const fs = require('fs');
const path = require('path');

// Correct MongoDB connection string
const correctMongoURI = 'mongodb+srv://mubashirullah0:UovgzvDbYOZWflOY@cluster0.mmfz0.mongodb.net/?retryWrites=true&w=majority';

// Path to .env.local file
const envPath = path.join(__dirname, '.env.local');

try {
  // Read the current .env.local file
  let envContent = fs.readFileSync(envPath, 'utf8');
  
  // Log the current content for debugging
  console.log('Current .env.local content:');
  console.log(envContent);
  
  // Replace the MongoDB URI line with the correct one
  const mongoUriRegex = /MONGODB_URI=.*/;
  const newEnvContent = envContent.replace(mongoUriRegex, `MONGODB_URI=${correctMongoURI}`);
  
  // Write the updated content back to .env.local
  fs.writeFileSync(envPath, newEnvContent);
  
  console.log('\nFixed .env.local file with correct MongoDB URI');
} catch (error) {
  console.error('Error updating .env.local file:', error);
}
