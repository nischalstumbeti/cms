
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useRouter } from 'next/navigation';
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
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  email: z.string().email("A valid email is required."),
  password: z.string().min(1, { message: "Password is required." }),
});

// Mock user data with roles
const ADMIN_USERS = {
    "admin@contestzen.com": { pass: "99230041300", role: "superadmin" },
    "viewer@contestzen.com": { pass: "password123", role: "admin" },
};

const setAdminSession = (user: {email: string, role: string}) => {
    if (typeof window !== 'undefined') {
        localStorage.setItem('admin_session', JSON.stringify(user));
    }
}

export function AdminLoginForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    const adminUser = ADMIN_USERS[values.email as keyof typeof ADMIN_USERS];

    if (adminUser && values.password === adminUser.pass) {
        setAdminSession({email: values.email, role: adminUser.role});
        toast({ title: "Login Successful", description: "Redirecting to dashboard..." });
        router.push("/admin/dashboard");
    } else {
       toast({
        variant: "destructive",
        title: "Login Failed",
        description: "Invalid credentials.",
      });
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="admin@contestzen.com" {...field} />
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
                <Input type="password" placeholder="••••••••" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Sign In
        </Button>
      </form>
    </Form>
  );
}
