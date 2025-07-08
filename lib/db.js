// Updated for Upstash Redis via Vercel Marketplace - CommonJS format
const { Redis } = require('@upstash/redis');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

// Initialize Upstash Redis client - use existing Vercel KV variable names
const redis = new Redis({
  url: process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN,
});

// Database keys
const USERS_KEY = 'users';
const USER_PREFIX = 'user:';
const PROGRESS_PREFIX = 'progress:';

// JWT secret (in production, use environment variable)
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

// User management functions
const db = {
  // Get all users
  async getAllUsers() {
    try {
      const userIds = await redis.smembers(USERS_KEY) || [];
      const users = [];
      
      for (const userId of userIds) {
        const user = await redis.get(`${USER_PREFIX}${userId}`);
        if (user) {
          users.push(user);
        }
      }
      
      return users;
    } catch (error) {
      console.error('Error getting all users:', error);
      return [];
    }
  },

  // Get user by ID
  async getUserById(userId) {
    try {
      return await redis.get(`${USER_PREFIX}${userId}`);
    } catch (error) {
      console.error('Error getting user by ID:', error);
      return null;
    }
  },

  // Get user by email
  async getUserByEmail(email) {
    try {
      const users = await this.getAllUsers();
      return users.find(user => user.email.toLowerCase() === email.toLowerCase()) || null;
    } catch (error) {
      console.error('Error getting user by email:', error);
      return null;
    }
  },

  // Create new user
  async createUser(userData) {
    try {
      const { firstName, lastName, email, password } = userData;
      
      // Check if user already exists
      const existingUser = await this.getUserByEmail(email);
      if (existingUser) {
        throw new Error('User with this email already exists');
      }

      // Generate user ID and hash password
      const userId = `user_${uuidv4().replace(/-/g, '').substring(0, 16)}`;
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      const user = {
        id: userId,
        email: email.toLowerCase(),
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        passwordHash,
        salt,
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
        isEmailVerified: true
      };

      // Save user
      await redis.set(`${USER_PREFIX}${userId}`, user);
      await redis.sadd(USERS_KEY, userId);

      // Initialize empty progress
      await this.initializeUserProgress(userId);

      return { ...user, passwordHash: undefined, salt: undefined };
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  },

  // Authenticate user
  async authenticateUser(email, password) {
    try {
      const user = await this.getUserByEmail(email);
      if (!user) {
        throw new Error('Invalid email or password');
      }

      const isValidPassword = await bcrypt.compare(password, user.passwordHash);
      if (!isValidPassword) {
        throw new Error('Invalid email or password');
      }

      // Update last login
      user.lastLoginAt = new Date().toISOString();
      await redis.set(`${USER_PREFIX}${user.id}`, user);

      return { ...user, passwordHash: undefined, salt: undefined };
    } catch (error) {
      console.error('Error authenticating user:', error);
      throw error;
    }
  },

  // Generate JWT token
  generateToken(user) {
    return jwt.sign(
      { 
        userId: user.id, 
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
  },

  // Verify JWT token
  verifyToken(token) {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  },

  // Initialize user progress
  async initializeUserProgress(userId) {
    try {
      const initialProgress = {
        userId,
        questionProgress: {},
        totalQuestions: 0,
        masteredQuestions: 0,
        categoryProgress: {},
        studyStreak: 0,
        examAttempts: [],
        totalStudyTime: 0,
        lastStudied: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await redis.set(`${PROGRESS_PREFIX}${userId}`, initialProgress);
      return initialProgress;
    } catch (error) {
      console.error('Error initializing user progress:', error);
      throw error;
    }
  },

  // Get user progress
  async getUserProgress(userId) {
    try {
      const progress = await redis.get(`${PROGRESS_PREFIX}${userId}`);
      if (!progress) {
        return await this.initializeUserProgress(userId);
      }
      return progress;
    } catch (error) {
      console.error('Error getting user progress:', error);
      return null;
    }
  },

  // Save user progress
  async saveUserProgress(userId, progressData) {
    try {
      const existingProgress = await this.getUserProgress(userId);
      const updatedProgress = {
        ...existingProgress,
        ...progressData,
        userId,
        updatedAt: new Date().toISOString()
      };

      await redis.set(`${PROGRESS_PREFIX}${userId}`, updatedProgress);
      return updatedProgress;
    } catch (error) {
      console.error('Error saving user progress:', error);
      throw error;
    }
  },

  // Get user count
  async getUserCount() {
    try {
      const userIds = await redis.smembers(USERS_KEY) || [];
      return userIds.length;
    } catch (error) {
      console.error('Error getting user count:', error);
      return 0;
    }
  },

  // Delete user (admin function)
  async deleteUser(userId) {
    try {
      await redis.del(`${USER_PREFIX}${userId}`);
      await redis.del(`${PROGRESS_PREFIX}${userId}`);
      await redis.srem(USERS_KEY, userId);
      return true;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }
};

// Middleware for authentication
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const user = db.verifyToken(token);
    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

// Admin authentication middleware
const authenticateAdmin = (req, res, next) => {
  const { username, password } = req.headers;
  
  if (username === 'admin' && password === 'nimda') {
    next();
  } else {
    return res.status(401).json({ error: 'Admin authentication required' });
  }
};

module.exports = { db, authenticateToken, authenticateAdmin };

// Middleware for authentication
export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const user = db.verifyToken(token);
    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

// Admin authentication middleware
export const authenticateAdmin = (req, res, next) => {
  const { username, password } = req.headers;
  
  if (username === 'admin' && password === 'nimda') {
    next();
  } else {
    return res.status(401).json({ error: 'Admin authentication required' });
  }
};
