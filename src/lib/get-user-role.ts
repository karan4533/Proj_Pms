/**
 * Get User's Role in a Workspace
 */
import { db } from "@/db";
import { members } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { MemberRole } from "@/features/members/types";

export async function getUserRole(
  userId: string,
  workspaceId: string
): Promise<MemberRole> {
  try {
    const [member] = await db
      .select()
      .from(members)
      .where(
        and(
          eq(members.userId, userId),
          eq(members.workspaceId, workspaceId)
        )
      )
      .limit(1);

    // Return user's role or default to EMPLOYEE
    return (member?.role as MemberRole) || MemberRole.EMPLOYEE;
  } catch (error) {
    console.error("Error fetching user role:", error);
    return MemberRole.EMPLOYEE; // Default fallback
  }
}

/**
 * Get User's Role from any workspace (for individual tasks without workspace)
 */
export async function getUserRoleFromAnyWorkspace(
  userId: string
): Promise<MemberRole> {
  try {
    const userMemberships = await db
      .select()
      .from(members)
      .where(eq(members.userId, userId));

    if (userMemberships.length === 0) {
      return MemberRole.EMPLOYEE;
    }

    // If user is admin in ANY workspace, return admin
    const hasAdminRole = userMemberships.some(
      (m) => m.role === MemberRole.ADMIN || m.role === MemberRole.PROJECT_MANAGER
    );

    if (hasAdminRole) {
      return MemberRole.ADMIN;
    }

    // Return their first role (most common scenario)
    return (userMemberships[0].role as MemberRole) || MemberRole.EMPLOYEE;
  } catch (error) {
    console.error("Error fetching user role from any workspace:", error);
    return MemberRole.EMPLOYEE;
  }
}

/**
 * Get User's Projects in a Workspace
 */
export async function getUserProjects(
  userId: string,
  workspaceId: string
): Promise<string[]> {
  // TODO: Implement based on your project ownership logic
  // For now, return empty array
  // You might want to query projects where creator = userId
  return [];
}

/**
 * Get Team Member IDs for a Team Lead
 */
export async function getTeamMemberIds(
  userId: string,
  workspaceId: string
): Promise<string[]> {
  // TODO: Implement team structure
  // For now, return empty array
  // You might want to add a teams table or team assignments
  return [];
}
