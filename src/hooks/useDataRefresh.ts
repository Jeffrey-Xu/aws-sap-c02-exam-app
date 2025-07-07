import { useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { useQuestionStore } from '../stores/questionStore';
import { useProgressStore } from '../stores/progressStore';

/**
 * Custom hook to refresh data when navigating between tabs
 * Ensures latest data is loaded when switching between pages
 */
export const useDataRefresh = () => {
  const location = useLocation();
  const { loadQuestions } = useQuestionStore();
  const { refreshProgress } = useProgressStore();

  const refreshAllData = useCallback(async () => {
    try {
      // Refresh questions data
      await loadQuestions();
      
      // Refresh progress calculations
      refreshProgress();
      
      console.log('Data refreshed for tab:', location.pathname);
    } catch (error) {
      console.error('Error refreshing data:', error);
    }
  }, [loadQuestions, refreshProgress, location.pathname]);

  // Refresh data when location (tab) changes
  useEffect(() => {
    // Add a small delay to ensure the component is fully mounted
    const timeoutId = setTimeout(() => {
      refreshAllData();
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [location.pathname, refreshAllData]);

  return { refreshAllData };
};
