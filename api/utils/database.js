const { MongoClient } = require('mongodb');

// MongoDB connection string - must be set in environment variables
const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.DB_NAME || 'votigram';

// Initialize MongoDB connection
let cachedDb = null;
let client = null;

async function connectToDatabase() {
  // Return cached connection if available
  if (cachedDb) {
    return cachedDb;
  }
  
  if (!MONGODB_URI) {
    throw new Error('Missing MONGODB_URI environment variable');
  }
  
  try {
    console.log('Connecting to MongoDB...');
    
    // Connect with options
    client = await MongoClient.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      connectTimeoutMS: 5000,
      serverSelectionTimeoutMS: 5000,
    });
    
    const db = client.db(DB_NAME);
    
    // Try a ping to confirm connection
    await db.command({ ping: 1 });
    console.log('Successfully connected to MongoDB');
    
    cachedDb = db;
    return db;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw new Error(`Unable to connect to database: ${error.message}`);
  }
}

// Properly close connection when needed
async function closeConnection() {
  if (client) {
    await client.close();
    cachedDb = null;
    client = null;
    console.log('MongoDB connection closed');
  }
}

module.exports = {
  connectToDatabase,
  closeConnection
}; 