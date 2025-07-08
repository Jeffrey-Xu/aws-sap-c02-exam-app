import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useServerAuthStore, checkServerSession } from '../../stores/serverAuthStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, user, isLoading } = useServerAuthStore();

  useEffect(() => {
    checkServerSession();
  }, []);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-aws-orange"></div>
      </div>
    );
  }

  // Redirect to auth page if not authenticated
  if (!isAuthenticated || !user) {
    return <Navigate to="/auth" replace />;
  }

  // User is authenticated and ready to go
  return <>{children}</>;
};

export default ProtectedRoute;
