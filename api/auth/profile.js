import { kv } from '@vercel/kv';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export default async function handler(req, res) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.userId;

    // Get current user data
    const userData = await kv.hgetall(`user:${userId}`);
    if (!userData) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Extract allowed updates
    const { firstName, lastName, examDate } = req.body;
    const updates = {};

    if (firstName !== undefined) updates.firstName = firstName;
    if (lastName !== undefined) updates.lastName = lastName;
    if (examDate !== undefined) updates.examDate = examDate;

    // Update user data
    if (Object.keys(updates).length > 0) {
      await kv.hmset(`user:${userId}`, updates);
    }

    // Get updated user data
    const updatedUserData = await kv.hgetall(`user:${userId}`);

    // Return updated user data
    const user = {
      id: userId,
      email: updatedUserData.email,
      firstName: updatedUserData.firstName,
      lastName: updatedUserData.lastName,
      createdAt: updatedUserData.createdAt,
      examDate: updatedUserData.examDate
    };

    res.status(200).json({ user });
  } catch (error) {
    console.error('Profile update error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    
    res.status(500).json({ error: 'Internal server error' });
  }
}
