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
import { sendOTP, verifyOTP } from "@/lib/auth";
import { Loader2, Mail, Shield, ArrowLeft } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const emailSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
});

// No OTP schema needed for magic link - user just clicks the link

// Session management
const setSession = (participantId: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('participant_session', participantId);
  }
};

export function ParticipantOTPLoginForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<'email' | 'magic-link-sent'>('email');
  const [userEmail, setUserEmail] = useState('');

  const emailForm = useForm<z.infer<typeof emailSchema>>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: "" },
  });

  const otpForm = useForm<z.infer<typeof otpSchema>>({
    resolver: zodResolver(otpSchema),
    defaultValues: { otp: "" },
  });

  const onEmailSubmit = async (values: z.infer<typeof emailSchema>) => {
    setIsLoading(true);
    setUserEmail(values.email);
    
    try {
      const result = await sendOTP(values.email);
      
      if (result.success) {
        toast({
          title: "OTP Sent",
          description: result.message,
        });
        setStep('otp');
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
        description: "Failed to send OTP. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onOTPSubmit = async (values: z.infer<typeof otpSchema>) => {
    setIsLoading(true);
    
    try {
      const result = await verifyOTP(userEmail, values.otp);
      
      if (result.success && result.participant) {
        toast({
          title: "Login Successful",
          description: "Welcome back!",
        });
        setSession(result.participant.id);
        router.push("/submit");
      } else {
        toast({
          variant: "destructive",
          title: "Login Failed",
          description: result.message,
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to verify OTP. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resendOTP = async () => {
    setIsLoading(true);
    try {
      const result = await sendOTP(userEmail);
      toast({
        title: result.success ? "OTP Resent" : "Error",
        description: result.message,
        variant: result.success ? "default" : "destructive"
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to resend OTP. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const goBack = () => {
    setStep('email');
    setUserEmail('');
    emailForm.reset();
    otpForm.reset();
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <div className="p-3 bg-primary/10 rounded-full">
            {step === 'email' ? (
              <Mail className="h-8 w-8 text-primary" />
            ) : (
              <Shield className="h-8 w-8 text-primary" />
            )}
          </div>
        </div>
        <CardTitle className="text-2xl">
          {step === 'email' ? 'Participant Login' : 'Verify OTP'}
        </CardTitle>
        <CardDescription>
          {step === 'email' 
            ? 'Enter your registered email address to receive an OTP'
            : `Enter the 6-digit OTP sent to ${userEmail}`
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
                        placeholder="you@example.com" 
                        type="email"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Send OTP
              </Button>
            </form>
          </Form>
        ) : (
          <div className="space-y-4">
            <Form {...otpForm}>
              <form onSubmit={otpForm.handleSubmit(onOTPSubmit)} className="space-y-4">
                <FormField
                  control={otpForm.control}
                  name="otp"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Enter OTP</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="123456" 
                          type="text"
                          maxLength={6}
                          className="text-center text-2xl tracking-widest"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Verify & Login
                </Button>
              </form>
            </Form>
            
            <div className="space-y-2">
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={resendOTP}
                disabled={isLoading}
              >
                Resend OTP
              </Button>
              <Button 
                variant="ghost" 
                className="w-full" 
                onClick={goBack}
                disabled={isLoading}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Email
              </Button>
            </div>
          </div>
        )}
        
        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            Don't have an account?{' '}
            <Button 
              variant="link" 
              className="p-0 h-auto text-primary"
              onClick={() => router.push('/register')}
            >
              Register here
            </Button>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
