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

// Create the base database instance
const baseDb = drizzle(client, { schema });

// FINAL FIX: Create a proxy that automatically converts ALL .returning() results to plain objects
// This prevents "Cannot read private member #state" errors in Next.js 16 serverless
export const db = new Proxy(baseDb, {
  get(target: any, prop: string) {
    const value = target[prop];
    
    // Intercept insert/update/delete operations
    if (['insert', 'update', 'delete'].includes(prop)) {
      return new Proxy(value, {
        apply(fn: any, thisArg: any, args: any[]) {
          const queryBuilder = fn.apply(thisArg, args);
          
          // Wrap the entire query builder
          return new Proxy(queryBuilder, {
            get(qbTarget: any, qbProp: string) {
              const qbValue = qbTarget[qbProp];
              
              // Intercept .returning() method
              if (qbProp === 'returning' && typeof qbValue === 'function') {
                return function(this: any, ...returningArgs: any[]) {
                  const result = qbValue.apply(this, returningArgs);
                  
                  // If result is a promise, wrap it to strip #state
                  if (result && typeof result.then === 'function') {
                    return result.then((data: any) => {
                      // Convert to plain objects by JSON round-trip
                      try {
                        return JSON.parse(JSON.stringify(data));
                      } catch {
                        // If serialization fails, return as-is
                        return data;
                      }
                    });
                  }
                  
                  return result;
                };
              }
              
              // For other methods, return as-is but keep wrapping
              if (typeof qbValue === 'function') {
                return function(this: any, ...methodArgs: any[]) {
                  const methodResult = qbValue.apply(this, methodArgs);
                  
                  // Keep chaining by returning the same proxy
                  if (methodResult && typeof methodResult === 'object') {
                    return new Proxy(methodResult, {
                      get: (mrTarget: any, mrProp: string) => {
                        const mrValue = mrTarget[mrProp];
                        
                        if (mrProp === 'returning' && typeof mrValue === 'function') {
                          return function(this: any, ...retArgs: any[]) {
                            const retResult = mrValue.apply(this, retArgs);
                            
                            if (retResult && typeof retResult.then === 'function') {
                              return retResult.then((data: any) => {
                                try {
                                  return JSON.parse(JSON.stringify(data));
                                } catch {
                                  return data;
                                }
                              });
                            }
                            
                            return retResult;
                          };
                        }
                        
                        return mrValue;
                      }
                    });
                  }
                  
                  return methodResult;
                };
              }
              
              return qbValue;
            }
          });
        }
      });
    }
    
    return value;
  }
}) as typeof baseDb;
