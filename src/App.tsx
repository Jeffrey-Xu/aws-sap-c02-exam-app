import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import LandingPage from './pages/LandingPage';
import HomePage from './pages/HomePage';
import AuthPage from './pages/AuthPage';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { useAuthStore } from './stores/authStore';
import { useUserProgress } from './hooks/useUserProgress';
import { initializeProgressPersistence, cleanupProgressPersistence } from './utils/progressPersistence';

// Lazy load pages for better performance
const PracticePage = lazy(() => import('./pages/PracticePage'));
const ExamPage = lazy(() => import('./pages/ExamPage'));
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage'));
const ServicesPage = lazy(() => import('./pages/ServicesPage'));
const ArchitectGuidePage = lazy(() => import('./pages/ArchitectGuidePage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));

// Loading component
const LoadingSpinner: React.FC = () => (
  <div className="flex items-center justify-center min-h-64">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-aws-orange"></div>
  </div>
);

// Protected app content with user progress management
const ProtectedAppContent: React.FC = () => {
  useUserProgress(); // Automatically manage user progress loading/saving

  return (
    <Layout>
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/practice" element={<PracticePage />} />
          <Route path="/exam" element={<ExamPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/architect" element={<ArchitectGuidePage />} />
          <Route path="/settings" element={<SettingsPage />} />
          {/* Catch all route for authenticated users */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </Layout>
  );
};

function App() {
  const { isAuthenticated, checkSession } = useAuthStore();

  useEffect(() => {
    // Initialize progress persistence system
    initializeProgressPersistence();
    
    // Check session on app start
    checkSession();
    
    // Cleanup on unmount
    return () => {
      cleanupProgressPersistence();
    };
  }, [checkSession]);

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route 
          path="/" 
          element={
            isAuthenticated ? <Navigate to="/dashboard" replace /> : <LandingPage />
          } 
        />
        <Route path="/auth" element={<AuthPage />} />
        
        {/* Protected Routes */}
        <Route 
          path="/dashboard/*" 
          element={
            <ProtectedRoute>
              <ProtectedAppContent />
            </ProtectedRoute>
          } 
        />
        
        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
