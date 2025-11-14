"use client";

import { useState } from "react";
import { useGetProfiles } from "@/features/profiles/api/use-get-profiles";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader, Search, UserCog, Pencil, Trash2 } from "lucide-react";
import { EditProfileModal } from "@/features/profiles/components/edit-profile-modal";
import { DeleteProfileDialog } from "@/features/profiles/components/delete-profile-dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface Profile {
  id: string;
  name: string;
  email: string;
  mobileNo?: string | null;
  native?: string | null;
  designation?: string | null;
  department?: string | null;
  experience?: number | null;
  dateOfBirth?: Date | null;
  dateOfJoining?: Date | null;
  skills?: string[] | null;
}

export default function EditProfilePage() {
  const { data: profiles, isLoading } = useGetProfiles();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);

  const filteredProfiles = profiles?.filter((profile: Profile) => {
    const query = searchQuery.toLowerCase();
    return (
      profile.name.toLowerCase().includes(query) ||
      profile.email.toLowerCase().includes(query) ||
      profile.designation?.toLowerCase().includes(query) ||
      profile.department?.toLowerCase().includes(query)
    );
  });

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex flex-col gap-y-4 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserCog className="size-6" />
            <h1 className="text-2xl font-bold">Edit Profile</h1>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Search Employees</CardTitle>
            <CardDescription>
              Search and manage employee profiles
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, designation, or department..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4">
          {filteredProfiles && filteredProfiles.length > 0 ? (
            filteredProfiles.map((profile: Profile) => (
              <Card key={profile.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 flex-1">
                      <Avatar className="size-12 border border-neutral-300">
                        <AvatarFallback className="bg-neutral-200 text-lg font-medium text-neutral-500">
                          {profile.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-lg">{profile.name}</h3>
                          {profile.designation && (
                            <Badge variant="secondary" className="capitalize">
                              {profile.designation.replace(/_/g, " ")}
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>{profile.email}</span>
                          {profile.mobileNo && <span>• {profile.mobileNo}</span>}
                          {profile.department && (
                            <span>• {profile.department.charAt(0).toUpperCase() + profile.department.slice(1)}</span>
                          )}
                          {profile.experience !== null && profile.experience !== undefined && (
                            <span>• {profile.experience} years exp</span>
                          )}
                        </div>

                        {profile.skills && profile.skills.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {profile.skills.slice(0, 5).map((skill: string) => (
                              <Badge key={skill} variant="outline" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                            {profile.skills.length > 5 && (
                              <Badge variant="outline" className="text-xs">
                                +{profile.skills.length - 5} more
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedUserId(profile.id)}
                      >
                        <Pencil className="size-4 mr-2" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDeleteUserId(profile.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <p className="text-muted-foreground">
                  {searchQuery ? "No employees found matching your search." : "No employees found."}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {selectedUserId && (
        <EditProfileModal
          userId={selectedUserId}
          open={!!selectedUserId}
          onOpenChange={(open) => !open && setSelectedUserId(null)}
        />
      )}

      {deleteUserId && (
        <DeleteProfileDialog
          userId={deleteUserId}
          open={!!deleteUserId}
          onOpenChange={(open) => !open && setDeleteUserId(null)}
        />
      )}
    </div>
  );
}
