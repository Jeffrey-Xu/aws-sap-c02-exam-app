import React, { useState, useEffect } from 'react';
import { Shield, Users, BarChart3, Clock, Trophy, Target, Eye, EyeOff, Download, RefreshCw, Trash2 } from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { formatTime } from '../utils/questionUtils';
import { apiService } from '../services/api';

interface UserMetrics {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
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

interface OverallStats {
  totalUsers: number;
  activeUsers: number;
  totalStudyTime: number;
  totalExamAttempts: number;
  avgReadinessScore: number;
}

const ServerAdminPage: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [users, setUsers] = useState<UserMetrics[]>([]);
  const [overallStats, setOverallStats] = useState<OverallStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sortBy, setSortBy] = useState<keyof UserMetrics>('lastActive');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [deleteConfirm, setDeleteConfirm] = useState<{show: boolean, user: UserMetrics | null}>({show: false, user: null});
  const [deleting, setDeleting] = useState(false);

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
      }, 30000);

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
    setOverallStats(null);
  };

  const loadUserData = async () => {
    setLoading(true);
    setError('');

    try {
      const result = await apiService.getAdminUsers();

      if (result.success && result.data) {
        setUsers(result.data.users);
        setOverallStats(result.data.statistics);
      } else {
        setError(result.error || 'Failed to load user data');
      }
    } catch (err) {
      setError('Network error while loading user data');
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
      ['User ID', 'Email', 'First Name', 'Last Name', 'Registration Date', 'Last Active', 'Total Questions', 'Mastered Questions', 'Study Time (hours)', 'Exam Attempts', 'Average Score (%)', 'Study Streak', 'Readiness Score (%)', 'Active Status'].join(','),
      ...users.map(user => [
        user.userId,
        user.email,
        user.firstName,
        user.lastName,
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

  // Handle delete user confirmation
  const handleDeleteUser = (user: UserMetrics) => {
    setDeleteConfirm({ show: true, user });
  };

  // Confirm delete user
  const confirmDeleteUser = async () => {
    if (!deleteConfirm.user) return;
    
    setDeleting(true);
    try {
      const response = await fetch(`/api/admin/delete-user?userId=${deleteConfirm.user.userId}`, {
        method: 'DELETE',
        headers: {
          'username': 'admin',
          'password': 'nimda'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete user');
      }

      const result = await response.json();
      
      // Remove user from local state
      setUsers(users.filter(u => u.userId !== deleteConfirm.user!.userId));
      
      // Update overall stats
      if (overallStats) {
        setOverallStats({
          ...overallStats,
          totalUsers: overallStats.totalUsers - 1,
          activeUsers: deleteConfirm.user.isActive ? overallStats.activeUsers - 1 : overallStats.activeUsers
        });
      }
      
      // Close confirmation dialog
      setDeleteConfirm({ show: false, user: null });
      
      // Show success message (you could add a toast notification here)
      console.log(`User ${result.deletedUser.email} deleted successfully`);
      
    } catch (error) {
      console.error('Delete user error:', error);
      setError(error instanceof Error ? error.message : 'Failed to delete user');
    } finally {
      setDeleting(false);
    }
  };

  // Cancel delete user
  const cancelDeleteUser = () => {
    setDeleteConfirm({ show: false, user: null });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md p-8">
          <div className="text-center mb-6">
            <Shield className="w-12 h-12 text-red-600 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900">Server Admin Access</h1>
            <p className="text-gray-600">Enter credentials to access server-side admin panel</p>
            <div className="mt-2 text-sm text-blue-600 bg-blue-50 p-2 rounded">
              🚀 Server-Side Mode: Centralized user management
            </div>
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
              Login to Server Admin
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
            <h1 className="text-3xl font-bold text-gray-900">Server Admin Dashboard</h1>
            <p className="text-gray-600">AWS SAP-C02 Exam Prep - Centralized User Management</p>
            <div className="mt-2 text-sm text-green-600 bg-green-50 p-2 rounded inline-block">
              🚀 Server-Side Mode: All users across all devices
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Button onClick={loadUserData} variant="outline" disabled={loading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button onClick={exportData} variant="outline" disabled={users.length === 0}>
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
            
            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-600">{error}</p>
                <Button onClick={loadUserData} className="mt-2" size="sm">
                  Retry
                </Button>
              </div>
            )}
            
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
                <p className="text-gray-600 mt-4">Loading user data from server...</p>
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No user data found on server</p>
                <Button onClick={loadUserData} className="mt-4" variant="outline">
                  Refresh Data
                </Button>
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
                      <th className="text-left py-3 px-4 font-medium text-gray-900 cursor-pointer hover:bg-gray-50" onClick={() => sortUsers('firstName')}>
                        Name {sortBy === 'firstName' && (sortOrder === 'desc' ? '↓' : '↑')}
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
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.userId} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 font-mono text-xs">{user.userId}</td>
                        <td className="py-3 px-4">{user.email}</td>
                        <td className="py-3 px-4">{user.firstName} {user.lastName}</td>
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
                        <td className="py-3 px-4">
                          <button
                            onClick={() => handleDeleteUser(user)}
                            className="inline-flex items-center px-2 py-1 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                            title={`Delete ${user.firstName} ${user.lastName}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
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

      {/* Delete Confirmation Dialog */}
      {deleteConfirm.show && deleteConfirm.user && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-gray-900">Delete User</h3>
              </div>
            </div>
            
            <div className="mb-6">
              <p className="text-sm text-gray-600">
                Are you sure you want to delete the user <strong>{deleteConfirm.user.firstName} {deleteConfirm.user.lastName}</strong> ({deleteConfirm.user.email})?
              </p>
              <p className="text-sm text-red-600 mt-2">
                This action cannot be undone. All user data and progress will be permanently deleted.
              </p>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={cancelDeleteUser}
                disabled={deleting}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteUser}
                disabled={deleting}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors disabled:opacity-50 flex items-center"
              >
                {deleting ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete User
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServerAdminPage;
