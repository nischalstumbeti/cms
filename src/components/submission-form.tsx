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
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Upload, BadgePercent, MessageSquareQuote } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";

const formSchema = z.object({
  submissionFile: z.any().refine(file => file?.[0], "A submission file is required."),
  terms: z.boolean().refine(val => val, { message: "You must accept the terms and conditions." }),
});

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
  const { addSubmission, updateSubmission, findSubmissionByParticipantId } = useContest();
  const [isLoading, setIsLoading] = useState(false);
  
  const existingSubmission = findSubmissionByParticipantId(participantId);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      submissionFile: undefined,
      terms: false,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
        const file = values.submissionFile[0];
        const submissionDataUri = await fileToDataUri(file);

        await addSubmission({
            participantId,
            fileDataUri: submissionDataUri,
            fileName: file.name
        });

        toast({
            title: "Analyzing Submission...",
            description: "Our AI is assessing adherence to the prompt. This may take a moment."
        });

        const result = await assessSubmissionAdherence({ submissionDataUri, promptText });
        
        await updateSubmission(participantId, {
            adherenceScore: result.adherenceScore,
            rationale: result.rationale
        });

        toast({
            title: "Analysis Complete!",
            description: "Your submission has been successfully processed and analyzed.",
            className: "bg-accent text-accent-foreground"
        });

    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Submission Failed",
        description: "An error occurred during submission or analysis.",
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
        <FormField
          control={form.control}
          name="submissionFile"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Your Entry</FormLabel>
              <FormControl>
                 <Input type="file" onChange={(e) => field.onChange(e.target.files)} />
              </FormControl>
              <FormDescription>Upload your photo, video, or document.</FormDescription>
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
          Submit & Analyze Entry
        </Button>
      </form>
    </Form>
  );
}
