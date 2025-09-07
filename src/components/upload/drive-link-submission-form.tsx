"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useContest } from '@/context/ContestContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, Link, ExternalLink, Plus, X } from 'lucide-react';

const formSchema = z.object({
  link: z.string().url("Please enter a valid URL"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  terms: z.boolean().refine(val => val, { message: "You must accept the terms and conditions." }),
});

interface DriveLinkSubmissionFormProps {
  participantId: string;
  onSubmissionComplete: () => void;
}

export function DriveLinkSubmissionForm({ participantId, onSubmissionComplete }: DriveLinkSubmissionFormProps) {
  const { addDriveLinkSubmission, findSubmissionByParticipantId } = useContest();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const existingSubmission = findSubmissionByParticipantId(participantId);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      link: '',
      description: '',
      terms: false,
    },
  });

  // If user already has a submission, show message instead of form
  if (existingSubmission) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-600">
            <Link className="h-5 w-5" />
            Submission Already Submitted
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800">
                You have already submitted a drive link. Only one submission per participant is allowed.
              </p>
            </div>
            {existingSubmission.link && (
              <div className="space-y-2">
                <h4 className="font-medium">Your Submitted Link:</h4>
                <a 
                  href={existingSubmission.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline block break-all"
                >
                  {existingSubmission.link}
                </a>
                <div className="text-sm text-muted-foreground">
                  Status: <span className={`px-2 py-1 rounded text-xs ${
                    existingSubmission.submissionStatus === 'approved' ? 'bg-green-100 text-green-800' :
                    existingSubmission.submissionStatus === 'rejected' ? 'bg-red-100 text-red-800' :
                    existingSubmission.submissionStatus === 'cancelled' ? 'bg-gray-100 text-gray-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {existingSubmission.submissionStatus}
                  </span>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    try {
      const result = await addDriveLinkSubmission({
        participantId,
        link: values.link,
        description: values.description,
        submissionType: 'photography', // Default to photography as per schema
        submissionStatus: 'pending'
      });

      if (result.success) {
        toast({
          title: "Submission Successful!",
          description: "Your drive link has been submitted successfully.",
        });
        onSubmissionComplete();
      } else {
        toast({
          variant: "destructive",
          title: "Submission Failed",
          description: result.message || "An error occurred while submitting your link.",
        });
      }
    } catch (error) {
      console.error('Submission error:', error);
      toast({
        variant: "destructive",
        title: "Submission Failed",
        description: "An error occurred while submitting your link.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Link className="h-5 w-5" />
          Drive Link Submission
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="link"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Drive Link URL</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          placeholder="https://drive.google.com/file/d/..."
                          {...field}
                          className="pr-10"
                        />
                        <ExternalLink className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      </div>
                    </FormControl>
                    <FormDescription>
                      Paste your Google Drive, Dropbox, or other cloud storage link here
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe what this submission contains..."
                        className="min-h-[80px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Provide a brief description of the content in this link
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="terms"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      I accept the terms and conditions
                    </FormLabel>
                    <FormDescription>
                      You agree to our contest rules and data usage policy. By submitting these links, you confirm that you have the right to share this content.
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Link className="mr-2 h-4 w-4" />
                  Submit Drive Link
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
