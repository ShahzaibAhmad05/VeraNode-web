/**
 * Authentication Debug Utility
 * Use this to troubleshoot voting and authentication issues
 */

export const checkAuthStatus = () => {
  if (typeof window === 'undefined') {
    console.log('🔍 Running on server-side, localStorage not available');
    return null;
  }

  const secretKey = localStorage.getItem('secret_key');
  const authToken = localStorage.getItem('auth_token');
  const userData = localStorage.getItem('user_data');

  console.group('🔐 Authentication Status Check');
  console.log('✅ Secret Key present:', !!secretKey);
  console.log('✅ Auth Token present:', !!authToken);
  console.log('✅ User Data present:', !!userData);
  
  if (secretKey) {
    console.log('🔑 Secret Key (first 10 chars):', secretKey.substring(0, 10) + '...');
  } else {
    console.error('❌ No secret key found! User needs to log in.');
  }
  
  if (userData) {
    try {
      const user = JSON.parse(userData);
      console.log('👤 User:', {
        email: user.email,
        area: user.area,
        department: user.department,
      });
    } catch (e) {
      console.error('❌ Failed to parse user data');
    }
  }
  
  console.groupEnd();

  return {
    hasSecretKey: !!secretKey,
    hasAuthToken: !!authToken,
    hasUserData: !!userData,
    isAuthenticated: !!(secretKey && authToken && userData),
  };
};

export const clearAuth = () => {
  if (typeof window === 'undefined') return;
  
  console.group('🧹 Clearing Authentication');
  localStorage.removeItem('secret_key');
  localStorage.removeItem('auth_token');
  localStorage.removeItem('user_data');
  console.log('✅ All auth data cleared');
  console.groupEnd();
};

// Add to window for easy access in browser console
if (typeof window !== 'undefined') {
  (window as any).checkAuth = checkAuthStatus;
  (window as any).clearAuth = clearAuth;
  console.log('💡 Debug utilities available: window.checkAuth() and window.clearAuth()');
}
