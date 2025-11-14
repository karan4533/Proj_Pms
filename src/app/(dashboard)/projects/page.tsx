import { redirect } from "next/navigation";
import { getCurrent } from "@/features/auth/queries";
import { ProjectsClient } from "./client";

const ProjectsPage = async () => {
  const user = await getCurrent();
  if (!user) redirect("/sign-in");

  return <ProjectsClient />;
};

export default ProjectsPage;
