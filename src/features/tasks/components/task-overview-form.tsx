"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Upload, X, Github, Link as LinkIcon, Image as ImageIcon, File } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useCreateTaskOverview } from "@/features/tasks/api/use-create-task-overview";
import { Task } from "../types";

const taskOverviewSchema = z.object({
  completedWorkDescription: z.string().min(10, "Please provide a detailed description (minimum 10 characters)"),
  completionMethod: z.string().min(10, "Please explain how you completed the work (minimum 10 characters)"),
  stepsFollowed: z.string().min(10, "Please describe the steps you followed (minimum 10 characters)"),
  screenshots: z.array(z.string()).optional(),
  files: z.array(z.string()).optional(),
  links: z.array(z.string().url("Please enter valid URLs")).optional(),
  githubCommits: z.array(z.string()).optional(),
  challenges: z.string().optional(),
  additionalRemarks: z.string().optional(),
  timeSpent: z.number().min(0).optional(),
});

type TaskOverviewFormValues = z.infer<typeof taskOverviewSchema>;

interface TaskOverviewFormProps {
  task: Task;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function TaskOverviewForm({
  task,
  isOpen,
  onClose,
  onSuccess,
}: TaskOverviewFormProps) {
  const { mutate: createOverview, isPending } = useCreateTaskOverview();
  
  const [screenshots, setScreenshots] = useState<string[]>([]);
  const [files, setFiles] = useState<string[]>([]);
  const [links, setLinks] = useState<string[]>([]);
  const [githubCommits, setGithubCommits] = useState<string[]>([]);
  
  const [linkInput, setLinkInput] = useState("");
  const [commitInput, setCommitInput] = useState("");

  const form = useForm<TaskOverviewFormValues>({
    resolver: zodResolver(taskOverviewSchema),
    defaultValues: {
      completedWorkDescription: "",
      completionMethod: "",
      stepsFollowed: "",
      challenges: "",
      additionalRemarks: "",
      timeSpent: undefined,
    },
  });

  const handleAddLink = () => {
    if (linkInput.trim()) {
      try {
        new URL(linkInput); // Validate URL
        setLinks([...links, linkInput.trim()]);
        setLinkInput("");
      } catch {
        form.setError("links", { message: "Please enter a valid URL" });
      }
    }
  };

  const handleAddCommit = () => {
    if (commitInput.trim()) {
      setGithubCommits([...githubCommits, commitInput.trim()]);
      setCommitInput("");
    }
  };

  const removeItem = (list: string[], setList: (items: string[]) => void, index: number) => {
    setList(list.filter((_, i) => i !== index));
  };

  const onSubmit = (values: TaskOverviewFormValues) => {
    // Validate that at least one proof of work is provided
    if (
      screenshots.length === 0 &&
      files.length === 0 &&
      links.length === 0 &&
      githubCommits.length === 0
    ) {
      form.setError("root", {
        message: "Please provide at least one proof of work (screenshot, file, link, or GitHub commit)",
      });
      return;
    }

    createOverview(
      {
        taskId: task.id,
        completedWorkDescription: values.completedWorkDescription,
        completionMethod: values.completionMethod,
        stepsFollowed: values.stepsFollowed,
        proofOfWork: {
          screenshots: screenshots.length > 0 ? screenshots : undefined,
          files: files.length > 0 ? files : undefined,
          links: links.length > 0 ? links : undefined,
          githubCommits: githubCommits.length > 0 ? githubCommits : undefined,
        },
        challenges: values.challenges,
        additionalRemarks: values.additionalRemarks,
        timeSpent: values.timeSpent,
      },
      {
        onSuccess: () => {
          form.reset();
          setScreenshots([]);
          setFiles([]);
          setLinks([]);
          setGithubCommits([]);
          onSuccess?.();
          onClose();
        },
      }
    );
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'screenshot' | 'file') => {
    const uploadedFiles = e.target.files;
    if (!uploadedFiles) return;

    // TODO: Implement actual file upload to cloud storage (S3, Cloudinary, etc.)
    // For now, we'll create placeholder URLs
    const fileUrls = Array.from(uploadedFiles).map((file) => {
      // In production, upload to cloud and return real URL
      return URL.createObjectURL(file); // Temporary local URL
    });

    if (type === 'screenshot') {
      setScreenshots([...screenshots, ...fileUrls]);
    } else {
      setFiles([...files, ...fileUrls]);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Task Completion Overview</DialogTitle>
          <DialogDescription>
            Please provide detailed information about how you completed this task: <strong>{task.summary}</strong> ({task.issueId})
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Auto-filled information */}
            <div className="bg-muted p-4 rounded-lg space-y-2">
              <p className="text-sm">
                <span className="font-semibold">Task:</span> {task.summary}
              </p>
              <p className="text-sm">
                <span className="font-semibold">Task ID:</span> {task.issueId}
              </p>
              <p className="text-sm">
                <span className="font-semibold">Employee:</span> {task.assignee?.name || "Unassigned"}
              </p>
            </div>

            {/* Completed Work Description */}
            <FormField
              control={form.control}
              name="completedWorkDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base">
                    What work was completed? <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Provide a clear description of what you accomplished..."
                      className="min-h-[100px] resize-y"
                    />
                  </FormControl>
                  <FormDescription>
                    Describe what you accomplished in this task
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Completion Method */}
            <FormField
              control={form.control}
              name="completionMethod"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base">
                    How was the work completed? <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Explain the approach and methods you used..."
                      className="min-h-[100px] resize-y"
                    />
                  </FormControl>
                  <FormDescription>
                    Explain the approach, technologies, or techniques you used
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Steps Followed */}
            <FormField
              control={form.control}
              name="stepsFollowed"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base">
                    Steps followed <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="List the steps you followed (e.g., 1. First step... 2. Second step...)"
                      className="min-h-[100px] resize-y"
                    />
                  </FormControl>
                  <FormDescription>
                    Provide a step-by-step breakdown of your process
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Proof of Work Section */}
            <div className="space-y-4 border p-4 rounded-lg">
              <h3 className="font-semibold text-lg">
                Proof of Work <span className="text-destructive">*</span>
              </h3>
              <p className="text-sm text-muted-foreground">
                Provide at least one form of evidence (screenshots, files, links, or GitHub commits)
              </p>

              {/* Screenshots */}
              <div className="space-y-2">
                <FormLabel className="flex items-center gap-2">
                  <ImageIcon className="h-4 w-4" />
                  Screenshots
                </FormLabel>
                <Input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => handleFileUpload(e, 'screenshot')}
                  className="cursor-pointer"
                />
                {screenshots.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {screenshots.map((url, index) => (
                      <div key={index} className="relative group">
                        <img src={url} alt={`Screenshot ${index + 1}`} className="h-20 w-20 object-cover rounded border" />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute -top-2 -right-2 h-6 w-6 opacity-0 group-hover:opacity-100"
                          onClick={() => removeItem(screenshots, setScreenshots, index)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Files */}
              <div className="space-y-2">
                <FormLabel className="flex items-center gap-2">
                  <File className="h-4 w-4" />
                  Files
                </FormLabel>
                <Input
                  type="file"
                  multiple
                  onChange={(e) => handleFileUpload(e, 'file')}
                  className="cursor-pointer"
                />
                {files.length > 0 && (
                  <div className="space-y-1 mt-2">
                    {files.map((url, index) => (
                      <div key={index} className="flex items-center justify-between bg-muted p-2 rounded">
                        <span className="text-sm truncate flex-1">{url.split('/').pop()}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem(files, setFiles, index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Links */}
              <div className="space-y-2">
                <FormLabel className="flex items-center gap-2">
                  <LinkIcon className="h-4 w-4" />
                  Links
                </FormLabel>
                <div className="flex gap-2">
                  <Input
                    value={linkInput}
                    onChange={(e) => setLinkInput(e.target.value)}
                    placeholder="https://example.com"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddLink())}
                  />
                  <Button type="button" onClick={handleAddLink} variant="secondary">
                    Add
                  </Button>
                </div>
                {links.length > 0 && (
                  <div className="space-y-1 mt-2">
                    {links.map((link, index) => (
                      <div key={index} className="flex items-center justify-between bg-muted p-2 rounded">
                        <a href={link} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline truncate flex-1">
                          {link}
                        </a>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem(links, setLinks, index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* GitHub Commits */}
              <div className="space-y-2">
                <FormLabel className="flex items-center gap-2">
                  <Github className="h-4 w-4" />
                  GitHub Commits
                </FormLabel>
                <div className="flex gap-2">
                  <Input
                    value={commitInput}
                    onChange={(e) => setCommitInput(e.target.value)}
                    placeholder="Commit hash or URL"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCommit())}
                  />
                  <Button type="button" onClick={handleAddCommit} variant="secondary">
                    Add
                  </Button>
                </div>
                {githubCommits.length > 0 && (
                  <div className="space-y-1 mt-2">
                    {githubCommits.map((commit, index) => (
                      <div key={index} className="flex items-center justify-between bg-muted p-2 rounded">
                        <code className="text-sm truncate flex-1">{commit}</code>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem(githubCommits, setGithubCommits, index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Optional Fields */}
            <FormField
              control={form.control}
              name="challenges"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Challenges Faced (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Describe any challenges or obstacles you encountered..."
                      className="min-h-[80px] resize-y"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="additionalRemarks"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Remarks (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Any additional notes or comments..."
                      className="min-h-[80px] resize-y"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="timeSpent"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Time Spent (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      placeholder="Minutes spent on this task"
                      {...field}
                      onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                    />
                  </FormControl>
                  <FormDescription>Enter time in minutes</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {form.formState.errors.root && (
              <p className="text-sm text-destructive">{form.formState.errors.root.message}</p>
            )}

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Submitting..." : "Submit Overview"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
