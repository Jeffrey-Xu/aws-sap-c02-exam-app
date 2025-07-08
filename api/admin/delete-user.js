import { db } from '../../lib/db.js';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, username, password');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Admin authentication
    const { username, password } = req.headers;
    
    if (username !== 'admin' || password !== 'nimda') {
      return res.status(401).json({ 
        error: 'Admin authentication required',
        code: 'ADMIN_AUTH_REQUIRED'
      });
    }

    // Get user ID from query parameters
    const { userId } = req.query;
    
    if (!userId) {
      return res.status(400).json({ 
        error: 'User ID is required',
        code: 'MISSING_USER_ID'
      });
    }

    // Check if user exists
    const user = await db.getUserById(userId);
    if (!user) {
      return res.status(404).json({ 
        error: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    // Delete the user
    await db.deleteUser(userId);

    res.status(200).json({
      success: true,
      message: `User ${user.email} has been deleted successfully`,
      deletedUser: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName
      }
    });

  } catch (error) {
    console.error('Admin delete user error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      code: 'SERVER_ERROR',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
