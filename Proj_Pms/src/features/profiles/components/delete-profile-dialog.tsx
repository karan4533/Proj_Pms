"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useGetProfile } from "../api/use-get-profile";
import { useDeleteProfile } from "../api/use-delete-profile";
import { Loader } from "lucide-react";

interface DeleteProfileDialogProps {
  userId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const DeleteProfileDialog = ({
  userId,
  open,
  onOpenChange,
}: DeleteProfileDialogProps) => {
  const { data: profile, isLoading } = useGetProfile(userId);
  const { mutate: deleteProfile, isPending } = useDeleteProfile();

  const handleDelete = () => {
    deleteProfile(userId, {
      onSuccess: () => {
        onOpenChange(false);
      },
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            {isLoading ? (
              <div className="flex items-center gap-2 py-4">
                <Loader className="size-4 animate-spin" />
                <span>Loading employee details...</span>
              </div>
            ) : (
              <div className="space-y-2">
                <p>
                  This action cannot be undone. This will permanently delete the employee profile
                  and remove all associated data from the system.
                </p>
                {profile && (
                  <div className="mt-4 p-4 bg-muted rounded-md space-y-1">
                    <p className="font-semibold text-foreground">Employee Details:</p>
                    <p className="text-sm">
                      <span className="font-medium">Name:</span> {profile.name}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Email:</span> {profile.email}
                    </p>
                    {profile.designation && (
                      <p className="text-sm">
                        <span className="font-medium">Designation:</span> {profile.designation}
                      </p>
                    )}
                    {profile.department && (
                      <p className="text-sm">
                        <span className="font-medium">Department:</span> {profile.department}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isPending || isLoading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isPending ? "Deleting..." : "Delete Employee"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
