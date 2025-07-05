import React, { useState } from 'react';
import { ArrowLeft, Download, Trash2, Upload, Database, Shield, RotateCcw } from 'lucide-react';
import { Link } from 'react-router-dom';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import ConfirmDialog from '../components/common/ConfirmDialog';
import DataManagement from '../components/settings/DataManagement';
import { useProgressStore } from '../stores/progressStore';
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
    currentSession, 
    resetExam 
  } = useExamStore();
  
  const [importFile, setImportFile] = useState<File | null>(null);
  const [storageStats, setStorageStats] = useState<any>(null);
  
  // Custom dialog hook
  const { dialogState, showDialog, hideDialog } = useConfirmDialog();
  
  React.useEffect(() => {
    setStorageStats(getStorageStats());
  }, [getStorageStats]);
  
  const handleResetProgress = () => {
    showDialog(
      {
        title: 'Reset All Progress',
        message: 'Are you sure you want to reset all progress? This action cannot be undone.',
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
            message: 'Progress has been reset successfully.',
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
      link.download = `aws-sap-c02-progress-${new Date().toISOString().split('T')[0]}.json`;
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
          <p className="text-gray-600">Manage your exam preparation preferences</p>
        </div>
      </div>
      
      {/* Progress Management */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Progress Management</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
            <div>
              <div className="font-medium text-gray-900">Export Progress</div>
              <div className="text-sm text-gray-600">Download your complete study progress as a backup file</div>
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
              <div className="font-medium text-gray-900">Reset Progress</div>
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
      
      {/* Storage Information */}
      {storageStats && (
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Storage Information</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <Database className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <div className="text-lg font-bold text-gray-900">
                {Math.round(storageStats.progressSize / 1024)}KB
              </div>
              <div className="text-sm text-gray-600">Progress Data</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <Shield className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <div className="text-lg font-bold text-gray-900">{storageStats.backupCount}</div>
              <div className="text-sm text-gray-600">Backup Copies</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-lg font-bold text-gray-900">
                {Math.round(storageStats.used / 1024)}KB
              </div>
              <div className="text-sm text-gray-600">Total Used</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-lg font-bold text-gray-900">
                {Math.round(storageStats.available / 1024)}KB
              </div>
              <div className="text-sm text-gray-600">Available</div>
            </div>
          </div>
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <div className="text-sm text-blue-800">
              <strong>Auto-backup:</strong> Your progress is automatically backed up every 30 seconds and when you close the app.
              Multiple backup copies are maintained for data safety.
            </div>
          </div>
        </Card>
      )}
      
      {/* Study Statistics */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Study Statistics</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">{totalQuestions}</div>
            <div className="text-sm text-gray-600">Total Questions</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">{masteredQuestions}</div>
            <div className="text-sm text-gray-600">Questions Mastered</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">
              {Math.floor(totalStudyTime / 3600)}h {Math.floor((totalStudyTime % 3600) / 60)}m
            </div>
            <div className="text-sm text-gray-600">Total Study Time</div>
          </div>
        </div>
      </Card>
      
      {/* Application Info */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Application Information</h3>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Version</span>
            <span className="font-medium">1.0.0</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Question Bank</span>
            <span className="font-medium">529 Questions</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Exam</span>
            <span className="font-medium">AWS SAP-C02</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Last Updated</span>
            <span className="font-medium">{new Date().toLocaleDateString()}</span>
          </div>
        </div>
      </Card>
      
      {/* Data Management */}
      <DataManagement />
      
      {/* About */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">About</h3>
        <div className="prose prose-sm text-gray-600">
          <p>
            This application is designed to help you prepare for the AWS Solutions Architect Professional (SAP-C02) certification exam. 
            It includes practice questions, full exam simulation, and detailed analytics to track your progress.
          </p>
          <p className="mt-3">
            The question bank contains 529 carefully curated questions with detailed explanations to help you understand 
            AWS services and architectural best practices.
          </p>
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
