/**
 * Utility to completely reset the authentication system
 * This will clear all stored users and sessions to fix any email verification issues
 */

export const resetAuthenticationSystem = () => {
  // Clear all authentication-related localStorage items
  const keysToRemove = [
    'aws_exam_app_users',
    'aws_exam_app_session',
    'progress-store',
    'user_progress_',
    'user_settings_',
    'email_verification_',
    'verification_link_'
  ];

  // Remove exact keys
  keysToRemove.forEach(key => {
    localStorage.removeItem(key);
  });

  // Remove keys that start with certain prefixes
  const allKeys = Object.keys(localStorage);
  allKeys.forEach(key => {
    if (key.startsWith('user_progress_') || 
        key.startsWith('user_settings_') || 
        key.startsWith('email_verification_') || 
        key.startsWith('verification_link_')) {
      localStorage.removeItem(key);
    }
  });

  console.log('🔄 Authentication system reset complete');
  console.log('✅ All users and sessions cleared');
  console.log('🚀 Ready for fresh user registration');
};

export const migrateExistingUsers = () => {
  try {
    const usersData = localStorage.getItem('aws_exam_app_users');
    if (usersData) {
      const users = JSON.parse(usersData);
      const migratedUsers = users.map((user: any) => ({
        ...user,
        isEmailVerified: true // Force all users to verified status
      }));
      
      localStorage.setItem('aws_exam_app_users', JSON.stringify(migratedUsers));
      console.log(`✅ Migrated ${migratedUsers.length} users to verified status`);
      return migratedUsers.length;
    }
  } catch (error) {
    console.error('Error migrating users:', error);
  }
  return 0;
};

export const checkAuthenticationStatus = () => {
  const usersData = localStorage.getItem('aws_exam_app_users');
  const sessionData = localStorage.getItem('aws_exam_app_session');
  
  console.log('🔍 Authentication Status Check:');
  
  if (usersData) {
    try {
      const users = JSON.parse(usersData);
      console.log(`👥 Total users: ${users.length}`);
      users.forEach((user: any, index: number) => {
        console.log(`User ${index + 1}: ${user.email} - Verified: ${user.isEmailVerified}`);
      });
    } catch (error) {
      console.log('❌ Error parsing users data');
    }
  } else {
    console.log('👥 No users found');
  }
  
  if (sessionData) {
    try {
      const session = JSON.parse(sessionData);
      console.log(`🔐 Current session: ${session.state?.user?.email || 'None'}`);
      console.log(`✅ Session verified: ${session.state?.user?.isEmailVerified || 'N/A'}`);
    } catch (error) {
      console.log('❌ Error parsing session data');
    }
  } else {
    console.log('🔐 No active session');
  }
};
