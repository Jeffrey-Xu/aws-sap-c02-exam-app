const { db } = require '../../lib/db.js';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
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

    // Get user progress
    const progress = await db.getUserProgress(userId);

    if (!progress) {
      return res.status(404).json({ 
        error: 'Progress not found',
        code: 'PROGRESS_NOT_FOUND'
      });
    }

    res.status(200).json({
      success: true,
      progress
    });

  } catch (error) {
    console.error('Load progress error:', error);
    
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
