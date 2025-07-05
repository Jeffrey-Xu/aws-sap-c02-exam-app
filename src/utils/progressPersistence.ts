import type { QuestionProgress, CategoryProgress, ExamDomain, ExamSession } from '../types';
import { STORAGE_KEYS } from '../constants';

// Enhanced progress persistence utilities
export class ProgressPersistence {
  
  // Backup progress to multiple storage locations
  static backupProgress(data: any): void {
    try {
      // Primary storage (localStorage)
      localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(data));
      
      // Backup storage with timestamp
      const backupKey = `${STORAGE_KEYS.PROGRESS}_backup_${Date.now()}`;
      localStorage.setItem(backupKey, JSON.stringify({
        ...data,
        backupTimestamp: new Date().toISOString()
      }));
      
      // Keep only last 5 backups
      this.cleanupOldBackups();
      
      // Also store in sessionStorage as additional backup
      sessionStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(data));
      
      console.log('✅ Progress backed up successfully');
    } catch (error) {
      console.error('❌ Failed to backup progress:', error);
    }
  }
  
  // Restore progress with fallback options
  static restoreProgress(): any | null {
    try {
      // Try primary storage first
      const primaryData = localStorage.getItem(STORAGE_KEYS.PROGRESS);
      if (primaryData) {
        const parsed = JSON.parse(primaryData);
        console.log('✅ Progress restored from primary storage');
        return parsed;
      }
      
      // Try session storage
      const sessionData = sessionStorage.getItem(STORAGE_KEYS.PROGRESS);
      if (sessionData) {
        const parsed = JSON.parse(sessionData);
        console.log('✅ Progress restored from session storage');
        // Restore to localStorage
        localStorage.setItem(STORAGE_KEYS.PROGRESS, sessionData);
        return parsed;
      }
      
      // Try latest backup
      const latestBackup = this.getLatestBackup();
      if (latestBackup) {
        console.log('✅ Progress restored from backup');
        // Restore to primary storage
        localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(latestBackup));
        return latestBackup;
      }
      
      console.log('ℹ️ No progress data found - starting fresh');
      return null;
    } catch (error) {
      console.error('❌ Failed to restore progress:', error);
      return null;
    }
  }
  
  // Get latest backup
  static getLatestBackup(): any | null {
    try {
      const backupKeys = Object.keys(localStorage)
        .filter(key => key.startsWith(`${STORAGE_KEYS.PROGRESS}_backup_`))
        .sort((a, b) => {
          const timestampA = parseInt(a.split('_').pop() || '0');
          const timestampB = parseInt(b.split('_').pop() || '0');
          return timestampB - timestampA; // Latest first
        });
      
      if (backupKeys.length > 0) {
        const latestBackupData = localStorage.getItem(backupKeys[0]);
        return latestBackupData ? JSON.parse(latestBackupData) : null;
      }
      
      return null;
    } catch (error) {
      console.error('❌ Failed to get latest backup:', error);
      return null;
    }
  }
  
  // Clean up old backups (keep only last 5)
  static cleanupOldBackups(): void {
    try {
      const backupKeys = Object.keys(localStorage)
        .filter(key => key.startsWith(`${STORAGE_KEYS.PROGRESS}_backup_`))
        .sort((a, b) => {
          const timestampA = parseInt(a.split('_').pop() || '0');
          const timestampB = parseInt(b.split('_').pop() || '0');
          return timestampB - timestampA; // Latest first
        });
      
      // Remove old backups (keep only 5 most recent)
      if (backupKeys.length > 5) {
        const toDelete = backupKeys.slice(5);
        toDelete.forEach(key => {
          localStorage.removeItem(key);
        });
        console.log(`🧹 Cleaned up ${toDelete.length} old backups`);
      }
    } catch (error) {
      console.error('❌ Failed to cleanup old backups:', error);
    }
  }
  
  // Export progress data for manual backup
  static exportProgress(): string {
    try {
      const progressData = localStorage.getItem(STORAGE_KEYS.PROGRESS);
      const examData = localStorage.getItem(STORAGE_KEYS.EXAM_SESSION);
      
      const exportData = {
        progress: progressData ? JSON.parse(progressData) : null,
        examSession: examData ? JSON.parse(examData) : null,
        exportTimestamp: new Date().toISOString(),
        version: '1.0.0'
      };
      
      return JSON.stringify(exportData, null, 2);
    } catch (error) {
      console.error('❌ Failed to export progress:', error);
      throw error;
    }
  }
  
  // Import progress data from backup
  static importProgress(importData: string): boolean {
    try {
      const data = JSON.parse(importData);
      
      if (data.progress) {
        localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(data.progress));
        sessionStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(data.progress));
      }
      
      if (data.examSession) {
        localStorage.setItem(STORAGE_KEYS.EXAM_SESSION, JSON.stringify(data.examSession));
      }
      
      console.log('✅ Progress imported successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to import progress:', error);
      return false;
    }
  }
  
  // Validate progress data integrity
  static validateProgressData(data: any): boolean {
    try {
      // Check required fields
      if (!data || typeof data !== 'object') return false;
      
      // Check if questionProgress exists and is an object
      if (!data.questionProgress || typeof data.questionProgress !== 'object') return false;
      
      // Validate question progress entries
      for (const [questionId, progress] of Object.entries(data.questionProgress)) {
        const p = progress as any;
        if (!p || typeof p !== 'object') return false;
        if (typeof p.attempts !== 'number' || p.attempts < 0) return false;
        if (typeof p.correctAttempts !== 'number' || p.correctAttempts < 0) return false;
        if (p.correctAttempts > p.attempts) return false;
      }
      
      console.log('✅ Progress data validation passed');
      return true;
    } catch (error) {
      console.error('❌ Progress data validation failed:', error);
      return false;
    }
  }
  
  // Auto-save progress periodically
  static startAutoSave(interval: number = 30000): () => void {
    const autoSaveInterval = setInterval(() => {
      try {
        const progressData = localStorage.getItem(STORAGE_KEYS.PROGRESS);
        if (progressData) {
          // Create timestamped backup
          const backupKey = `${STORAGE_KEYS.PROGRESS}_auto_${Date.now()}`;
          localStorage.setItem(backupKey, progressData);
          
          // Keep only last 3 auto-saves
          const autoSaveKeys = Object.keys(localStorage)
            .filter(key => key.startsWith(`${STORAGE_KEYS.PROGRESS}_auto_`))
            .sort((a, b) => {
              const timestampA = parseInt(a.split('_').pop() || '0');
              const timestampB = parseInt(b.split('_').pop() || '0');
              return timestampB - timestampA;
            });
          
          if (autoSaveKeys.length > 3) {
            const toDelete = autoSaveKeys.slice(3);
            toDelete.forEach(key => localStorage.removeItem(key));
          }
          
          console.log('💾 Auto-save completed');
        }
      } catch (error) {
        console.error('❌ Auto-save failed:', error);
      }
    }, interval);
    
    // Return cleanup function
    return () => {
      clearInterval(autoSaveInterval);
      console.log('🛑 Auto-save stopped');
    };
  }
  
  // Get storage usage statistics
  static getStorageStats(): {
    used: number;
    available: number;
    progressSize: number;
    backupCount: number;
  } {
    try {
      let totalSize = 0;
      let progressSize = 0;
      let backupCount = 0;
      
      for (const key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          const size = localStorage[key].length;
          totalSize += size;
          
          if (key === STORAGE_KEYS.PROGRESS) {
            progressSize = size;
          } else if (key.startsWith(`${STORAGE_KEYS.PROGRESS}_backup_`)) {
            backupCount++;
          }
        }
      }
      
      // Estimate available space (localStorage typically has 5-10MB limit)
      const estimatedLimit = 5 * 1024 * 1024; // 5MB
      const available = estimatedLimit - totalSize;
      
      return {
        used: totalSize,
        available: Math.max(0, available),
        progressSize,
        backupCount
      };
    } catch (error) {
      console.error('❌ Failed to get storage stats:', error);
      return { used: 0, available: 0, progressSize: 0, backupCount: 0 };
    }
  }
}

// Auto-initialize progress persistence
let autoSaveCleanup: (() => void) | null = null;

export const initializeProgressPersistence = (): void => {
  console.log('🔧 Initializing progress persistence...');
  
  // Start auto-save (every 30 seconds)
  autoSaveCleanup = ProgressPersistence.startAutoSave(30000);
  
  // Listen for page unload to ensure final save
  window.addEventListener('beforeunload', () => {
    try {
      const progressData = localStorage.getItem(STORAGE_KEYS.PROGRESS);
      if (progressData) {
        ProgressPersistence.backupProgress(JSON.parse(progressData));
      }
    } catch (error) {
      console.error('❌ Failed to backup on page unload:', error);
    }
  });
  
  // Listen for storage events (sync across tabs)
  window.addEventListener('storage', (event) => {
    if (event.key === STORAGE_KEYS.PROGRESS) {
      console.log('🔄 Progress updated in another tab');
      // Could trigger a refresh of the progress store here
    }
  });
  
  console.log('✅ Progress persistence initialized');
};

export const cleanupProgressPersistence = (): void => {
  if (autoSaveCleanup) {
    autoSaveCleanup();
    autoSaveCleanup = null;
  }
  console.log('🧹 Progress persistence cleaned up');
};
