"use client";

import { AttendanceTracker } from "@/features/attendance/components/attendance-tracker";
import { AttendanceRecords } from "@/features/attendance/components/attendance-records";
import { MyAttendanceHistory } from "@/features/attendance/components/my-attendance-history";
import { useCurrent } from "@/features/auth/api/use-current";
import { useIsGlobalAdmin } from "@/features/members/api/use-get-user-role";

const AttendanceClient = () => {
  const { data: user } = useCurrent();
  const { data: isAdmin, isLoading: isAdminLoading } = useIsGlobalAdmin();

  if (!user) return null;

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
        <AttendanceTracker />

        {/* My Attendance History - Admin sees their own first */}
        <MyAttendanceHistory />

        {/* Admin Only: All Employees' Attendance Records - Shown below admin's own records */}
        {!isAdminLoading && isAdmin && (
          <AttendanceRecords />
        )}
      </div>
    </div>
  );
};

export default AttendanceClient;
