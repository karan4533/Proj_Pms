import { redirect } from "next/navigation";

import { getCurrent } from "@/features/auth/queries";
import { getUserRole, getUserRoleFromAnyWorkspace } from "@/lib/get-user-role";
import { PermissionProvider } from "@/components/providers/permission-provider";

import { TaskIdClient } from "./client";

interface TaskIdPageProps {
  params: {
    workspaceId: string;
    taskId: string;
  };
}

const TaskIdPage = async ({ params }: TaskIdPageProps) => {
  const user = await getCurrent();
  if (!user) redirect("/sign-in");

  const workspaceId = params.workspaceId;
  
  // Handle individual tasks where workspaceId might be "undefined" string or null
  const hasValidWorkspace = workspaceId && workspaceId !== "undefined" && workspaceId !== "null";
  
  // For individual tasks, get role from any workspace; for workspace tasks, get role from specific workspace
  const userRole = hasValidWorkspace 
    ? await getUserRole(user.id, workspaceId)
    : await getUserRoleFromAnyWorkspace(user.id);

  return (
    <PermissionProvider 
      userId={user.id} 
      workspaceId={hasValidWorkspace ? workspaceId : undefined} 
      role={userRole}
    >
      <TaskIdClient />
    </PermissionProvider>
  );
};

export default TaskIdPage;
