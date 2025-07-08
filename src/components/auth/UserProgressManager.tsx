import { useEffect } from 'react';
import { useServerAuthStore } from '../../stores/serverAuthStore';
import { useProgressStore } from '../../stores/progressStore';

/**
 * UserProgressManager - Handles automatic loading/saving of user-specific progress data
 * This component ensures that each user's progress is isolated and properly managed
 */
const UserProgressManager: React.FC = () => {
  const { user, isAuthenticated } = useServerAuthStore();
  const { loadUserProgress, saveUserProgress } = useProgressStore();

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      // Load the current user's progress when they log in
      loadUserProgress(user.id);
      
      // Set up auto-save interval (save progress every 30 seconds)
      const autoSaveInterval = setInterval(() => {
        saveUserProgress(user.id);
      }, 30000);

      // Save progress when the component unmounts or user changes
      return () => {
        clearInterval(autoSaveInterval);
        saveUserProgress(user.id);
      };
    }
  }, [user?.id, isAuthenticated, loadUserProgress, saveUserProgress]);

  // Save progress when the page is about to unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (isAuthenticated && user?.id) {
        saveUserProgress(user.id);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [user?.id, isAuthenticated, saveUserProgress]);

  // This component doesn't render anything, it just manages data
  return null;
};

export default UserProgressManager;
