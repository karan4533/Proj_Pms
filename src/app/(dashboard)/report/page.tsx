import { redirect } from "next/navigation";
import { getCurrent } from "@/features/auth/queries";
import { ReportClient } from "./client";

const ReportPage = async () => {
  const user = await getCurrent();
  if (!user) redirect("/sign-in");

  return <ReportClient />;
};

export default ReportPage;
