"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Pencil, Plus, X } from "lucide-react";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DottedSeparator } from "@/components/dotted-separator";

import { useCurrent } from "../api/use-current";
import { useUpdateProfile } from "../api/use-update-profile";

const profileSchema = z.object({
  native: z.string().optional(),
  mobileNo: z.string().optional(),
  experience: z.coerce.number().optional(),
  skills: z.array(z.string()).optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

interface ProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ProfileModal = ({ open, onOpenChange }: ProfileModalProps) => {
  const { data: user, refetch } = useCurrent();
  const { mutate: updateProfile, isPending } = useUpdateProfile();
  const [isEditing, setIsEditing] = useState(false);
  const [newSkill, setNewSkill] = useState("");
  const [tempSkills, setTempSkills] = useState<string[]>([]);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      native: "",
      mobileNo: "",
      experience: 0,
      skills: [],
    },
  });

  // Refetch user data when modal opens
  useEffect(() => {
    if (open) {
      refetch();
    }
  }, [open, refetch]);

  // Initialize form values when user data is available
  useEffect(() => {
    if (user) {
      form.reset({
        native: user.native || "",
        mobileNo: user.mobileNo || "",
        experience: user.experience || 0,
        skills: user.skills || [],
      });
      setTempSkills(user.skills || []);
    }
  }, [user, form]);

  const handleAddSkill = () => {
    if (newSkill.trim() && !tempSkills.includes(newSkill.trim())) {
      setTempSkills([...tempSkills, newSkill.trim()]);
      setNewSkill("");
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setTempSkills(tempSkills.filter((skill) => skill !== skillToRemove));
  };

  const onSubmit = (values: ProfileFormValues) => {
    updateProfile(
      { ...values, skills: tempSkills },
      {
        onSuccess: async () => {
          // Wait for refetch to complete before switching modes
          await refetch();
          setIsEditing(false);
        },
      }
    );
  };

  const formatDate = (date: Date | string | null) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Profile Details</DialogTitle>
            {!isEditing && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditing(true)}
              >
                <Pencil className="size-4 mr-2" />
                Edit Profile
              </Button>
            )}
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto pr-2">
          <div className="space-y-6">
            {/* Read-only fields */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-neutral-700">Personal Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-neutral-500">Full Name</label>
                  <p className="text-sm font-medium">{user.name}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-neutral-500">Date of Birth</label>
                  <p className="text-sm font-medium">{formatDate(user.dateOfBirth)}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-neutral-500">Official Email</label>
                  <p className="text-sm font-medium">{user.email}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-neutral-500">Designation</label>
                  <p className="text-sm font-medium">{user.designation || "N/A"}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-neutral-500">Department</label>
                  <p className="text-sm font-medium">{user.department || "N/A"}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-neutral-500">Date of Joining</label>
                  <p className="text-sm font-medium">{formatDate(user.dateOfJoining)}</p>
                </div>
              </div>
            </div>

            <DottedSeparator />

            {/* Editable fields */}
            {isEditing ? (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <h3 className="text-sm font-semibold text-neutral-700">Additional Details</h3>
                  
                  <FormField
                    control={form.control}
                    name="native"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Native Place</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Enter your native place" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="mobileNo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mobile Number</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Enter your mobile number" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="experience"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Experience (Years)</FormLabel>
                        <FormControl>
                          <Input {...field} type="number" placeholder="Enter years of experience" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="space-y-2">
                    <FormLabel>Skills</FormLabel>
                    <div className="flex gap-2">
                      <Input
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddSkill();
                          }
                        }}
                        placeholder="Add a skill"
                      />
                      <Button
                        type="button"
                        size="icon"
                        onClick={handleAddSkill}
                        disabled={!newSkill.trim()}
                      >
                        <Plus className="size-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {tempSkills.map((skill) => (
                        <Badge key={skill} variant="secondary" className="gap-1">
                          {skill}
                          <button
                            type="button"
                            onClick={() => handleRemoveSkill(skill)}
                            className="ml-1 hover:text-red-500"
                          >
                            <X className="size-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2 justify-end pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsEditing(false);
                        form.reset();
                        setTempSkills(user.skills || []);
                      }}
                      disabled={isPending}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isPending}>
                      Save Changes
                    </Button>
                  </div>
                </form>
              </Form>
            ) : (
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-neutral-700">Additional Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-neutral-500">Native Place</label>
                    <p className="text-sm font-medium">{user.native || "N/A"}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-neutral-500">Mobile Number</label>
                    <p className="text-sm font-medium">{user.mobileNo || "N/A"}</p>
                  </div>
                  <div className="col-span-2">
                    <label className="text-xs font-medium text-neutral-500">Experience</label>
                    <p className="text-sm font-medium">
                      {user.experience ? `${user.experience} years` : "N/A"}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <label className="text-xs font-medium text-neutral-500">Skills</label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {user.skills && user.skills.length > 0 ? (
                        user.skills.map((skill) => (
                          <Badge key={skill} variant="secondary">
                            {skill}
                          </Badge>
                        ))
                      ) : (
                        <p className="text-sm text-neutral-400">No skills added</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
