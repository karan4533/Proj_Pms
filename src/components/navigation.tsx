"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { 
  SettingsIcon, 
  UsersIcon, 
  KanbanSquareIcon, 
  ChevronDown, 
  ChevronRight,
  FileText,
  PlusCircle,
  BarChart3
} from "lucide-react";
import Link from "next/link";
import {
  GoCheckCircle,
  GoCheckCircleFill,
  GoHome,
  GoHomeFill,
} from "react-icons/go";

import { usePathname, useSearchParams } from "next/navigation";

interface RouteItem {
  label: string;
  href: string;
  icon: any;
  activeIcon: any;
}

interface RouteGroup {
  label: string;
  icon: any;
  activeIcon: any;
  children: RouteItem[];
}

const routeGroups: (RouteItem | RouteGroup)[] = [
  {
    label: "Home",
    icon: GoHome,
    activeIcon: GoHomeFill,
    children: [
      {
        label: "Dashboard",
        href: "/dashboard",
        icon: BarChart3,
        activeIcon: BarChart3,
      },
      {
        label: "Report",
        href: "/report",
        icon: FileText,
        activeIcon: FileText,
      },
    ],
  },
  {
    label: "Projects",
    icon: GoCheckCircle,
    activeIcon: GoCheckCircleFill,
    children: [
      {
        label: "All Projects",
        href: "/projects",
        icon: GoCheckCircle,
        activeIcon: GoCheckCircleFill,
      },
      {
        label: "New Project",
        href: "/new-project",
        icon: PlusCircle,
        activeIcon: PlusCircle,
      },
      {
        label: "Tasks",
        href: "/tasks",
        icon: GoCheckCircle,
        activeIcon: GoCheckCircleFill,
      },
    ],
  },
  {
    label: "Board",
    href: "/board",
    icon: KanbanSquareIcon,
    activeIcon: KanbanSquareIcon,
  } as RouteItem,
];

export const Navigation = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [expandedGroups, setExpandedGroups] = useState<string[]>(["Home", "Projects"]);
  
  // Get current projectId from URL if exists
  const projectId = searchParams.get('projectId');

  const toggleGroup = (label: string) => {
    setExpandedGroups((prev) =>
      prev.includes(label)
        ? prev.filter((item) => item !== label)
        : [...prev, label]
    );
  };

  const renderRouteItem = (item: RouteItem) => {
    const fullHref = item.href;
    const hrefWithProject = projectId ? `${fullHref}?projectId=${projectId}` : fullHref;
    const isActive = pathname === fullHref;
    const Icon = isActive ? item.activeIcon : item.icon;

    return (
      <Link key={item.href} href={hrefWithProject}>
        <div
          className={cn(
            "flex items-center gap-2.5 p-2.5 rounded-md font-medium hover:text-primary transition text-muted-foreground",
            isActive && "bg-background dark:bg-background shadow-sm hover:opacity-100 text-primary border border-border"
          )}
        >
          <Icon className={cn(
            "size-5",
            isActive ? "text-primary" : "text-muted-foreground"
          )} />
          {item.label}
        </div>
      </Link>
    );
  };

  const renderRouteGroup = (group: RouteGroup) => {
    const isExpanded = expandedGroups.includes(group.label);
    const isAnyChildActive = group.children.some(
      (child) => pathname === child.href
    );
    const Icon = isAnyChildActive ? group.activeIcon : group.icon;
    const ChevronIcon = isExpanded ? ChevronDown : ChevronRight;

    return (
      <div key={group.label}>
        <button
          onClick={() => toggleGroup(group.label)}
          className={cn(
            "flex items-center justify-between w-full gap-2.5 p-2.5 rounded-md font-medium hover:text-primary transition text-muted-foreground",
            isAnyChildActive && "text-primary"
          )}
        >
          <div className="flex items-center gap-2.5">
            <Icon className={cn(
              "size-5",
              isAnyChildActive ? "text-primary" : "text-muted-foreground"
            )} />
            {group.label}
          </div>
          <ChevronIcon className="size-4" />
        </button>
        {isExpanded && (
          <div className="ml-4 mt-1 space-y-1">
            {group.children.map((child) => renderRouteItem(child))}
          </div>
        )}
      </div>
    );
  };

  return (
    <ul className="flex flex-col gap-y-1">
      {routeGroups.map((route, index) => {
        const isBoard = 'href' in route && route.href === '/board';
        const element = 'children' in route ? renderRouteGroup(route) : renderRouteItem(route);
        
        return (
          <li key={index}>
            {element}
            {isBoard && (
              <div className="my-3">
                <div className="h-px bg-border" />
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
};
