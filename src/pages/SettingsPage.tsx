import React, { useState } from 'react';
import { ArrowLeft, Download, Trash2, Upload, User, Mail, Shield, RotateCcw, Save } from 'lucide-react';
import { Link } from 'react-router-dom';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { useProgressStore } from '../stores/progressStore';
import { useServerAuthStore } from '../stores/serverAuthStore';
import { useExamStore } from '../stores/examStore';
import { useConfirmDialog } from '../hooks/useConfirmDialog';
import { ROUTES } from '../constants';

const SettingsPage: React.FC = () => {
  const { 
    resetProgress, 
    totalQuestions, 
    masteredQuestions, 
    totalStudyTime,
    exportProgress,
    importProgress,
    getStorageStats
  } = useProgressStore();
  
  const { 
    user,
    updateProfile,
    deleteAccount,
    logout
  } = useServerAuthStore();
  
  const { 
    currentSession, 
    resetExam 
  } = useExamStore();
  
  const [importFile, setImportFile] = useState<File | null>(null);
  const [storageStats, setStorageStats] = useState<any>(null);
  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || ''
  });
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  
  // Custom dialog hook
  const { dialogState, showDialog, hideDialog } = useConfirmDialog();
  
  React.useEffect(() => {
    setStorageStats(getStorageStats());
  }, [getStorageStats]);

  React.useEffect(() => {
    if (user) {
      setProfileData({
        firstName: user.firstName,
        lastName: user.lastName
      });
    }
  }, [user]);
  
  const handleUpdateProfile = async () => {
    if (!profileData.firstName.trim() || !profileData.lastName.trim()) {
      alert('Please enter both first and last name.');
      return;
    }

    setIsUpdatingProfile(true);
    const success = await updateProfile({
      firstName: profileData.firstName.trim(),
      lastName: profileData.lastName.trim()
    });

    if (success) {
      showDialog(
        {
          title: 'Success',
          message: 'Profile updated successfully.',
          type: 'success',
          confirmText: 'OK',
          cancelText: ''
        },
        () => {}
      );
    } else {
      alert('Failed to update profile. Please try again.');
    }
    setIsUpdatingProfile(false);
  };

  const handleDeleteAccount = () => {
    showDialog(
      {
        title: 'Delete Account',
        message: 'Are you sure you want to delete your account? This will permanently remove all your data and cannot be undone.',
        type: 'danger',
        confirmText: 'Delete Account',
        cancelText: 'Cancel',
        confirmVariant: 'danger'
      },
      async () => {
        const success = await deleteAccount();
        if (success) {
          // User will be automatically logged out and redirected
        } else {
          alert('Failed to delete account. Please try again.');
        }
      }
    );
  };
  
  const handleResetProgress = () => {
    showDialog(
      {
        title: 'Reset Study Progress',
        message: 'Are you sure you want to reset all your study progress? This action cannot be undone.',
        type: 'warning',
        confirmText: 'Reset Progress',
        cancelText: 'Cancel',
        confirmVariant: 'danger'
      },
      () => {
        resetProgress();
        showDialog(
          {
            title: 'Success',
            message: 'Study progress has been reset successfully.',
            type: 'success',
            confirmText: 'OK',
            cancelText: ''
          },
          () => {}
        );
      }
    );
  };
  
  const handleResetExam = () => {
    showDialog(
      {
        title: 'Reset Current Exam',
        message: 'Are you sure you want to reset the current exam session? This will end your current exam.',
        type: 'warning',
        confirmText: 'Reset Exam',
        cancelText: 'Cancel',
        confirmVariant: 'danger'
      },
      () => {
        resetExam();
        showDialog(
          {
            title: 'Success',
            message: 'Current exam session has been reset successfully.',
            type: 'success',
            confirmText: 'OK',
            cancelText: ''
          },
          () => {}
        );
      }
    );
  };
  
  const handleExportProgress = () => {
    try {
      const progressData = exportProgress();
      const dataBlob = new Blob([progressData], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `aws-sap-c02-progress-${user?.firstName}-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      
      URL.revokeObjectURL(url);
      alert('Progress exported successfully!');
    } catch (error) {
      alert('Failed to export progress. Please try again.');
      console.error('Export error:', error);
    }
  };
  
  const handleImportProgress = async () => {
    if (!importFile) {
      alert('Please select a file to import.');
      return;
    }
    
    try {
      const fileContent = await importFile.text();
      const success = importProgress(fileContent);
      
      if (success) {
        alert('Progress imported successfully! The page will reload to apply changes.');
        window.location.reload();
      } else {
        alert('Failed to import progress. Please check the file format.');
      }
    } catch (error) {
      alert('Failed to import progress. Please check the file format.');
      console.error('Import error:', error);
    }
  };
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setImportFile(file || null);
  };
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link to={ROUTES.HOME}>
          <Button variant="outline" size="sm">
            <ArrowLeft size={16} className="mr-1" />
            Back to Dashboard
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600">Manage your account and study preferences</p>
        </div>
      </div>

      {/* User Profile */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <User className="w-5 h-5 mr-2" />
          Profile Information
        </h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                First Name
              </label>
              <input
                id="firstName"
                type="text"
                value={profileData.firstName}
                onChange={(e) => setProfileData(prev => ({ ...prev, firstName: e.target.value }))}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-aws-orange focus:border-aws-orange"
                placeholder="Enter your first name"
              />
            </div>
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                Last Name
              </label>
              <input
                id="lastName"
                type="text"
                value={profileData.lastName}
                onChange={(e) => setProfileData(prev => ({ ...prev, lastName: e.target.value }))}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-aws-orange focus:border-aws-orange"
                placeholder="Enter your last name"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-md">
              <Mail className="w-4 h-4 text-gray-400" />
              <span className="text-gray-700">{user?.email}</span>
              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Verified</span>
            </div>
          </div>

          <div className="flex justify-end">
            <Button 
              onClick={handleUpdateProfile}
              disabled={isUpdatingProfile}
              className="flex items-center"
            >
              <Save size={16} className="mr-2" />
              {isUpdatingProfile ? 'Updating...' : 'Update Profile'}
            </Button>
          </div>
        </div>
      </Card>

      {/* Study Progress Management */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Study Progress</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{totalQuestions}</div>
            <div className="text-sm text-gray-600">Questions Attempted</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{masteredQuestions}</div>
            <div className="text-sm text-gray-600">Questions Mastered</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {Math.floor(totalStudyTime / 3600)}h {Math.floor((totalStudyTime % 3600) / 60)}m
            </div>
            <div className="text-sm text-gray-600">Total Study Time</div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
            <div>
              <div className="font-medium text-gray-900">Export Progress</div>
              <div className="text-sm text-gray-600">Download your study progress as a backup file</div>
            </div>
            <Button variant="outline" onClick={handleExportProgress}>
              <Download size={16} className="mr-1" />
              Export
            </Button>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
            <div className="flex-1">
              <div className="font-medium text-gray-900">Import Progress</div>
              <div className="text-sm text-gray-600">Restore progress from a backup file</div>
              <div className="mt-2">
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileChange}
                  className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>
            </div>
            <Button 
              variant="outline" 
              onClick={handleImportProgress}
              disabled={!importFile}
              className="ml-4"
            >
              <Upload size={16} className="mr-1" />
              Import
            </Button>
          </div>
          
          {/* Reset Current Exam */}
          {currentSession && (
            <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg">
              <div>
                <div className="font-medium text-gray-900">Reset Current Exam</div>
                <div className="text-sm text-gray-600">End current exam session and return to exam start page</div>
              </div>
              <Button 
                variant="outline" 
                onClick={handleResetExam}
                className="text-orange-600 border-orange-300 hover:bg-orange-50"
              >
                <RotateCcw size={16} className="mr-1" />
                Reset Exam
              </Button>
            </div>
          )}
          
          <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
            <div>
              <div className="font-medium text-gray-900">Reset All Progress</div>
              <div className="text-sm text-gray-600">Clear all study progress and start fresh</div>
            </div>
            <Button 
              variant="outline" 
              onClick={handleResetProgress}
              className="text-red-600 border-red-300 hover:bg-red-50"
            >
              <Trash2 size={16} className="mr-1" />
              Reset
            </Button>
          </div>
        </div>
      </Card>

      {/* Account Management */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Shield className="w-5 h-5 mr-2" />
          Account Management
        </h3>
        <div className="space-y-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex justify-between items-start">
              <div>
                <div className="font-medium text-gray-900">Account Created</div>
                <div className="text-sm text-gray-600">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
                </div>
              </div>
              <div>
                <div className="font-medium text-gray-900">Last Login</div>
                <div className="text-sm text-gray-600">
                  {user?.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : 'Unknown'}
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-medium text-red-900">Delete Account</h4>
                  <p className="text-sm text-red-700 mt-1">
                    Permanently delete your account and all associated data. This action cannot be undone.
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  onClick={handleDeleteAccount}
                  className="text-red-600 border-red-300 hover:bg-red-50 ml-4"
                >
                  <Trash2 size={16} className="mr-1" />
                  Delete Account
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Application Info */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Application Information</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="text-lg font-bold text-gray-900">529</div>
            <div className="text-sm text-gray-600">Total Questions</div>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="text-lg font-bold text-gray-900">5</div>
            <div className="text-sm text-gray-600">Exam Domains</div>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="text-lg font-bold text-gray-900">20</div>
            <div className="text-sm text-gray-600">Max Users</div>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="text-lg font-bold text-gray-900">v2.0</div>
            <div className="text-sm text-gray-600">Version</div>
          </div>
        </div>
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <div className="text-sm text-blue-800">
            <strong>AWS SAP-C02 Exam Prep</strong> - Comprehensive preparation platform for the 
            AWS Solutions Architect Professional certification with detailed explanations and progress tracking.
          </div>
        </div>
      </Card>
      
      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={dialogState.isOpen}
        onClose={hideDialog}
        onConfirm={dialogState.onConfirm}
        title={dialogState.title}
        message={dialogState.message}
        type={dialogState.type}
        confirmText={dialogState.confirmText}
        cancelText={dialogState.cancelText}
        confirmVariant={dialogState.confirmVariant}
      />
    </div>
  );
};

export default SettingsPage;
