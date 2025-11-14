import { redirect } from "next/navigation";
import { getCurrent } from "@/features/auth/queries";
import AttendanceClient from "@/app/(dashboard)/attendance/client";

const AttendancePage = async () => {
  const user = await getCurrent();

  if (!user) redirect("/sign-in");

  return <AttendanceClient />;
};

export default AttendancePage;
