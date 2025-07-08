import { db } from '../../lib/db.js';

export default async function handler(req, res) {
  console.log('🚀 Registration API called');
  console.log('Method:', req.method);
  console.log('Headers:', JSON.stringify(req.headers, null, 2));
  
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    console.log('✅ OPTIONS request handled');
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    console.log('❌ Invalid method:', req.method);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('📝 Processing registration request...');
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    
    const { firstName, lastName, email, password, confirmPassword } = req.body;

    // Validation
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      console.log('❌ Missing fields validation failed');
      return res.status(400).json({ 
        error: 'All fields are required',
        code: 'MISSING_FIELDS'
      });
    }

    if (password !== confirmPassword) {
      console.log('❌ Password mismatch validation failed');
      return res.status(400).json({ 
        error: 'Passwords do not match',
        code: 'PASSWORD_MISMATCH'
      });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log('❌ Email format validation failed');
      return res.status(400).json({ 
        error: 'Invalid email format',
        code: 'INVALID_EMAIL'
      });
    }

    // Password strength validation
    if (password.length < 8) {
      console.log('❌ Password length validation failed');
      return res.status(400).json({ 
        error: 'Password must be at least 8 characters long',
        code: 'WEAK_PASSWORD'
      });
    }

    console.log('✅ All validations passed');

    // Test environment variables
    console.log('🔧 Checking environment variables...');
    console.log('KV_REST_API_URL exists:', !!process.env.KV_REST_API_URL);
    console.log('KV_REST_API_TOKEN exists:', !!process.env.KV_REST_API_TOKEN);
    console.log('JWT_SECRET exists:', !!process.env.JWT_SECRET);
    
    if (process.env.KV_REST_API_URL) {
      console.log('KV_REST_API_URL prefix:', process.env.KV_REST_API_URL.substring(0, 30) + '...');
    }

    // Check user limit (20 users max)
    console.log('📊 Checking user count...');
    const userCount = await db.getUserCount();
    console.log('Current user count:', userCount);
    
    if (userCount >= 20) {
      console.log('❌ User limit reached');
      return res.status(400).json({ 
        error: 'Maximum number of users (20) has been reached',
        code: 'USER_LIMIT_REACHED'
      });
    }

    console.log('👤 Creating user...');
    // Create user
    const user = await db.createUser({
      firstName,
      lastName,
      email,
      password
    });
    console.log('✅ User created successfully:', user.id);

    console.log('🔑 Generating JWT token...');
    // Generate JWT token
    const token = db.generateToken(user);
    console.log('✅ JWT token generated');

    console.log('🎉 Registration completed successfully');
    res.status(201).json({
      success: true,
      user,
      token,
      message: 'User created successfully'
    });

  } catch (error) {
    console.error('💥 Registration error occurred:');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    // Check if it's a specific database error
    if (error.message && error.message.includes('Redis')) {
      console.error('🔴 Redis/Database error detected');
    }
    
    if (error.message && error.message.includes('JWT')) {
      console.error('🔴 JWT error detected');
    }
    
    if (error.message && error.message.includes('bcrypt')) {
      console.error('🔴 bcrypt error detected');
    }

    if (error.message === 'User with this email already exists') {
      console.log('❌ User already exists');
      return res.status(400).json({ 
        error: error.message,
        code: 'USER_EXISTS'
      });
    }

    res.status(500).json({ 
      error: 'Registration failed',
      details: error.message,
      code: 'REGISTRATION_ERROR',
      timestamp: new Date().toISOString()
    });
  }
};
