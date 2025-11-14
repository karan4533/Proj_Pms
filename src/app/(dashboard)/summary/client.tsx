"use client";

import { useGetProjects } from "@/features/projects/api/use-get-projects";
import { ProjectAvatar } from "@/features/projects/components/project-avatar";
import { useCreateProjectModal } from "@/features/projects/hooks/use-create-project-modal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusIcon, FolderKanban } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

export const ProjectsClient = () => {
  const { data: projects, isLoading } = useGetProjects({});
  const { open } = useCreateProjectModal();

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const projectList = projects?.documents || [];

  return (
    <div className="h-full flex flex-col p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Projects</h1>
          <p className="text-muted-foreground">
            Manage and organize your projects ({projectList.length} total)
          </p>
        </div>
        <Button onClick={open}>
          <PlusIcon className="mr-2 h-4 w-4" />
          New Project
        </Button>
      </div>

      {projectList.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FolderKanban className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No projects yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Get started by creating your first project
            </p>
            <Button onClick={open}>
              <PlusIcon className="mr-2 h-4 w-4" />
              Create Project
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projectList.map((project) => (
            <Link key={project.id} href={`/tasks?projectId=${project.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardHeader>
                  <div className="flex items-start gap-3">
                    <ProjectAvatar
                      image={project.imageUrl || undefined}
                      name={project.name}
                      className="h-12 w-12"
                    />
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg truncate">{project.name}</CardTitle>
                      <CardDescription className="mt-1">
                        Created {format(new Date(project.createdAt), "MMM d, yyyy")}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {project.postDate && (
                      <div className="text-sm text-muted-foreground">
                        <span className="font-medium">Posted:</span>{" "}
                        {format(new Date(project.postDate), "MMM d, yyyy")}
                      </div>
                    )}
                    {project.tentativeEndDate && (
                      <div className="text-sm text-muted-foreground">
                        <span className="font-medium">Due:</span>{" "}
                        {format(new Date(project.tentativeEndDate), "MMM d, yyyy")}
                      </div>
                    )}
                    {project.assignees && project.assignees.length > 0 && (
                      <div className="text-sm text-muted-foreground">
                        <span className="font-medium">Team:</span> {project.assignees.length} member
                        {project.assignees.length !== 1 ? "s" : ""}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};
