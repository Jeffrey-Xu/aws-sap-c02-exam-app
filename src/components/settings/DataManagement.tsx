import React, { useState } from 'react';
import { Download, Upload, Trash2, AlertTriangle, CheckCircle, FileText } from 'lucide-react';
import Card from '../common/Card';
import Button from '../common/Button';
import ConfirmDialog from '../common/ConfirmDialog';
import { useProgressStore } from '../../stores/progressStore';

const DataManagement: React.FC = () => {
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [importMessage, setImportMessage] = useState('');
  
  const { 
    exportProgress, 
    importProgress, 
    resetProgress,
    getStorageStats,
    totalQuestions,
    masteredQuestions,
    examAttempts
  } = useProgressStore();

  const handleExport = () => {
    try {
      const data = exportProgress();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `aws-sap-c02-progress-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
      setImportStatus('error');
      setImportMessage('Failed to export progress data');
    }
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result as string;
        const success = importProgress(data);
        
        if (success) {
          setImportStatus('success');
          setImportMessage('Progress data imported successfully!');
        } else {
          setImportStatus('error');
          setImportMessage('Invalid progress data format');
        }
      } catch (error) {
        setImportStatus('error');
        setImportMessage('Failed to import progress data');
      }
    };
    
    reader.readAsText(file);
    event.target.value = ''; // Reset input
  };

  const handleReset = () => {
    resetProgress();
    setShowResetDialog(false);
    setImportStatus('success');
    setImportMessage('All progress data has been reset');
  };

  const storageStats = getStorageStats();
  const progressSummary = {
    totalQuestions,
    masteredQuestions,
    examAttempts: examAttempts.length,
    completionRate: totalQuestions > 0 ? Math.round((masteredQuestions / totalQuestions) * 100) : 0
  };

  return (
    <div className="space-y-6">
      {/* Progress Summary */}
      <Card>
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Progress Summary</h3>
          <p className="text-gray-600">Overview of your current study progress</p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{progressSummary.totalQuestions}</div>
            <div className="text-sm text-blue-800">Questions Attempted</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{progressSummary.masteredQuestions}</div>
            <div className="text-sm text-green-800">Questions Mastered</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{progressSummary.examAttempts}</div>
            <div className="text-sm text-purple-800">Exam Attempts</div>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">{progressSummary.completionRate}%</div>
            <div className="text-sm text-orange-800">Completion Rate</div>
          </div>
        </div>
      </Card>

      {/* Data Export/Import */}
      <Card>
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Backup & Restore</h3>
          <p className="text-gray-600">Export your progress for backup or import from another device</p>
        </div>

        {/* Status Messages */}
        {importStatus !== 'idle' && (
          <div className={`mb-4 p-3 rounded-lg flex items-center ${
            importStatus === 'success' 
              ? 'bg-green-50 text-green-800 border border-green-200' 
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {importStatus === 'success' ? (
              <CheckCircle className="w-4 h-4 mr-2" />
            ) : (
              <AlertTriangle className="w-4 h-4 mr-2" />
            )}
            <span className="text-sm">{importMessage}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Export */}
          <div className="p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center mb-3">
              <Download className="w-5 h-5 text-blue-600 mr-2" />
              <h4 className="font-medium text-gray-900">Export Progress</h4>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Download your progress data as a JSON file for backup or transfer to another device.
            </p>
            <Button onClick={handleExport} className="w-full">
              <Download className="w-4 h-4 mr-2" />
              Export Data
            </Button>
          </div>

          {/* Import */}
          <div className="p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center mb-3">
              <Upload className="w-5 h-5 text-green-600 mr-2" />
              <h4 className="font-medium text-gray-900">Import Progress</h4>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Restore progress data from a previously exported file. This will merge with existing data.
            </p>
            <div className="relative">
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <Button variant="outline" className="w-full">
                <Upload className="w-4 h-4 mr-2" />
                Choose File
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Storage Information */}
      <Card>
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Storage Information</h3>
          <p className="text-gray-600">Details about your local data storage</p>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-sm text-gray-600">Question Progress</span>
            <span className="text-sm font-medium text-gray-900">
              {storageStats?.questionProgress || 'N/A'}
            </span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-sm text-gray-600">Exam History</span>
            <span className="text-sm font-medium text-gray-900">
              {storageStats?.examHistory || 'N/A'}
            </span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-sm text-gray-600">Settings</span>
            <span className="text-sm font-medium text-gray-900">
              {storageStats?.settings || 'N/A'}
            </span>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="text-sm font-medium text-gray-900">Total Storage Used</span>
            <span className="text-sm font-bold text-gray-900">
              {storageStats?.total || 'N/A'}
            </span>
          </div>
        </div>
      </Card>

      {/* Reset Data */}
      <Card>
        <div className="mb-4">
          <div className="flex items-center mb-2">
            <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Reset All Data</h3>
          </div>
          <p className="text-gray-600">
            Permanently delete all progress data, exam history, and settings. This action cannot be undone.
          </p>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start">
            <AlertTriangle className="w-5 h-5 text-red-600 mr-3 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-medium text-red-900 mb-1">Warning</h4>
              <p className="text-sm text-red-800 mb-3">
                This will permanently delete all your progress, including:
              </p>
              <ul className="text-sm text-red-800 space-y-1 mb-4">
                <li>• Question progress and mastery status</li>
                <li>• Exam attempt history and scores</li>
                <li>• Study streaks and time tracking</li>
                <li>• Bookmarks and notes</li>
                <li>• All application settings</li>
              </ul>
              <Button
                variant="outline"
                onClick={() => setShowResetDialog(true)}
                className="text-red-600 border-red-300 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Reset All Data
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Reset Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showResetDialog}
        onClose={() => setShowResetDialog(false)}
        onConfirm={handleReset}
        title="Reset All Data"
        message="Are you absolutely sure you want to delete all your progress data? This action cannot be undone."
        confirmText="Yes, Reset Everything"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
};

export default DataManagement;
