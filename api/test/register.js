import { Redis } from '@upstash/redis';
import bcrypt from 'bcryptjs';

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
    console.log('Test registration started');
    
    // Initialize Redis
    const redis = new Redis({
      url: process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN,
    });

    console.log('Redis initialized');

    const { firstName, lastName, email, password } = req.body;

    // Basic validation
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ 
        error: 'All fields are required',
        code: 'MISSING_FIELDS'
      });
    }

    console.log('Validation passed');

    // Simple user object
    const userId = `test_user_${Date.now()}`;
    const passwordHash = await bcrypt.hash(password, 10);
    
    console.log('Password hashed');

    const user = {
      id: userId,
      email: email.toLowerCase(),
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      passwordHash,
      createdAt: new Date().toISOString(),
    };

    console.log('User object created');

    // Save to Redis
    await redis.set(`user:${userId}`, user);
    console.log('User saved to Redis');

    // Return success (without sensitive data)
    const { passwordHash: _, ...safeUser } = user;
    
    res.status(201).json({
      success: true,
      user: safeUser,
      message: 'Test user created successfully'
    });

  } catch (error) {
    console.error('Test registration error:', error);
    res.status(500).json({ 
      error: 'Test registration failed',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}
