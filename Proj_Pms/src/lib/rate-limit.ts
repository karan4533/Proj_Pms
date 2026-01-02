/**
 * Rate Limiting Middleware
 * Protects against brute force attacks and API abuse
 */

import { Context, Next } from 'hono';
import { logger } from '@/lib/logger';

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};

// Cleanup old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  Object.keys(store).forEach((key) => {
    if (store[key].resetTime < now) {
      delete store[key];
    }
  });
}, 5 * 60 * 1000);

interface RateLimitOptions {
  windowMs: number;      // Time window in milliseconds
  max: number;           // Max requests per window
  keyGenerator?: (c: Context) => string;
  handler?: (c: Context) => Response;
}

/**
 * Create rate limit middleware
 */
export function rateLimit(options: RateLimitOptions) {
  const {
    windowMs,
    max,
    keyGenerator = (c) => {
      // Default: use IP address or fallback to a generic key
      return c.req.header('x-forwarded-for') || 
             c.req.header('x-real-ip') || 
             'anonymous';
    },
    handler = (c) => {
      return c.json({
        error: 'Too many requests, please try again later.',
      }, 429);
    },
  } = options;

  return async (c: Context, next: Next) => {
    const key = keyGenerator(c);
    const now = Date.now();

    if (!store[key] || store[key].resetTime < now) {
      store[key] = {
        count: 1,
        resetTime: now + windowMs,
      };
    } else {
      store[key].count++;
    }

    const remaining = Math.max(0, max - store[key].count);
    const resetTime = Math.ceil((store[key].resetTime - now) / 1000);

    // Set rate limit headers
    c.header('X-RateLimit-Limit', max.toString());
    c.header('X-RateLimit-Remaining', remaining.toString());
    c.header('X-RateLimit-Reset', resetTime.toString());

    if (store[key].count > max) {
      logger.security('Rate limit exceeded', {
        ip: key,
        count: store[key].count,
        max,
      });
      
      c.header('Retry-After', resetTime.toString());
      return handler(c);
    }

    await next();
  };
}

/**
 * Preset rate limiters for common use cases
 */
export const rateLimiters = {
  /**
   * Auth endpoints (strict)
   * 5 requests per 15 minutes
   */
  auth: rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    keyGenerator: (c) => {
      // Rate limit by IP + endpoint for auth
      const ip = c.req.header('x-forwarded-for') || 'anonymous';
      const path = c.req.path;
      return `auth:${ip}:${path}`;
    },
  }),

  /**
   * API endpoints (moderate)
   * 100 requests per minute
   */
  api: rateLimit({
    windowMs: 60 * 1000,
    max: 100,
  }),

  /**
   * Public endpoints (lenient)
   * 1000 requests per 15 minutes
   */
  public: rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 1000,
  }),
};
