const { connectToDatabase } = require('../utils/database');
const { handleCors } = require('../utils/cors');

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
  
  // Only allow GET method
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
  
  // Check authorization
  if (!requireAuth(req, res)) {
    return;
  }
  
  try {
    const { page = 1, limit = 50, status } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Connect to database
    const db = await connectToDatabase();
    const collection = db.collection(COLLECTION_NAME);
    
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
    console.error('Admin API Error:', error);
    res.status(500).json({ error: 'An error occurred' });
  }
}; 