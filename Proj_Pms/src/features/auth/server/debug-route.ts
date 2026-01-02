/**
 * Auth Flow Diagnostic Tool
 * Run this in production to diagnose cookie/session issues
 * 
 * Usage: 
 * 1. Deploy to production
 * 2. Access: https://your-app.vercel.app/api/auth/debug
 * 3. Share output with developer if issues persist
 */

import { Hono } from "hono";
import { getCookie } from "hono/cookie";
import { AUTH_COOKIE } from "@/features/auth/constants";
import { db } from "@/db";
import { sessions } from "@/db/schema";
import { eq } from "drizzle-orm";

const app = new Hono()
  .get("/debug", async (c) => {
    try {
      const sessionToken = getCookie(c, AUTH_COOKIE);
      const isProd = process.env.NODE_ENV === 'production';
      
      // Gather diagnostic information
      const diagnostics = {
        timestamp: new Date().toISOString(),
        environment: {
          nodeEnv: process.env.NODE_ENV,
          isProd,
          appUrl: process.env.NEXT_PUBLIC_APP_URL || 'NOT SET ⚠️',
          hasDbUrl: !!process.env.DATABASE_URL,
        },
        cookies: {
          sessionCookieName: AUTH_COOKIE,
          cookiePresent: !!sessionToken,
          cookieValue: sessionToken ? `${sessionToken.substring(0, 8)}...` : null,
        },
        request: {
          url: c.req.url,
          method: c.req.method,
          headers: {
            userAgent: c.req.header('user-agent'),
            origin: c.req.header('origin'),
            referer: c.req.header('referer'),
            cookie: c.req.header('cookie') ? 'Present' : 'Missing',
          },
        },
        session: null as any,
      };

      // Check if session exists in database
      if (sessionToken) {
        try {
          const [session] = await db
            .select()
            .from(sessions)
            .where(eq(sessions.sessionToken, sessionToken))
            .limit(1);

          if (session) {
            diagnostics.session = {
              found: true,
              userId: session.userId,
              expires: session.expires.toISOString(),
              isExpired: session.expires < new Date(),
              timeUntilExpiry: session.expires.getTime() - Date.now(),
            };
          } else {
            diagnostics.session = {
              found: false,
              issue: 'Cookie present but no session in database',
            };
          }
        } catch (dbError) {
          diagnostics.session = {
            error: 'Database query failed',
            message: dbError instanceof Error ? dbError.message : 'Unknown error',
          };
        }
      } else {
        diagnostics.session = {
          found: false,
          issue: 'No session cookie present',
        };
      }

      // Cookie configuration that should be used
      const expectedCookieConfig = {
        path: "/",
        httpOnly: true,
        secure: isProd,
        sameSite: "lax",
        domain: null as string | null,
      };

      if (isProd && process.env.NEXT_PUBLIC_APP_URL) {
        try {
          const url = new URL(process.env.NEXT_PUBLIC_APP_URL);
          if (!url.hostname.match(/^(localhost|127\.0\.0\.1|\d+\.\d+\.\d+\.\d+)$/)) {
            expectedCookieConfig.domain = url.hostname;
          }
        } catch (e) {
          expectedCookieConfig.domain = 'PARSE_ERROR';
        }
      }

      // Warnings/Issues
      const issues: string[] = [];
      if (!process.env.NEXT_PUBLIC_APP_URL) {
        issues.push('⚠️ NEXT_PUBLIC_APP_URL not set - cookie domain detection will fail');
      }
      if (!isProd && sessionToken) {
        issues.push('ℹ️ Development mode - cookie security is relaxed');
      }
      if (diagnostics.session?.isExpired) {
        issues.push('⚠️ Session is EXPIRED - should be cleaned up');
      }
      if (diagnostics.session?.found === false && sessionToken) {
        issues.push('❌ CRITICAL: Cookie exists but session missing from database');
      }

      return c.json({
        status: 'ok',
        diagnostics,
        expectedCookieConfig,
        issues: issues.length > 0 ? issues : ['✅ No issues detected'],
        recommendations: [
          'Verify NEXT_PUBLIC_APP_URL matches your domain exactly',
          'Check that cookies are being set with consistent configuration',
          'Ensure database migrations are complete',
          'Test logout flow: cookie should be deleted after logout',
        ],
      }, 200);

    } catch (error) {
      console.error('[Debug] Error:', error);
      return c.json({
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      }, 500);
    }
  });

export default app;
