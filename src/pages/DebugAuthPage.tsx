import React from 'react';
import { clearAllAuthData, debugAuthState } from '../utils/authCleanup';
import { useServerAuthStore } from '../stores/serverAuthStore';
import Card from '../components/common/Card';
import Button from '../components/common/Button';

const DebugAuthPage: React.FC = () => {
  const { user, isAuthenticated, logout } = useServerAuthStore();

  const handleDebugState = () => {
    debugAuthState();
  };

  const handleClearAll = () => {
    if (confirm('This will clear all authentication data and reload the page. Continue?')) {
      clearAllAuthData();
    }
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <Card className="p-6">
          <h1 className="text-2xl font-bold mb-6">Authentication Debug Panel</h1>
          
          <div className="space-y-6">
            {/* Current State */}
            <div>
              <h2 className="text-lg font-semibold mb-3">Current Authentication State</h2>
              <div className="bg-gray-100 p-4 rounded-lg">
                <p><strong>Is Authenticated:</strong> {isAuthenticated ? 'Yes' : 'No'}</p>
                <p><strong>User:</strong> {user ? `${user.firstName} ${user.lastName} (${user.email})` : 'None'}</p>
                <p><strong>User ID:</strong> {user?.id || 'None'}</p>
              </div>
            </div>

            {/* Actions */}
            <div>
              <h2 className="text-lg font-semibold mb-3">Debug Actions</h2>
              <div className="flex flex-wrap gap-3">
                <Button onClick={handleDebugState} variant="secondary">
                  Log Auth State to Console
                </Button>
                <Button onClick={handleLogout} variant="secondary">
                  Try Logout (Store)
                </Button>
                <Button onClick={handleClearAll} variant="danger">
                  Clear All Auth Data & Reload
                </Button>
              </div>
            </div>

            {/* Instructions */}
            <div>
              <h2 className="text-lg font-semibold mb-3">Instructions</h2>
              <div className="bg-blue-50 p-4 rounded-lg">
                <ol className="list-decimal list-inside space-y-2">
                  <li>Click "Log Auth State to Console" and check browser console (F12)</li>
                  <li>Try "Try Logout (Store)" to test the store logout function</li>
                  <li>If logout doesn't work, use "Clear All Auth Data & Reload" to force cleanup</li>
                  <li>Check if the issue persists after clearing all data</li>
                </ol>
              </div>
            </div>

            {/* Access */}
            <div>
              <h2 className="text-lg font-semibold mb-3">Access This Page</h2>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <p>Visit: <code>https://aws-sap-c02-exam-app.vercel.app/debug-auth</code></p>
                <p>This page is for debugging authentication issues only.</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default DebugAuthPage;
