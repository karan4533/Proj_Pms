import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not defined in environment variables');
}

// Create the connection with optimized pooling settings
const client = postgres(process.env.DATABASE_URL, {
  max: 20,          // Maximum number of connections in the pool
  idle_timeout: 20, // Close idle connections after 20 seconds
  connect_timeout: 10, // Connection timeout in seconds
  prepare: false,   // Disable prepared statements for better performance in some cases
});

// Create and export the database instance
export const db = drizzle(client);
