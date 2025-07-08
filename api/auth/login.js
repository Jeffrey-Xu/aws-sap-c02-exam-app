const { db } = require('../../lib/db.js');

module.exports = async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Email and password are required',
        code: 'MISSING_CREDENTIALS'
      });
    }

    // Authenticate user
    const user = await db.authenticateUser(email, password);

    // Generate JWT token
    const token = db.generateToken(user);

    res.status(200).json({
      success: true,
      user,
      token,
      message: 'Login successful'
    });

  } catch (error) {
    console.error('Login error:', error);
    
    if (error.message === 'Invalid email or password') {
      return res.status(401).json({ 
        error: error.message,
        code: 'INVALID_CREDENTIALS'
      });
    }

    res.status(500).json({ 
      error: 'Internal server error',
      code: 'SERVER_ERROR'
    });
  }
};
