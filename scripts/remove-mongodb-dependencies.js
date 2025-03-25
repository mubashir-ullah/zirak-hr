/**
 * MongoDB Dependency Removal Script
 * 
 * This script helps identify and remove MongoDB dependencies from the codebase.
 * It will:
 * 1. List all files that import mongoose
 * 2. Remove MongoDB-related packages from package.json
 * 3. Delete MongoDB model files
 * 4. Delete mongoose.ts connection file
 * 
 * Usage:
 * node scripts/remove-mongodb-dependencies.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const rootDir = path.resolve(__dirname, '..');
const packagesToRemove = [
  'mongoose',
  'mongodb',
  '@auth/mongodb-adapter'
];

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

console.log(`${colors.cyan}=== MongoDB Dependency Removal Script ===${colors.reset}\n`);

// Step 1: Find all files that import mongoose
console.log(`${colors.yellow}Step 1: Identifying files with mongoose imports...${colors.reset}`);

try {
  const grepResult = execSync('grep -r "import.*mongoose" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" .', 
    { cwd: rootDir, encoding: 'utf8' });
  
  const files = grepResult.split('\n')
    .filter(line => line.trim() !== '')
    .map(line => {
      const [filePath] = line.split(':');
      return filePath;
    })
    .filter((value, index, self) => self.indexOf(value) === index); // Remove duplicates
  
  console.log(`${colors.blue}Found ${files.length} files with mongoose imports:${colors.reset}`);
  files.forEach(file => console.log(`- ${file}`));
  console.log('');
  
  console.log(`${colors.yellow}These files need to be updated to use Supabase instead of MongoDB.${colors.reset}`);
  console.log(`${colors.yellow}Please check MIGRATION.md for guidance on updating these files.${colors.reset}\n`);
} catch (error) {
  console.log(`${colors.red}No files with mongoose imports found or grep command failed.${colors.reset}\n`);
}

// Step 2: Remove MongoDB-related packages from package.json
console.log(`${colors.yellow}Step 2: Removing MongoDB packages from package.json...${colors.reset}`);

try {
  const packageJsonPath = path.join(rootDir, 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  let packagesRemoved = [];
  
  // Check dependencies
  if (packageJson.dependencies) {
    packagesToRemove.forEach(pkg => {
      if (packageJson.dependencies[pkg]) {
        delete packageJson.dependencies[pkg];
        packagesRemoved.push(pkg);
      }
    });
  }
  
  // Check devDependencies
  if (packageJson.devDependencies) {
    packagesToRemove.forEach(pkg => {
      if (packageJson.devDependencies[pkg]) {
        delete packageJson.devDependencies[pkg];
        packagesRemoved.push(pkg);
      }
    });
  }
  
  if (packagesRemoved.length > 0) {
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    console.log(`${colors.green}Removed packages from package.json: ${packagesRemoved.join(', ')}${colors.reset}`);
    console.log(`${colors.yellow}Don't forget to run 'npm install' to update your node_modules${colors.reset}\n`);
  } else {
    console.log(`${colors.blue}No MongoDB packages found in package.json${colors.reset}\n`);
  }
} catch (error) {
  console.log(`${colors.red}Error updating package.json: ${error.message}${colors.reset}\n`);
}

// Step 3: List MongoDB model files
console.log(`${colors.yellow}Step 3: Identifying MongoDB model files...${colors.reset}`);

const modelDirs = [
  path.join(rootDir, 'models'),
  path.join(rootDir, 'app', 'models')
];

let modelFiles = [];

modelDirs.forEach(dir => {
  if (fs.existsSync(dir)) {
    fs.readdirSync(dir).forEach(file => {
      if (file.endsWith('.ts') || file.endsWith('.js')) {
        const filePath = path.join(dir, file);
        try {
          const content = fs.readFileSync(filePath, 'utf8');
          if (content.includes('mongoose') || content.includes('Schema')) {
            modelFiles.push(filePath);
          }
        } catch (error) {
          console.log(`${colors.red}Error reading file ${filePath}: ${error.message}${colors.reset}`);
        }
      }
    });
  }
});

if (modelFiles.length > 0) {
  console.log(`${colors.blue}Found ${modelFiles.length} MongoDB model files:${colors.reset}`);
  modelFiles.forEach(file => console.log(`- ${file}`));
  console.log('');
  
  console.log(`${colors.yellow}These files should be replaced with Supabase types and utilities.${colors.reset}\n`);
} else {
  console.log(`${colors.blue}No MongoDB model files found${colors.reset}\n`);
}

// Step 4: Check for mongoose.ts connection file
console.log(`${colors.yellow}Step 4: Checking for mongoose.ts connection file...${colors.reset}`);

const mongooseFilePath = path.join(rootDir, 'lib', 'mongoose.ts');
if (fs.existsSync(mongooseFilePath)) {
  console.log(`${colors.blue}Found mongoose.ts connection file at: ${mongooseFilePath}${colors.reset}`);
  console.log(`${colors.yellow}This file should be removed after all MongoDB dependencies are migrated.${colors.reset}\n`);
} else {
  console.log(`${colors.blue}mongoose.ts connection file not found${colors.reset}\n`);
}

// Step 5: Check for MongoDB environment variables
console.log(`${colors.yellow}Step 5: Checking for MongoDB environment variables...${colors.reset}`);

const envFiles = [
  path.join(rootDir, '.env'),
  path.join(rootDir, '.env.local'),
  path.join(rootDir, '.env.development'),
  path.join(rootDir, '.env.production')
];

let mongoEnvVarsFound = false;

envFiles.forEach(envFile => {
  if (fs.existsSync(envFile)) {
    try {
      const content = fs.readFileSync(envFile, 'utf8');
      const lines = content.split('\n');
      
      const mongoLines = lines.filter(line => 
        line.includes('MONGODB') || 
        line.includes('MONGO_URI') || 
        line.includes('MONGO_URL') ||
        line.includes('DATABASE_URL') && line.includes('mongodb')
      );
      
      if (mongoLines.length > 0) {
        console.log(`${colors.blue}Found MongoDB environment variables in ${envFile}:${colors.reset}`);
        mongoLines.forEach(line => console.log(`- ${line}`));
        mongoEnvVarsFound = true;
      }
    } catch (error) {
      console.log(`${colors.red}Error reading file ${envFile}: ${error.message}${colors.reset}`);
    }
  }
});

if (!mongoEnvVarsFound) {
  console.log(`${colors.blue}No MongoDB environment variables found${colors.reset}`);
}

console.log(`\n${colors.green}=== MongoDB Dependency Removal Script Complete ===${colors.reset}`);
console.log(`${colors.cyan}Please follow the steps in MIGRATION.md to complete the migration to Supabase.${colors.reset}`);
