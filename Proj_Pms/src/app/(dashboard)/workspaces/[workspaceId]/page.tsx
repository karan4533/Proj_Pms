import { redirect } from "next/navigation";

import { getCurrent } from "@/features/auth/queries";

interface WorkspaceIdPageProps {
  params: {
    workspaceId: string;
  };
}

const WorkspaceIdPage = async ({ params }: WorkspaceIdPageProps) => {
  const user = await getCurrent();

  if (!user) redirect("/sign-in");

  // Redirect to new project-centric dashboard
  redirect("/dashboard");
};

export default WorkspaceIdPage;
