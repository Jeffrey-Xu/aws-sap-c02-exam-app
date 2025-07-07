import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { Shield, BookOpen, Users, Award } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import LoginForm from '../components/auth/LoginForm';
import SignupForm from '../components/auth/SignupForm';
import { ROUTES } from '../constants';

type AuthMode = 'login' | 'signup' | 'forgot-password';

const AuthPage: React.FC = () => {
  const [mode, setMode] = useState<AuthMode>('login');
  
  const { isAuthenticated, checkSession } = useAuthStore();

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  // Redirect if already authenticated
  if (isAuthenticated) {
    return <Navigate to={ROUTES.HOME} replace />;
  }

  const handleSwitchToSignup = () => setMode('signup');
  const handleSwitchToLogin = () => setMode('login');
  const handleForgotPassword = () => setMode('forgot-password');

  const renderAuthForm = () => {
    switch (mode) {
      case 'signup':
        return (
          <SignupForm
            onSwitchToLogin={handleSwitchToLogin}
          />
        );
      case 'forgot-password':
        return (
          <div className="w-full max-w-md mx-auto">
            <div className="bg-white rounded-lg shadow-lg p-8 text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Password Reset</h2>
              <p className="text-gray-600 mb-6">
                Password reset functionality will be available soon. 
                Please contact the administrator if you need to reset your password.
              </p>
              <button
                onClick={handleSwitchToLogin}
                className="text-aws-orange hover:text-aws-orange-dark font-medium"
              >
                ← Back to Login
              </button>
            </div>
          </div>
        );
      default:
        return (
          <LoginForm
            onSwitchToSignup={handleSwitchToSignup}
            onForgotPassword={handleForgotPassword}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-aws-orange to-orange-600 p-12 flex-col justify-center">
        <div className="text-white">
          <div className="flex items-center mb-8">
            <Shield className="h-12 w-12 mr-4" />
            <div>
              <h1 className="text-3xl font-bold">AWS SAP-C02</h1>
              <p className="text-orange-100">Exam Preparation Platform</p>
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="flex items-start">
              <BookOpen className="h-6 w-6 mr-4 mt-1 text-orange-200" />
              <div>
                <h3 className="text-xl font-semibold mb-2">Comprehensive Study Materials</h3>
                <p className="text-orange-100">
                  Access 529+ practice questions with detailed explanations and reasoning analysis
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <Users className="h-6 w-6 mr-4 mt-1 text-orange-200" />
              <div>
                <h3 className="text-xl font-semibold mb-2">Multi-User Platform</h3>
                <p className="text-orange-100">
                  Secure individual accounts with personalized progress tracking and settings
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <Award className="h-6 w-6 mr-4 mt-1 text-orange-200" />
              <div>
                <h3 className="text-xl font-semibold mb-2">Expert-Level Analysis</h3>
                <p className="text-orange-100">
                  Detailed reasoning for each question option with AWS services identification
                </p>
              </div>
            </div>
          </div>
          
          <div className="mt-12 p-6 bg-white/10 rounded-lg backdrop-blur-sm">
            <h4 className="text-lg font-semibold mb-2">Ready to Excel?</h4>
            <p className="text-orange-100 text-sm">
              Join our platform and master the AWS Solutions Architect Professional certification 
              with comprehensive practice questions and detailed explanations.
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Authentication Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile Header */}
          <div className="lg:hidden text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <Shield className="h-10 w-10 text-aws-orange mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">AWS SAP-C02</h1>
                <p className="text-gray-600 text-sm">Exam Prep Platform</p>
              </div>
            </div>
          </div>

          {renderAuthForm()}
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
