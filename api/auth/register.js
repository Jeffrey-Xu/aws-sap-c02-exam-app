import { db } from '../../lib/db.js';

export default async function handler(req, res) {
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
    const { firstName, lastName, email, password, confirmPassword } = req.body;

    // Validation
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      return res.status(400).json({ 
        error: 'All fields are required',
        code: 'MISSING_FIELDS'
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ 
        error: 'Passwords do not match',
        code: 'PASSWORD_MISMATCH'
      });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        error: 'Invalid email format',
        code: 'INVALID_EMAIL'
      });
    }

    // Password strength validation
    if (password.length < 8) {
      return res.status(400).json({ 
        error: 'Password must be at least 8 characters long',
        code: 'WEAK_PASSWORD'
      });
    }

    // Check user limit (20 users max)
    const userCount = await db.getUserCount();
    if (userCount >= 20) {
      return res.status(400).json({ 
        error: 'Maximum number of users (20) has been reached',
        code: 'USER_LIMIT_REACHED'
      });
    }

    // Create user
    const user = await db.createUser({
      firstName,
      lastName,
      email,
      password
    });

    // Generate JWT token
    const token = db.generateToken(user);

    res.status(201).json({
      success: true,
      user,
      token,
      message: 'User created successfully'
    });

  } catch (error) {
    console.error('Registration error:', error);
    
    if (error.message === 'User with this email already exists') {
      return res.status(400).json({ 
        error: error.message,
        code: 'USER_EXISTS'
      });
    }

    res.status(500).json({ 
      error: 'Registration failed',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
      code: 'REGISTRATION_ERROR'
    });
  }
};
