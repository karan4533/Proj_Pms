"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { UserPlus, Trash2, RefreshCw } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MemberRole } from "@/features/members/types";

const createUserSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.nativeEnum(MemberRole),
});

type CreateUserValues = z.infer<typeof createUserSchema>;

export const UserManagementClient = () => {
  const [isCreating, setIsCreating] = useState(false);
  const queryClient = useQueryClient();

  const form = useForm<CreateUserValues>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: MemberRole.EMPLOYEE,
    },
  });

  const createUserMutation = useMutation({
    mutationFn: async (values: CreateUserValues) => {
      const response = await fetch("/api/admin/create-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create user");
      }

      return response.json();
    },
    onSuccess: (data) => {
      toast.success("User created successfully!", {
        description: `Email: ${data.email}`,
      });
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["members"] });
    },
    onError: (error: Error) => {
      toast.error("Failed to create user", {
        description: error.message,
      });
    },
  });

  const onSubmit = (values: CreateUserValues) => {
    createUserMutation.mutate(values);
  };

  const handleQuickCreate = (role: MemberRole) => {
    const roleNames: Record<MemberRole, string> = {
      [MemberRole.ADMIN]: "admin",
      [MemberRole.PROJECT_MANAGER]: "manager",
      [MemberRole.TEAM_LEAD]: "teamlead",
      [MemberRole.EMPLOYEE]: "employee",
      [MemberRole.MANAGEMENT]: "management",
      [MemberRole.MEMBER]: "member",
    };

    const roleName = roleNames[role];
    
    form.setValue("name", `Test ${roleName.charAt(0).toUpperCase() + roleName.slice(1)}`);
    form.setValue("email", `${roleName}@test.pms`);
    form.setValue("password", `${roleName}123`);
    form.setValue("role", role);

    toast.info(`Pre-filled ${role} credentials`, {
      description: "Click 'Create User' to save",
    });
  };

  return (
    <div className="h-full flex flex-col p-6 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">User Management</h1>
        <p className="text-muted-foreground">
          Create test users with different roles for testing RBAC
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Quick Create Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="size-5" />
              Quick Create Test Users
            </CardTitle>
            <CardDescription>
              One-click to pre-fill credentials for each role
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => handleQuickCreate(MemberRole.ADMIN)}
            >
              <span className="mr-2">👑</span>
              Create Admin User
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => handleQuickCreate(MemberRole.PROJECT_MANAGER)}
            >
              <span className="mr-2">📊</span>
              Create Project Manager
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => handleQuickCreate(MemberRole.TEAM_LEAD)}
            >
              <span className="mr-2">🎯</span>
              Create Team Lead
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => handleQuickCreate(MemberRole.EMPLOYEE)}
            >
              <span className="mr-2">👷</span>
              Create Employee
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => handleQuickCreate(MemberRole.MANAGEMENT)}
            >
              <span className="mr-2">📈</span>
              Create Management User
            </Button>
          </CardContent>
        </Card>

        {/* Create User Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="size-5" />
              Create New User
            </CardTitle>
            <CardDescription>
              Add a new user with specific role and credentials
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="user@test.pms" type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input placeholder="minimum 6 characters" type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value={MemberRole.ADMIN}>
                            👑 Admin
                          </SelectItem>
                          <SelectItem value={MemberRole.PROJECT_MANAGER}>
                            📊 Project Manager
                          </SelectItem>
                          <SelectItem value={MemberRole.TEAM_LEAD}>
                            🎯 Team Lead
                          </SelectItem>
                          <SelectItem value={MemberRole.EMPLOYEE}>
                            👷 Employee
                          </SelectItem>
                          <SelectItem value={MemberRole.MANAGEMENT}>
                            📈 Management
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full"
                  disabled={createUserMutation.isPending}
                >
                  {createUserMutation.isPending ? (
                    <>Creating...</>
                  ) : (
                    <>
                      <UserPlus className="size-4 mr-2" />
                      Create User
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>

      {/* Info Card */}
      <Card className="border-blue-200 bg-blue-50/50 dark:bg-blue-950/20 dark:border-blue-900">
        <CardHeader>
          <CardTitle className="text-lg">🔐 Default Test Credentials</CardTitle>
          <CardDescription>
            Quick create buttons will use these credentials
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 text-sm font-mono">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Admin:</span>
              <span>admin@test.pms / admin123</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Manager:</span>
              <span>manager@test.pms / manager123</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Team Lead:</span>
              <span>teamlead@test.pms / teamlead123</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Employee:</span>
              <span>employee@test.pms / employee123</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Management:</span>
              <span>management@test.pms / management123</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
