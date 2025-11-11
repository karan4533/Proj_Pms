"use client";

import { useState } from "react";
import { Trash2, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { DottedSeparator } from "@/components/dotted-separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { useBulkDeleteProjects } from "@/features/projects/api/use-bulk-delete-projects";
import { Project } from "@/features/projects/types";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";

interface BulkDeleteProjectsCardProps {
  projects: Project[];
}

export const BulkDeleteProjectsCard = ({ projects }: BulkDeleteProjectsCardProps) => {
  const workspaceId = useWorkspaceId();
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  
  const { mutate: bulkDelete, isPending } = useBulkDeleteProjects();

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedProjects(projects.map(p => p.id));
    } else {
      setSelectedProjects([]);
    }
  };

  const handleSelectProject = (projectId: string, checked: boolean) => {
    if (checked) {
      setSelectedProjects(prev => [...prev, projectId]);
    } else {
      setSelectedProjects(prev => prev.filter(id => id !== projectId));
    }
  };

  const handleBulkDelete = () => {
    bulkDelete(
      {
        projectIds: selectedProjects,
        workspaceId,
      },
      {
        onSuccess: () => {
          setSelectedProjects([]);
          setIsOpen(false);
        },
      }
    );
  };

  const allSelected = projects.length > 0 && selectedProjects.length === projects.length;
  const someSelected = selectedProjects.length > 0 && selectedProjects.length < projects.length;

  return (
    <Card className="border-2 border-destructive/20 shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl flex items-center gap-2">
              <Trash2 className="size-5 text-destructive" />
              Bulk Delete Projects
            </CardTitle>
            <CardDescription className="mt-2">
              Select multiple projects to delete (Admin only)
            </CardDescription>
          </div>
          {selectedProjects.length > 0 && (
            <div className="bg-destructive/10 px-3 py-1.5 rounded-md">
              <span className="text-sm font-medium text-destructive">
                {selectedProjects.length} selected
              </span>
            </div>
          )}
        </div>
      </CardHeader>
      <DottedSeparator />
      <CardContent className="p-4">
        {projects.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No projects available to delete
          </div>
        ) : (
          <>
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
              {/* Select All */}
              <div className="flex items-center space-x-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                <Checkbox
                  id="select-all"
                  checked={allSelected}
                  onCheckedChange={handleSelectAll}
                  disabled={isPending}
                />
                <label
                  htmlFor="select-all"
                  className="text-sm font-medium leading-none cursor-pointer flex-1"
                >
                  Select All Projects
                </label>
              </div>

              <DottedSeparator />

              {/* Individual Projects */}
              {projects.map((project) => (
                <div
                  key={project.id}
                  className={`flex items-center space-x-3 p-3 rounded-lg border transition-colors ${
                    selectedProjects.includes(project.id)
                      ? "bg-destructive/5 border-destructive/30"
                      : "bg-card hover:bg-muted/50 border-transparent"
                  }`}
                >
                  <Checkbox
                    id={`project-${project.id}`}
                    checked={selectedProjects.includes(project.id)}
                    onCheckedChange={(checked) =>
                      handleSelectProject(project.id, checked as boolean)
                    }
                    disabled={isPending}
                  />
                  <label
                    htmlFor={`project-${project.id}`}
                    className="text-sm cursor-pointer flex-1 flex items-center gap-2"
                  >
                    {project.imageUrl && (
                      <img
                        src={project.imageUrl}
                        alt={project.name}
                        className="size-6 rounded object-cover"
                      />
                    )}
                    <span className="font-medium">{project.name}</span>
                  </label>
                </div>
              ))}
            </div>

            <DottedSeparator className="my-4" />

            {/* Delete Button */}
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <Button
                variant="destructive"
                className="w-full"
                disabled={selectedProjects.length === 0 || isPending}
                onClick={() => setIsOpen(true)}
              >
                {isPending ? (
                  <>
                    <Loader2 className="size-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="size-4 mr-2" />
                    Delete {selectedProjects.length} Project
                    {selectedProjects.length !== 1 ? "s" : ""}
                  </>
                )}
              </Button>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Are you absolutely sure?</DialogTitle>
                  <DialogDescription className="space-y-2 pt-2">
                    <p>
                      This will permanently delete{" "}
                      <span className="font-semibold text-destructive">
                        {selectedProjects.length} project{selectedProjects.length !== 1 ? "s" : ""}
                      </span>{" "}
                      and all associated tasks.
                    </p>
                    <p className="text-sm text-muted-foreground">
                      This action cannot be undone. All tasks within these projects will also be deleted.
                    </p>
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter className="gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsOpen(false)}
                    disabled={isPending}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleBulkDelete}
                    disabled={isPending}
                  >
                    {isPending ? (
                      <>
                        <Loader2 className="size-4 mr-2 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      "Yes, delete permanently"
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </>
        )}
      </CardContent>
    </Card>
  );
};
