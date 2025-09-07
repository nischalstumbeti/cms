"use client";
import Link from 'next/link';
import { DynamicRegistrationForm } from '@/components/auth/dynamic-registration-form';
import { RegistrationContentDisplay } from '@/components/cms/content-display';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Logo } from '@/components/logo';
import { useContest } from '@/context/ContestContext';
import { Lock, Mail, Phone } from 'lucide-react';

export default function RegisterPage() {
  const { registrationControl } = useContest();

  return (
    <div className="min-h-screen bg-muted/40 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-center mb-8">
          <Logo />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Registration Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="text-center">
                <CardTitle className="font-headline text-2xl">Create an Account</CardTitle>
                <CardDescription>Enter your details to register for the contest.</CardDescription>
              </CardHeader>
              <CardContent>
                {registrationControl?.isOpen ? (
                  <DynamicRegistrationForm />
                ) : (
                  <Alert>
                    <Lock className="h-4 w-4" />
                    <AlertTitle>{registrationControl?.closedTitle || "Registration Closed"}</AlertTitle>
                    <AlertDescription className="space-y-4">
                      <p>{registrationControl?.closedMessage || "We are not currently accepting new registrations. Please check back later!"}</p>
                      
                      {registrationControl?.showContactInfo && (
                        <div className="mt-4 space-y-2">
                          <p className="text-sm font-medium">For more information, please contact us:</p>
                          <div className="flex flex-col gap-2">
                            {registrationControl.contactEmail && (
                              <div className="flex items-center gap-2 text-sm">
                                <Mail className="h-4 w-4" />
                                <a href={`mailto:${registrationControl.contactEmail}`} className="text-primary hover:underline">
                                  {registrationControl.contactEmail}
                                </a>
                              </div>
                            )}
                            {registrationControl.contactPhone && (
                              <div className="flex items-center gap-2 text-sm">
                                <Phone className="h-4 w-4" />
                                <a href={`tel:${registrationControl.contactPhone}`} className="text-primary hover:underline">
                                  {registrationControl.contactPhone}
                                </a>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
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

          {/* Content Sidebar */}
          <div className="lg:col-span-1">
            <RegistrationContentDisplay />
          </div>
        </div>
      </div>
    </div>
  );
}
