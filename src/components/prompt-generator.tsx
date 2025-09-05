"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useState } from 'react';
import { generateContestPrompt, GenerateContestPromptOutput } from '@/ai/flows/automated-prompt-generation';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Wand2, CheckCircle } from "lucide-react";

const formSchema = z.object({
  contestType: z.string().min(2, { message: "Contest type is required." }),
  themePreferences: z.string().min(5, { message: "Theme preferences must be at least 5 characters." }),
  difficultyLevel: z.enum(['easy', 'medium', 'hard']),
});

export function PromptGenerator() {
  const { toast } = useToast();
  const { activePrompt, setActivePrompt } = useContest();
  const [isLoading, setIsLoading] = useState(false);
  const [generatedPrompt, setGeneratedPrompt] = useState<GenerateContestPromptOutput | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      contestType: "Photo",
      themePreferences: "Abstract concepts, nature, and technology",
      difficultyLevel: "medium",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setGeneratedPrompt(null);
    try {
      const result = await generateContestPrompt(values);
      setGeneratedPrompt(result);
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Generation Failed",
        description: "An error occurred while generating the prompt.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  const handleSetAsActive = () => {
    if (generatedPrompt) {
      setActivePrompt(generatedPrompt);
      toast({
        title: "Prompt Activated!",
        description: "This is now the active prompt for submissions.",
        className: "bg-accent text-accent-foreground"
      });
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Generator Settings</CardTitle>
          <CardDescription>Define the criteria for the prompt.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="contestType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contest Type</FormLabel>
                    <Input placeholder="e.g., Photo, Writing, Video" {...field} />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="themePreferences"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Theme Preferences</FormLabel>
                    <Input placeholder="e.g., futuristic, vintage, emotion" {...field} />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="difficultyLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Difficulty Level</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a difficulty" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="easy">Easy</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="hard">Hard</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                Generate Prompt
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card className="flex flex-col">
        <CardHeader>
          <CardTitle>Generated Prompt</CardTitle>
          <CardDescription>Review the AI-generated prompt below.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-1 flex-col justify-center">
          {isLoading && (
             <div className="flex flex-col items-center justify-center text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin" />
                <p className="mt-2">Generating creative prompt...</p>
             </div>
          )}
          {!isLoading && !generatedPrompt && !activePrompt && (
            <div className="text-center text-muted-foreground">
                <p>Your generated prompt will appear here.</p>
            </div>
          )}
          
          {(generatedPrompt || activePrompt) && (
            <div className="space-y-4">
                <blockquote className="border-l-2 border-primary pl-6 italic text-lg font-semibold">
                    {(generatedPrompt || activePrompt)?.prompt}
                </blockquote>
                <p className="text-sm text-muted-foreground">
                    <span className="font-bold">Explanation: </span>
                    {(generatedPrompt || activePrompt)?.explanation}
                </p>
                {generatedPrompt && (
                    <Button onClick={handleSetAsActive} className="w-full bg-accent hover:bg-accent/90">
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Set as Active Prompt
                    </Button>
                )}
            </div>
          )}

           {!isLoading && !generatedPrompt && activePrompt && (
                <div className="mt-4 rounded-md border border-accent/50 bg-accent/10 p-4 text-sm text-accent-foreground/80">
                    <p><span className="font-bold text-accent">Active Prompt:</span> The prompt above is currently active for all participants.</p>
                </div>
           )}
        </CardContent>
      </Card>
    </div>
  );
}
