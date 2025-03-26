/**
 * API Routes Migration Utility
 * 
 * This script helps identify and update API routes to use the new database functions.
 * It scans the API routes directory and suggests changes to migrate from the old
 * database functions to the new ones.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const API_ROUTES_DIR = path.join(process.cwd(), 'app', 'api');
const OLD_IMPORTS = [
  '@/lib/supabaseDb',
  '@/lib/supabaseAuth'
];
const NEW_IMPORTS = '@/lib/database';

// Function to recursively find all TypeScript files in a directory
function findTsFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  
  for (const file of list) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      // Recursively search directories
      results = results.concat(findTsFiles(filePath));
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      // Add TypeScript files to results
      results.push(filePath);
    }
  }
  
  return results;
}

// Function to analyze imports in a file
function analyzeImports(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const imports = [];
  
  // Find all import statements
  const importRegex = /import\s+{([^}]+)}\s+from\s+['"]([^'"]+)['"]/g;
  let match;
  
  while ((match = importRegex.exec(content)) !== null) {
    const importedItems = match[1].split(',').map(item => item.trim());
    const source = match[2];
    
    imports.push({
      source,
      items: importedItems,
      fullMatch: match[0]
    });
  }
  
  return imports;
}

// Function to check if a file needs migration
function needsMigration(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  
  for (const oldImport of OLD_IMPORTS) {
    if (content.includes(oldImport)) {
      return true;
    }
  }
  
  return false;
}

// Function to generate migration suggestions for a file
function generateMigrationSuggestions(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const imports = analyzeImports(filePath);
  const suggestions = [];
  
  // Find imports from old sources
  const oldImportsFound = imports.filter(imp => OLD_IMPORTS.includes(imp.source));
  
  if (oldImportsFound.length > 0) {
    // Create a suggestion to replace the old imports with new ones
    const importedFunctions = oldImportsFound.flatMap(imp => imp.items);
    
    suggestions.push({
      type: 'import',
      oldImports: oldImportsFound.map(imp => imp.fullMatch),
      newImport: `import { ${importedFunctions.join(', ')} } from '${NEW_IMPORTS}'`
    });
  }
  
  return suggestions;
}

// Function to apply migrations to a file
function applyMigration(filePath, backup = true) {
  console.log(`Migrating file: ${filePath}`);
  
  // Create a backup of the original file
  if (backup) {
    const backupPath = `${filePath}.bak`;
    fs.copyFileSync(filePath, backupPath);
    console.log(`Created backup: ${backupPath}`);
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  const suggestions = generateMigrationSuggestions(filePath);
  
  // Apply import changes
  const importSuggestions = suggestions.filter(s => s.type === 'import');
  
  if (importSuggestions.length > 0) {
    for (const suggestion of importSuggestions) {
      for (const oldImport of suggestion.oldImports) {
        content = content.replace(oldImport, '');
      }
      
      // Add the new import at the top of the file
      const importIndex = content.indexOf('import');
      if (importIndex !== -1) {
        content = content.slice(0, importIndex) + suggestion.newImport + '\n' + content.slice(importIndex);
      } else {
        content = suggestion.newImport + '\n' + content;
      }
    }
  }
  
  // Write the updated content back to the file
  fs.writeFileSync(filePath, content);
  console.log(`Updated file: ${filePath}`);
}

// Main function to run the migration
async function runMigration() {
  try {
    console.log('Starting API routes migration...');
    
    // Find all TypeScript files in the API routes directory
    const tsFiles = findTsFiles(API_ROUTES_DIR);
    console.log(`Found ${tsFiles.length} TypeScript files in API routes directory`);
    
    // Filter files that need migration
    const filesToMigrate = tsFiles.filter(file => needsMigration(file));
    console.log(`Found ${filesToMigrate.length} files that need migration`);
    
    if (filesToMigrate.length === 0) {
      console.log('No files need migration. Exiting...');
      return;
    }
    
    // Ask for confirmation
    console.log('\nFiles to migrate:');
    filesToMigrate.forEach((file, index) => {
      console.log(`${index + 1}. ${path.relative(process.cwd(), file)}`);
    });
    
    console.log('\nThis will update the import statements in these files to use the new database functions.');
    console.log('Backups will be created with the .bak extension.');
    
    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    readline.question('\nDo you want to proceed? (y/n): ', answer => {
      readline.close();
      
      if (answer.toLowerCase() === 'y') {
        // Apply migrations
        for (const file of filesToMigrate) {
          applyMigration(file);
        }
        
        console.log('\nMigration completed successfully!');
        console.log('Please review the changes and test the application.');
        console.log('You can restore from backups if needed.');
      } else {
        console.log('Migration cancelled.');
      }
    });
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

// Run the migration
runMigration();
