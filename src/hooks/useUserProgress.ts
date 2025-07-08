import { useEffect } from 'react';
import { useServerAuthStore } from '../stores/serverAuthStore';
import { useProgressStore } from '../stores/progressStore';

/**
 * Hook to automatically manage user progress loading/saving
 * This ensures that when a user logs in, their progress is loaded
 * and when they log out, their progress is saved
 */
export const useUserProgress = () => {
  const { user, isAuthenticated } = useServerAuthStore();
  const { loadUserProgress, saveUserProgress } = useProgressStore();

  useEffect(() => {
    if (isAuthenticated && user) {
      // Load user's progress when they log in
      loadUserProgress(user.id);
    }
  }, [isAuthenticated, user?.id, loadUserProgress]);

  useEffect(() => {
    // Save progress periodically and on page unload
    if (!isAuthenticated || !user) return;

    const saveInterval = setInterval(() => {
      saveUserProgress(user.id);
    }, 30000); // Save every 30 seconds

    const handleBeforeUnload = () => {
      saveUserProgress(user.id);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      clearInterval(saveInterval);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      // Save one final time when component unmounts
      if (user) {
        saveUserProgress(user.id);
      }
    };
  }, [isAuthenticated, user?.id, saveUserProgress]);

  return {
    isProgressLoaded: isAuthenticated && user !== null
  };
};
