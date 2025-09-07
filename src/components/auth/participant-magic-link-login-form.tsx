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
import { sendOTP } from "@/lib/auth";
import { Loader2, Mail, Shield, ArrowLeft, CheckCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const emailSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
});

// Session management
const setSession = (participantId: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('participant_session', participantId);
  }
};

export function ParticipantMagicLinkLoginForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<'email' | 'magic-link-sent'>('email');
  const [userEmail, setUserEmail] = useState('');

  const emailForm = useForm<z.infer<typeof emailSchema>>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: "" },
  });

  const onEmailSubmit = async (values: z.infer<typeof emailSchema>) => {
    setIsLoading(true);
    setUserEmail(values.email);
    
    try {
      const result = await sendOTP(values.email);
      
      if (result.success) {
        toast({
          title: "Magic Link Sent",
          description: result.message,
        });
        setStep('magic-link-sent');
      } else {
        // Check if it's a "not found" error and show acknowledgement instead
        if (result.message === 'Participant not found') {
          toast({
            title: "Email Not Registered",
            description: "This email address is not registered. Please register first to access the portal.",
            variant: "default"
          });
        } else {
          toast({
            variant: "destructive",
            title: "Error",
            description: result.message,
          });
        }
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to send magic link. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resendMagicLink = async () => {
    setIsLoading(true);
    try {
      const result = await sendOTP(userEmail);
      toast({
        title: result.success ? "Magic Link Resent" : "Error",
        description: result.message,
        variant: result.success ? "default" : "destructive"
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to resend magic link. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const goBack = () => {
    setStep('email');
    setUserEmail('');
    emailForm.reset();
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <div className="p-3 bg-primary/10 rounded-full">
            {step === 'email' ? (
              <Mail className="h-8 w-8 text-primary" />
            ) : (
              <CheckCircle className="h-8 w-8 text-green-600" />
            )}
          </div>
        </div>
        <CardTitle className="text-2xl font-bold">
          {step === 'email' ? 'Participant Login' : 'Check Your Email'}
        </CardTitle>
        <CardDescription>
          {step === 'email' 
            ? 'Enter your email address to receive a magic link'
            : 'We\'ve sent a magic link to your email address'
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        {step === 'email' ? (
          <Form {...emailForm}>
            <form onSubmit={emailForm.handleSubmit(onEmailSubmit)} className="space-y-4">
              <FormField
                control={emailForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter your email address"
                        type="email"
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending Magic Link...
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    Send Magic Link
                  </>
                )}
              </Button>
            </form>
          </Form>
        ) : (
          <div className="space-y-4 text-center">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-2" />
              <h3 className="font-semibold text-green-800 mb-2">Access Link Sent</h3>
              <p className="text-sm text-green-700">
                We've sent a Access link to <strong>{userEmail}</strong>
              </p>
            </div>
            
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Please check your email and click the magic link to login. The link will redirect you back to the application.
              </p>
              
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={resendMagicLink}
                  disabled={isLoading}
                  className="flex-1"
                >
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Mail className="mr-2 h-4 w-4" />
                  )}
                  Resend Link
                </Button>
                
                <Button
                  variant="outline"
                  onClick={goBack}
                  className="flex-1"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
