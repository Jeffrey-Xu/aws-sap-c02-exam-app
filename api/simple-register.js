// Ultra-simple registration endpoint - minimal dependencies
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
    const { firstName, lastName, email, password } = req.body;

    // Basic validation
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ 
        error: 'All fields are required',
        code: 'MISSING_FIELDS'
      });
    }

    // Simple Redis connection using fetch (no external dependencies)
    const redisUrl = process.env.KV_REST_API_URL;
    const redisToken = process.env.KV_REST_API_TOKEN;

    if (!redisUrl || !redisToken) {
      return res.status(500).json({ 
        error: 'Database configuration missing',
        code: 'CONFIG_ERROR'
      });
    }

    // Create simple user object
    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const user = {
      id: userId,
      email: email.toLowerCase(),
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      password: password, // In production, this should be hashed
      createdAt: new Date().toISOString(),
    };

    // Save to Redis using REST API
    const saveResponse = await fetch(`${redisUrl}/set/user:${userId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${redisToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(user)
    });

    if (!saveResponse.ok) {
      throw new Error(`Redis save failed: ${saveResponse.status}`);
    }

    // Return success (without password)
    const { password: _, ...safeUser } = user;
    
    res.status(201).json({
      success: true,
      user: safeUser,
      message: 'User created successfully (simple version)'
    });

  } catch (error) {
    console.error('Simple registration error:', error);
    res.status(500).json({ 
      error: 'Registration failed',
      details: error.message,
      code: 'SIMPLE_REG_ERROR'
    });
  }
}
