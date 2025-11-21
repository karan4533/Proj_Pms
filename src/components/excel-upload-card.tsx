"use client";

import React, { useState, useRef } from "react";
import { Upload, FileSpreadsheet, X, CheckCircle, AlertCircle, LoaderIcon, Download } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { DottedSeparator } from "@/components/dotted-separator";
import { cn } from "@/lib/utils";

import { useGetProjects } from "@/features/projects/api/use-get-projects";
import { useGetMembers } from "@/features/members/api/use-get-members";
import { useUploadExcelTasks } from "@/features/tasks/api/use-upload-excel-tasks";

export const ExcelUploadCard = () => {
  const [file, setFile] = useState<File | null>(null);
  const [projectId, setProjectId] = useState<string>("");
  const [assigneeIds, setAssigneeIds] = useState<string[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: projects } = useGetProjects({});
  const { data: members } = useGetMembers({});
  const { mutate: uploadExcel, isPending } = useUploadExcelTasks();

  const handleAddAssignee = (userId: string) => {
    if (!assigneeIds.includes(userId)) {
      setAssigneeIds([...assigneeIds, userId]);
    }
  };

  const handleRemoveAssignee = (userId: string) => {
    setAssigneeIds(assigneeIds.filter((id) => id !== userId));
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && isValidCsvFile(droppedFile)) {
      setFile(droppedFile);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && isValidCsvFile(selectedFile)) {
      setFile(selectedFile);
    }
  };

  const isValidCsvFile = (file: File): boolean => {
    const validTypes = ['text/csv'];
    const isValidType = validTypes.includes(file.type) || file.name.match(/\.csv$/i) !== null;
    
    const maxSizeInBytes = 100 * 1024 * 1024; // 100MB
    const isValidSize = file.size <= maxSizeInBytes;
    
    if (!isValidType) {
      alert('Please upload a CSV file only.');
      return false;
    }
    
    if (!isValidSize) {
      alert(`File size too large. Please upload a file smaller than 100MB. Current size: ${formatFileSize(file.size)}`);
      return false;
    }
    
    return true;
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleDownloadTemplate = () => {
    // Create Excel file with yellow header row using xlsx library approach
    // For now, create CSV and note that yellow formatting needs to be done in Excel
    // To add actual yellow color, you'll need to install xlsx library: npm install xlsx
    
    const headers = [
      'Summary',
      'Summary id',
      'Issue id',
      'Issue Type',
      'Status',
      'Project name',
      'Priority',
      'Resolution',
      'Assignee',
      'Reporter',
      'Creator',
      'Created',
      'Updated',
      'Resolved',
      'Due date',
      'Labels'
    ];

    const emptyRow1 = ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''];
    const emptyRow2 = ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''];
    
    const instructionRow = [
      '(The titles should not be modified under any circumstances.)',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      ''
    ];

    // Create CSV content with BOM for Excel compatibility
    const csvContent = '\uFEFF' + [
      headers.join(','),
      emptyRow1.join(','),
      emptyRow2.join(','),
      instructionRow.join(',')
    ].join('\n');

    // Create and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', 'task_import_template.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Note: To add yellow background color to headers, you need to:
    // 1. Install xlsx library: npm install xlsx
    // 2. Generate .xlsx file instead of .csv
    // CSV format doesn't support cell formatting/colors
  };

  const handleUpload = () => {
    if (!file || !projectId) {
      return;
    }

    const selectedProject = projects?.documents?.find(p => p.id === projectId);
    const workspaceId = selectedProject?.workspaceId; // Use project's workspace ID (can be null/undefined)

    uploadExcel({
      file,
      workspaceId,
      projectId,
    }, {
      onSuccess: () => {
        setFile(null);
        setProjectId("");
        setAssigneeIds([]);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      },
    });
  };

  const removeFile = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const selectedProject = projects?.documents?.find(p => p.id === projectId);

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5" />
              Bulk Task Import
            </CardTitle>
            <CardDescription>
              Upload a CSV file to create multiple tasks at once. Select a project and optionally choose default assignees.
              <br />
              <Badge variant="outline" className="mt-2">CSV format only - Up to 100MB</Badge>
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadTemplate}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Download Template
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Choose Project Dropdown */}
        <div className="space-y-2">
          <Label htmlFor="project">Choose Project *</Label>
          <Select value={projectId} onValueChange={setProjectId}>
            <SelectTrigger id="project">
              <SelectValue placeholder="Select a project" />
            </SelectTrigger>
            <SelectContent>
              {projects?.documents?.map((project) => (
                <SelectItem key={project.id} value={project.id}>
                  {project.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {!projectId && (
            <p className="text-sm text-muted-foreground">
              Please select a project before uploading
            </p>
          )}
        </div>

        {/* Choose Project Assignees Dropdown */}
        <div className="space-y-2">
          <Label htmlFor="assignees">Choose Project Assignees (Optional)</Label>
          <Select onValueChange={handleAddAssignee}>
            <SelectTrigger id="assignees">
              <SelectValue placeholder="Select assignees" />
            </SelectTrigger>
            <SelectContent>
              {members?.documents
                ?.filter((member: any) => !assigneeIds.includes(member.userId))
                ?.map((member: any) => (
                  <SelectItem key={member.userId} value={member.userId}>
                    {member.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
          {assigneeIds.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {assigneeIds.map((userId) => {
                const member = members?.documents?.find((m: any) => m.userId === userId);
                return (
                  <Badge key={userId} variant="secondary" className="py-1 px-2">
                    {member?.name}
                    <button
                      onClick={() => handleRemoveAssignee(userId)}
                      className="ml-2 hover:text-destructive transition"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                );
              })}
            </div>
          )}
          <p className="text-sm text-muted-foreground">
            Select employees who will be default assignees for imported tasks
          </p>
        </div>

        <DottedSeparator />

        {/* Import File Field */}
        <div className="space-y-2">
          <Label htmlFor="file">Import File *</Label>
          <div
            className={cn(
              "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
              dragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25",
              !projectId && "opacity-50 cursor-not-allowed"
            )}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              className="hidden"
              id="file-upload"
              disabled={!projectId}
            />
            
            {!file ? (
              <div className="flex flex-col items-center gap-4">
                <div className="rounded-full bg-primary/10 p-4">
                  <Upload className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">
                    Drag and drop your CSV file here
                  </p>
                  <p className="text-xs text-muted-foreground mb-4">
                    or click to browse
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={!projectId}
                  >
                    Choose File
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Maximum file size: 100MB
                </p>
              </div>
            ) : (
              <div className="flex items-center justify-between p-4 bg-secondary rounded-lg">
                <div className="flex items-center gap-3">
                  <FileSpreadsheet className="h-8 w-8 text-primary" />
                  <div className="text-left">
                    <p className="text-sm font-medium">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={removeFile}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>

        <DottedSeparator />

        {/* Submit Button */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {file && projectId ? (
              <span className="flex items-center gap-2 text-green-600">
                <CheckCircle className="h-4 w-4" />
                Ready to import
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                Please select project and file
              </span>
            )}
          </p>
          <Button
            onClick={handleUpload}
            disabled={isPending || !file || !projectId}
            size="lg"
          >
            {isPending ? (
              <>
                <LoaderIcon className="h-4 w-4 mr-2 animate-spin" />
                Importing...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Submit Import
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
