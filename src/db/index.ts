import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not defined in environment variables');
}

// Create the connection with optimized pooling settings for 1000+ users
const client = postgres(process.env.DATABASE_URL, {
  max: 100,         // Maximum number of connections in the pool (increased for 1000+ concurrent users)
  idle_timeout: 30, // Close idle connections after 30 seconds
  connect_timeout: 10, // Connection timeout in seconds
  prepare: false,   // Disable prepared statements for better performance with dynamic queries
  max_lifetime: 60 * 30, // Max connection lifetime: 30 minutes (prevents stale connections)
});

// Create and export the database instance
export const db = drizzle(client);
