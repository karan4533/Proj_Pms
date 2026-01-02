"use client";

import { CreateProjectForm } from "@/features/projects/components/create-project-form";
import { AdminGuard } from "@/components/admin-guard";

const NewProjectPage = () => {
  return (
    <AdminGuard>
      <div className="h-full flex flex-col p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Create New Project</h1>
        <p className="text-muted-foreground">Start a new project to organize your tasks</p>
      </div>
      <div className="max-w-2xl">
        <CreateProjectForm />
      </div>
      </div>
    </AdminGuard>
  );
};

export default NewProjectPage;
