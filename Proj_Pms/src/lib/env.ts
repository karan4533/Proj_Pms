// Environment detection utility
export const isProduction = () => {
  // Server-side
  if (typeof window === 'undefined') {
    return process.env.VERCEL_ENV === 'production' || process.env.NODE_ENV === 'production';
  }
  
  // Client-side
  return window.location.hostname !== 'localhost' && 
         window.location.hostname !== '127.0.0.1' &&
         !window.location.hostname.includes('.local');
};

export const isServerless = () => {
  return process.env.VERCEL === '1' || process.env.VERCEL_ENV === 'production';
};

export const isDevelopment = () => {
  return !isProduction();
};
