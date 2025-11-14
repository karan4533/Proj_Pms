import "server-only";

import { getCookie } from "hono/cookie";
import { createMiddleware } from "hono/factory";
import { db } from "@/db";
import { sessions, users } from "@/db/schema";
import { eq } from "drizzle-orm";

import { AUTH_COOKIE } from "@/features/auth/constants";

export type User = typeof users.$inferSelect;

type AdditionalContext = {
  Variables: {
    user: User;
    userId: string;
  };
};

export const sessionMiddleware = createMiddleware<AdditionalContext>(
  async (c, next) => {
    const sessionToken = getCookie(c, AUTH_COOKIE);

    if (!sessionToken) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    // Get session and user in a single optimized query with JOIN
    const [result] = await db
      .select({
        session: {
          sessionToken: sessions.sessionToken,
          expires: sessions.expires,
          userId: sessions.userId,
        },
        user: {
          id: users.id,
          name: users.name,
          email: users.email,
          emailVerified: users.emailVerified,
          image: users.image,
          password: users.password,
          createdAt: users.createdAt,
          updatedAt: users.updatedAt,
          // Profile fields
          dateOfBirth: users.dateOfBirth,
          native: users.native,
          mobileNo: users.mobileNo,
          designation: users.designation,
          department: users.department,
          experience: users.experience,
          dateOfJoining: users.dateOfJoining,
          skills: users.skills,
        }
      })
      .from(sessions)
      .innerJoin(users, eq(sessions.userId, users.id))
      .where(eq(sessions.sessionToken, sessionToken))
      .limit(1);

    if (!result) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const { session, user } = result;

    // Check if session is expired
    if (session.expires < new Date()) {
      // Delete expired session
      await db.delete(sessions).where(eq(sessions.sessionToken, sessionToken));
      return c.json({ error: "Session expired" }, 401);
    }

    c.set("user", user);
    c.set("userId", user.id);

    await next();
  }
);
