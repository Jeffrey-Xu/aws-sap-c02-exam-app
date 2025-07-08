const { db } = require '../../lib/db.js';

module.exports = async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Authenticate token
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ 
        error: 'Access token required',
        code: 'NO_TOKEN'
      });
    }

    const decoded = db.verifyToken(token);
    const userId = decoded.userId;

    // Get progress data from request body
    const progressData = req.body;

    // Validate required fields
    if (!progressData || typeof progressData !== 'object') {
      return res.status(400).json({ 
        error: 'Invalid progress data',
        code: 'INVALID_DATA'
      });
    }

    // Save progress
    const updatedProgress = await db.saveUserProgress(userId, {
      ...progressData,
      lastStudied: new Date().toISOString()
    });

    res.status(200).json({
      success: true,
      progress: updatedProgress,
      message: 'Progress saved successfully'
    });

  } catch (error) {
    console.error('Save progress error:', error);
    
    if (error.message === 'Invalid or expired token') {
      return res.status(403).json({ 
        error: error.message,
        code: 'INVALID_TOKEN'
      });
    }

    res.status(500).json({ 
      error: 'Internal server error',
      code: 'SERVER_ERROR'
    });
  }
}
