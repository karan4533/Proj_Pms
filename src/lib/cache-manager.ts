/**
 * Cache Manager - Forces cache invalidation when app version changes
 * This ensures users get fresh queries after updates
 */

const CACHE_VERSION = 'v2.0'; // Increment this to force cache clear
const CACHE_KEY = 'app-cache-version';

export function checkAndClearCache() {
  if (typeof window === 'undefined') return;

  try {
    const storedVersion = localStorage.getItem(CACHE_KEY);
    
    if (storedVersion !== CACHE_VERSION) {
      console.log('🔄 Cache version mismatch - clearing old cached data');
      
      // Only clear specific cached data, preserve auth tokens and important data
      const keysToPreserve = ['AUTH_COOKIE', 'auth-token', 'user-data'];
      const preservedData: Record<string, string> = {};
      
      // Save important data
      keysToPreserve.forEach(key => {
        const value = localStorage.getItem(key);
        if (value) preservedData[key] = value;
      });
      
      // Clear all localStorage
      localStorage.clear();
      
      // Restore preserved data
      Object.entries(preservedData).forEach(([key, value]) => {
        localStorage.setItem(key, value);
      });
      
      // Clear sessionStorage (safe to clear completely)
      sessionStorage.clear();
      
      // Set new version
      localStorage.setItem(CACHE_KEY, CACHE_VERSION);
      
      console.log('✅ Cache cleared, preserving auth data');
    }
  } catch (error) {
    console.error('Failed to check cache version:', error);
  }
}
