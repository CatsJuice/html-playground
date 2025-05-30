#!/usr/bin/env node

import { readdir, mkdir, cp, readFile, writeFile, access } from 'fs/promises';
import { join, resolve } from 'path';
import { fileURLToPath } from 'url';
import inquirer from 'inquirer';
import ora from 'ora';
import { execSync } from 'child_process';
import { rm } from 'fs/promises';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

async function directoryExists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  try {
    // Read all folders in templates directory
    const templatesDir = join(__dirname, 'templates');
    const folders = await readdir(templatesDir, { withFileTypes: true });
    const templateFolders = folders
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);

    if (templateFolders.length === 0) {
      console.error('No template folders found!');
      process.exit(1);
    }

    // Let user select template
    const { selectedTemplate } = await inquirer.prompt([
      {
        type: 'list',
        name: 'selectedTemplate',
        message: 'Select a template:',
        choices: templateFolders
      }
    ]);

    // Let user input new project name
    const { newName } = await inquirer.prompt([
      {
        type: 'input',
        name: 'newName',
        message: 'Enter new project name:',
        validate: input => {
          if (!input) return 'Project name cannot be empty!';
          if (!/^[a-z0-9-]+$/.test(input)) {
            return 'Project name can only contain lowercase letters, numbers, and hyphens!';
          }
          return true;
        }
      }
    ]);

    // Create target directory
    const targetDir = join(__dirname, 'packages', newName);
    
    // Check if directory exists
    if (await directoryExists(targetDir)) {
      const { shouldOverwrite } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'shouldOverwrite',
          message: `Directory ${newName} already exists. Delete and continue?`,
          default: false
        }
      ]);

      if (!shouldOverwrite) {
        console.log('Operation cancelled');
        process.exit(0);
      }

      // Delete existing directory
      await rm(targetDir, { recursive: true, force: true });
    }

    await mkdir(targetDir, { recursive: true });

    // Copy template files
    const sourceDir = join(templatesDir, selectedTemplate);
    await cp(sourceDir, targetDir, { recursive: true });

    // Check and update package.json
    const packageJsonPath = join(targetDir, 'package.json');
    try {
      const packageJsonContent = await readFile(packageJsonPath, 'utf-8');
      const packageJson = JSON.parse(packageJsonContent);
      packageJson.name = newName;
      await writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2));
    } catch (error) {
      // If file doesn't exist or parsing fails, ignore error
      console.log('package.json not found or update failed, continuing...');
    }

    // Let user select package manager
    const { packageManager } = await inquirer.prompt([
      {
        type: 'list',
        name: 'packageManager',
        message: 'Select package manager:',
        choices: ['ni', 'pnpm', 'npm', 'yarn'],
        default: 'ni'
      }
    ]);

    // Show loading animation and install dependencies
    const spinner = ora('Initializing project...').start();
    
    try {
      process.chdir(targetDir);
      if (packageManager === 'ni') {
        execSync('ni', { stdio: 'inherit' });
      } else {
        execSync(`${packageManager} install`, { stdio: 'inherit' });
      }
      spinner.succeed('Project initialization completed!');
    } catch (error) {
      spinner.fail('Project initialization failed!');
      console.error(error);
      process.exit(1);
    }

  } catch (error) {
    console.error('An error occurred:', error);
    process.exit(1);
  }
}

main();
