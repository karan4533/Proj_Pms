"use client";

import { useGetRequirements } from "@/features/requirements/api/use-get-requirements";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader, Plus, Calendar, User, FileText } from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";

export default function RequirementsSummaryPage() {
  const { data: requirements, isLoading } = useGetRequirements();

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20';
      case 'REJECTED':
        return 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20';
      default:
        return 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20';
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex flex-col gap-y-4 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Requirements Summary</h1>
            <p className="text-sm text-muted-foreground mt-1">
              View and manage all project requirements
            </p>
          </div>
          <Link href="/add-requirements">
            <Button>
              <Plus className="size-4 mr-2" />
              Add Requirement
            </Button>
          </Link>
        </div>

        {requirements && requirements.length > 0 ? (
          <div className="grid gap-4">
            {requirements.map((req: any) => (
              <Card key={req.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2">{req.tentativeTitle}</CardTitle>
                      <CardDescription className="flex items-center gap-4 flex-wrap">
                        <span className="flex items-center gap-1">
                          <User className="size-3" />
                          {req.customer}
                        </span>
                        {req.projectManagerName && (
                          <span className="flex items-center gap-1">
                            <User className="size-3" />
                            PM: {req.projectManagerName}
                          </span>
                        )}
                        {req.dueDate && (
                          <span className="flex items-center gap-1">
                            <Calendar className="size-3" />
                            Due: {format(new Date(req.dueDate), "MMM dd, yyyy")}
                          </span>
                        )}
                      </CardDescription>
                    </div>
                    <Badge className={getStatusColor(req.status)}>
                      {req.status}
                    </Badge>
                  </div>
                </CardHeader>
                {req.projectDescription && (
                  <CardContent>
                    <div className="flex items-start gap-2">
                      <FileText className="size-4 mt-0.5 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {req.projectDescription}
                      </p>
                    </div>
                    <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
                      {req.sampleInputFiles && req.sampleInputFiles.length > 0 && (
                        <span>{req.sampleInputFiles.length} input file(s)</span>
                      )}
                      {req.expectedOutputFiles && req.expectedOutputFiles.length > 0 && (
                        <span>{req.expectedOutputFiles.length} output file(s)</span>
                      )}
                      <span>Created {format(new Date(req.createdAt), "MMM dd, yyyy")}</span>
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <FileText className="size-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground mb-4">No requirements found</p>
              <Link href="/add-requirements">
                <Button>
                  <Plus className="size-4 mr-2" />
                  Add Your First Requirement
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
