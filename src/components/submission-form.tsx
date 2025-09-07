"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useState } from 'react';
import { assessSubmissionAdherence } from '@/ai/flows/submission-adherence-assessment';
import { useContest } from '@/context/ContestContext';

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Upload, BadgePercent, MessageSquareQuote } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";

const createFormSchema = (isDriveLinksMode: boolean) => {
  if (isDriveLinksMode) {
    return z.object({
      driveLink: z.string().min(1, "Drive link is required."),
      description: z.string().min(10, "Description must be at least 10 characters."),
      terms: z.boolean().refine(val => val, { message: "You must accept the terms and conditions." }),
    });
  } else {
    return z.object({
      submissionType: z.enum(["file", "drive"], { required_error: "Please select a submission type." }),
      submissionFile: z.any().optional(),
      driveLink: z.string().optional(),
      description: z.string().min(10, "Description must be at least 10 characters."),
      terms: z.boolean().refine(val => val, { message: "You must accept the terms and conditions." }),
    }).refine((data) => {
      if (data.submissionType === "file") {
        return data.submissionFile?.[0];
      } else if (data.submissionType === "drive") {
        return data.driveLink && data.driveLink.trim().length > 0;
      }
      return false;
    }, {
      message: "Please provide either a file upload or a Google Drive link.",
      path: ["submissionFile"]
    });
  }
};

interface SubmissionFormProps {
    promptText: string;
    participantId: string;
}

const fileToDataUri = (file: File) => new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
});

export function SubmissionForm({ promptText, participantId }: SubmissionFormProps) {
  const { toast } = useToast();
  const { addSubmission, updateSubmission, findSubmissionByParticipantId, submissionControl } = useContest();
  const [isLoading, setIsLoading] = useState(false);
  
  const existingSubmission = findSubmissionByParticipantId(participantId);
  const isDriveLinksMode = submissionControl?.collectionMode === 'drive_links';

  const formSchema = createFormSchema(isDriveLinksMode);
  const form = useForm({
    resolver: zodResolver(formSchema as any),
    defaultValues: isDriveLinksMode ? {
      driveLink: "",
      description: "",
      terms: false,
    } : {
      submissionType: "drive",
      submissionFile: undefined,
      driveLink: "",
      description: "",
      terms: false,
    },
  });

  async function onSubmit(values: any) {
    setIsLoading(true);
    try {
        let fileDataUri: string;
        let fileName: string;
        let submissionType: 'file' | 'drive_link';
        let driveLink: string | undefined;

        if (isDriveLinksMode) {
            // In drive links mode, only drive link is available
            fileDataUri = values.driveLink;
            fileName = `Drive Link - ${values.description.substring(0, 50)}...`;
            submissionType = 'drive_link';
            driveLink = values.driveLink;
        } else {
            // In normal mode, handle both file and drive link
            if ('submissionType' in values && values.submissionType === "file" && values.submissionFile?.[0]) {
                const file = values.submissionFile[0];
                fileDataUri = await fileToDataUri(file);
                fileName = file.name;
                submissionType = 'file';
            } else if ('submissionType' in values && values.submissionType === "drive" && values.driveLink) {
                fileDataUri = values.driveLink;
                fileName = `Google Drive Link - ${values.description.substring(0, 50)}...`;
                submissionType = 'drive_link';
                driveLink = values.driveLink;
            } else {
                throw new Error("Invalid submission data");
            }
        }

        await addSubmission({
            participantId,
            fileDataUri: fileDataUri,
            fileName: fileName,
            submissionType: submissionType,
            driveLink: driveLink
        });

        toast({
            title: "Submission Received!",
            description: "Your submission has been successfully recorded. Thank you for participating!"
        });

        // Note: AI analysis is disabled for Google Drive links as we can't access the actual file content
        // You can enable this if you implement a way to download and analyze files from Google Drive

    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Submission Failed",
        description: "An error occurred during submission. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  if (existingSubmission?.adherenceScore !== undefined) {
    const scorePercentage = Math.round(existingSubmission.adherenceScore * 100);
    return (
        <div className="space-y-6">
            <h3 className="font-headline text-xl font-semibold text-center">Your Submission Analysis</h3>
            <Card>
                <CardContent className="p-6 space-y-4">
                    <div className="space-y-2">
                        <div className="flex justify-between items-center font-medium">
                            <span className="flex items-center gap-2"><BadgePercent className="h-4 w-4 text-primary"/> Adherence Score</span>
                            <span>{scorePercentage}%</span>
                        </div>
                        <Progress value={scorePercentage} className="w-full" />
                    </div>
                    <div className="space-y-2">
                        <h4 className="flex items-center gap-2 font-medium"><MessageSquareQuote className="h-4 w-4 text-primary"/> AI Rationale</h4>
                        <p className="text-sm text-muted-foreground p-4 bg-muted/50 rounded-md border">
                            {existingSubmission.rationale}
                        </p>
                    </div>
                     <p className="text-center text-xs text-muted-foreground pt-4">You have successfully submitted your entry for this contest.</p>
                </CardContent>
            </Card>
        </div>
    )
  }


  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {!isDriveLinksMode && (
          <FormField
            control={form.control}
            name="submissionType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Submission Method</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex flex-col space-y-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="drive" id="drive" />
                      <Label htmlFor="drive" className="flex flex-col">
                        <span className="font-medium">Google Drive Link (Recommended)</span>
                        <span className="text-sm text-muted-foreground">
                          Upload your work to Google Drive and share the link
                        </span>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="file" id="file" />
                      <Label htmlFor="file" className="flex flex-col">
                        <span className="font-medium">Direct File Upload</span>
                        <span className="text-sm text-muted-foreground">
                          Upload your file directly (max 10MB)
                        </span>
                      </Label>
                    </div>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {!isDriveLinksMode && form.watch("submissionType") === "file" && (
          <FormField
            control={form.control}
            name="submissionFile"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Your Entry File</FormLabel>
                <FormControl>
                  <Input type="file" onChange={(e) => field.onChange(e.target.files)} />
                </FormControl>
                <FormDescription>Upload your photo, video, or document.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {(!isDriveLinksMode && form.watch("submissionType") === "drive") || isDriveLinksMode ? (
          <FormField
            control={form.control}
            name="driveLink"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Drive Link</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="https://drive.google.com/file/d/..." 
                    {...field} 
                  />
                </FormControl>
                <FormDescription>
                  {isDriveLinksMode 
                    ? "Paste your drive link here. Make sure the link is accessible."
                    : "Paste your Google Drive shareable link here. Make sure the link is set to 'Anyone with the link can view'."
                  }
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        ) : null}

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe your submission and how it relates to the contest theme..."
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Provide a brief description of your work and how it addresses the contest prompt.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

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
                  I accept the terms and conditions.
                </FormLabel>
                <FormDescription>
                    You agree to our contest rules and data usage policy.
                </FormDescription>
              </div>
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
          Submit Entry
        </Button>
      </form>
    </Form>
  );
}
