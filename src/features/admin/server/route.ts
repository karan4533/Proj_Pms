import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { db } from "@/db";
import { users, members, workspaces } from "@/db/schema";
import { eq } from "drizzle-orm";
import { sessionMiddleware } from "@/lib/session-middleware";
import { MemberRole } from "@/features/members/types";

const app = new Hono()
  .post(
    "/create-user",
    sessionMiddleware,
    zValidator(
      "json",
      z.object({
        name: z.string().min(1),
        email: z.string().email(),
        password: z.string().min(6),
        role: z.nativeEnum(MemberRole),
      })
    ),
    async (c) => {
      const currentUser = c.get("user");
      const { name, email, password, role } = c.req.valid("json");

      // Check if current user is admin
      const memberRecord = await db
        .select()
        .from(members)
        .where(eq(members.userId, currentUser.id))
        .limit(1);

      if (!memberRecord.length || memberRecord[0].role !== MemberRole.ADMIN) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      // Check if email already exists
      const existingUser = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

      if (existingUser.length > 0) {
        return c.json({ error: "Email already exists" }, 400);
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const [newUser] = await db
        .insert(users)
        .values({
          name,
          email,
          password: hashedPassword,
        })
        .returning();

      // Get first workspace
      const workspaceList = await db.select().from(workspaces).limit(1);

      if (workspaceList.length > 0) {
        // Add user to workspace with specified role
        await db.insert(members).values({
          userId: newUser.id,
          workspaceId: workspaceList[0].id,
          role: role,
        });
      }

      return c.json({
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: role,
      });
    }
  );

export default app;
