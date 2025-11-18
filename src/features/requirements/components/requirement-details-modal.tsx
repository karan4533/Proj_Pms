"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Calendar, User, FileText, Download, X } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface RequirementDetailsModalProps {
  requirement: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const RequirementDetailsModal = ({
  requirement,
  open,
  onOpenChange,
}: RequirementDetailsModalProps) => {
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [fileType, setFileType] = useState<'input' | 'output' | null>(null);

  if (!requirement) return null;

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

  const handleFileClick = (fileName: string, type: 'input' | 'output') => {
    setSelectedFile(fileName);
    setFileType(type);
  };

  const closeFilePreview = () => {
    setSelectedFile(null);
    setFileType(null);
  };

  const getFileExtension = (fileName: string) => {
    return fileName.split('.').pop()?.toLowerCase() || '';
  };

  const renderFilePreview = () => {
    if (!selectedFile) return null;

    const extension = getFileExtension(selectedFile);
    
    // For demo purposes - showing file info
    // In production, you'd fetch and display actual file content
    return (
      <div className="fixed inset-0 bg-background/95 z-50 flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-3">
            <FileText className="size-5 text-muted-foreground" />
            <div>
              <h3 className="font-semibold">{selectedFile}</h3>
              <p className="text-xs text-muted-foreground">
                {fileType === 'input' ? 'Sample Input File' : 'Expected Output File'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Download className="size-4 mr-2" />
              Download
            </Button>
            <Button variant="ghost" size="sm" onClick={closeFilePreview}>
              <X className="size-4" />
            </Button>
          </div>
        </div>
        
        <div className="flex-1 overflow-auto p-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-muted/30 rounded-lg border p-8 min-h-[400px]">
              <div className="text-center space-y-4">
                <FileText className="size-16 mx-auto text-muted-foreground" />
                <div>
                  <p className="font-medium text-lg">{selectedFile}</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    File Type: {extension.toUpperCase()}
                  </p>
                  <p className="text-sm text-muted-foreground mt-4">
                    File preview will be displayed here
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <DialogTitle className="text-2xl pr-8">{requirement.tentativeTitle}</DialogTitle>
              </div>
              <Badge className={getStatusColor(requirement.status)}>
                {requirement.status}
              </Badge>
            </div>
          </DialogHeader>

          <div className="space-y-6 mt-4">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2 text-sm">
                <User className="size-4 text-muted-foreground" />
                <span className="text-muted-foreground">Customer:</span>
                <span className="font-medium">{requirement.customer}</span>
              </div>
              
              {requirement.projectManagerName && (
                <div className="flex items-center gap-2 text-sm">
                  <User className="size-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Project Manager:</span>
                  <span className="font-medium">{requirement.projectManagerName}</span>
                </div>
              )}
              
              {requirement.dueDate && (
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="size-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Due Date:</span>
                  <span className="font-medium text-orange-600 dark:text-orange-400">
                    {format(new Date(requirement.dueDate), "MMMM dd, yyyy")}
                  </span>
                </div>
              )}
              
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="size-4 text-muted-foreground" />
                <span className="text-muted-foreground">Created:</span>
                <span className="font-medium">{format(new Date(requirement.createdAt), "MMMM dd, yyyy")}</span>
              </div>
            </div>

            <Separator />

            {/* Project Description */}
            {requirement.projectDescription && (
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <FileText className="size-4" />
                  Project Description
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {requirement.projectDescription}
                </p>
              </div>
            )}

            {/* Sample Input Files */}
            {requirement.sampleInputFiles && requirement.sampleInputFiles.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <FileText className="size-4" />
                  Sample Input Files ({requirement.sampleInputFiles.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {requirement.sampleInputFiles.map((file: string, index: number) => (
                    <button
                      key={index}
                      onClick={() => handleFileClick(file, 'input')}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors text-left",
                        selectedFile === file && fileType === 'input' && "ring-2 ring-primary"
                      )}
                    >
                      <FileText className="size-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{file}</p>
                        <p className="text-xs text-muted-foreground">Click to preview</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Expected Output Files */}
            {requirement.expectedOutputFiles && requirement.expectedOutputFiles.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <FileText className="size-4" />
                  Expected Output Files ({requirement.expectedOutputFiles.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {requirement.expectedOutputFiles.map((file: string, index: number) => (
                    <button
                      key={index}
                      onClick={() => handleFileClick(file, 'output')}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors text-left",
                        selectedFile === file && fileType === 'output' && "ring-2 ring-primary"
                      )}
                    >
                      <FileText className="size-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{file}</p>
                        <p className="text-xs text-muted-foreground">Click to preview</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {renderFilePreview()}
    </>
  );
};
