import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import HomePage from './pages/HomePage';
import { ROUTES } from './constants';
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

function App() {
  useEffect(() => {
    // Initialize progress persistence system
    initializeProgressPersistence();
    
    // Cleanup on unmount
    return () => {
      cleanupProgressPersistence();
    };
  }, []);
  return (
    <Router>
      <Layout>
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            <Route path={ROUTES.HOME} element={<HomePage />} />
            <Route path={ROUTES.PRACTICE} element={<PracticePage />} />
            <Route path={ROUTES.EXAM} element={<ExamPage />} />
            <Route path={ROUTES.ANALYTICS} element={<AnalyticsPage />} />
            <Route path={ROUTES.SERVICES} element={<ServicesPage />} />
            <Route path={ROUTES.ARCHITECT} element={<ArchitectGuidePage />} />
            <Route path={ROUTES.SETTINGS} element={<SettingsPage />} />
            {/* Catch all route */}
            <Route path="*" element={<HomePage />} />
          </Routes>
        </Suspense>
      </Layout>
    </Router>
  );
}

export default App;
