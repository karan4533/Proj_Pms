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
      console.log('🔄 Cache version mismatch - clearing old data');
      
      // Clear all stored data
      localStorage.clear();
      sessionStorage.clear();
      
      // Set new version
      localStorage.setItem(CACHE_KEY, CACHE_VERSION);
      
      // Force reload to get fresh state
      window.location.reload();
    }
  } catch (error) {
    console.error('Failed to check cache version:', error);
  }
}
