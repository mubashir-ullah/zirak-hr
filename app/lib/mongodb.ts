import { MongoClient } from 'mongodb'

if (!process.env.MONGODB_URI) {
  throw new Error('Invalid/Missing environment variable: "MONGODB_URI"')
}

const uri = process.env.MONGODB_URI
const options = {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS: 45000,
  connectTimeoutMS: 30000,
  retryWrites: true,
  retryReads: true,
  ssl: true,
  tlsAllowInvalidCertificates: false,
}

let client: MongoClient | null = null
let clientPromise: Promise<MongoClient> | null = null

async function connectToMongoDB() {
  if (clientPromise) {
    return clientPromise
  }

  try {
    client = new MongoClient(uri, options)
    const promise = client.connect()
    
    // Test the connection
    const db = client.db()
    await db.command({ ping: 1 })
    console.log('Successfully connected to MongoDB.')
    
    clientPromise = promise
    return promise
  } catch (error) {
    console.error('MongoDB connection error:', error)
    clientPromise = null
    throw error
  }
}

// In development mode, use a global variable so that the value
// is preserved across module reloads caused by HMR (Hot Module Replacement).
if (process.env.NODE_ENV === 'development') {
  let globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>
  }

  if (!globalWithMongo._mongoClientPromise) {
    globalWithMongo._mongoClientPromise = connectToMongoDB()
  }
  clientPromise = globalWithMongo._mongoClientPromise
} else {
  // In production mode, it's best to not use a global variable.
  clientPromise = connectToMongoDB()
}

// Export a module-scoped MongoClient promise. By doing this in a
// separate module, the client can be shared across functions.
export default clientPromise 

/**
 * Connect to the database and return both the client and db instances
 * This is used by API routes to interact with MongoDB
 */
export async function connectToDatabase() {
  try {
    // Ensure client is initialized by calling connectToMongoDB
    if (!clientPromise) {
      await connectToMongoDB();
    }
    
    const client = await clientPromise;
    if (!client) {
      throw new Error('MongoDB client is null');
    }
    
    const db = client.db(process.env.MONGODB_DB || 'zirak-hr');
    
    return { client, db };
  } catch (error) {
    console.error('Error connecting to database:', error);
    throw new Error('Unable to connect to database');
  }
}
