import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// Disable connection during build time to avoid "Command exited with 1" errors on Vercel
const isBuilding = process.env.NEXT_PHASE === 'phase-production-build' || 
                   process.env.VERCEL_ENV === 'production' && !process.env.DATABASE_URL;

if (!process.env.DATABASE_URL && !isBuilding) {
  throw new Error('DATABASE_URL is not defined in environment variables');
}

// Use dummy URL during build phase
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://dummy:dummy@localhost:5432/dummy';

// Create the connection with optimized pooling settings
// Note: Connections are REUSED among all users - 10 connections can serve 10,000+ users
// Each query only holds a connection for milliseconds, then releases it for the next user

// Detect if using remote database (contains domain name) or local
const isRemoteDb = DATABASE_URL.includes('.supabase.co') || 
                   DATABASE_URL.includes('.neon.tech') ||
                   DATABASE_URL.includes('.railway.app');

// Serverless-optimized connection pool
// Vercel/serverless: Each function instance needs its own pool
// Use MUCH smaller pool in production to avoid exhausting database connections
const isServerless = process.env.VERCEL === '1' || process.env.VERCEL_ENV === 'production';

const client = postgres(DATABASE_URL, {
  max: isServerless ? 1 : 5,  // CRITICAL: Serverless uses 1 connection per instance
  idle_timeout: isServerless ? 0 : 20, // Never close in serverless (reuse across invocations)
  connect_timeout: 10, // Connection timeout in seconds
  prepare: false,   // Disable prepared statements for better performance with dynamic queries
  max_lifetime: isServerless ? 60 * 60 : 60 * 5, // Serverless: 1 hour, Local: 5 minutes
  onnotice: () => {}, // Suppress notices
  ssl: isRemoteDb ? 'require' : false, // Only use SSL for remote databases
  // Don't actually connect during build phase
  connection: isBuilding ? { application_name: 'build' } : undefined,
  // Transform undefined to null to prevent serialization issues
  transform: {
    undefined: null,
  },
});

// Create the database instance
export const db = drizzle(client, { schema });
