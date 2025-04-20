const { connectToDatabase } = require('./utils/database');
const { handleCors } = require('./utils/cors');

const COLLECTION_NAME = process.env.WAITLIST_COLLECTION || 'Early User Acquisition';

module.exports = async (req, res) => {
  console.log('Waitlist API called with method:', req.method);
  
  // Handle CORS
  if (handleCors(req, res)) {
    return;
  }
  
  // Only allow POST method
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
  
  try {
    // Parse the request body
    const { email, username } = req.body;
    console.log('Received submission:', { email, username });
    
    // Validate email
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ 
        success: false,
        field: 'email',
        message: 'Please provide a valid email address'
      });
    }
    
    // Validate Twitter username
    // Twitter usernames can only contain letters, numbers, and underscores
    // They cannot exceed 15 characters and cannot be less than 4 characters
    if (!username || !/^[A-Za-z0-9_]{3,15}$/.test(username)) {
      return res.status(400).json({
        success: false,
        field: 'username',
        message: 'Please provide a valid Twitter handle (3-15 characters, letters, numbers, and underscores only)'
      });
    }
    
    // Remove @ if present at the beginning
    const twitterHandle = username.startsWith('@') ? username.substring(1) : username;
    
    console.log('Connecting to MongoDB...');
    // Connect to the database
    const db = await connectToDatabase();
    console.log('Connected to MongoDB successfully');
    
    const collection = db.collection(COLLECTION_NAME);
    
    // Check if email already exists in waitlist
    const existingUserByEmail = await collection.findOne({ email });
    if (existingUserByEmail) {
      return res.status(409).json({
        success: false,
        field: 'email',
        message: 'This email is already on our waitlist'
      });
    }
    
    // Check if Twitter handle already exists
    const existingUserByTwitter = await collection.findOne({ 
      twitterHandle: { $regex: new RegExp(`^${twitterHandle}$`, 'i') }
    });
    
    if (existingUserByTwitter) {
      return res.status(409).json({
        success: false,
        field: 'username',
        message: 'This Twitter handle is already on our waitlist'
      });
    }
    
    // Generate waitlist position number
    const totalUsers = await collection.countDocuments();
    const position = totalUsers + 1;
    
    const newEntry = {
      email,
      twitterHandle,
      joinedAt: new Date(),
      status: 'pending',
      position,
      source: req.headers.referer || 'direct'
    };
    
    console.log('Inserting new waitlist entry:', newEntry);
    
    // Add to waitlist collection
    await collection.insertOne(newEntry);
    
    console.log(`Added to waitlist: ${twitterHandle} (${email}) at position ${position}`);
    
    // Return success response
    return res.status(200).json({
      success: true,
      message: 'Thank you for joining our waitlist!',
      data: {
        twitterHandle,
        position,
        joinedAt: new Date(),
        estimatedAccessDate: getEstimatedAccessDate(position)
      }
    });
  } catch (error) {
    console.error('Waitlist API Error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while processing your request. Please try again later.'
    });
  }
};

// Helper function to estimate access date based on position
function getEstimatedAccessDate(position) {
  // Example logic: 100 users get access each week
  const currentDate = new Date();
  const weeksToWait = Math.ceil(position / 100);
  const estimatedDate = new Date(currentDate);
  estimatedDate.setDate(currentDate.getDate() + (weeksToWait * 7));
  return estimatedDate;
} 