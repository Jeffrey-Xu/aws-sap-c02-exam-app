import React from 'react';
import Layout from './Layout';
import ProtectedRoute from '../auth/ProtectedRoute';
import { useUserProgress } from '../../hooks/useUserProgress';

interface ProtectedLayoutProps {
  children: React.ReactNode;
}

const ProtectedLayout: React.FC<ProtectedLayoutProps> = ({ children }) => {
  useUserProgress(); // Automatically manage user progress loading/saving

  return (
    <ProtectedRoute>
      <Layout>
        {children}
      </Layout>
    </ProtectedRoute>
  );
};

export default ProtectedLayout;
