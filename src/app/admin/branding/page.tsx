
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useEffect, useState } from "react";
import { useContest } from "@/context/ContestContext";
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  headerTitle: z.string().min(5, "Header title must be at least 5 characters."),
  headerSubtitle: z.string().min(5, "Header subtitle must be at least 5 characters."),
  footerText: z.string().min(10, "Footer text must be at least 10 characters."),
});

export default function BrandingPage() {
  const { branding, updateBranding } = useContest();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      headerTitle: "",
      headerSubtitle: "",
      footerText: "",
    },
  });

  useEffect(() => {
    if (branding) {
      form.reset(branding);
    }
  }, [branding, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    try {
      await updateBranding(values);
      toast({
        title: "Success",
        description: "Branding has been updated successfully.",
        className: "bg-accent text-accent-foreground",
      });
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: "An error occurred while updating the branding.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="font-headline text-3xl font-bold tracking-tight">Branding</h1>
      <p className="text-muted-foreground">
        Manage the look and feel of your contest portal. Update logos, header text, and footer links.
      </p>
      <Card>
        <CardHeader>
          <CardTitle>Homepage Branding</CardTitle>
          <CardDescription>Customize the content of the header and footer.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="headerTitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Header Title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Official Contest Portal" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="headerSubtitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Header Subtitle</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Your Organization Name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="footerText"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Footer Text</FormLabel>
                    <FormControl>
                      <Input placeholder={`e.g., © ${new Date().getFullYear()} Your Org. All rights reserved.`} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading} className="w-full md:w-auto">
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
