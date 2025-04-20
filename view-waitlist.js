/**
 * Waitlist Entries Viewer
 * 
 * This script retrieves and displays all entries in the waitlist collection.
 * Run it with: node view-waitlist.js
 */

// Load environment variables from .env file
require('dotenv').config();

const { MongoClient } = require('mongodb');

// Get connection details from environment variables
const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.DB_NAME || 'votigram';
const COLLECTION_NAME = process.env.WAITLIST_COLLECTION || 'Early User Acquisition';

async function viewWaitlist() {
  console.log('🔍 Connecting to MongoDB...');
  console.log(`Database: ${DB_NAME}`);
  console.log(`Collection: ${COLLECTION_NAME}`);
  
  // MongoDB client
  let client;
  
  try {
    // Connect to MongoDB
    client = await MongoClient.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('✅ Successfully connected to MongoDB!');
    
    // Get database and collection
    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAME);
    
    // Count entries
    const count = await collection.countDocuments();
    console.log(`\n📊 Total entries in waitlist: ${count}`);
    
    if (count === 0) {
      console.log('\nℹ️ No entries found in the waitlist collection.');
      return;
    }
    
    // Retrieve all entries, sorted by position
    const entries = await collection.find({}).sort({ position: 1 }).toArray();
    
    console.log('\n📋 Waitlist Entries:');
    console.log('------------------------');
    
    entries.forEach((entry, index) => {
      console.log(`#${entry.position}: ${entry.twitterHandle} (${entry.email})`);
      console.log(`   Joined: ${entry.joinedAt}`);
      console.log(`   Status: ${entry.status}`);
      console.log(`   Source: ${entry.source}`);
      if (index < entries.length - 1) {
        console.log('------------------------');
      }
    });
    
    console.log('\n✅ All entries displayed successfully!');
    
  } catch (error) {
    console.error('❌ Error retrieving waitlist entries:', error);
  } finally {
    if (client) {
      console.log('Closing MongoDB connection...');
      await client.close();
    }
  }
}

// Run the function
viewWaitlist().catch(console.error); 