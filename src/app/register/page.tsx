"use client";
import Link from 'next/link';
import { RegistrationForm } from '@/components/auth/registration-form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Logo } from '@/components/logo';
import { useContest } from '@/context/ContestContext';
import { Lock } from 'lucide-react';

export default function RegisterPage() {
  const { registrationOpen } = useContest();

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="flex justify-center">
          <Logo />
        </div>
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="font-headline text-2xl">Create an Account</CardTitle>
            <CardDescription>Enter your details to register for the contest.</CardDescription>
          </CardHeader>
          <CardContent>
            {registrationOpen ? (
              <RegistrationForm />
            ) : (
              <Alert>
                <Lock className="h-4 w-4" />
                <AlertTitle>Registration Closed</AlertTitle>
                <AlertDescription>
                  We are not currently accepting new registrations. Please check back later!
                </AlertDescription>
              </Alert>
            )}
            <div className="mt-4 text-center text-sm">
              Already have an account?{' '}
              <Link href="/login" className="font-medium text-primary underline-offset-4 hover:underline">
                Sign in
              </Link>
            </div>
            <div className="mt-4 text-center text-sm">
                <Link href="/" className="font-medium text-muted-foreground underline-offset-4 hover:underline">
                    Back to Home
                </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
