import { glob } from "glob";
import path from "path";
import fs from "fs";
import { execa } from "execa";

const __dirname = path.dirname(new URL(import.meta.url).pathname);
const ROOT_DIR = __dirname;
const DIST_DIR = path.join(ROOT_DIR, "dist");

async function clean() {
  if (!fs.existsSync(DIST_DIR)) return fs.mkdirSync(DIST_DIR);
  await execa("shx", ["rm", "-rf", DIST_DIR]);
  await execa("shx", ["mkdir", "-p", DIST_DIR]);
}

const packages = [];

async function buildPkg(p) {
  const pkgDir = path.dirname(p);
  const pkgName = path.basename(pkgDir);
  const pkgDistDir = path.join(DIST_DIR, pkgName);
  fs.mkdirSync(pkgDistDir);

  // read .config.json
  const configPath = path.join(pkgDir, ".config.json");
  let config = {};
  if (fs.existsSync(configPath))
    config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
  if (config.wip) return;

  // copy index.html & src
  if (config.distDir) {
    await execa("npm", ["run", "build"], { cwd: pkgDir });
    const distDir = path.join(pkgDir, config.distDir, "*");
    await execa("shx", ["cp", "-r", distDir, pkgDistDir]);
  } else {
    const indexHtml = path.join(pkgDir, "index.html");
    const srcDir = path.join(pkgDir, "src");
    await execa("shx", ["cp", "-r", indexHtml, srcDir, pkgDistDir]);
  }

  const cfgFile = path.join(pkgDir, "config.json");
  const cfg = fs.existsSync(cfgFile)
    ? JSON.parse(fs.readFileSync(cfgFile, "utf-8"))
    : {};

  // get last updated time by git log
  const { stdout } = await execa("git", [
    "log",
    "-1",
    "--format=%cd",
    "--date=iso",
    "--",
    pkgDir,
  ]);
  const updatedAt = stdout;

  packages.push({ name: pkgName, updatedAt, ...cfg });
}

await clean();
const pkgs = await glob("./packages/*/index.html", { cwd: ROOT_DIR });
for (const p of pkgs) {
  await buildPkg(p);
}

const entry = `<html>
  <head>
  <meta charset="utf-8">
  <title>Html Playground</title>
  </head>
  <body>
    <ul>
      ${packages
        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
        .map(
          (pkg) => `<li>
      <a href="./${pkg.name}/index.html">
        ${pkg.name}
      </a>
      (updated at ${pkg.updatedAt})
      </li>`
        )}
    </ul>
  </body>
</html>`;

fs.writeFileSync(path.join(DIST_DIR, "index.html"), entry);
