const { connectToDatabase } = require('../utils/database');
const { handleCors } = require('../utils/cors');
const { ObjectId } = require('mongodb');

const COLLECTION_NAME = process.env.WAITLIST_COLLECTION || 'waitlist';

// Simple authorization middleware
function requireAuth(req, res) {
  // This is a simple example - in production use a proper auth system
  const apiKey = req.headers['x-api-key'];
  if (!apiKey || apiKey !== process.env.ADMIN_API_KEY) {
    res.status(401).json({ error: 'Unauthorized' });
    return false;
  }
  return true;
}

module.exports = async (req, res) => {
  // Handle CORS
  if (handleCors(req, res)) {
    return;
  }
  
  // Check authorization
  if (!requireAuth(req, res)) {
    return;
  }
  
  // Connect to database
  const db = await connectToDatabase();
  const collection = db.collection(COLLECTION_NAME);
  
  // Handle different HTTP methods
  switch (req.method) {
    case 'GET':
      await handleGet(req, res, collection);
      break;
    case 'PUT':
      await handlePut(req, res, collection);
      break;
    case 'DELETE':
      await handleDelete(req, res, collection);
      break;
    default:
      res.status(405).json({ error: 'Method Not Allowed' });
  }
};

// Get waitlist entries with pagination
async function handleGet(req, res, collection) {
  try {
    const { page = 1, limit = 50, status } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Build query
    const query = {};
    if (status) {
      query.status = status;
    }
    
    // Get total count for pagination
    const total = await collection.countDocuments(query);
    
    // Get paginated results
    const entries = await collection
      .find(query)
      .sort({ joinedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .toArray();
    
    // Return results with pagination metadata
    res.status(200).json({
      entries,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Admin API Error (GET):', error);
    res.status(500).json({ error: 'An error occurred' });
  }
}

// Update waitlist entry status
async function handlePut(req, res, collection) {
  try {
    const { id, status } = req.body;
    
    if (!id || !status) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Validate status
    const validStatuses = ['pending', 'approved', 'rejected', 'contacted'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }
    
    // Update entry
    const result = await collection.updateOne(
      { _id: ObjectId(id) },
      { $set: { status, updatedAt: new Date() }}
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Entry not found' });
    }
    
    res.status(200).json({ success: true, message: 'Entry updated' });
  } catch (error) {
    console.error('Admin API Error (PUT):', error);
    res.status(500).json({ error: 'An error occurred' });
  }
}

// Delete waitlist entry
async function handleDelete(req, res, collection) {
  try {
    const { id } = req.query;
    
    if (!id) {
      return res.status(400).json({ error: 'Missing required field: id' });
    }
    
    // Delete entry
    const result = await collection.deleteOne({ _id: ObjectId(id) });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Entry not found' });
    }
    
    res.status(200).json({ success: true, message: 'Entry deleted' });
  } catch (error) {
    console.error('Admin API Error (DELETE):', error);
    res.status(500).json({ error: 'An error occurred' });
  }
} 