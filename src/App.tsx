import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import ProtectedLayout from './components/layout/ProtectedLayout';
import LandingPage from './pages/LandingPage';
import HomePage from './pages/HomePage';
import AuthPage from './pages/AuthPage';
import UserProgressManager from './components/auth/UserProgressManager';
import { useAuthStore } from './stores/authStore';
import { useUserProgress } from './hooks/useUserProgress';
import { initializeProgressPersistence, cleanupProgressPersistence } from './utils/progressPersistence';

// Lazy load pages for better performance
const PracticePage = lazy(() => import('./pages/PracticePage'));
const ExamPage = lazy(() => import('./pages/ExamPage'));
const ServicesPage = lazy(() => import('./pages/ServicesPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));

// Loading component
const LoadingSpinner: React.FC = () => (
  <div className="flex items-center justify-center min-h-64">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-aws-orange"></div>
  </div>
);

// Root route handler
const RootRoute: React.FC = () => {
  const { isAuthenticated } = useAuthStore();
  
  useUserProgress(); // Manage user progress for authenticated users
  
  if (isAuthenticated) {
    return (
      <Layout>
        <HomePage />
      </Layout>
    );
  }
  
  return <LandingPage />;
};

function App() {
  const { checkSession } = useAuthStore();

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
      {/* User Progress Manager - handles user-specific data isolation */}
      <UserProgressManager />
      
      <Routes>
        {/* Root route - Landing page or Dashboard based on auth */}
        <Route path="/" element={<RootRoute />} />
        
        {/* Public Authentication Route */}
        <Route path="/auth" element={<AuthPage />} />
        
        {/* Protected Routes with clean URLs */}
        <Route path="/practice" element={
          <ProtectedLayout>
            <Suspense fallback={<LoadingSpinner />}>
              <PracticePage />
            </Suspense>
          </ProtectedLayout>
        } />
        
        <Route path="/exam" element={
          <ProtectedLayout>
            <Suspense fallback={<LoadingSpinner />}>
              <ExamPage />
            </Suspense>
          </ProtectedLayout>
        } />
        
        <Route path="/services" element={
          <ProtectedLayout>
            <Suspense fallback={<LoadingSpinner />}>
              <ServicesPage />
            </Suspense>
          </ProtectedLayout>
        } />
        
        <Route path="/settings" element={
          <ProtectedLayout>
            <Suspense fallback={<LoadingSpinner />}>
              <SettingsPage />
            </Suspense>
          </ProtectedLayout>
        } />
        
        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
