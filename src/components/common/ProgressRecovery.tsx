import React, { useState, useEffect } from 'react';
import { AlertTriangle, RefreshCw, Download, Upload } from 'lucide-react';
import Button from './Button';
import Card from './Card';
import ConfirmDialog from './ConfirmDialog';
import { ProgressPersistence } from '../../utils/progressPersistence';
import { useConfirmDialog } from '../../hooks/useConfirmDialog';

interface ProgressRecoveryProps {
  onRecoveryComplete: () => void;
}

const ProgressRecovery: React.FC<ProgressRecoveryProps> = ({ onRecoveryComplete }) => {
  const [backups, setBackups] = useState<Array<{ key: string; timestamp: string; size: number }>>([]);
  const [selectedBackup, setSelectedBackup] = useState<string>('');
  const [isRecovering, setIsRecovering] = useState(false);
  
  // Custom dialog hook
  const { dialogState, showDialog, hideDialog } = useConfirmDialog();

  useEffect(() => {
    // Get available backups
    const availableBackups = Object.keys(localStorage)
      .filter(key => key.includes('progress') && key.includes('backup'))
      .map(key => {
        const data = localStorage.getItem(key);
        const timestamp = key.includes('_') ? key.split('_').pop() : 'unknown';
        return {
          key,
          timestamp: timestamp ? new Date(parseInt(timestamp)).toLocaleString() : 'Unknown',
          size: data ? data.length : 0
        };
      })
      .sort((a, b) => b.key.localeCompare(a.key)); // Latest first

    setBackups(availableBackups);
  }, []);

  const handleRecoverFromBackup = async () => {
    if (!selectedBackup) return;

    setIsRecovering(true);
    try {
      const backupData = localStorage.getItem(selectedBackup);
      if (backupData) {
        const parsed = JSON.parse(backupData);
        
        // Validate the backup data
        if (ProgressPersistence.validateProgressData(parsed)) {
          // Restore to main storage
          localStorage.setItem('aws-sap-c02-progress', JSON.stringify(parsed));
          sessionStorage.setItem('aws-sap-c02-progress', JSON.stringify(parsed));
          
          alert('Progress recovered successfully! The page will reload.');
          window.location.reload();
        } else {
          alert('Backup data appears to be corrupted. Please try another backup.');
        }
      }
    } catch (error) {
      console.error('Recovery failed:', error);
      alert('Failed to recover from backup. Please try another backup or contact support.');
    } finally {
      setIsRecovering(false);
    }
  };

  const handleStartFresh = () => {
    showDialog(
      {
        title: 'Start Fresh',
        message: 'Are you sure you want to start fresh? This will clear all progress data.',
        type: 'warning',
        confirmText: 'Start Fresh',
        cancelText: 'Cancel',
        confirmVariant: 'danger'
      },
      () => {
        // Clear all progress data
        Object.keys(localStorage)
          .filter(key => key.includes('progress'))
          .forEach(key => localStorage.removeItem(key));
        
        sessionStorage.removeItem('aws-sap-c02-progress');
        
        showDialog(
          {
            title: 'Success',
            message: 'All progress data cleared. Starting fresh!',
            type: 'success',
            confirmText: 'OK',
            cancelText: ''
          },
          () => {
            onRecoveryComplete();
          }
        );
      }
    );
  };

  const handleExportBackup = () => {
    if (!selectedBackup) return;

    const backupData = localStorage.getItem(selectedBackup);
    if (backupData) {
      const blob = new Blob([backupData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `progress-backup-${selectedBackup.split('_').pop()}.json`;
      link.click();
      
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-2xl w-full">
        <div className="text-center mb-6">
          <AlertTriangle className="w-16 h-16 text-orange-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Progress Recovery
          </h2>
          <p className="text-gray-600">
            We detected an issue with your progress data. Let's get you back on track!
          </p>
        </div>

        {backups.length > 0 ? (
          <div className="space-y-6">
            <div>
              <h3 className="font-medium text-gray-900 mb-3">Available Backups</h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {backups.map((backup) => (
                  <label
                    key={backup.key}
                    className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                  >
                    <input
                      type="radio"
                      name="backup"
                      value={backup.key}
                      checked={selectedBackup === backup.key}
                      onChange={(e) => setSelectedBackup(e.target.value)}
                      className="mr-3"
                    />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">
                        {backup.timestamp}
                      </div>
                      <div className="text-xs text-gray-500">
                        Size: {Math.round(backup.size / 1024)}KB
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button
                onClick={handleRecoverFromBackup}
                disabled={!selectedBackup || isRecovering}
                className="flex items-center"
              >
                <RefreshCw size={16} className={`mr-2 ${isRecovering ? 'animate-spin' : ''}`} />
                {isRecovering ? 'Recovering...' : 'Recover Selected'}
              </Button>

              <Button
                variant="outline"
                onClick={handleExportBackup}
                disabled={!selectedBackup}
                className="flex items-center"
              >
                <Download size={16} className="mr-2" />
                Export Backup
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">
              No automatic backups found. You can start fresh or import a manual backup.
            </p>
          </div>
        )}

        <div className="border-t pt-6 mt-6">
          <div className="flex flex-wrap gap-3 justify-center">
            <Button
              variant="outline"
              onClick={handleStartFresh}
              className="flex items-center"
            >
              <RefreshCw size={16} className="mr-2" />
              Start Fresh
            </Button>

            <Button
              variant="outline"
              onClick={onRecoveryComplete}
              className="flex items-center"
            >
              Continue Anyway
            </Button>
          </div>
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">Prevention Tips:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Regular exports from Settings → Export Progress</li>
            <li>• Don't clear browser data without backing up first</li>
            <li>• The app auto-saves every 30 seconds</li>
            <li>• Multiple backup copies are kept automatically</li>
          </ul>
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

export default ProgressRecovery;
