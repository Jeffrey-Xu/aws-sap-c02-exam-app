const { db } = require '../../lib/db.js';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, username, password');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
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

    // Get all users
    const users = await db.getAllUsers();
    const userMetrics = [];

    for (const user of users) {
      try {
        // Get user progress
        const progress = await db.getUserProgress(user.id);
        
        // Calculate metrics
        const totalQuestions = progress?.totalQuestions || 0;
        const masteredQuestions = progress?.masteredQuestions || 0;
        const studyTime = progress?.totalStudyTime || 0;
        const examAttempts = progress?.examAttempts?.length || 0;
        const studyStreak = progress?.studyStreak || 0;

        // Calculate average score
        let averageScore = 0;
        if (progress?.examAttempts && progress.examAttempts.length > 0) {
          const totalScore = progress.examAttempts.reduce((sum, attempt) => 
            sum + (attempt.score?.percentage || 0), 0);
          averageScore = Math.round(totalScore / progress.examAttempts.length);
        }

        // Calculate readiness score
        const readinessScore = totalQuestions > 0 ? 
          Math.round((masteredQuestions / totalQuestions) * 100) : 0;

        // Determine last active time
        const lastActive = progress?.lastStudied || 
                          user.lastLoginAt || 
                          user.createdAt;

        // Check if user is active (within last 7 days)
        const isActive = new Date(lastActive) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

        userMetrics.push({
          userId: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          registrationDate: user.createdAt,
          lastActive,
          totalQuestions,
          masteredQuestions,
          studyTime,
          examAttempts,
          averageScore,
          studyStreak,
          readinessScore,
          isActive
        });
      } catch (progressError) {
        console.error(`Error getting progress for user ${user.id}:`, progressError);
        
        // Add user with minimal data if progress fetch fails
        userMetrics.push({
          userId: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          registrationDate: user.createdAt,
          lastActive: user.lastLoginAt || user.createdAt,
          totalQuestions: 0,
          masteredQuestions: 0,
          studyTime: 0,
          examAttempts: 0,
          averageScore: 0,
          studyStreak: 0,
          readinessScore: 0,
          isActive: false
        });
      }
    }

    // Calculate overall statistics
    const totalUsers = userMetrics.length;
    const activeUsers = userMetrics.filter(u => u.isActive).length;
    const totalStudyTime = userMetrics.reduce((sum, u) => sum + u.studyTime, 0);
    const totalExamAttempts = userMetrics.reduce((sum, u) => sum + u.examAttempts, 0);
    const avgReadinessScore = totalUsers > 0 ? 
      Math.round(userMetrics.reduce((sum, u) => sum + u.readinessScore, 0) / totalUsers) : 0;

    res.status(200).json({
      success: true,
      users: userMetrics,
      statistics: {
        totalUsers,
        activeUsers,
        totalStudyTime,
        totalExamAttempts,
        avgReadinessScore
      }
    });

  } catch (error) {
    console.error('Admin users error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      code: 'SERVER_ERROR'
    });
  }
}
