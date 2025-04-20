/**
 * MongoDB Connection Verification Script
 * 
 * This script tests the connection to MongoDB and verifies access to the waitlist collection.
 * Run it with: node verify-db.js
 */

// Load environment variables from .env file
require('dotenv').config();

const { MongoClient } = require('mongodb');

// Get connection details from environment variables
const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.DB_NAME || 'votigram';
const COLLECTION_NAME = process.env.WAITLIST_COLLECTION || 'Early User Acquisition';

async function verifyConnection() {
  console.log('🔍 Verifying MongoDB connection...');
  console.log(`Database: ${DB_NAME}`);
  console.log(`Collection: ${COLLECTION_NAME}`);
  
  // MongoDB client
  let client;
  
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    client = await MongoClient.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('✅ Successfully connected to MongoDB!');
    
    // Get database and collection
    const db = client.db(DB_NAME);
    
    // Create collection if it doesn't exist
    const collections = await db.listCollections({name: COLLECTION_NAME}).toArray();
    if (collections.length === 0) {
      console.log(`Collection "${COLLECTION_NAME}" does not exist. Creating it now...`);
      await db.createCollection(COLLECTION_NAME);
      console.log(`✅ Collection "${COLLECTION_NAME}" created successfully!`);
    } else {
      console.log(`✅ Collection "${COLLECTION_NAME}" exists!`);
    }
    
    // Insert a test document
    const collection = db.collection(COLLECTION_NAME);
    const testDoc = {
      twitterHandle: 'test_user',
      email: 'test@example.com',
      joinedAt: new Date(),
      status: 'test',
      position: 0,
      source: 'verify-db.js'
    };
    
    console.log('Inserting test document...');
    const result = await collection.insertOne(testDoc);
    console.log(`✅ Test document inserted with ID: ${result.insertedId}`);
    
    // Retrieve and delete the test document
    console.log('Retrieving test document...');
    const found = await collection.findOne({ twitterHandle: 'test_user' });
    console.log('Found test document:', found);
    
    console.log('Deleting test document...');
    await collection.deleteOne({ twitterHandle: 'test_user' });
    console.log('✅ Test document deleted');
    
    console.log('\n✅ DATABASE VERIFICATION COMPLETE! ✅');
    console.log('Your waitlist form is ready to collect user data.');
    
  } catch (error) {
    console.error('❌ Error verifying database connection:', error);
  } finally {
    if (client) {
      console.log('Closing MongoDB connection...');
      await client.close();
    }
  }
}

// Run the verification
verifyConnection().catch(console.error); 