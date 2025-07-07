import React, { useState, useEffect } from 'react';
import { Mail, CheckCircle, AlertCircle, Loader2, RefreshCw, ExternalLink, Copy } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import Button from '../common/Button';

interface EmailVerificationProps {
  email: string;
  onVerificationSuccess: () => void;
  onBackToLogin: () => void;
}

const EmailVerification: React.FC<EmailVerificationProps> = ({
  email,
  onVerificationSuccess,
  onBackToLogin
}) => {
  const [verificationCode, setVerificationCode] = useState('');
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [verificationLink, setVerificationLink] = useState<string>('');

  const { verifyEmail, resendVerification, isLoading, error, clearError } = useAuthStore();

  // Load verification link from localStorage
  useEffect(() => {
    const storedLink = localStorage.getItem(`verification_link_${email}`);
    if (storedLink) {
      setVerificationLink(storedLink);
    }
  }, [email]);

  // Handle URL parameters for email verification
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const emailParam = urlParams.get('email');

    if (token && emailParam && emailParam === email) {
      handleVerification(token);
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [email]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(resendCooldown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleVerification = async (token?: string) => {
    const tokenToUse = token || verificationCode;
    if (!tokenToUse) return;

    const result = await verifyEmail(email, tokenToUse);
    
    if (result.success) {
      setMessage({ type: 'success', text: 'Email verified successfully!' });
      setTimeout(() => {
        onVerificationSuccess();
      }, 2000);
    } else {
      setMessage({ 
        type: 'error', 
        text: result.error?.message || 'Verification failed. Please try again.' 
      });
    }
  };

  const handleResendVerification = async () => {
    setIsResending(true);
    clearError();
    
    const success = await resendVerification(email);
    
    if (success) {
      setMessage({ type: 'success', text: 'Verification email sent! Check the verification link below.' });
      setResendCooldown(60); // 60 second cooldown
      
      // Update verification link
      const newLink = localStorage.getItem(`verification_link_${email}`);
      if (newLink) {
        setVerificationLink(newLink);
      }
    } else {
      setMessage({ type: 'error', text: 'Failed to send verification email. Please try again.' });
    }
    
    setIsResending(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleVerification();
  };

  const copyVerificationLink = () => {
    if (verificationLink) {
      navigator.clipboard.writeText(verificationLink);
      setMessage({ type: 'success', text: 'Verification link copied to clipboard!' });
    }
  };

  const openVerificationLink = () => {
    if (verificationLink) {
      window.location.href = verificationLink;
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
            <Mail className="h-6 w-6 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Verify Your Email</h2>
          <p className="text-gray-600 mt-2">
            We've sent a verification email to
          </p>
          <p className="text-aws-orange font-medium mt-1">{email}</p>
        </div>

        <div className="space-y-6">
          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <div className="text-sm text-blue-700">
              <p className="font-medium mb-2">To verify your email:</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Click the verification link below</li>
                <li>Or copy and paste the verification code manually</li>
                <li>Or check your browser console for the verification URL</li>
              </ol>
            </div>
          </div>

          {/* Direct Verification Link */}
          {verificationLink && (
            <div className="bg-green-50 border border-green-200 rounded-md p-4">
              <div className="text-sm text-green-700 mb-3">
                <p className="font-medium">🔗 Direct Verification Link:</p>
                <p className="text-xs text-green-600 mt-1">Click the link below to verify your email instantly</p>
              </div>
              <div className="flex space-x-2">
                <Button
                  onClick={openVerificationLink}
                  className="flex-1 flex items-center justify-center"
                  size="sm"
                >
                  <ExternalLink size={16} className="mr-2" />
                  Verify Email Now
                </Button>
                <Button
                  variant="outline"
                  onClick={copyVerificationLink}
                  size="sm"
                  className="flex items-center"
                >
                  <Copy size={16} />
                </Button>
              </div>
            </div>
          )}

          {/* Manual Verification Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="verificationCode" className="block text-sm font-medium text-gray-700 mb-2">
                Verification Code (Optional)
              </label>
              <input
                id="verificationCode"
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-aws-orange focus:border-aws-orange"
                placeholder="Enter verification code"
                disabled={isLoading}
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || !verificationCode}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Verifying...
                </>
              ) : (
                'Verify Email'
              )}
            </Button>
          </form>

          {/* Messages */}
          {message && (
            <div className={`border rounded-md p-3 ${
              message.type === 'success' 
                ? 'bg-green-50 border-green-200' 
                : 'bg-red-50 border-red-200'
            }`}>
              <div className="flex items-center">
                {message.type === 'success' ? (
                  <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
                )}
                <span className={`text-sm ${
                  message.type === 'success' ? 'text-green-700' : 'text-red-700'
                }`}>
                  {message.text}
                </span>
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && !message && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
                <span className="text-sm text-red-700">{error}</span>
              </div>
            </div>
          )}

          {/* Resend Verification */}
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-3">
              Didn't receive the email?
            </p>
            <Button
              variant="outline"
              onClick={handleResendVerification}
              disabled={isResending || resendCooldown > 0}
              className="w-full"
            >
              {isResending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : resendCooldown > 0 ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Resend in {resendCooldown}s
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Resend Verification Email
                </>
              )}
            </Button>
          </div>

          {/* Back to Login */}
          <div className="text-center pt-4 border-t border-gray-200">
            <button
              onClick={onBackToLogin}
              className="text-sm text-gray-600 hover:text-gray-800"
              disabled={isLoading}
            >
              ← Back to Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailVerification;
