"use client";

import Image from "next/image";
import Link from "next/link";
import { FolderKanban, Clock, Lightbulb, FileText, Video, MessageSquare, GitCompare } from "lucide-react";

import { DottedSeparator } from "./dotted-separator";
import { Navigation } from "./navigation";
import { WorkspaceSwitcher } from "./workspace-switcher";
import { Projects } from "./projects";
import { CollapsibleSection } from "./collapsible-section";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";

export const Sidebar = () => {
  const workspaceId = useWorkspaceId();
  return (
    <aside className="h-full bg-muted/50 dark:bg-muted/30 p-4 w-full border-r border-border overflow-y-auto">
      <div className="flex items-center gap-2">
        <Link href="/">
          <Image src="/logo.svg" alt="logo" width={50} height={39} />
        </Link>
        <p className="font-bold text-lg">GGS </p>
      </div>
      <DottedSeparator className="my-4" />
      
      {/* PM (Project Management) Section */}
      <CollapsibleSection 
        title="Project Manager" 
        icon={<FolderKanban className="size-4" />}
        defaultOpen={true}
      >
        <WorkspaceSwitcher />
        <DottedSeparator className="my-4" />
        <Navigation />
        <DottedSeparator className="my-4" />
        <Projects />
      </CollapsibleSection>

      {/* ATTENDANCE Section */}
      <CollapsibleSection 
        title="Attendance" 
        icon={<Clock className="size-4" />}
        defaultOpen={false}
      >
        <nav className="flex flex-col gap-1 px-3">
          <Link
            href={`/attendance/${workspaceId}`}
            className="flex items-center gap-2.5 p-2.5 rounded-md font-medium hover:text-primary transition text-muted-foreground hover:bg-muted"
          >
            <Clock className="size-4" />
            My Attendance
          </Link>
        </nav>
      </CollapsibleSection>

      {/* Solutions Section */}
      <CollapsibleSection 
        title="Solutions" 
        icon={<Lightbulb className="size-4" />}
        defaultOpen={false}
      >
        <nav className="flex flex-col gap-1 px-3">
          <Link
            href={`/workspaces/${workspaceId}/solutions/pdf-xml`}
            className="flex items-center gap-2.5 p-2.5 rounded-md font-medium hover:text-primary transition text-muted-foreground hover:bg-muted"
          >
            <FileText className="size-4" />
            PDF to XML Extraction
          </Link>
          <Link
            href={`/workspaces/${workspaceId}/solutions/video-rag`}
            className="flex items-center gap-2.5 p-2.5 rounded-md font-medium hover:text-primary transition text-muted-foreground hover:bg-muted"
          >
            <Video className="size-4" />
            Video RAG
          </Link>
          <Link
            href={`/workspaces/${workspaceId}/solutions/chatbot`}
            className="flex items-center gap-2.5 p-2.5 rounded-md font-medium hover:text-primary transition text-muted-foreground hover:bg-muted"
          >
            <MessageSquare className="size-4" />
            Chatbot
          </Link>
          <Link
            href={`/workspaces/${workspaceId}/solutions/similarity`}
            className="flex items-center gap-2.5 p-2.5 rounded-md font-medium hover:text-primary transition text-muted-foreground hover:bg-muted"
          >
            <GitCompare className="size-4" />
            Similarity Checkers
          </Link>
        </nav>
      </CollapsibleSection>

    </aside>
  );
};
