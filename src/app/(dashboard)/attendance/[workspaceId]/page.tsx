import { redirect } from "next/navigation";
import { getCurrent } from "@/features/auth/queries";
import { AttendanceTracker } from "@/features/attendance/components/attendance-tracker";
import { AttendanceRecords } from "@/features/attendance/components/attendance-records";
import { MyAttendanceHistory } from "@/features/attendance/components/my-attendance-history";
import { getMember } from "@/features/members/utils";
import { MemberRole } from "@/features/members/types";

interface AttendancePageProps {
  params: {
    workspaceId: string;
  };
}

const AttendancePage = async ({ params }: AttendancePageProps) => {
  const user = await getCurrent();
  if (!user) redirect("/sign-in");

  const { workspaceId } = params;

  // Check if user is a member and get their role
  const member = await getMember({ workspaceId, userId: user.id });
  if (!member) redirect("/");

  const isAdmin = member.role === MemberRole.ADMIN;

  return (
    <div className="h-full flex flex-col">
      <div className="flex flex-col gap-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Attendance</h1>
            <p className="text-muted-foreground">
              Track your work hours and daily tasks across all projects
            </p>
          </div>
        </div>

        {/* Attendance Tracker */}
        <AttendanceTracker workspaceId={workspaceId} />

        {/* Employee: My Attendance History */}
        <MyAttendanceHistory workspaceId={workspaceId} />

        {/* Admin Only: All Attendance Records */}
        {isAdmin && (
          <div className="mt-6">
            <AttendanceRecords workspaceId={workspaceId} />
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendancePage;

