// Comprehensive authentication cleanup utility
export const clearAllAuthData = () => {
  try {
    // Clear all localStorage authentication data
    localStorage.removeItem('auth_token');
    localStorage.removeItem('admin_authenticated');
    
    // Clear Zustand persistence data
    localStorage.removeItem('server-auth-storage');
    localStorage.removeItem('auth-storage'); // old auth store
    
    // Clear any user-specific progress data (optional)
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('progress-store-')) {
        localStorage.removeItem(key);
      }
    });
    
    // Clear session storage
    sessionStorage.clear();
    
    console.log('🧹 All authentication data cleared');
    
    // Force page reload to ensure clean state
    window.location.reload();
  } catch (error) {
    console.error('Error clearing auth data:', error);
  }
};

// Check if user should be automatically logged in
export const shouldAutoLogin = (): boolean => {
  const token = localStorage.getItem('auth_token');
  if (!token) return false;
  
  try {
    // Basic JWT token validation
    const payload = JSON.parse(atob(token.split('.')[1]));
    const isValid = payload.exp * 1000 > Date.now();
    
    if (!isValid) {
      // Token expired, clear it
      clearAllAuthData();
      return false;
    }
    
    return true;
  } catch {
    // Invalid token, clear it
    clearAllAuthData();
    return false;
  }
};

// Debug function to show current auth state
export const debugAuthState = () => {
  console.log('🔍 Current Auth State:');
  console.log('auth_token:', localStorage.getItem('auth_token'));
  console.log('admin_authenticated:', localStorage.getItem('admin_authenticated'));
  console.log('server-auth-storage:', localStorage.getItem('server-auth-storage'));
  console.log('auth-storage:', localStorage.getItem('auth-storage'));
  
  // Show all progress stores
  const progressStores = Object.keys(localStorage).filter(key => key.startsWith('progress-store-'));
  console.log('progress stores:', progressStores);
};
