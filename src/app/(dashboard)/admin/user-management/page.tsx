import { redirect } from "next/navigation";
import { getCurrent } from "@/features/auth/queries";
import { UserManagementClient } from "./client";
import { db } from "@/db";
import { members } from "@/db/schema";
import { eq } from "drizzle-orm";
import { MemberRole } from "@/features/members/types";

const UserManagementPage = async () => {
  const user = await getCurrent();
  if (!user) redirect("/sign-in");

  // Check if user is admin in any workspace
  const memberRecords = await db
    .select()
    .from(members)
    .where(eq(members.userId, user.id));

  const isAdmin = memberRecords.some(
    (m) => m.role === MemberRole.ADMIN || m.role === MemberRole.PROJECT_MANAGER
  );

  if (!isAdmin) {
    redirect("/dashboard");
  }

  return <UserManagementClient />;
};

export default UserManagementPage;
