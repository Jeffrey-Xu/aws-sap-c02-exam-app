const { db } = require('../../lib/db.js');

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'PUT') {
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
    if (!decoded) {
      return res.status(401).json({ 
        error: 'Invalid or expired token',
        code: 'INVALID_TOKEN'
      });
    }

    const userId = decoded.userId;

    // Get current user data
    const currentUser = await db.getUserById(userId);
    if (!currentUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Extract allowed updates
    const { firstName, lastName, examDate } = req.body;
    const updates = { ...currentUser };

    if (firstName !== undefined) updates.firstName = firstName;
    if (lastName !== undefined) updates.lastName = lastName;
    if (examDate !== undefined) updates.examDate = examDate;

    // Update user data
    const success = await db.updateUser(userId, updates);
    
    if (!success) {
      return res.status(500).json({ error: 'Failed to update profile' });
    }

    // Return updated user data
    const user = {
      id: userId,
      email: updates.email,
      firstName: updates.firstName,
      lastName: updates.lastName,
      createdAt: updates.createdAt,
      examDate: updates.examDate
    };

    res.status(200).json({ user });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
