/**
 * Apply API Migrations Script
 * 
 * This script applies the migrated API routes by replacing the original files
 * with the migrated versions. It also creates backups of the original files.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const API_DIR = path.join(process.cwd(), 'app', 'api');
const MIGRATED_EXTENSION = '.migrated';
const BACKUP_EXTENSION = '.bak';

/**
 * Find all migrated API route files
 * @returns {string[]} Array of file paths
 */
function findMigratedFiles() {
  const results = [];
  
  function scanDirectory(dir) {
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const itemPath = path.join(dir, item);
      const stat = fs.statSync(itemPath);
      
      if (stat.isDirectory()) {
        scanDirectory(itemPath);
      } else if (item.endsWith(MIGRATED_EXTENSION)) {
        results.push(itemPath);
      }
    }
  }
  
  scanDirectory(API_DIR);
  return results;
}

/**
 * Apply a single migration
 * @param {string} migratedFilePath Path to the migrated file
 * @returns {boolean} Success status
 */
function applyMigration(migratedFilePath) {
  try {
    // Get the original file path
    const originalFilePath = migratedFilePath.replace(MIGRATED_EXTENSION, '');
    const backupFilePath = originalFilePath + BACKUP_EXTENSION;
    
    console.log(`Migrating: ${path.relative(process.cwd(), originalFilePath)}`);
    
    // Create backup of original file
    if (fs.existsSync(originalFilePath)) {
      fs.copyFileSync(originalFilePath, backupFilePath);
      console.log(`  Created backup: ${path.relative(process.cwd(), backupFilePath)}`);
    }
    
    // Copy migrated file to original location
    fs.copyFileSync(migratedFilePath, originalFilePath);
    console.log(`  Applied migration successfully`);
    
    return true;
  } catch (error) {
    console.error(`  Error applying migration:`, error);
    return false;
  }
}

/**
 * Run the migration process
 */
function runMigration() {
  try {
    console.log('Starting API migration process...');
    
    // Find all migrated files
    const migratedFiles = findMigratedFiles();
    console.log(`Found ${migratedFiles.length} migrated API routes`);
    
    if (migratedFiles.length === 0) {
      console.log('No migrations to apply. Exiting...');
      return;
    }
    
    // Display the files to be migrated
    console.log('\nFiles to migrate:');
    migratedFiles.forEach((file, index) => {
      console.log(`${index + 1}. ${path.relative(process.cwd(), file)}`);
    });
    
    // Ask for confirmation
    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    readline.question('\nDo you want to proceed with the migration? (y/n): ', answer => {
      readline.close();
      
      if (answer.toLowerCase() === 'y') {
        console.log('\nApplying migrations...');
        
        let successCount = 0;
        let failCount = 0;
        
        // Apply each migration
        for (const file of migratedFiles) {
          const success = applyMigration(file);
          if (success) {
            successCount++;
          } else {
            failCount++;
          }
        }
        
        console.log('\nMigration summary:');
        console.log(`  Successfully migrated: ${successCount}`);
        console.log(`  Failed migrations: ${failCount}`);
        console.log('\nBackups of original files were created with .bak extension');
        console.log('You can restore them if needed.');
      } else {
        console.log('Migration cancelled.');
      }
    });
  } catch (error) {
    console.error('Error running migration:', error);
  }
}

// Run the migration
runMigration();
