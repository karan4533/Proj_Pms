"use client";

import { useState } from "react";
import { Download, Loader2, Clock, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useGetAttendanceRecords } from "../api/use-attendance";
import { useGetProjects } from "@/features/projects/api/use-get-projects";

interface AttendanceRecordsProps {
  workspaceId: string;
}

export const AttendanceRecords = ({ workspaceId }: AttendanceRecordsProps) => {
  const { data: records, isLoading } = useGetAttendanceRecords(workspaceId);
  const { data: projects } = useGetProjects({ workspaceId });
  
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);

  const formatDuration = (minutes: number | null) => {
    if (!minutes) return "N/A";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleViewDetails = (record: any) => {
    setSelectedRecord(record);
    setIsDetailDialogOpen(true);
  };

  const downloadCSV = () => {
    if (!records || records.length === 0) return;

    const headers = ["Date", "Employee Name", "Email", "Start Time", "End Time", "Duration", "Status", "End Activity", "Tasks"];
    const rows = records.map((record) => [
      formatDate(record.shiftStartTime),
      record.userName || "N/A",
      record.userEmail || "N/A",
      formatTime(record.shiftStartTime),
      record.shiftEndTime ? formatTime(record.shiftEndTime) : "In Progress",
      record.totalDuration ? formatDuration(record.totalDuration) : "N/A",
      record.status,
      record.endActivity || "N/A",
      record.dailyTasks ? JSON.stringify(record.dailyTasks).replace(/,/g, "; ") : "N/A",
    ]);

    const csv = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `attendance-records-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <>
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Clock className="size-5" />
              Attendance Records {records && records.length > 0 && `(${records.length})`}
            </CardTitle>
            <CardDescription>
              Company-wide attendance records for all employees (Admin Only)
            </CardDescription>
          </div>
          <Button onClick={downloadCSV} disabled={!records || records.length === 0} className="gap-2">
            <Download className="size-4" />
            Download CSV
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {!records || records.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <Clock className="size-10 mb-3" />
            <p className="text-base font-medium">No completed attendance records found</p>
            <p className="text-sm mt-1 text-center max-w-md">
              No employees have completed shifts yet across the company.
            </p>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Employee Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Start Time</TableHead>
                  <TableHead>End Time</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Daily Tasks</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="font-medium">
                      {formatDate(record.shiftStartTime)}
                    </TableCell>
                    <TableCell className="font-medium">
                      {record.userName || "Unknown User"}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {record.userEmail || "N/A"}
                    </TableCell>
                    <TableCell>{formatTime(record.shiftStartTime)}</TableCell>
                    <TableCell>
                      {record.shiftEndTime ? formatTime(record.shiftEndTime) : "-"}
                    </TableCell>
                    <TableCell>
                      {record.totalDuration ? formatDuration(record.totalDuration) : "-"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={record.status === "COMPLETED" ? "default" : "secondary"}
                        className="gap-1"
                      >
                        {record.status === "COMPLETED" ? (
                          <CheckCircle2 className="size-3" />
                        ) : (
                          <Clock className="size-3" />
                        )}
                        {record.status === "COMPLETED" ? "Completed" : "In Progress"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {record.dailyTasks ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewDetails(record)}
                          className="text-primary hover:underline"
                        >
                          View {(record.dailyTasks as string[]).length} tasks
                        </Button>
                      ) : (
                        <span className="text-muted-foreground">No tasks yet</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>

    {/* Detail Dialog */}
    <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Attendance Details</DialogTitle>
          <DialogDescription>
            Complete information for this shift
          </DialogDescription>
        </DialogHeader>
        {selectedRecord && (
          <div className="space-y-4 overflow-y-auto flex-1 px-1">
            {/* Employee & Date Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Employee Name</p>
                <p className="font-semibold text-lg">{selectedRecord.userName}</p>
                <p className="text-sm text-muted-foreground">{selectedRecord.userEmail}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Date</p>
                <p className="font-semibold text-lg">
                  {formatDate(selectedRecord.shiftStartTime)}
                </p>
              </div>
            </div>

            {/* Project */}
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Project</p>
              <p className="font-semibold text-lg">
                {selectedRecord.projectId
                  ? projects?.documents?.find(p => p.id === selectedRecord.projectId)?.name || "Unknown Project"
                  : "No Project Selected"}
              </p>
            </div>

            {/* Time Details */}
            <div className="rounded-lg border bg-muted/50 p-4">
              <h3 className="font-semibold text-sm mb-3">Time Details</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Start Time</p>
                  <p className="font-medium">{formatTime(selectedRecord.shiftStartTime)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">End Time</p>
                  <p className="font-medium">
                    {selectedRecord.shiftEndTime ? formatTime(selectedRecord.shiftEndTime) : "In Progress"}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Total Duration</p>
                  <p className="font-medium text-primary text-lg">
                    {selectedRecord.totalDuration ? formatDuration(selectedRecord.totalDuration) : "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Status</p>
                  <Badge
                    variant={selectedRecord.status === "COMPLETED" ? "default" : "secondary"}
                    className="gap-1"
                  >
                    {selectedRecord.status === "COMPLETED" ? (
                      <CheckCircle2 className="size-3" />
                    ) : (
                      <Clock className="size-3" />
                    )}
                    {selectedRecord.status === "COMPLETED" ? "Completed" : "In Progress"}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Daily Tasks */}
            {selectedRecord.dailyTasks && (
              <div className="space-y-2">
                <h3 className="font-semibold text-sm">
                  Daily Tasks ({(selectedRecord.dailyTasks as string[]).length})
                </h3>
                <div className="rounded-lg border bg-muted/50 p-4">
                  <ul className="space-y-2">
                    {(selectedRecord.dailyTasks as string[]).map((task, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <span className="text-primary font-semibold min-w-[24px]">{i + 1}.</span>
                        <span>{task}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
    </>
  );
};
