/**
 * Health Check Endpoint
 * Provides system status for monitoring and load balancers
 */

import { Hono } from 'hono';
import { db } from '@/db';
import { sql } from 'drizzle-orm';

const app = new Hono()
  .get('/', async (c) => {
    const startTime = Date.now();
    
    try {
      // Check database connectivity
      await db.execute(sql`SELECT 1`);
      
      const duration = Date.now() - startTime;
      
      return c.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        checks: {
          database: 'connected',
          responseTime: `${duration}ms`,
        },
        version: process.env.npm_package_version || '1.0.0',
        environment: process.env.NODE_ENV,
      });
    } catch (error) {
      const duration = Date.now() - startTime;
      
      return c.json({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
        checks: {
          database: 'disconnected',
          responseTime: `${duration}ms`,
        },
      }, 503);
    }
  })
  
  .get('/ready', async (c) => {
    // Readiness probe - check if app is ready to receive traffic
    try {
      await db.execute(sql`SELECT 1`);
      return c.json({ status: 'ready' });
    } catch {
      return c.json({ status: 'not ready' }, 503);
    }
  })
  
  .get('/live', (c) => {
    // Liveness probe - check if app is alive (no external dependencies)
    return c.json({ status: 'alive' });
  });

export default app;
