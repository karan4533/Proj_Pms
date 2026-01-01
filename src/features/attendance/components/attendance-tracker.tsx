"use client";

import { useState, useEffect } from "react";
import { Clock, Play, Square, Download, Loader2, Plus, X } from "lucide-react";
import { format } from "date-fns";
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
  workspaceId?: string; // Optional - for workspace-specific views
}

export const AttendanceTracker = ({ workspaceId }: AttendanceTrackerProps = {}) => {
  const [elapsedTime, setElapsedTime] = useState(0);
  const [dailyTasks, setDailyTasks] = useState<string[]>([""]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [endActivity, setEndActivity] = useState("");
  const [isStartDialogOpen, setIsStartDialogOpen] = useState(false);
  const [isEndShiftDialogOpen, setIsEndShiftDialogOpen] = useState(false);
  const [showMidnightWarning, setShowMidnightWarning] = useState(false);

  const { data: activeShift, isLoading } = useGetActiveShift();
  const { data: projects } = useGetProjects({});
  const startShift = useStartShift();
  const endShift = useEndShift();

  // Update timer
  useEffect(() => {
    if (!activeShift) {
      setElapsedTime(0);
      setShowMidnightWarning(false);
      // Clear midnight reload flag when no active shift
      sessionStorage.removeItem('midnight-reload-done');
      return;
    }

    const startTime = new Date(activeShift.shiftStartTime).getTime();
    let interval: NodeJS.Timeout | null = null;
    
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
        const reloadFlag = sessionStorage.getItem('midnight-reload-done');
        const lastReloadTime = reloadFlag ? parseInt(reloadFlag, 10) : 0;
        const timeSinceReload = Date.now() - lastReloadTime;
        
        // Only reload if we haven't reloaded in the last 5 minutes (prevent rapid reloads)
        if (!reloadFlag || timeSinceReload > 5 * 60 * 1000) {
          console.log('Auto-ending shift at midnight...');
          sessionStorage.setItem('midnight-reload-done', Date.now().toString());
          // Clear interval before reload to prevent memory leak
          if (interval) {
            clearInterval(interval);
            interval = null;
          }
          window.location.reload();
        }
      }
    };

    // Initial update
    updateTimer();
    
    // Start interval - update every second
    interval = setInterval(updateTimer, 1000);

    // Cleanup function - CRITICAL for preventing continuous re-renders
    return () => {
      if (interval) {
        clearInterval(interval);
        interval = null;
      }
    };
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
Date: ${format(startTime, 'MMM dd, yyyy')}
Start Time: ${format(startTime, 'h:mm a')}
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
        <CardHeader className="px-2 sm:px-4 md:px-6 py-3 sm:py-4">
          <CardTitle className="flex items-center gap-1.5 sm:gap-2 text-sm sm:text-lg md:text-xl">
            <Clock className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="truncate">Attendance</span>
          </CardTitle>
          <CardDescription className="text-[10px] sm:text-xs md:text-sm truncate">
            Track shift hours and tasks
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 sm:space-y-6 px-2 sm:px-4 md:px-6 pb-4 sm:pb-6">
          {/* Timer Display */}
          {activeShift && (
            <div className="flex items-center justify-center px-1 sm:px-2">
              <div className="text-center p-2 sm:p-4 md:p-8 rounded-lg bg-muted/50 w-full max-w-md">
                <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground mb-1 sm:mb-2">Shift Duration</p>
                <p className="text-xl sm:text-3xl md:text-4xl lg:text-5xl font-mono font-bold text-primary">
                  {formatTime(elapsedTime)}
                </p>
                <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground mt-1 sm:mt-2 truncate">
                  Started at {format(new Date(activeShift.shiftStartTime), 'h:mm a')}
                </p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col gap-2 w-full max-w-md mx-auto">
            {!activeShift ? (
              <Button
                onClick={handleStartShift}
                disabled={startShift.isPending}
                size="lg"
                className="gap-1.5 sm:gap-2 w-full flex items-center justify-center text-xs sm:text-sm md:text-base"
              >
                {startShift.isPending ? (
                  <>
                    <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                    <span>Starting...</span>
                  </>
                ) : (
                  <>
                    <Play className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span>Start Shift</span>
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
                  className="gap-1.5 sm:gap-2 w-full flex items-center justify-center text-xs sm:text-sm md:text-base"
                >
                  <Square className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span>End Shift</span>
                </Button>
                <Button
                  onClick={handleDownloadReport}
                  size="lg"
                  variant="outline"
                  className="gap-1.5 sm:gap-2 w-full flex items-center justify-center whitespace-nowrap text-xs sm:text-sm md:text-base"
                  disabled={dailyTasks.filter((t) => t.trim()).length === 0}
                >
                  <Download className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden xs:inline">Download</span>
                  <span className="xs:hidden">Download All</span>
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
                      {format(new Date(activeShift.shiftStartTime), 'h:mm a')}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">End Time</p>
                    <p className="font-medium">
                      {format(new Date(), 'h:mm a')}
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
