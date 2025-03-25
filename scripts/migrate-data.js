/**
 * Data Migration Script from MongoDB to Supabase
 * 
 * This script helps migrate data from MongoDB to Supabase.
 * It extracts data from MongoDB collections and inserts it into Supabase tables.
 * 
 * Usage:
 * 1. Set up environment variables in .env file
 * 2. Run: node scripts/migrate-data.js
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const { MongoClient } = require('mongodb');

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error('MONGODB_URI environment variable is not set');
  process.exit(1);
}

// Supabase connection
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Supabase environment variables are not set');
  process.exit(1);
}

// Initialize Supabase client with service role key for admin privileges
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Collection to table mapping
const collectionMapping = {
  'users': 'users',
  'talent_profiles': 'talent_profiles',
  'hiring_profiles': 'hiring_profiles',
  'jobs': 'jobs',
  'job_applications': 'job_applications',
  'saved_jobs': 'saved_jobs',
  'notifications': 'notifications'
};

// Connect to MongoDB and migrate data
async function migrateData() {
  let mongoClient;
  
  try {
    console.log('Connecting to MongoDB...');
    mongoClient = new MongoClient(MONGODB_URI);
    await mongoClient.connect();
    console.log('Connected to MongoDB');
    
    const db = mongoClient.db();
    
    // Migrate each collection
    for (const [collection, table] of Object.entries(collectionMapping)) {
      await migrateCollection(db, collection, table);
    }
    
    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    if (mongoClient) {
      await mongoClient.close();
      console.log('MongoDB connection closed');
    }
  }
}

// Migrate a single collection to a Supabase table
async function migrateCollection(db, collectionName, tableName) {
  try {
    console.log(`Migrating ${collectionName} to ${tableName}...`);
    
    // Get all documents from MongoDB collection
    const collection = db.collection(collectionName);
    const documents = await collection.find({}).toArray();
    
    if (documents.length === 0) {
      console.log(`No documents found in ${collectionName}, skipping`);
      return;
    }
    
    console.log(`Found ${documents.length} documents in ${collectionName}`);
    
    // Transform MongoDB documents to Supabase format
    const transformedData = documents.map(doc => transformDocument(doc, collectionName));
    
    // Insert data into Supabase in batches
    const batchSize = 100;
    for (let i = 0; i < transformedData.length; i += batchSize) {
      const batch = transformedData.slice(i, i + batchSize);
      
      const { error } = await supabase
        .from(tableName)
        .insert(batch)
        .select();
      
      if (error) {
        console.error(`Error inserting batch into ${tableName}:`, error);
        continue;
      }
      
      console.log(`Inserted batch ${i/batchSize + 1} of ${Math.ceil(transformedData.length/batchSize)} into ${tableName}`);
    }
    
    console.log(`Successfully migrated ${documents.length} documents from ${collectionName} to ${tableName}`);
  } catch (error) {
    console.error(`Error migrating ${collectionName} to ${tableName}:`, error);
  }
}

// Transform MongoDB document to Supabase format
function transformDocument(doc, collectionName) {
  // Create a new object without MongoDB's _id
  const { _id, ...rest } = doc;
  
  // Add id field using MongoDB's _id string
  const transformed = {
    id: _id.toString(),
    ...rest
  };
  
  // Collection-specific transformations
  switch (collectionName) {
    case 'users':
      // Convert MongoDB dates to ISO strings
      if (transformed.created_at instanceof Date) {
        transformed.created_at = transformed.created_at.toISOString();
      }
      if (transformed.updated_at instanceof Date) {
        transformed.updated_at = transformed.updated_at.toISOString();
      }
      break;
      
    case 'jobs':
      // Convert MongoDB dates to ISO strings
      if (transformed.posted_date instanceof Date) {
        transformed.posted_date = transformed.posted_date.toISOString();
      }
      if (transformed.expiry_date instanceof Date) {
        transformed.expiry_date = transformed.expiry_date.toISOString();
      }
      break;
      
    case 'job_applications':
      // Convert MongoDB dates to ISO strings
      if (transformed.applied_date instanceof Date) {
        transformed.applied_date = transformed.applied_date.toISOString();
      }
      if (transformed.updated_date instanceof Date) {
        transformed.updated_date = transformed.updated_date.toISOString();
      }
      
      // Ensure job_id and user_id are strings
      if (transformed.job_id && typeof transformed.job_id !== 'string') {
        transformed.job_id = transformed.job_id.toString();
      }
      if (transformed.user_id && typeof transformed.user_id !== 'string') {
        transformed.user_id = transformed.user_id.toString();
      }
      break;
      
    case 'saved_jobs':
      // Ensure job_id and user_id are strings
      if (transformed.job_id && typeof transformed.job_id !== 'string') {
        transformed.job_id = transformed.job_id.toString();
      }
      if (transformed.user_id && typeof transformed.user_id !== 'string') {
        transformed.user_id = transformed.user_id.toString();
      }
      
      // Convert MongoDB dates to ISO strings
      if (transformed.saved_date instanceof Date) {
        transformed.saved_date = transformed.saved_date.toISOString();
      }
      break;
      
    default:
      // Convert all Date objects to ISO strings
      Object.keys(transformed).forEach(key => {
        if (transformed[key] instanceof Date) {
          transformed[key] = transformed[key].toISOString();
        }
      });
  }
  
  return transformed;
}

// Run the migration
migrateData()
  .then(() => {
    console.log('Migration script completed');
    process.exit(0);
  })
  .catch(error => {
    console.error('Migration script failed:', error);
    process.exit(1);
  });
