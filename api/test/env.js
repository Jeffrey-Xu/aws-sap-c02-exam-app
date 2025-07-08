module.exports = async function handler(req, res) {
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
    const envCheck = {
      hasUpstashUrl: !!process.env.UPSTASH_REDIS_REST_URL,
      hasUpstashToken: !!process.env.UPSTASH_REDIS_REST_TOKEN,
      hasJwtSecret: !!process.env.JWT_SECRET,
      upstashUrlPrefix: process.env.UPSTASH_REDIS_REST_URL ? 
        process.env.UPSTASH_REDIS_REST_URL.substring(0, 20) + '...' : 'MISSING',
      nodeEnv: process.env.NODE_ENV || 'undefined'
    };

    res.status(200).json({
      success: true,
      environment: envCheck,
      message: 'Environment variables check'
    });

  } catch (error) {
    console.error('Environment check error:', error);
    res.status(500).json({ 
      error: 'Environment check failed',
      details: error.message
    });
  }
};
