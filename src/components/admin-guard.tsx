"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useIsGlobalAdmin } from "@/features/members/api/use-get-user-role";
import { Loader } from "lucide-react";

interface AdminGuardProps {
  children: React.ReactNode;
}

/**
 * Protects admin-only pages by redirecting employees to dashboard
 */
export const AdminGuard = ({ children }: AdminGuardProps) => {
  const router = useRouter();
  const isAdmin = useIsGlobalAdmin();

  useEffect(() => {
    if (isAdmin === false) {
      // User is employee, redirect to dashboard
      router.push("/dashboard");
    }
  }, [isAdmin, router]);

  // Show loading while checking permission
  if (isAdmin === null || isAdmin === undefined) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Show access denied if employee
  if (isAdmin === false) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold">Access Denied</h1>
          <p className="text-muted-foreground">
            You don't have permission to access this page.
          </p>
          <p className="text-sm text-muted-foreground">
            This feature is only available to administrators.
          </p>
        </div>
      </div>
    );
  }

  // User is admin, show the page
  return <>{children}</>;
};
