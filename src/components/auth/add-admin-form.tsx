
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useState } from 'react';

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useContest } from "@/context/ContestContext";
import { Loader2, Shield, Settings, Users, FileText, Download, AlertTriangle } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(2, { message: "Name is required." }),
  email: z.string().email({ message: "A valid email is required." }),
  phone: z.string().min(10, { message: "A valid 10-digit phone number is required." }),
  department: z.string().min(2, { message: "Department is required." }),
  government: z.enum(['state', 'central', 'outsource', 'other'], { required_error: "Please select government type." }),
  place: z.string().min(2, { message: "Place is required." }),
  role: z.enum(['admin', 'superadmin'], { required_error: "Please select admin role." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
  confirmPassword: z.string().min(6, { message: "Please confirm your password." }),
  permissions: z.object({
    can_manage_announcements: z.boolean().default(true),
    can_manage_participants: z.boolean().default(true),
    can_manage_submissions: z.boolean().default(true),
    can_manage_admins: z.boolean().default(false),
    can_manage_settings: z.boolean().default(false),
    can_export_data: z.boolean().default(true),
  }).optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

interface AddAdminFormProps {
    onFinished: () => void;
}

export function AddAdminForm({ onFinished }: AddAdminFormProps) {
  const { toast } = useToast();
  const { addAdmin } = useContest();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      department: "",
      place: "",
      role: "admin",
      password: "",
      confirmPassword: "",
      permissions: {
        can_manage_announcements: true,
        can_manage_participants: true,
        can_manage_submissions: true,
        can_manage_admins: false,
        can_manage_settings: false,
        can_export_data: true,
      },
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    try {
        // Prepare admin data with permissions
        const adminData = {
          name: values.name,
          email: values.email,
          phone: values.phone,
          department: values.department,
          government: values.government,
          place: values.place,
          role: values.role,
          password: values.password,
          permissions: values.permissions
        };

        const { success, message } = await addAdmin(adminData);
        if (success) {
            toast({
                title: "Admin Created",
                description: `The new ${values.role} account has been created successfully. Password: ${values.password}`,
                className: "bg-accent text-accent-foreground",
            });
            onFinished();
        } else {
             toast({
                variant: "destructive",
                title: "Creation Failed",
                description: message || "Failed to create admin. Please check the console for details.",
            });
        }

    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
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
                <Input placeholder="admin.viewer@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone Number</FormLabel>
              <FormControl>
                <Input placeholder="9876543210" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="department"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Department</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Tourism Department" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
         <FormField
          control={form.control}
          name="government"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Government Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select government type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="state">State Government</SelectItem>
                  <SelectItem value="central">Central Government</SelectItem>
                  <SelectItem value="outsource">Outsourced Agency</SelectItem>
                  <SelectItem value="other">Other Organization</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="place"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Place</FormLabel>
              <FormControl>
                <Input placeholder="e.g., New Delhi" {...field} />
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
              <FormLabel>Admin Role</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select admin role" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="superadmin">Super Admin</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Password Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="Enter password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="Confirm password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Permissions Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Shield className="h-5 w-5" />
              Admin Permissions
            </CardTitle>
            <CardDescription>
              Configure what this admin can access and manage in the system
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="permissions.can_manage_announcements"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Manage Announcements
                    </FormLabel>
                    <div className="text-sm text-muted-foreground">
                      Create, edit, and delete announcements
                    </div>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="permissions.can_manage_participants"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Manage Participants
                    </FormLabel>
                    <div className="text-sm text-muted-foreground">
                      View, edit, and manage participant details
                    </div>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="permissions.can_manage_submissions"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Manage Submissions
                    </FormLabel>
                    <div className="text-sm text-muted-foreground">
                      Review and manage contest submissions
                    </div>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="permissions.can_manage_admins"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Manage Other Admins
                    </FormLabel>
                    <div className="text-sm text-muted-foreground">
                      Create and manage other admin accounts
                    </div>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="permissions.can_manage_settings"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      Manage System Settings
                    </FormLabel>
                    <div className="text-sm text-muted-foreground">
                      Configure system-wide settings and branding
                    </div>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="permissions.can_export_data"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base flex items-center gap-2">
                      <Download className="h-4 w-4" />
                      Export Data
                    </FormLabel>
                    <div className="text-sm text-muted-foreground">
                      Export participant and submission data
                    </div>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <div className="pt-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Admin
            </Button>
        </div>
      </form>
    </Form>
  );
}
