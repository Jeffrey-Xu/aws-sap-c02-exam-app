import { db } from '../../lib/db.js';

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
      console.log('Profile update failed: No token provided');
      return res.status(401).json({ 
        error: 'Access token required',
        code: 'NO_TOKEN'
      });
    }

    let decoded;
    try {
      decoded = db.verifyToken(token);
      console.log('Token verified successfully for user:', decoded.userId);
    } catch (tokenError) {
      console.log('Profile update failed: Token verification error:', tokenError.message);
      return res.status(401).json({ 
        error: 'Invalid or expired token',
        code: 'INVALID_TOKEN'
      });
    }

    const userId = decoded.userId;
    console.log('Profile update request for user:', userId);

    // Get current user data
    const currentUser = await db.getUserById(userId);
    if (!currentUser) {
      console.log('Profile update failed: User not found:', userId);
      return res.status(404).json({ error: 'User not found' });
    }

    // Extract allowed updates
    const { firstName, lastName, examDate } = req.body;
    console.log('Profile update data:', { firstName, lastName, examDate });
    
    const updates = { ...currentUser };

    if (firstName !== undefined) updates.firstName = firstName;
    if (lastName !== undefined) updates.lastName = lastName;
    if (examDate !== undefined) updates.examDate = examDate;

    // Update user data
    console.log('Attempting to update user:', userId);
    const success = await db.updateUser(userId, updates);
    
    if (!success) {
      console.log('Profile update failed: Database update failed for user:', userId);
      return res.status(500).json({ error: 'Failed to update profile' });
    }

    console.log('Profile update successful for user:', userId);

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
    console.error('Error stack:', error.stack);
    console.error('Error details:', {
      message: error.message,
      name: error.name,
      code: error.code
    });
    res.status(500).json({ error: 'Internal server error' });
  }
}
