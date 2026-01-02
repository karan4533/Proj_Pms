"use client";

import { Bug, Calendar, User, FileText, Download, Edit, X, Upload, Eye, Trash2, RotateCcw, Send, MessageSquare, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import React, { useState, useRef } from "react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DottedSeparator } from "@/components/dotted-separator";
import { cn } from "@/lib/utils";
import { BugStatus, BugPriority } from "../types";
import { useUpdateBug } from "../api/use-update-bug";
import { useGetBugComments, useCreateComment } from "../api/use-bug-comments";
import { useCurrent } from "@/features/auth/api/use-current";

interface BugDetailModalProps {
  bug: any;
  isOpen: boolean;
  onClose: () => void;
  isAssignee: boolean;
  isReporter: boolean;
}

export const BugDetailModal = ({
  bug,
  isOpen,
  onClose,
  isAssignee,
  isReporter,
}: BugDetailModalProps) => {
  const { mutate: updateBug } = useUpdateBug();
  const { data: currentUser } = useCurrent();
  const { data: comments, isLoading: commentsLoading } = useGetBugComments(bug.bugId);
  const { mutate: createComment } = useCreateComment();
  
  const [isReplacing, setIsReplacing] = useState(false);
  const [newFile, setNewFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Output file state (for assignee)
  const [outputFile, setOutputFile] = useState<File | null>(null);
  const [outputFilePreview, setOutputFilePreview] = useState<string | null>(null);
  const outputFileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingOutput, setIsUploadingOutput] = useState(false);
  
  // Comment state
  const [commentText, setCommentText] = useState("");
  const [commentFile, setCommentFile] = useState<File | null>(null);
  const commentFileInputRef = useRef<HTMLInputElement>(null);

  // Reporter can only edit files when status is Open
  const canReporterEditFiles = isReporter && bug.status === BugStatus.OPEN;
  const canReopen = isReporter && bug.status === BugStatus.CLOSED;

  const getPriorityColor = (priority: string | null) => {
    switch (priority) {
      case BugPriority.CRITICAL:
        return "bg-red-500";
      case BugPriority.HIGH:
        return "bg-orange-500";
      case BugPriority.MEDIUM:
        return "bg-yellow-500";
      case BugPriority.LOW:
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  const getPriorityLabel = (priority: string | null) => {
    switch (priority) {
      case BugPriority.CRITICAL:
        return "Critical";
      case BugPriority.HIGH:
        return "High";
      case BugPriority.MEDIUM:
        return "Medium";
      case BugPriority.LOW:
        return "Low";
      default:
        return "Not Set";
    }
  };

  const handleStatusChange = (newStatus: string) => {
    if (!isAssignee) {
      return;
    }
    updateBug(
      {
        param: { bugId: bug.bugId },
        json: { bugId: bug.bugId, status: newStatus },
      },
      {
        onSuccess: () => {
          // Modal will show updated status automatically due to query invalidation
        },
      }
    );
  };

  const handleFileView = () => {
    if (!bug.fileUrl) return;
    
    try {
      if (bug.fileUrl.startsWith('data:')) {
        // For base64 data, open directly in new tab
        const newWindow = window.open();
        if (newWindow) {
          newWindow.document.open();
          
          // Check if it's an image
          if (bug.fileUrl.startsWith('data:image/')) {
            newWindow.document.write(`
              <!DOCTYPE html>
              <html>
                <head>
                  <title>View Attachment - ${bug.bugId}</title>
                  <meta charset="UTF-8">
                  <style>
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    body { 
                      display: flex; 
                      justify-content: center; 
                      align-items: center; 
                      min-height: 100vh; 
                      background: #1a1a1a; 
                      padding: 20px;
                    }
                    img { 
                      max-width: 100%; 
                      max-height: 100vh; 
                      object-fit: contain; 
                      box-shadow: 0 4px 6px rgba(0,0,0,0.3);
                    }
                  </style>
                </head>
                <body>
                  <img src="${bug.fileUrl}" alt="Bug Attachment" onload="console.log('Image loaded')" onerror="console.error('Image failed to load')">
                </body>
              </html>
            `);
          } else if (bug.fileUrl.startsWith('data:application/pdf')) {
            // For PDFs, use embed tag
            newWindow.document.write(`
              <!DOCTYPE html>
              <html>
                <head>
                  <title>View PDF - ${bug.bugId}</title>
                  <meta charset="UTF-8">
                  <style>
                    * { margin: 0; padding: 0; }
                    body { height: 100vh; }
                    embed { width: 100%; height: 100%; }
                  </style>
                </head>
                <body>
                  <embed src="${bug.fileUrl}" type="application/pdf" />
                </body>
              </html>
            `);
          } else {
            // For other file types
            newWindow.document.write(`
              <!DOCTYPE html>
              <html>
                <head>
                  <title>View File - ${bug.bugId}</title>
                  <meta charset="UTF-8">
                  <style>
                    body { 
                      font-family: system-ui, -apple-system, sans-serif; 
                      padding: 20px; 
                      max-width: 1200px; 
                      margin: 0 auto;
                    }
                    .header { 
                      background: #f5f5f5; 
                      padding: 15px; 
                      border-radius: 8px; 
                      margin-bottom: 20px;
                    }
                    iframe { 
                      width: 100%; 
                      height: 80vh; 
                      border: 1px solid #ddd; 
                      border-radius: 4px;
                    }
                  </style>
                </head>
                <body>
                  <div class="header">
                    <h2>Bug ${bug.bugId} - File Attachment</h2>
                    <p>If the file doesn't display properly, please use the Download button.</p>
                  </div>
                  <iframe src="${bug.fileUrl}"></iframe>
                </body>
              </html>
            `);
          }
          
          newWindow.document.close();
        }
      } else {
        // If it's a regular URL, open in new tab
        window.open(bug.fileUrl, '_blank', 'noopener,noreferrer');
      }
    } catch (error) {
      console.error('Error viewing file:', error);
      alert('Unable to open file viewer. Please try the Download option instead.');
    }
  };

  const handleFileDownload = () => {
    if (!bug.fileUrl) return;
    
    try {
      if (bug.fileUrl.startsWith('data:')) {
        // For base64, create a download link
        const mimeMatch = bug.fileUrl.match(/data:([^;]+);/);
        const mimeType = mimeMatch ? mimeMatch[1] : 'application/octet-stream';
        
        // Map mime types to extensions
        const extensionMap: { [key: string]: string } = {
          'image/png': 'png',
          'image/jpeg': 'jpg',
          'image/jpg': 'jpg',
          'image/gif': 'gif',
          'image/webp': 'webp',
          'image/svg+xml': 'svg',
          'application/pdf': 'pdf',
          'text/plain': 'txt',
          'text/html': 'html',
          'application/msword': 'doc',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
          'application/vnd.ms-excel': 'xls',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
        };
        
        const extension = extensionMap[mimeType] || 'file';
        const filename = `${bug.bugId}-attachment.${extension}`;
        
        // Create temporary anchor and trigger download
        const downloadLink = document.createElement('a');
        downloadLink.href = bug.fileUrl;
        downloadLink.download = filename;
        downloadLink.style.display = 'none';
        
        document.body.appendChild(downloadLink);
        downloadLink.click();
        
        // Clean up
        setTimeout(() => {
          document.body.removeChild(downloadLink);
        }, 100);
        
        console.log(`Downloaded: ${filename}`);
      } else {
        // For regular URLs
        const downloadLink = document.createElement('a');
        downloadLink.href = bug.fileUrl;
        downloadLink.download = bug.fileUrl.split('/').pop() || 'attachment';
        downloadLink.target = '_blank';
        downloadLink.rel = 'noopener noreferrer';
        downloadLink.style.display = 'none';
        
        document.body.appendChild(downloadLink);
        downloadLink.click();
        
        setTimeout(() => {
          document.body.removeChild(downloadLink);
        }, 100);
      }
    } catch (error) {
      console.error('Error downloading file:', error);
      alert('Unable to download file. Please try again or contact support.');
    }
  };

  const handleReplaceClick = () => {
    if (!canReporterEditFiles) return;
    setIsReplacing(true);
  };

  // Output file view/download handlers
  const handleOutputFileView = () => {
    if (!bug.outputFileUrl) return;
    
    try {
      if (bug.outputFileUrl.startsWith('data:')) {
        const newWindow = window.open();
        if (newWindow) {
          newWindow.document.open();
          
          if (bug.outputFileUrl.startsWith('data:image/')) {
            newWindow.document.write(`
              <!DOCTYPE html>
              <html>
                <head>
                  <title>Output File - ${bug.bugId}</title>
                  <meta charset="UTF-8">
                  <style>
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    body { 
                      display: flex; 
                      justify-content: center; 
                      align-items: center; 
                      min-height: 100vh; 
                      background: #1a1a1a; 
                      padding: 20px;
                    }
                    img { 
                      max-width: 100%; 
                      max-height: 100vh; 
                      object-fit: contain; 
                      box-shadow: 0 4px 6px rgba(0,0,0,0.3);
                    }
                  </style>
                </head>
                <body>
                  <img src="${bug.outputFileUrl}" alt="Output File">
                </body>
              </html>
            `);
          } else if (bug.outputFileUrl.startsWith('data:application/pdf')) {
            newWindow.document.write(`
              <!DOCTYPE html>
              <html>
                <head>
                  <title>Output PDF - ${bug.bugId}</title>
                  <meta charset="UTF-8">
                  <style>
                    * { margin: 0; padding: 0; }
                    body { height: 100vh; }
                    embed { width: 100%; height: 100%; }
                  </style>
                </head>
                <body>
                  <embed src="${bug.outputFileUrl}" type="application/pdf" />
                </body>
              </html>
            `);
          } else {
            newWindow.document.write(`
              <!DOCTYPE html>
              <html>
                <head>
                  <title>Output File - ${bug.bugId}</title>
                  <meta charset="UTF-8">
                  <style>
                    body { 
                      font-family: system-ui, -apple-system, sans-serif; 
                      padding: 20px; 
                      max-width: 1200px; 
                      margin: 0 auto;
                    }
                    iframe { 
                      width: 100%; 
                      height: 80vh; 
                      border: 1px solid #ddd; 
                      border-radius: 4px;
                    }
                  </style>
                </head>
                <body>
                  <h2>Output File from ${bug.bugId}</h2>
                  <iframe src="${bug.outputFileUrl}"></iframe>
                </body>
              </html>
            `);
          }
          newWindow.document.close();
        }
      } else {
        window.open(bug.outputFileUrl, '_blank', 'noopener,noreferrer');
      }
    } catch (error) {
      console.error('Error viewing output file:', error);
      alert('Unable to open file viewer. Please try the Download option instead.');
    }
  };

  const handleOutputFileDownload = () => {
    if (!bug.outputFileUrl) return;
    
    try {
      if (bug.outputFileUrl.startsWith('data:')) {
        const mimeMatch = bug.outputFileUrl.match(/data:([^;]+);/);
        const mimeType = mimeMatch ? mimeMatch[1] : 'application/octet-stream';
        
        const extensionMap: { [key: string]: string } = {
          'image/png': 'png',
          'image/jpeg': 'jpg',
          'image/jpg': 'jpg',
          'image/gif': 'gif',
          'image/webp': 'webp',
          'image/svg+xml': 'svg',
          'application/pdf': 'pdf',
          'text/plain': 'txt',
          'text/html': 'html',
          'application/msword': 'doc',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
          'application/vnd.ms-excel': 'xls',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
        };
        
        const extension = extensionMap[mimeType] || 'file';
        const filename = `${bug.bugId}-output.${extension}`;
        
        const downloadLink = document.createElement('a');
        downloadLink.href = bug.outputFileUrl;
        downloadLink.download = filename;
        downloadLink.style.display = 'none';
        
        document.body.appendChild(downloadLink);
        downloadLink.click();
        
        setTimeout(() => {
          document.body.removeChild(downloadLink);
        }, 100);
      } else {
        const downloadLink = document.createElement('a');
        downloadLink.href = bug.outputFileUrl;
        downloadLink.download = bug.outputFileUrl.split('/').pop() || 'output';
        downloadLink.target = '_blank';
        downloadLink.rel = 'noopener noreferrer';
        downloadLink.style.display = 'none';
        
        document.body.appendChild(downloadLink);
        downloadLink.click();
        
        setTimeout(() => {
          document.body.removeChild(downloadLink);
        }, 100);
      }
    } catch (error) {
      console.error('Error downloading output file:', error);
      alert('Unable to download file. Please try again.');
    }
  };

  // Comment file view handler
  const handleCommentFileView = (fileUrl: string | null, commentId: string) => {
    if (!fileUrl) {
      alert('No file attached to this comment.');
      return;
    }
    
    console.log('Viewing comment file:', { 
      fileUrlStart: fileUrl.substring(0, 50), 
      isDataUrl: fileUrl.startsWith('data:'),
      commentId 
    });
    
    try {
      // Only handle base64 data URLs
      if (!fileUrl.startsWith('data:')) {
        alert('Invalid file format. The file may not have been properly uploaded. Please try uploading again.');
        return;
      }
      
      if (fileUrl.startsWith('data:')) {
        const newWindow = window.open();
        if (newWindow) {
          newWindow.document.open();
          
          // Common download button HTML
          const downloadButtonHTML = `
            <div style="position: fixed; top: 20px; right: 20px; z-index: 1000;">
              <button onclick="downloadFile()" style="
                background: #3b82f6;
                color: white;
                border: none;
                padding: 10px 20px;
                border-radius: 6px;
                font-size: 14px;
                font-weight: 500;
                cursor: pointer;
                box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                display: flex;
                align-items: center;
                gap: 8px;
              " onmouseover="this.style.background='#2563eb'" onmouseout="this.style.background='#3b82f6'">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="7 10 12 15 17 10"></polyline>
                  <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
                Download
              </button>
            </div>
          `;
          
          const downloadScript = `
            <script>
              function downloadFile() {
                const mimeMatch = '${fileUrl}'.match(/data:([^;]+);/);
                const mimeType = mimeMatch ? mimeMatch[1] : 'application/octet-stream';
                const extensionMap = {
                  'image/png': 'png',
                  'image/jpeg': 'jpg',
                  'image/jpg': 'jpg',
                  'image/gif': 'gif',
                  'image/webp': 'webp',
                  'image/svg+xml': 'svg',
                  'application/pdf': 'pdf',
                  'text/plain': 'txt',
                  'text/html': 'html',
                  'application/msword': 'doc',
                  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
                  'application/vnd.ms-excel': 'xls',
                  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
                };
                const extension = extensionMap[mimeType] || 'file';
                const filename = 'comment-attachment-${commentId.substring(0, 8)}.' + extension;
                
                const downloadLink = document.createElement('a');
                downloadLink.href = '${fileUrl}';
                downloadLink.download = filename;
                downloadLink.click();
              }
            </script>
          `;
          
          if (fileUrl.startsWith('data:image/')) {
            newWindow.document.write(`
              <!DOCTYPE html>
              <html>
                <head>
                  <title>Comment Attachment</title>
                  <meta charset="UTF-8">
                  <style>
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    body { 
                      display: flex; 
                      justify-content: center; 
                      align-items: center; 
                      min-height: 100vh; 
                      background: #1a1a1a; 
                      padding: 20px;
                    }
                    img { 
                      max-width: 100%; 
                      max-height: 100vh; 
                      object-fit: contain; 
                      box-shadow: 0 4px 6px rgba(0,0,0,0.3);
                    }
                  </style>
                </head>
                <body>
                  ${downloadButtonHTML}
                  <img src="${fileUrl}" alt="Comment Attachment">
                  ${downloadScript}
                </body>
              </html>
            `);
          } else if (fileUrl.startsWith('data:application/pdf')) {
            newWindow.document.write(`
              <!DOCTYPE html>
              <html>
                <head>
                  <title>Comment PDF</title>
                  <meta charset="UTF-8">
                  <style>
                    * { margin: 0; padding: 0; }
                    body { height: 100vh; }
                    embed { width: 100%; height: 100%; }
                  </style>
                </head>
                <body>
                  ${downloadButtonHTML}
                  <embed src="${fileUrl}" type="application/pdf" />
                  ${downloadScript}
                </body>
              </html>
            `);
          } else {
            newWindow.document.write(`
              <!DOCTYPE html>
              <html>
                <head>
                  <title>Comment Attachment</title>
                  <meta charset="UTF-8">
                  <style>
                    body { 
                      font-family: system-ui, -apple-system, sans-serif; 
                      padding: 20px; 
                    }
                    iframe { 
                      width: 100%; 
                      height: 80vh; 
                      border: 1px solid #ddd;
                    }
                  </style>
                </head>
                <body>
                  ${downloadButtonHTML}
                  <iframe src="${fileUrl}"></iframe>
                  ${downloadScript}
                </body>
              </html>
            `);
          }
          newWindow.document.close();
        }
      } else {
        window.open(fileUrl, '_blank', 'noopener,noreferrer');
      }
    } catch (error) {
      console.error('Error viewing comment file:', error);
      alert('Unable to open file viewer.');
    }
  };

  // Comment file download handler
  const handleCommentFileDownload = (fileUrl: string, commentId: string) => {
    if (!fileUrl) return;
    
    console.log('Downloading comment file:', { fileUrl: fileUrl.substring(0, 50), commentId });
    
    try {
      if (fileUrl.startsWith('data:')) {
        const mimeMatch = fileUrl.match(/data:([^;]+);/);
        const mimeType = mimeMatch ? mimeMatch[1] : 'application/octet-stream';
        
        const extensionMap: { [key: string]: string } = {
          'image/png': 'png',
          'image/jpeg': 'jpg',
          'image/jpg': 'jpg',
          'image/gif': 'gif',
          'image/webp': 'webp',
          'image/svg+xml': 'svg',
          'application/pdf': 'pdf',
          'text/plain': 'txt',
          'text/html': 'html',
          'application/msword': 'doc',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
          'application/vnd.ms-excel': 'xls',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
        };
        
        const extension = extensionMap[mimeType] || 'file';
        const filename = `${bug.bugId}-comment-${commentId.substring(0, 8)}.${extension}`;
        
        const downloadLink = document.createElement('a');
        downloadLink.href = fileUrl;
        downloadLink.download = filename;
        downloadLink.style.display = 'none';
        
        document.body.appendChild(downloadLink);
        downloadLink.click();
        
        setTimeout(() => {
          document.body.removeChild(downloadLink);
        }, 100);
      } else {
        // Fallback for non-base64 URLs
        alert('File URL is not in the expected format. The file may not have been properly uploaded.');
      }
    } catch (error) {
      console.error('Error downloading comment file:', error);
      alert('Unable to download file.');
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setNewFile(file);

    // Create preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setFilePreview(null);
    }
  };

  const handleFileReplace = () => {
    if (!newFile || !isReporter) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      
      updateBug(
        {
          param: { bugId: bug.bugId },
          json: { 
            bugId: bug.bugId,
            fileUrl: base64String
          },
        },
        {
          onSuccess: () => {
            setIsReplacing(false);
            setNewFile(null);
            setFilePreview(null);
          },
        }
      );
    };
    reader.readAsDataURL(newFile);
  };

  const handleCancelReplace = () => {
    setIsReplacing(false);
    setNewFile(null);
    setFilePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveFile = () => {
    if (!canReporterEditFiles) return;
    
    if (confirm('Are you sure you want to remove the attached file? This action cannot be undone.')) {
      updateBug(
        {
          param: { bugId: bug.bugId },
          json: { 
            bugId: bug.bugId,
            fileUrl: ''
          },
        },
        {
          onSuccess: () => {
            // File will be removed from display via query invalidation
          },
        }
      );
    }
  };

  // Reopen bug handler
  const handleReopenBug = () => {
    if (!canReopen) return;
    
    if (confirm(`Are you sure you want to reopen ${bug.bugId}? The bug will be moved back to 'Open' status.`)) {
      updateBug(
        {
          param: { bugId: bug.bugId },
          json: { bugId: bug.bugId, status: BugStatus.OPEN },
        },
        {
          onSuccess: () => {
            // Add a system comment about reopening
            createComment({
              bugId: bug.bugId,
              comment: `🔄 Bug reopened by ${currentUser?.name || 'Reporter'}`,
            });
          },
        }
      );
    }
  };

  // Output file handlers (for assignee)
  const handleOutputFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setOutputFile(file);
    
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setOutputFilePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadOutputFile = () => {
    if (!outputFile || !isAssignee) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      updateBug(
        {
          param: { bugId: bug.bugId },
          json: { bugId: bug.bugId, outputFileUrl: base64String },
        },
        {
          onSuccess: () => {
            setOutputFile(null);
            setOutputFilePreview(null);
            setIsUploadingOutput(false);
            if (outputFileInputRef.current) {
              outputFileInputRef.current.value = '';
            }
          },
        }
      );
    };
    reader.readAsDataURL(outputFile);
  };

  // Comment handlers
  const handleCommentFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCommentFile(file);
    }
  };

  const handleSendComment = () => {
    if (!commentText.trim() && !commentFile) return;

    if (commentFile) {
      console.log('Sending comment with file:', commentFile.name, commentFile.type);
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        console.log('File converted to base64, length:', base64String.length, 'starts with:', base64String.substring(0, 30));
        
        createComment({
          bugId: bug.bugId,
          comment: commentText.trim(),
          fileUrl: base64String,
        }, {
          onSuccess: () => {
            setCommentText('');
            setCommentFile(null);
            if (commentFileInputRef.current) {
              commentFileInputRef.current.value = '';
            }
          },
        });
      };
      reader.readAsDataURL(commentFile);
    } else {
      createComment({
        bugId: bug.bugId,
        comment: commentText.trim(),
      }, {
        onSuccess: () => {
          setCommentText('');
        },
      });
    }
  };

  // Debug: Log bug data when modal opens
  React.useEffect(() => {
    if (isOpen) {
      console.log('=== BUG DETAIL MODAL OPENED ===');
      console.log('Bug ID:', bug.bugId);
      console.log('File URL:', bug.fileUrl ? `${bug.fileUrl.substring(0, 50)}... (length: ${bug.fileUrl.length})` : 'None');
      console.log('File URL starts with data:', bug.fileUrl?.startsWith('data:'));
      console.log('Output File URL:', bug.outputFileUrl ? `${bug.outputFileUrl.substring(0, 50)}... (length: ${bug.outputFileUrl.length})` : 'None');
      console.log('Output File URL starts with data:', bug.outputFileUrl?.startsWith('data:'));
    }
  }, [isOpen, bug]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-5xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Bug className="h-6 w-6" />
            Bug Details: {bug.bugId}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-2">
          {/* Header Info */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Badge variant="outline">{bug.bugType}</Badge>
              <div className="flex items-center gap-2">
                <div className={cn("h-2 w-2 rounded-full", getPriorityColor(bug.priority))} />
                <span className="text-sm font-medium">{getPriorityLabel(bug.priority)}</span>
              </div>
            </div>
            <Badge variant={bug.status === BugStatus.OPEN ? "destructive" : "default"}>
              {bug.status}
            </Badge>
          </div>

          <DottedSeparator />

          {/* Status Control - Only for Assignee */}
          {isAssignee && (
            <div className="space-y-3">
              <label className="text-sm font-medium">Update Status</label>
              <Select defaultValue={bug.status} onValueChange={handleStatusChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={BugStatus.OPEN}>Open</SelectItem>
                  <SelectItem value={BugStatus.IN_PROGRESS}>In Progress</SelectItem>
                  <SelectItem value={BugStatus.RESOLVED}>Resolved</SelectItem>
                  <SelectItem value={BugStatus.CLOSED}>Closed</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Only you (assignee) can change the bug status
              </p>
            </div>
          )}

          {!isAssignee && (
            <div className="bg-muted/50 p-4 rounded-md">
              <p className="text-sm text-muted-foreground">
                <span className="font-medium">Status:</span> {bug.status}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Only the assignee can update the status
              </p>
            </div>
          )}

          <DottedSeparator />

          {/* Description */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Bug Description</label>
            <div className="bg-muted/50 p-3 rounded-md">
              <p className="text-sm whitespace-pre-wrap">{bug.bugDescription}</p>
            </div>
          </div>

          {/* People Information */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-1">
                <User className="h-3 w-3" />
                Reported By
              </label>
              <p className="text-sm text-muted-foreground">{bug.reportedByName}</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-1">
                <User className="h-3 w-3" />
                Assigned To
              </label>
              <p className="text-sm text-muted-foreground">{bug.assignedToName || "Not assigned"}</p>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Created
              </label>
              <p className="text-sm text-muted-foreground">
                {format(new Date(bug.createdAt), "PPP 'at' p")}
              </p>
            </div>
            {bug.resolvedAt && (bug.status === "Resolved" || bug.status === "Closed") && (
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Resolved
                </label>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(bug.resolvedAt), "PPP 'at' p")}
                </p>
              </div>
            )}
          </div>

          {/* File Attachment */}
          {bug.fileUrl && (
            <>
              <DottedSeparator />
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-1">
                  <FileText className="h-3 w-3" />
                  Attached File
                </label>
                
                {/* Warning for invalid file URLs */}
                {!bug.fileUrl.startsWith('data:') && (
                  <div className="bg-amber-50 border border-amber-200 rounded-md p-3 mb-2">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-amber-800">Invalid File Format</p>
                        <p className="text-xs text-amber-700 mt-1">
                          This file was not properly uploaded. The file URL is: <code className="bg-amber-100 px-1 rounded">{bug.fileUrl}</code>
                        </p>
                        <p className="text-xs text-amber-700 mt-1">
                          Please delete this bug and create a new one with the file properly attached, or contact support.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                
                {!isReplacing ? (
                  <>
                    <div className="bg-muted/50 p-3 rounded-md flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium truncate max-w-[200px]">
                          {bug.fileUrl.startsWith('data:') ? `Attachment for ${bug.bugId}` : bug.fileUrl}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleFileView}
                          disabled={!bug.fileUrl.startsWith('data:')}
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          View
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleFileDownload}
                          disabled={!bug.fileUrl.startsWith('data:')}
                        >
                          <Download className="h-3 w-3 mr-1" />
                          Download
                        </Button>
                        {canReporterEditFiles && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={handleReplaceClick}
                            >
                              <Edit className="h-3 w-3 mr-1" />
                              Replace
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={handleRemoveFile}
                            >
                              <Trash2 className="h-3 w-3 mr-1" />
                              Remove
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {canReporterEditFiles
                        ? "As the reporter, you can view, download, replace, or remove the attached file"
                        : isReporter
                        ? "As the reporter, you can view and download the file. File modifications are only allowed when status is 'Open'."
                        : isAssignee
                        ? "As the assignee, you can view and download the file. Only the reporter can modify or remove it (when status is 'Open')."
                        : "You can view and download the file. Only the reporter can modify or remove it (when status is 'Open')."}
                    </p>
                  </>
                ) : (
                  <>
                    <div className="bg-muted/50 p-4 rounded-md space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Replace File</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={handleCancelReplace}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <input
                        ref={fileInputRef}
                        type="file"
                        onChange={handleFileSelect}
                        className="w-full text-sm"
                        accept="image/*,.pdf,.doc,.docx,.txt"
                      />
                      
                      {filePreview && (
                        <div className="mt-2">
                          <img 
                            src={filePreview} 
                            alt="Preview" 
                            className="max-w-full h-32 object-contain rounded border"
                          />
                        </div>
                      )}
                      
                      {newFile && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <FileText className="h-4 w-4" />
                          <span className="truncate">{newFile.name}</span>
                          <span className="text-xs">({(newFile.size / 1024).toFixed(1)} KB)</span>
                        </div>
                      )}
                      
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={handleFileReplace}
                          disabled={!newFile}
                        >
                          <Upload className="h-3 w-3 mr-1" />
                          Upload New File
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleCancelReplace}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </>
          )}

          <DottedSeparator />

          {/* Reopen Bug Button (for reporters on closed bugs) */}
          {canReopen && (
            <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 p-4 rounded-md">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-amber-900 dark:text-amber-100 mb-1">
                    Bug Closed
                  </p>
                  <p className="text-xs text-amber-700 dark:text-amber-300">
                    If you're experiencing this issue again, you can reopen this bug instead of creating a new one. The conversation history will be preserved.
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-amber-300 hover:bg-amber-100 dark:border-amber-700 dark:hover:bg-amber-900"
                  onClick={handleReopenBug}
                >
                  <RotateCcw className="h-3 w-3 mr-1" />
                  Reopen Bug
                </Button>
              </div>
            </div>
          )}

          {/* Output File Section (for assignee when resolving) */}
          {isAssignee && (bug.status === BugStatus.RESOLVED || bug.status === BugStatus.CLOSED) && (
            <>
              <DottedSeparator />
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Resolution Output File
                  </label>
                  {!isUploadingOutput && !bug.outputFileUrl && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setIsUploadingOutput(true)}
                    >
                      <Upload className="h-3 w-3 mr-1" />
                      Upload Output
                    </Button>
                  )}
                </div>

                {bug.outputFileUrl && !isUploadingOutput ? (
                  <div className="bg-green-50 dark:bg-green-950 p-3 rounded-md">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-green-900 dark:text-green-100">
                        Output file attached
                      </span>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={handleOutputFileView}>
                          <Eye className="h-3 w-3 mr-1" />
                          View
                        </Button>
                        <Button size="sm" variant="outline" onClick={handleOutputFileDownload}>
                          <Download className="h-3 w-3 mr-1" />
                          Download
                        </Button>
                      </div>
                    </div>
                    <p className="text-xs text-green-700 dark:text-green-300">
                      Resolution output available for reporter to review
                    </p>
                  </div>
                ) : isUploadingOutput ? (
                  <div className="bg-muted/50 p-4 rounded-md space-y-3">
                    <input
                      ref={outputFileInputRef}
                      type="file"
                      onChange={handleOutputFileSelect}
                      className="w-full text-sm"
                      accept="image/*,.pdf,.doc,.docx,.txt"
                    />
                    {outputFilePreview && (
                      <img 
                        src={outputFilePreview} 
                        alt="Preview" 
                        className="max-w-full h-32 object-contain rounded border"
                      />
                    )}
                    {outputFile && (
                      <div className="flex gap-2">
                        <Button size="sm" onClick={handleUploadOutputFile}>
                          <Upload className="h-3 w-3 mr-1" />
                          Upload File
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => {
                            setIsUploadingOutput(false);
                            setOutputFile(null);
                            setOutputFilePreview(null);
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Upload a file showing the resolution/fix for the reporter to reference
                  </p>
                )}
              </div>
            </>
          )}

          {/* Output File View (for reporter) */}
          {isReporter && bug.outputFileUrl && (
            <>
              <DottedSeparator />
              <div className="space-y-3">
                <label className="text-sm font-medium flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Resolution Output from Assignee
                </label>
                <div className="bg-green-50 dark:bg-green-950 p-3 rounded-md">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-green-900 dark:text-green-100">
                      Resolution file available
                    </span>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={handleOutputFileView}>
                        <Eye className="h-3 w-3 mr-1" />
                        View
                      </Button>
                      <Button size="sm" variant="outline" onClick={handleOutputFileDownload}>
                        <Download className="h-3 w-3 mr-1" />
                        Download
                      </Button>
                    </div>
                  </div>
                  <p className="text-xs text-green-700 dark:text-green-300 mt-2">
                    The assignee has provided output showing the resolution
                  </p>
                </div>
              </div>
            </>
          )}

          {/* Comments/Conversation Section */}
          <DottedSeparator />
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              <label className="text-sm font-medium">
                Conversation & Updates
              </label>
              <Badge variant="secondary" className="text-xs">
                {comments?.length || 0}
              </Badge>
            </div>

            {/* Comments List */}
            <ScrollArea className="h-[300px] sm:h-[400px] lg:h-[450px] border rounded-md p-3 sm:p-4">
              {commentsLoading ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Loading comments...
                </p>
              ) : comments && comments.length > 0 ? (
                <div className="space-y-5">
                  {comments.map((comment: any) => (
                    <div 
                      key={comment.id} 
                      className={cn(
                        "p-3 sm:p-4 rounded-md",
                        comment.isSystemComment 
                          ? "bg-muted/50 border-l-2 border-blue-500" 
                          : comment.userId === currentUser?.id
                          ? "bg-blue-50 dark:bg-blue-950 ml-8"
                          : "bg-muted mr-8"
                      )}
                    >
                      <div className="flex items-start justify-between mb-1">
                        <span className="text-xs font-medium">
                          {comment.userName}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(comment.createdAt), "MMM d, h:mm a")}
                        </span>
                      </div>
                      <p className="text-sm whitespace-pre-wrap">{comment.comment}</p>
                      {comment.fileUrl && (
                        <div className="mt-2">
                          <Button 
                            type="button"
                            size="sm" 
                            variant="outline"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleCommentFileView(comment.fileUrl, comment.id);
                            }}
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            View Attachment
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">
                  {isReporter 
                    ? "No comments yet. Start the conversation!" 
                    : "No comments yet. Waiting for reporter to start the conversation."}
                </p>
              )}
            </ScrollArea>

            {/* Add Comment Section */}
            {/* Show input only if bug is not closed, OR if it's closed show message about reopening */}
            {bug.status !== BugStatus.CLOSED && (isReporter || (isAssignee && comments && comments.length > 0)) && (
              <div className="space-y-2">
                <Textarea
                  placeholder={isReporter 
                    ? "Add a comment or update..." 
                    : "Reply to the conversation..."}
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  rows={3}
                  className="resize-none"
                />
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <input
                      ref={commentFileInputRef}
                      type="file"
                      onChange={handleCommentFileSelect}
                      className="hidden"
                      accept="image/*,.pdf,.doc,.docx,.txt"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => commentFileInputRef.current?.click()}
                    >
                      <Upload className="h-3 w-3 mr-1" />
                      Attach File
                    </Button>
                    {commentFile && (
                      <span className="text-xs text-muted-foreground">
                        {commentFile.name}
                      </span>
                    )}
                  </div>
                  <Button
                    size="sm"
                    onClick={handleSendComment}
                    disabled={!commentText.trim() && !commentFile}
                  >
                    <Send className="h-3 w-3 mr-1" />
                    Send
                  </Button>
                </div>
              </div>
            )}

            {/* Message when bug is closed */}
            {bug.status === BugStatus.CLOSED && (
              <div className="bg-muted/50 p-4 rounded-md text-center">
                <p className="text-sm text-muted-foreground">
                  {isReporter 
                    ? "This bug is closed. Reopen it above to continue the conversation."
                    : "This bug is closed. Conversation ended."}
                </p>
              </div>
            )}

            {/* Message for assignee if no conversation started yet */}
            {isAssignee && (!comments || comments.length === 0) && (
              <div className="bg-muted/50 p-4 rounded-md">
                <p className="text-xs text-muted-foreground text-center">
                  💬 The reporter will start the conversation. Once they add the first comment, you can reply and provide updates.
                </p>
              </div>
            )}
          </div>

          <DottedSeparator />

          {/* Permissions Summary */}
          <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-md">
            <p className="text-sm font-medium mb-2">Access Permissions:</p>
            <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
              <li>
                <span className="font-medium">Status Updates:</span> Only the assignee ({bug.assignedToName}) can change the bug status
              </li>
              <li>
                <span className="font-medium">File Access:</span> Both assignee and reporter ({bug.reportedByName}) can view the file
              </li>
              <li>
                <span className="font-medium">File Edit:</span> Only the reporter ({bug.reportedByName}) can replace the attached file
              </li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
