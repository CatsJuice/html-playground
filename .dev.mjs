#!/usr/bin/env node

import { readdir, stat } from 'fs/promises';
import { join } from 'path';
import { spawn } from 'child_process';

// Color codes
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m'
};

// Clear screen function
function clearScreen() {
  process.stdout.write('\x1b[2J\x1b[0f');
}

// Get all project directories
async function getProjects() {
  const packagesDir = join(process.cwd(), 'packages');
  try {
    const items = await readdir(packagesDir);
    const projects = [];
    
    for (const item of items) {
      const fullPath = join(packagesDir, item);
      const stats = await stat(fullPath);
      if (stats.isDirectory()) {
        projects.push(item);
      }
    }
    
    return projects.sort();
  } catch (error) {
    console.error(`${colors.red}Error: Cannot read packages directory${colors.reset}`);
    process.exit(1);
  }
}

// Filter project list
function filterProjects(projects, searchTerm) {
  if (!searchTerm) return projects;
  return projects.filter(project => 
    project.toLowerCase().includes(searchTerm.toLowerCase())
  );
}

// Display project list
function displayProjects(projects, selectedIndex = 0, searchTerm = '') {
  clearScreen();
  
  console.log(`${colors.bright}${colors.cyan}🎯 Select a project to start${colors.reset}\n`);
  
  if (searchTerm) {
    console.log(`${colors.yellow}Search: ${searchTerm}${colors.reset}\n`);
  }
  
  if (projects.length === 0) {
    console.log(`${colors.red}No matching projects found${colors.reset}`);
    return;
  }
  
  projects.forEach((project, index) => {
    const isSelected = index === selectedIndex;
    const prefix = isSelected ? `${colors.green}▶ ${colors.reset}` : '  ';
    const color = isSelected ? colors.bright + colors.green : colors.white;
    
    console.log(`${prefix}${color}${project}${colors.reset}`);
  });
  
  console.log(`\n${colors.cyan}Use arrow keys to navigate, Enter to confirm, ESC to exit${colors.reset}`);
}

// Start project
async function startProject(projectName) {
  const projectPath = join(process.cwd(), 'packages', projectName);
  
  console.log(`\n${colors.green}🚀 Starting project: ${projectName}${colors.reset}`);
  console.log(`${colors.cyan}Path: ${projectPath}${colors.reset}\n`);
  
  try {
    const child = spawn('npm', ['run', 'dev'], {
      cwd: projectPath,
      stdio: 'inherit',
      shell: true
    });
    
    child.on('error', (error) => {
      console.error(`${colors.red}Failed to start: ${error.message}${colors.reset}`);
      process.exit(1);
    });
    
    child.on('exit', (code) => {
      if (code !== 0) {
        console.error(`${colors.red}Project exited with code: ${code}${colors.reset}`);
      }
    });
    
  } catch (error) {
    console.error(`${colors.red}Error starting project: ${error.message}${colors.reset}`);
    process.exit(1);
  }
}

// Main function
async function main() {
  const projects = await getProjects();
  
  if (projects.length === 0) {
    console.log(`${colors.yellow}No projects found in packages directory${colors.reset}`);
    return;
  }
  
  let filteredProjects = projects;
  let selectedIndex = 0;
  let searchTerm = '';
  
  // Set raw mode
  process.stdin.setRawMode(true);
  process.stdin.resume();
  process.stdin.setEncoding('utf8');
  
  // Hide cursor
  process.stdout.write('\x1b[?25l');
  
  // Display initial list
  displayProjects(filteredProjects, selectedIndex, searchTerm);
  
  // Handle keyboard input
  process.stdin.on('data', (key) => {
    // Handle arrow keys and special keys
    if (key.length === 3 && key.charCodeAt(0) === 27 && key.charCodeAt(1) === 91) {
      // Arrow keys: ESC [ A (up), ESC [ B (down)
      const arrowKey = key.charCodeAt(2);
      
      if (arrowKey === 65) { // Up arrow
        selectedIndex = selectedIndex > 0 ? selectedIndex - 1 : filteredProjects.length - 1;
        displayProjects(filteredProjects, selectedIndex, searchTerm);
        return;
      }
      
      if (arrowKey === 66) { // Down arrow
        selectedIndex = selectedIndex < filteredProjects.length - 1 ? selectedIndex + 1 : 0;
        displayProjects(filteredProjects, selectedIndex, searchTerm);
        return;
      }
    }
    
    // Handle single character keys
    const keyCode = key.charCodeAt(0);
    
    // ESC key to exit
    if (keyCode === 27) {
      process.stdout.write('\x1b[?25h'); // Show cursor
      process.exit(0);
    }
    
    // Enter key to confirm selection
    if (keyCode === 13) {
      if (filteredProjects.length > 0) {
        const selectedProject = filteredProjects[selectedIndex];
        process.stdout.write('\x1b[?25h'); // Show cursor
        process.stdin.setRawMode(false);
        startProject(selectedProject);
      }
      return;
    }
    
    // Backspace key
    if (keyCode === 127) {
      searchTerm = searchTerm.slice(0, -1);
      filteredProjects = filterProjects(projects, searchTerm);
      selectedIndex = Math.min(selectedIndex, Math.max(0, filteredProjects.length - 1));
      displayProjects(filteredProjects, selectedIndex, searchTerm);
      return;
    }
    
    // Printable characters (search input)
    if (keyCode >= 32 && keyCode <= 126) {
      searchTerm += key;
      filteredProjects = filterProjects(projects, searchTerm);
      selectedIndex = 0; // Reset selection index
      displayProjects(filteredProjects, selectedIndex, searchTerm);
      return;
    }
  });
}

// Handle process exit
process.on('SIGINT', () => {
  process.stdout.write('\x1b[?25h'); // Show cursor
  process.exit(0);
});

process.on('SIGTERM', () => {
  process.stdout.write('\x1b[?25h'); // Show cursor
  process.exit(0);
});

// Start the program
main().catch(error => {
  console.error(`${colors.red}Program error: ${error.message}${colors.reset}`);
  process.exit(1);
});
