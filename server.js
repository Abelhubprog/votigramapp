/**
 * Simple Express server to handle API requests locally
 * Run with: node server.js
 */

const express = require('express');
const path = require('path');
const { MongoClient } = require('mongodb');
const cors = require('cors');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3002;

// MongoDB connection details
const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.DB_NAME || 'votigram';
const COLLECTION_NAME = process.env.WAITLIST_COLLECTION || 'waitlist';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// MongoDB connection
let db = null;
let client = null;

// Nodemailer transporter setup
let transporter;
try {
  transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT || '465', 10),
    secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER, 
      pass: decodeURIComponent(process.env.EMAIL_PASS || ''), // Decode the password
    },
  });
  console.log('Nodemailer transporter configured.');
} catch (error) {
  console.error('Error configuring Nodemailer:', error);
  transporter = null; // Ensure transporter is null if config fails
}

// Function to send confirmation email
async function sendConfirmationEmail(toEmail, username, position) {
  if (!transporter) {
    console.error('Email transporter is not configured. Cannot send email.');
    return; // Don't try to send if setup failed
  }
  
  const mailOptions = {
    from: process.env.EMAIL_FROM || '"Votigram Waitlist" <no-reply@votigram.com>', // sender address
    to: toEmail, // list of receivers
    subject: '✅ Welcome to the Votigram Waitlist!', // Subject line
    text: `Hi ${username},\n\nThanks for joining the Votigram waitlist! You are currently #${position}.\n\nWe'll let you know when you get early access.\n\nBest,\nThe Votigram Team`,
    html: `<p>Hi ${username},</p><p>Thanks for joining the Votigram waitlist! You are currently <strong>#${position}</strong>.</p><p>We'll let you know when you get early access.</p><p>Best,<br>The Votigram Team</p>` // html body
  };

  try {
    console.log(`Sending confirmation email to ${toEmail}...`);
    let info = await transporter.sendMail(mailOptions);
    console.log('Confirmation email sent: %s', info.messageId);
  } catch (error) {
    console.error(`Error sending confirmation email to ${toEmail}:`, error);
    // Log error but don't block the API response
  }
}

async function connectToDatabase() {
  if (db) return db;
  
  try {
    client = await MongoClient.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    db = client.db(DB_NAME);
    console.log('Connected to MongoDB!');
    return db;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}

// Waitlist API endpoint
app.post('/api/waitlist', async (req, res) => {
  console.log('Waitlist API called with data:', req.body);
  
  try {
    // Extract data from request
    const { email, username } = req.body;
    
    // Validate email
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ 
        success: false,
        field: 'email',
        message: 'Please provide a valid email address'
      });
    }
    
    // Validate Twitter username
    if (!username || !/^[A-Za-z0-9_]{3,15}$/.test(username)) {
      return res.status(400).json({
        success: false,
        field: 'username',
        message: 'Please provide a valid Twitter handle (3-15 characters, letters, numbers, and underscores only)'
      });
    }
    
    // Remove @ if present at the beginning
    const twitterHandle = username.startsWith('@') ? username.substring(1) : username;
    
    // Connect to database
    const database = await connectToDatabase();
    const collection = database.collection(COLLECTION_NAME);
    
    // Check if email already exists
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
    
    // Generate waitlist position
    const totalUsers = await collection.countDocuments();
    const position = totalUsers + 1;
    
    // Prepare new entry
    const newEntry = {
      email,
      twitterHandle,
      joinedAt: new Date(),
      status: 'pending',
      position,
      source: req.headers.referer || 'direct'
    };
    
    // Insert into collection
    await collection.insertOne(newEntry);
    console.log(`Added to waitlist: ${twitterHandle} (${email}) at position ${position}`);
    
    // Send confirmation email (asynchronously, don't wait)
    sendConfirmationEmail(email, twitterHandle, position).catch(console.error);
    
    // Return success response
    return res.status(200).json({
      success: true,
      message: 'Thank you for joining our waitlist!',
      data: {
        twitterHandle,
        position,
        joinedAt: new Date(),
        estimatedAccessDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      }
    });
    
  } catch (error) {
    console.error('Error processing waitlist request:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while processing your request. Please try again later.'
    });
  }
});

// Catch-all route for SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`API endpoint available at http://localhost:${PORT}/api/waitlist`);
});

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down server...');
  if (client) {
    await client.close();
    console.log('MongoDB connection closed');
  }
  process.exit(0);
}); 