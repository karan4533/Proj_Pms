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
          {isLoading ? (
            <div className="flex items-center gap-2 py-4">
              <Loader className="size-4 animate-spin" />
              <span className="text-sm text-muted-foreground">Loading employee details...</span>
            </div>
          ) : (
            <>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the employee profile
                and remove all associated data from the system.
              </AlertDialogDescription>
              {profile && (
                <div className="mt-4 p-4 bg-muted rounded-md space-y-1 text-sm">
                  <div className="font-semibold text-foreground">Employee Details:</div>
                  <div>
                    <span className="font-medium">Name:</span> {profile.name}
                  </div>
                  <div>
                    <span className="font-medium">Email:</span> {profile.email}
                  </div>
                  {profile.designation && (
                    <div>
                      <span className="font-medium">Designation:</span> {profile.designation}
                    </div>
                  )}
                  {profile.department && (
                    <div>
                      <span className="font-medium">Department:</span> {profile.department}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
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
