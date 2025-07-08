import { Redis } from '@upstash/redis';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Test Redis connection
    const redis = new Redis({
      url: process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN,
    });

    // Simple test - set and get a value
    const testKey = 'test-connection';
    const testValue = 'connection-working-' + Date.now();
    
    await redis.set(testKey, testValue);
    const retrievedValue = await redis.get(testKey);
    await redis.del(testKey); // cleanup

    const connectionTest = {
      redisConnected: retrievedValue === testValue,
      testValue: testValue,
      retrievedValue: retrievedValue,
      timestamp: new Date().toISOString()
    };

    res.status(200).json({
      success: true,
      database: connectionTest,
      message: 'Database connection test'
    });

  } catch (error) {
    console.error('Database connection error:', error);
    res.status(500).json({ 
      error: 'Database connection failed',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}
