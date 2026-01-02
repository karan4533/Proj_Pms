import { redirect } from "next/navigation";
import { getCurrent } from "@/features/auth/queries";

const ReportsPage = async () => {
  const user = await getCurrent();
  if (!user) redirect("/sign-in");

  // Redirect to the main report page
  redirect("/report");
};

export default ReportsPage;
