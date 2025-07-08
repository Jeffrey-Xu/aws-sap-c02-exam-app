import React, { useState, useEffect } from 'react';
import { Shield, Users, BarChart3, Clock, Trophy, Target, Eye, EyeOff, Download, RefreshCw } from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { formatTime } from '../utils/questionUtils';

interface UserMetrics {
  userId: string;
  email: string;
  registrationDate: string;
  lastActive: string;
  totalQuestions: number;
  masteredQuestions: number;
  studyTime: number;
  examAttempts: number;
  averageScore: number;
  studyStreak: number;
  readinessScore: number;
  isActive: boolean;
}

const AdminPage: React.FC = () => {
  // Route verification
  if (window.location.pathname !== '/admin') {
    console.error('AdminPage loaded but pathname is not /admin:', window.location.pathname);
  }
  
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [users, setUsers] = useState<UserMetrics[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sortBy, setSortBy] = useState<keyof UserMetrics>('lastActive');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Check if already authenticated on mount
  useEffect(() => {
    const adminAuth = localStorage.getItem('admin_authenticated');
    if (adminAuth === 'true') {
      setIsAuthenticated(true);
      loadUserData();
    }
  }, []);

  // Auto-refresh user data every 30 seconds when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const interval = setInterval(() => {
        loadUserData();
      }, 30000); // Refresh every 30 seconds

      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (username === 'admin' && password === 'nimda') {
      setIsAuthenticated(true);
      localStorage.setItem('admin_authenticated', 'true');
      loadUserData();
    } else {
      setError('Invalid credentials');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('admin_authenticated');
    setUsername('');
    setPassword('');
    setUsers([]);
  };

  const loadUserData = (forceRefresh = false) => {
    setLoading(true);
    try {
      const userData: UserMetrics[] = [];
      
      // Force refresh by clearing any potential caching
      if (forceRefresh) {
        console.log('=== FORCE REFRESH TRIGGERED ===');
        console.log('Current localStorage keys:');
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && (key.includes('user') || key.includes('aws_exam_app'))) {
            const value = localStorage.getItem(key);
            if (key === 'aws_exam_app_users') {
              console.log(`  ${key}:`, value);
              try {
                const parsed = JSON.parse(value || '[]');
                console.log(`    Parsed users (${parsed.length}):`, parsed.map((u: { id: string; email: string; createdAt: string }) => ({ id: u.id, email: u.email, createdAt: u.createdAt })));
              } catch {
                console.log('    Failed to parse users data');
              }
            } else {
              console.log(`  ${key}: ${value?.substring(0, 100)}...`);
            }
          }
        }
        
        // Check for any users that might be in different storage locations
        console.log('=== CHECKING ALTERNATIVE STORAGE ===');
        
        // Check session storage as well
        console.log('SessionStorage items:');
        for (let i = 0; i < sessionStorage.length; i++) {
          const key = sessionStorage.key(i);
          if (key && key.includes('user')) {
            console.log(`  Session: ${key}`);
          }
        }
        
        // Small delay to ensure any pending localStorage writes are complete
        setTimeout(() => {
          loadUserData(false);
        }, 100);
        return;
      }
      
      // Get user data from auth store
      const usersData = localStorage.getItem('aws_exam_app_users');
      console.log('Current aws_exam_app_users:', usersData);
      
      if (usersData && usersData !== 'null' && usersData !== '[]') {
        const users = JSON.parse(usersData);
        console.log(`Found ${users.length} users in storage:`, users.map((u: { email: string; id: string; createdAt: string }) => ({ email: u.email, id: u.id, createdAt: u.createdAt })));
        
        interface ProgressData {
          totalQuestions?: number;
          masteredQuestions?: number;
          totalStudyTime?: number;
          examAttempts?: Array<{ score?: { percentage: number } }>;
          studyStreak?: number;
        }
        
        users.forEach((user: { id: string; email: string }) => {
          try {
            // Try the specific progress key patterns found in localStorage
            const possibleProgressKeys = [
              `progress-store-${user.id}`,
              `user_progress_${user.id}`,
              `progress-store-user_${user.id}`,
              `user_progress_user_${user.id}`
            ];
            
            let progressData: ProgressData = {};
            
            for (const key of possibleProgressKeys) {
              const data = localStorage.getItem(key);
              if (data && data !== 'null') {
                try {
                  progressData = JSON.parse(data) as ProgressData;
                  break;
                } catch {
                  console.log(`Failed to parse data for key: ${key}`);
                }
              }
            }
            
            // Calculate metrics from progress data
            const totalQuestions = progressData.totalQuestions || 0;
            const masteredQuestions = progressData.masteredQuestions || 0;
            const studyTime = progressData.totalStudyTime || 0;
            const examAttempts = progressData.examAttempts?.length || 0;
            const studyStreak = progressData.studyStreak || 0;
            
            // Calculate average score from exam attempts
            let averageScore = 0;
            if (progressData.examAttempts && progressData.examAttempts.length > 0) {
              const totalScore = progressData.examAttempts.reduce((sum: number, attempt) => 
                sum + (attempt.score?.percentage || 0), 0);
              averageScore = Math.round(totalScore / progressData.examAttempts.length);
            }
            
            // Calculate readiness score
            const readinessScore = totalQuestions > 0 ? 
              Math.round((masteredQuestions / totalQuestions) * 100) : 0;
            
            // Determine last active time
            const lastActive = (progressData as any).lastStudied || 
                             user.lastLoginAt || 
                             user.createdAt || 
                             new Date().toISOString();
            
            userData.push({
              userId: user.id,
              email: user.email,
              registrationDate: user.createdAt || new Date().toISOString(),
              lastActive,
              totalQuestions,
              masteredQuestions,
              studyTime,
              examAttempts,
              averageScore,
              studyStreak,
              readinessScore,
              isActive: new Date(lastActive) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
            });
          } catch (err) {
            console.error('Error parsing user data for user:', user?.id, err);
          }
        });
      } else {
        console.log('No users found in aws_exam_app_users, checking progress keys...');
        // If no users in aws_exam_app_users, try to extract from progress keys directly
        const progressKeys = Object.keys(localStorage).filter(key => 
          key.startsWith('progress-store-') || key.startsWith('user_progress_')
        );
        
        console.log('Found progress keys:', progressKeys);
        
        progressKeys.forEach(key => {
          try {
            const data = localStorage.getItem(key);
            if (data && data !== 'null') {
              const progressData = JSON.parse(data);
              
              // Extract user ID from key
              let userId = '';
              if (key.startsWith('progress-store-')) {
                userId = key.replace('progress-store-', '');
              } else if (key.startsWith('user_progress_')) {
                userId = key.replace('user_progress_', '');
              }
              
              // Try to get user info from session or create placeholder
              const sessionData = localStorage.getItem('aws_exam_app_session');
              let userEmail = `user_${userId.substring(0, 8)}@example.com`;
              let registrationDate = new Date().toISOString();
              
              if (sessionData) {
                try {
                  const session = JSON.parse(sessionData);
                  if (session.state?.user) {
                    userEmail = session.state.user.email || userEmail;
                    registrationDate = session.state.user.createdAt || registrationDate;
                  }
                } catch (e) {
                  console.log('Failed to parse session data');
                }
              }
              
              // Calculate metrics
              const totalQuestions = progressData.totalQuestions || 0;
              const masteredQuestions = progressData.masteredQuestions || 0;
              const studyTime = progressData.totalStudyTime || 0;
              const examAttempts = progressData.examAttempts?.length || 0;
              const studyStreak = progressData.studyStreak || 0;
              
              let averageScore = 0;
              if (progressData.examAttempts && progressData.examAttempts.length > 0) {
                const totalScore = progressData.examAttempts.reduce((sum: number, attempt: any) => 
                  sum + (attempt.score?.percentage || 0), 0);
                averageScore = Math.round(totalScore / progressData.examAttempts.length);
              }
              
              const readinessScore = totalQuestions > 0 ? 
                Math.round((masteredQuestions / totalQuestions) * 100) : 0;
              
              const lastActive = progressData.lastStudied || registrationDate;
              
              userData.push({
                userId,
                email: userEmail,
                registrationDate,
                lastActive,
                totalQuestions,
                masteredQuestions,
                studyTime,
                examAttempts,
                averageScore,
                studyStreak,
                readinessScore,
                isActive: new Date(lastActive) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
              });
            }
          } catch (err) {
            console.error('Error parsing progress data for key:', key, err);
          }
        });
      }
      
      console.log(`Final userData array: ${userData.length} users found`);
      console.log('Users:', userData.map(u => ({ email: u.email, id: u.userId, registered: u.registrationDate })));
      setUsers(userData);
    } catch (err) {
      setError('Failed to load user data');
      console.error('Error loading user data:', err);
    } finally {
      setLoading(false);
    }
  };

  const sortUsers = (field: keyof UserMetrics) => {
    const newOrder = sortBy === field && sortOrder === 'desc' ? 'asc' : 'desc';
    setSortBy(field);
    setSortOrder(newOrder);
    
    const sortedUsers = [...users].sort((a, b) => {
      const aVal = a[field];
      const bVal = b[field];
      
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return newOrder === 'desc' ? bVal.localeCompare(aVal) : aVal.localeCompare(bVal);
      }
      
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return newOrder === 'desc' ? bVal - aVal : aVal - bVal;
      }
      
      return 0;
    });
    
    setUsers(sortedUsers);
  };

  const exportData = () => {
    const csvContent = [
      ['User ID', 'Email', 'Registration Date', 'Last Active', 'Total Questions', 'Mastered Questions', 'Study Time (hours)', 'Exam Attempts', 'Average Score (%)', 'Study Streak', 'Readiness Score (%)', 'Active Status'].join(','),
      ...users.map(user => [
        user.userId,
        user.email,
        new Date(user.registrationDate).toLocaleDateString(),
        new Date(user.lastActive).toLocaleDateString(),
        user.totalQuestions,
        user.masteredQuestions,
        Math.round(user.studyTime / 3600 * 100) / 100,
        user.examAttempts,
        user.averageScore,
        user.studyStreak,
        user.readinessScore,
        user.isActive ? 'Active' : 'Inactive'
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aws-sap-c02-users-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const calculateOverallStats = () => {
    if (users.length === 0) return null;
    
    const totalUsers = users.length;
    const activeUsers = users.filter(u => u.isActive).length;
    const totalStudyTime = users.reduce((sum, u) => sum + u.studyTime, 0);
    const totalExamAttempts = users.reduce((sum, u) => sum + u.examAttempts, 0);
    const avgReadinessScore = Math.round(users.reduce((sum, u) => sum + u.readinessScore, 0) / totalUsers);
    
    return {
      totalUsers,
      activeUsers,
      totalStudyTime,
      totalExamAttempts,
      avgReadinessScore
    };
  };

  const overallStats = calculateOverallStats();

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md p-8">
          <div className="text-center mb-6">
            <Shield className="w-12 h-12 text-red-600 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900">Admin Access</h1>
            <p className="text-gray-600">Enter credentials to access admin panel</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            
            {error && (
              <div className="text-red-600 text-sm text-center">{error}</div>
            )}
            
            <Button type="submit" className="w-full">
              Login
            </Button>
          </form>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600">AWS SAP-C02 Exam Prep - User Management</p>
          </div>
          <div className="flex items-center space-x-4">
            <Button onClick={() => loadUserData(true)} variant="outline" disabled={loading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Force Refresh
            </Button>
            <Button onClick={exportData} variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
            <Button onClick={handleLogout} variant="outline">
              Logout
            </Button>
          </div>
        </div>

        {/* Overall Stats */}
        {overallStats && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
            <Card className="p-6 text-center">
              <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{overallStats.totalUsers}</div>
              <div className="text-sm text-gray-600">Total Users</div>
            </Card>
            
            <Card className="p-6 text-center">
              <Target className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{overallStats.activeUsers}</div>
              <div className="text-sm text-gray-600">Active Users</div>
            </Card>
            
            <Card className="p-6 text-center">
              <Clock className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{formatTime(overallStats.totalStudyTime)}</div>
              <div className="text-sm text-gray-600">Total Study Time</div>
            </Card>
            
            <Card className="p-6 text-center">
              <BarChart3 className="w-8 h-8 text-orange-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{overallStats.totalExamAttempts}</div>
              <div className="text-sm text-gray-600">Total Exams</div>
            </Card>
            
            <Card className="p-6 text-center">
              <Trophy className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{overallStats.avgReadinessScore}%</div>
              <div className="text-sm text-gray-600">Avg Readiness</div>
            </Card>
          </div>
        )}

        {/* User Table */}
        <Card>
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              User Accounts ({users.length})
            </h2>
            
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
                <p className="text-gray-600 mt-4">Loading user data...</p>
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No user data found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-900 cursor-pointer hover:bg-gray-50" onClick={() => sortUsers('userId')}>
                        User ID {sortBy === 'userId' && (sortOrder === 'desc' ? '↓' : '↑')}
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900 cursor-pointer hover:bg-gray-50" onClick={() => sortUsers('email')}>
                        Email {sortBy === 'email' && (sortOrder === 'desc' ? '↓' : '↑')}
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900 cursor-pointer hover:bg-gray-50" onClick={() => sortUsers('registrationDate')}>
                        Registered {sortBy === 'registrationDate' && (sortOrder === 'desc' ? '↓' : '↑')}
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900 cursor-pointer hover:bg-gray-50" onClick={() => sortUsers('lastActive')}>
                        Last Active {sortBy === 'lastActive' && (sortOrder === 'desc' ? '↓' : '↑')}
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900 cursor-pointer hover:bg-gray-50" onClick={() => sortUsers('masteredQuestions')}>
                        Progress {sortBy === 'masteredQuestions' && (sortOrder === 'desc' ? '↓' : '↑')}
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900 cursor-pointer hover:bg-gray-50" onClick={() => sortUsers('studyTime')}>
                        Study Time {sortBy === 'studyTime' && (sortOrder === 'desc' ? '↓' : '↑')}
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900 cursor-pointer hover:bg-gray-50" onClick={() => sortUsers('examAttempts')}>
                        Exams {sortBy === 'examAttempts' && (sortOrder === 'desc' ? '↓' : '↑')}
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900 cursor-pointer hover:bg-gray-50" onClick={() => sortUsers('readinessScore')}>
                        Readiness {sortBy === 'readinessScore' && (sortOrder === 'desc' ? '↓' : '↑')}
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.userId} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 font-mono text-xs">{user.userId}</td>
                        <td className="py-3 px-4">{user.email}</td>
                        <td className="py-3 px-4">{new Date(user.registrationDate).toLocaleDateString()}</td>
                        <td className="py-3 px-4">{new Date(user.lastActive).toLocaleDateString()}</td>
                        <td className="py-3 px-4">
                          <div className="text-sm">
                            <div>{user.masteredQuestions} / {user.totalQuestions}</div>
                            <div className="text-gray-500">({user.totalQuestions > 0 ? Math.round((user.masteredQuestions / user.totalQuestions) * 100) : 0}%)</div>
                          </div>
                        </td>
                        <td className="py-3 px-4">{formatTime(user.studyTime)}</td>
                        <td className="py-3 px-4">
                          <div className="text-sm">
                            <div>{user.examAttempts} attempts</div>
                            {user.averageScore > 0 && (
                              <div className="text-gray-500">{user.averageScore}% avg</div>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className={`text-sm font-medium ${
                            user.readinessScore >= 80 ? 'text-green-600' : 
                            user.readinessScore >= 60 ? 'text-orange-600' : 'text-red-600'
                          }`}>
                            {user.readinessScore}%
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            user.isActive 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {user.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdminPage;
