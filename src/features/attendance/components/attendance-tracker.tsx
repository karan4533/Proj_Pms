"use client";

import { useState, useEffect } from "react";
import { Clock, Play, Square, Download, Loader2, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useStartShift, useEndShift, useGetActiveShift } from "../api/use-attendance";
import { useGetProjects } from "@/features/projects/api/use-get-projects";
import { toast } from "sonner";

interface AttendanceTrackerProps {
  workspaceId?: string;
}

export const AttendanceTracker = ({ workspaceId }: AttendanceTrackerProps = {}) => {
  const effectiveWorkspaceId = workspaceId || "default-workspace";
  const [elapsedTime, setElapsedTime] = useState(0);
  const [dailyTasks, setDailyTasks] = useState<string[]>([""]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [endActivity, setEndActivity] = useState("");
  const [isStartDialogOpen, setIsStartDialogOpen] = useState(false);
  const [isEndShiftDialogOpen, setIsEndShiftDialogOpen] = useState(false);
  const [showMidnightWarning, setShowMidnightWarning] = useState(false);

  const { data: activeShift, isLoading } = useGetActiveShift(effectiveWorkspaceId);
  const { data: projects } = useGetProjects({});
  const startShift = useStartShift();
  const endShift = useEndShift();

  // Update timer
  useEffect(() => {
    if (!activeShift) {
      setElapsedTime(0);
      setShowMidnightWarning(false);
      return;
    }

    const startTime = new Date(activeShift.shiftStartTime).getTime();
    
    const updateTimer = () => {
      const now = Date.now();
      const elapsed = Math.floor((now - startTime) / 1000); // in seconds
      setElapsedTime(elapsed);

      // Check if we've passed midnight (12 AM)
      const shiftDate = new Date(activeShift.shiftStartTime);
      const currentDate = new Date();
      
      // Get midnight of the next day after shift started
      const midnightToday = new Date(shiftDate);
      midnightToday.setHours(24, 0, 0, 0);
      
      // Show warning 30 minutes before midnight
      const thirtyMinutesBeforeMidnight = new Date(midnightToday);
      thirtyMinutesBeforeMidnight.setMinutes(thirtyMinutesBeforeMidnight.getMinutes() - 30);
      
      if (currentDate >= thirtyMinutesBeforeMidnight && currentDate < midnightToday) {
        setShowMidnightWarning(true);
      } else {
        setShowMidnightWarning(false);
      }
      
      // If current time is past midnight, auto-end the shift
      if (currentDate >= midnightToday) {
        console.log('Auto-ending shift at midnight...');
        // Reload to get updated shift status from server
        window.location.reload();
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [activeShift]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleStartShift = () => {
    setIsStartDialogOpen(true);
  };

  const handleStartShiftSubmit = () => {
    startShift.mutate(
      {
        workspaceId: effectiveWorkspaceId,
        projectId: selectedProjectId || undefined,
      },
      {
        onSuccess: () => {
          setIsStartDialogOpen(false);
          setSelectedProjectId("");
        },
      }
    );
  };

  const handleEndShiftClick = () => {
    setIsEndShiftDialogOpen(true);
  };

  const handleAddTask = () => {
    setDailyTasks([...dailyTasks, ""]);
  };

  const handleRemoveTask = (index: number) => {
    if (dailyTasks.length > 1) {
      setDailyTasks(dailyTasks.filter((_, i) => i !== index));
    }
  };

  const handleTaskChange = (index: number, value: string) => {
    const newTasks = [...dailyTasks];
    newTasks[index] = value;
    setDailyTasks(newTasks);
  };

  const handleEndShiftSubmit = () => {
    if (!activeShift) return;

    const tasksArray = dailyTasks
      .map((task) => task.trim())
      .filter((task) => task.length > 0);

    if (tasksArray.length === 0) {
      toast.error("Please add at least one task");
      return;
    }

    // Use all tasks as end activity summary
    const endActivitySummary = tasksArray.join("; ");

    endShift.mutate(
      {
        attendanceId: activeShift.id,
        endActivity: endActivitySummary,
        dailyTasks: tasksArray,
      },
      {
        onSuccess: () => {
          setIsEndShiftDialogOpen(false);
          setDailyTasks([""]);
          setEndActivity("");
        },
      }
    );
  };

  const handleDownloadReport = () => {
    if (!activeShift) return;

    const startTime = new Date(activeShift.shiftStartTime);
    const tasksList = dailyTasks
      .filter((task) => task.trim().length > 0)
      .map((task, i) => `${i + 1}. ${task}`)
      .join("\n");

    const report = `
SHIFT REPORT
============
Date: ${startTime.toLocaleDateString()}
Start Time: ${startTime.toLocaleTimeString()}
Duration: ${formatTime(elapsedTime)}

DAILY TASKS:
${tasksList}
    `.trim();

    const blob = new Blob([report], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `shift-report-${startTime.toISOString().split("T")[0]}.txt`;
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
    <div className="space-y-6">
      {/* Midnight Warning Banner */}
      {showMidnightWarning && (
        <div className="rounded-lg bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 p-4">
          <div className="flex items-start gap-3">
            <Clock className="size-5 text-amber-600 dark:text-amber-400 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-amber-900 dark:text-amber-100">
                Shift Ending Soon
              </h3>
              <p className="text-sm text-amber-800 dark:text-amber-200 mt-1">
                Your shift will automatically end at midnight (12:00 AM). Please end your shift manually and enter your tasks before then.
              </p>
            </div>
          </div>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="size-5" />
            Attendance Tracker
          </CardTitle>
          <CardDescription>
            Track your shift hours and daily tasks (Shifts auto-end at midnight)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Timer Display */}
          {activeShift && (
            <div className="flex items-center justify-center">
              <div className="text-center p-8 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground mb-2">Shift Duration</p>
                <p className="text-5xl font-mono font-bold text-primary">
                  {formatTime(elapsedTime)}
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Started at {new Date(activeShift.shiftStartTime).toLocaleTimeString()}
                </p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-center gap-4">
            {!activeShift ? (
              <Button
                onClick={handleStartShift}
                disabled={startShift.isPending}
                size="lg"
                className="gap-2"
              >
                {startShift.isPending ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Starting...
                  </>
                ) : (
                  <>
                    <Play className="size-4" />
                    Start Shift
                  </>
                )}
              </Button>
            ) : (
              <>
                <Button
                  onClick={handleEndShiftClick}
                  disabled={endShift.isPending}
                  size="lg"
                  variant="destructive"
                  className="gap-2"
                >
                  <Square className="size-4" />
                  End Shift
                </Button>
                <Button
                  onClick={handleDownloadReport}
                  size="lg"
                  variant="outline"
                  className="gap-2"
                  disabled={dailyTasks.filter((t) => t.trim()).length === 0}
                >
                  <Download className="size-4" />
                  Download Report
                </Button>
              </>
            )}
          </div>

          {/* Task Input (visible when shift is active) */}
          {activeShift && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">
                  End Activity Summary
                </label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddTask}
                  className="gap-1"
                >
                  <Plus className="size-4" />
                  Add Task
                </Button>
              </div>
              <div className="space-y-2">
                {dailyTasks.map((task, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      placeholder={`Task ${index + 1}...`}
                      value={task}
                      onChange={(e) => handleTaskChange(index, e.target.value)}
                      className="flex-1"
                    />
                    {dailyTasks.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveTask(index)}
                        className="shrink-0"
                      >
                        <X className="size-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                {dailyTasks.filter((t) => t.trim()).length} tasks entered • You can download the report anytime during your shift
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Start Shift Dialog */}
      <Dialog open={isStartDialogOpen} onOpenChange={setIsStartDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Start Shift</DialogTitle>
            <DialogDescription>
              Select the project you'll be working on (optional).
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="project">Project</Label>
              <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
                <SelectTrigger id="project">
                  <SelectValue placeholder="Select a project (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {projects?.documents?.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                You can leave this blank if you're not working on a specific project
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsStartDialogOpen(false)}
              disabled={startShift.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleStartShiftSubmit}
              disabled={startShift.isPending}
            >
              {startShift.isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin mr-2" />
                  Starting...
                </>
              ) : (
                "Start Shift"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* End Shift Dialog */}
      <Dialog open={isEndShiftDialogOpen} onOpenChange={setIsEndShiftDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>End Shift</DialogTitle>
            <DialogDescription>
              Review your shift details and enter your daily tasks.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 overflow-y-auto flex-1 px-1">
            {/* Shift Details Summary */}
            {activeShift && (
              <div className="rounded-lg border bg-muted/50 p-4 space-y-3">
                <h3 className="font-semibold text-sm">Shift Details</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Project</p>
                    <p className="font-medium">
                      {activeShift.projectId 
                        ? projects?.documents?.find(p => p.id === activeShift.projectId)?.name || "Unknown Project"
                        : "No Project Selected"}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Total Duration</p>
                    <p className="font-medium text-primary text-lg">
                      {formatTime(elapsedTime)}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Start Time</p>
                    <p className="font-medium">
                      {new Date(activeShift.shiftStartTime).toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">End Time</p>
                    <p className="font-medium">
                      {new Date().toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true
                      })}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* End Activity Summary */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>End Activity Summary</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddTask}
                  className="gap-1"
                >
                  <Plus className="size-4" />
                  Add Task
                </Button>
              </div>
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                {dailyTasks.map((task, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      placeholder={`Task ${index + 1}...`}
                      value={task}
                      onChange={(e) => handleTaskChange(index, e.target.value)}
                      className="flex-1"
                    />
                    {dailyTasks.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveTask(index)}
                        className="shrink-0"
                      >
                        <X className="size-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                {dailyTasks.filter((t) => t.trim()).length} tasks entered
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEndShiftDialogOpen(false)}
              disabled={endShift.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleEndShiftSubmit}
              disabled={endShift.isPending || dailyTasks.filter((t) => t.trim()).length === 0}
            >
              {endShift.isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin mr-2" />
                  Ending Shift...
                </>
              ) : (
                "End Shift"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
