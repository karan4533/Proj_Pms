import { redirect } from "next/navigation";

import { getCurrent } from "@/features/auth/queries";

interface ReportPageProps {
  params: {
    workspaceId: string;
  };
}

const ReportPage = async ({ params }: ReportPageProps) => {
  const user = await getCurrent();

  if (!user) redirect("/sign-in");

  // Redirect to new project-centric report page
  redirect("/report");
};

export default ReportPage;
