"use client";

import { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Calendar, User, FileText, Download, X, ChevronLeft, ChevronRight } from "lucide-react";
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
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [fileType, setFileType] = useState<'input' | 'output' | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const ROWS_PER_PAGE = 50;

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

  const handleFileClick = (file: any, type: 'input' | 'output') => {
    setSelectedFile(file);
    setFileType(type);
  };

  const closeFilePreview = () => {
    setSelectedFile(null);
    setFileType(null);
    setCurrentPage(1);
  };

  const handleDownload = () => {
    if (!selectedFile) return;

    const fileName = typeof selectedFile === 'string' ? selectedFile : selectedFile.name;
    const fileContent = typeof selectedFile === 'object' ? selectedFile.content : '';

    if (!fileContent) return;

    // Create a blob from the file content
    let blob: Blob;
    
    // Check if it's base64 data (starts with data:)
    if (fileContent.startsWith('data:')) {
      // Extract base64 data
      const base64Data = fileContent.split(',')[1];
      const mimeType = fileContent.split(',')[0].split(':')[1].split(';')[0];
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      blob = new Blob([byteArray], { type: mimeType });
    } else {
      // Plain text content
      blob = new Blob([fileContent], { type: 'text/plain' });
    }

    // Create download link
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const getFileExtension = (file: any) => {
    const fileName = typeof file === 'string' ? file : file?.name || '';
    return fileName.split('.').pop()?.toLowerCase() || '';
  };

  const parseCSV = (content: string) => {
    const lines = content.split('\n').filter(line => line.trim());
    return lines.map(line => {
      // Simple CSV parsing - handles basic cases
      const values = [];
      let current = '';
      let inQuotes = false;
      
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          values.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      values.push(current.trim());
      return values;
    });
  };

  const renderFileContent = (content: string, extension: string) => {
    if (!content) return null;

    // Handle CSV/Excel files as tables
    if (['csv', 'xls', 'xlsx'].includes(extension)) {
      const rows = parseCSV(content);
      if (rows.length === 0) return <p className="text-muted-foreground">Empty file</p>;

      const headers = rows[0];
      const dataRows = rows.slice(1);
      
      // Pagination for large tables
      const totalPages = Math.ceil(dataRows.length / ROWS_PER_PAGE);
      const startIndex = (currentPage - 1) * ROWS_PER_PAGE;
      const endIndex = startIndex + ROWS_PER_PAGE;
      const paginatedRows = dataRows.slice(startIndex, endIndex);

      return (
        <div className="space-y-4">
          <div className="rounded-lg border border-border overflow-auto max-h-[500px]">
            <table className="w-full border-collapse text-sm">
              <thead className="sticky top-0 bg-muted z-10">
                <tr>
                  {headers.map((header, i) => (
                    <th key={i} className="border-b border-border px-3 py-2 text-left font-semibold whitespace-nowrap">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-background">
                {paginatedRows.map((row, rowIndex) => (
                  <tr key={rowIndex} className="hover:bg-muted/50 border-b border-border last:border-b-0">
                    {row.map((cell, cellIndex) => (
                      <td key={cellIndex} className="px-3 py-2 whitespace-nowrap">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-2">
              <div className="text-sm text-muted-foreground">
                Showing {startIndex + 1} to {Math.min(endIndex, dataRows.length)} of {dataRows.length} rows
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="size-4 mr-1" />
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight className="size-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </div>
      );
    }

    // Handle JSON with formatting
    if (extension === 'json') {
      try {
        const parsed = JSON.parse(content);
        return (
          <pre className="whitespace-pre-wrap break-words text-sm overflow-auto">
            {JSON.stringify(parsed, null, 2)}
          </pre>
        );
      } catch (e) {
        return <pre className="whitespace-pre-wrap break-words text-sm overflow-auto">{content}</pre>;
      }
    }

    // Handle images
    if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(extension)) {
      if (content.startsWith('data:image')) {
        return (
          <div className="flex justify-center p-4">
            <img src={content} alt="Preview" className="max-w-full h-auto rounded-lg border" />
          </div>
        );
      }
    }

    // Default: plain text with monospace font
    return <pre className="whitespace-pre-wrap break-words text-sm overflow-auto">{content}</pre>;
  };

  const renderFilePreview = () => {
    if (!selectedFile) return null;

    const fileName = typeof selectedFile === 'string' ? selectedFile : selectedFile.name;
    const fileContent = typeof selectedFile === 'object' ? selectedFile.content : '';
    const extension = getFileExtension(selectedFile);
    
    const getFileIcon = () => {
      const ext = extension.toLowerCase();
      if (['pdf'].includes(ext)) return '📄';
      if (['doc', 'docx'].includes(ext)) return '📝';
      if (['xls', 'xlsx', 'csv'].includes(ext)) return '📊';
      if (['jpg', 'jpeg', 'png', 'gif', 'svg'].includes(ext)) return '🖼️';
      if (['txt', 'md'].includes(ext)) return '📃';
      if (['zip', 'rar', '7z'].includes(ext)) return '📦';
      return '📁';
    };

    return (
      <div className="fixed inset-0 bg-background/98 backdrop-blur-sm z-[100] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b bg-background/80">
          <div className="flex items-center gap-3">
            <div className="text-3xl">{getFileIcon()}</div>
            <div>
              <h3 className="font-semibold text-lg">{fileName}</h3>
              <p className="text-xs text-muted-foreground">
                {fileType === 'input' ? 'Sample Input File' : 'Expected Output File'} • {extension.toUpperCase()}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleDownload}
              disabled={!fileContent}
            >
              <Download className="size-4 mr-2" />
              Download
            </Button>
            <Button variant="ghost" size="sm" onClick={closeFilePreview}>
              <X className="size-4" />
            </Button>
          </div>
        </div>
        
        <div className="flex-1 overflow-auto p-6 bg-muted/20">
          <div className="max-w-5xl mx-auto">
            {fileContent ? (
              <div className="bg-background rounded-xl border p-6 min-h-[500px]">
                <div className="mb-4 flex items-center justify-between">
                  <h4 className="font-semibold flex items-center gap-2">
                    <FileText className="size-4" />
                    File Content
                  </h4>
                  <div className="flex items-center gap-3">
                    {!['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(extension) && (
                      <span className="text-xs text-muted-foreground">
                        {fileContent.length} characters
                      </span>
                    )}
                    {['csv', 'xls', 'xlsx'].includes(extension) && (
                      <span className="text-xs bg-blue-500/10 text-blue-700 dark:text-blue-400 px-2 py-1 rounded">
                        Table View
                      </span>
                    )}
                  </div>
                </div>
                <div className="rounded-lg p-4 overflow-auto" style={{ maxHeight: 'calc(100vh - 300px)' }}>
                  {renderFileContent(fileContent, extension)}
                </div>
              </div>
            ) : (
              <div className="bg-background rounded-xl border-2 border-dashed border-border p-12 min-h-[500px] flex items-center justify-center">
                <div className="text-center space-y-6 max-w-md">
                  <div className="text-6xl mb-4">{getFileIcon()}</div>
                  <div className="space-y-3">
                    <h4 className="font-semibold text-xl">{fileName}</h4>
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-muted rounded-full text-sm">
                      <span className="font-medium">Type:</span>
                      <span className="text-muted-foreground">{extension.toUpperCase()}</span>
                    </div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-muted rounded-full text-sm ml-2">
                      <span className="font-medium">Category:</span>
                      <span className="text-muted-foreground">
                        {fileType === 'input' ? 'Sample Input' : 'Expected Output'}
                      </span>
                    </div>
                  </div>
                  <div className="pt-6 space-y-2 text-sm text-muted-foreground">
                    <p className="flex items-center gap-2 justify-center">
                      <FileText className="size-4" />
                      File reference stored
                    </p>
                    <p className="text-xs opacity-75">
                      No content available for this file
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {/* File Details Card */}
            <div className="mt-6 bg-background rounded-lg border p-6">
              <h4 className="font-semibold mb-4 flex items-center gap-2">
                <FileText className="size-4" />
                File Information
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">File Name</p>
                  <p className="font-medium mt-1">{fileName}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">File Type</p>
                  <p className="font-medium mt-1">{extension.toUpperCase() || 'Unknown'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Category</p>
                  <p className="font-medium mt-1">
                    {fileType === 'input' ? 'Sample Input File' : 'Expected Output File'}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Status</p>
                  <p className="font-medium mt-1 text-green-600 dark:text-green-400">
                    {fileContent ? 'Content Available' : 'Referenced'}
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
                  {requirement.sampleInputFiles.map((file: any, index: number) => {
                    const fileName = typeof file === 'string' ? file : file.name;
                    const hasContent = typeof file === 'object' && file.content;
                    return (
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
                          <p className="text-sm font-medium truncate">{fileName}</p>
                          <p className="text-xs text-muted-foreground">
                            {hasContent ? 'Click to preview content' : 'Click to preview'}
                          </p>
                        </div>
                      </button>
                    );
                  })}
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
                  {requirement.expectedOutputFiles.map((file: any, index: number) => {
                    const fileName = typeof file === 'string' ? file : file.name;
                    const hasContent = typeof file === 'object' && file.content;
                    return (
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
                          <p className="text-sm font-medium truncate">{fileName}</p>
                          <p className="text-xs text-muted-foreground">
                            {hasContent ? 'Click to preview content' : 'Click to preview'}
                          </p>
                        </div>
                      </button>
                    );
                  })}
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
