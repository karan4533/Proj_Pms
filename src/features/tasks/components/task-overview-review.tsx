"use client";

import { useState } from "react";
import { format } from "date-fns";
import { CheckCircle, XCircle, Eye, Github, Link as LinkIcon, Image as ImageIcon, File, Clock } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { TaskOverview, OverviewStatus } from "../types";
import { useReviewTaskOverview } from "../api/use-review-task-overview";

interface TaskOverviewReviewProps {
  overview: TaskOverview;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function TaskOverviewReview({
  overview,
  isOpen,
  onClose,
  onSuccess,
}: TaskOverviewReviewProps) {
  const [adminRemarks, setAdminRemarks] = useState("");
  const { mutate: reviewOverview, isPending } = useReviewTaskOverview();

  const handleApprove = () => {
    reviewOverview(
      {
        overviewId: overview.id,
        status: OverviewStatus.APPROVED,
        adminRemarks: adminRemarks.trim() || undefined,
      },
      {
        onSuccess: () => {
          setAdminRemarks("");
          onSuccess?.();
          onClose();
        },
      }
    );
  };

  const handleRework = () => {
    if (!adminRemarks.trim()) {
      alert("Please provide remarks when requesting rework");
      return;
    }

    reviewOverview(
      {
        overviewId: overview.id,
        status: OverviewStatus.REWORK,
        adminRemarks: adminRemarks.trim(),
      },
      {
        onSuccess: () => {
          setAdminRemarks("");
          onSuccess?.();
          onClose();
        },
      }
    );
  };

  const formatTimeSpent = (minutes?: number) => {
    if (!minutes) return "Not specified";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Review Task Completion Overview</DialogTitle>
          <DialogDescription>
            Review the employee's submission and approve or request rework
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Task Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Task Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-semibold">Task Title:</Label>
                  <p className="text-sm">{overview.taskTitle}</p>
                </div>
                <div>
                  <Label className="text-sm font-semibold">Employee:</Label>
                  <p className="text-sm">{overview.employeeName}</p>
                </div>
                <div>
                  <Label className="text-sm font-semibold">Submitted:</Label>
                  <p className="text-sm">
                    {format(new Date(overview.createdAt), "MMM d, yyyy 'at' h:mm a")}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-semibold">Time Spent:</Label>
                  <p className="text-sm flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatTimeSpent(overview.timeSpent)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Completed Work Description */}
          <div className="space-y-2">
            <Label className="text-base font-semibold">What was completed?</Label>
            <Card>
              <CardContent className="pt-4">
                <p className="text-sm whitespace-pre-wrap">{overview.completedWorkDescription}</p>
              </CardContent>
            </Card>
          </div>

          {/* Completion Method */}
          <div className="space-y-2">
            <Label className="text-base font-semibold">How was it completed?</Label>
            <Card>
              <CardContent className="pt-4">
                <p className="text-sm whitespace-pre-wrap">{overview.completionMethod}</p>
              </CardContent>
            </Card>
          </div>

          {/* Steps Followed */}
          <div className="space-y-2">
            <Label className="text-base font-semibold">Steps Followed</Label>
            <Card>
              <CardContent className="pt-4">
                <p className="text-sm whitespace-pre-wrap">{overview.stepsFollowed}</p>
              </CardContent>
            </Card>
          </div>

          {/* Proof of Work */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Proof of Work</Label>
            
            {/* Screenshots */}
            {overview.proofOfWork.screenshots && overview.proofOfWork.screenshots.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm flex items-center gap-2">
                  <ImageIcon className="h-4 w-4" />
                  Screenshots ({overview.proofOfWork.screenshots.length})
                </Label>
                <div className="flex flex-wrap gap-3">
                  {overview.proofOfWork.screenshots.map((url, index) => (
                    <a
                      key={index}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group relative"
                    >
                      <img
                        src={url}
                        alt={`Screenshot ${index + 1}`}
                        className="h-32 w-32 object-cover rounded border hover:ring-2 hover:ring-primary transition"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center rounded">
                        <Eye className="h-6 w-6 text-white" />
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Files */}
            {overview.proofOfWork.files && overview.proofOfWork.files.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm flex items-center gap-2">
                  <File className="h-4 w-4" />
                  Files ({overview.proofOfWork.files.length})
                </Label>
                <div className="space-y-1">
                  {overview.proofOfWork.files.map((url, index) => (
                    <a
                      key={index}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block bg-muted p-3 rounded hover:bg-muted/70 transition"
                    >
                      <span className="text-sm text-blue-600 hover:underline">
                        {url.split('/').pop() || `File ${index + 1}`}
                      </span>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Links */}
            {overview.proofOfWork.links && overview.proofOfWork.links.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm flex items-center gap-2">
                  <LinkIcon className="h-4 w-4" />
                  Links ({overview.proofOfWork.links.length})
                </Label>
                <div className="space-y-1">
                  {overview.proofOfWork.links.map((link, index) => (
                    <a
                      key={index}
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block bg-muted p-3 rounded hover:bg-muted/70 transition"
                    >
                      <span className="text-sm text-blue-600 hover:underline truncate block">
                        {link}
                      </span>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* GitHub Commits */}
            {overview.proofOfWork.githubCommits && overview.proofOfWork.githubCommits.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm flex items-center gap-2">
                  <Github className="h-4 w-4" />
                  GitHub Commits ({overview.proofOfWork.githubCommits.length})
                </Label>
                <div className="space-y-1">
                  {overview.proofOfWork.githubCommits.map((commit, index) => (
                    <div
                      key={index}
                      className="bg-muted p-3 rounded font-mono text-xs"
                    >
                      {commit}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Optional Fields */}
          {overview.challenges && (
            <div className="space-y-2">
              <Label className="text-base font-semibold">Challenges Faced</Label>
              <Card>
                <CardContent className="pt-4">
                  <p className="text-sm whitespace-pre-wrap">{overview.challenges}</p>
                </CardContent>
              </Card>
            </div>
          )}

          {overview.additionalRemarks && (
            <div className="space-y-2">
              <Label className="text-base font-semibold">Additional Remarks</Label>
              <Card>
                <CardContent className="pt-4">
                  <p className="text-sm whitespace-pre-wrap">{overview.additionalRemarks}</p>
                </CardContent>
              </Card>
            </div>
          )}

          <Separator />

          {/* Admin Remarks */}
          <div className="space-y-2">
            <Label htmlFor="adminRemarks" className="text-base font-semibold">
              Admin Remarks {overview.status === OverviewStatus.PENDING && <span className="text-xs text-muted-foreground">(Required for rework)</span>}
            </Label>
            <Textarea
              id="adminRemarks"
              value={adminRemarks}
              onChange={(e) => setAdminRemarks(e.target.value)}
              placeholder="Provide feedback, suggestions, or reasons for rework..."
              className="min-h-[100px] resize-y"
            />
          </div>

          {/* Action Buttons */}
          {overview.status === OverviewStatus.PENDING && (
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={onClose} disabled={isPending}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleRework}
                disabled={isPending}
                className="gap-2"
              >
                <XCircle className="h-4 w-4" />
                Request Rework
              </Button>
              <Button
                onClick={handleApprove}
                disabled={isPending}
                className="gap-2"
              >
                <CheckCircle className="h-4 w-4" />
                Approve & Complete
              </Button>
            </div>
          )}

          {/* Show status if already reviewed */}
          {overview.status !== OverviewStatus.PENDING && (
            <div className="space-y-3">
              <Badge
                variant={overview.status === OverviewStatus.APPROVED ? "default" : "destructive"}
                className="text-sm"
              >
                {overview.status === OverviewStatus.APPROVED ? "Approved" : "Rework Requested"}
              </Badge>
              
              {overview.adminRemarks && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Previous Admin Remarks</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm whitespace-pre-wrap">{overview.adminRemarks}</p>
                  </CardContent>
                </Card>
              )}

              {overview.reviewedAt && (
                <p className="text-xs text-muted-foreground">
                  Reviewed on {format(new Date(overview.reviewedAt), "MMM d, yyyy 'at' h:mm a")}
                </p>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
