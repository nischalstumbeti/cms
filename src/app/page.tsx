
"use client";

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { DynamicRegistrationForm } from '@/components/auth/dynamic-registration-form';
import { HomepageContentDisplay } from '@/components/cms/content-display';
import { NoticeBoard } from '@/components/notice-board';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useContest } from '@/context/ContestContext';
import { Skeleton } from '@/components/ui/skeleton';
import { Lock, Mail, Phone } from 'lucide-react';

export default function Home() {
    const { branding, registrationControl } = useContest();
  return (
    <div className="flex min-h-screen flex-col">
      <header className="container mx-auto flex h-20 items-center justify-between px-4 md:px-6 bg-transparent">
        <div className="flex items-center gap-4">
          <Image src="https://upload.wikimedia.org/wikipedia/commons/thumb/f/f4/Emblem_of_Andhra_Pradesh.png/500px-Emblem_of_Andhra_Pradesh.png" alt="Govt Logo" width={70} height={65} className="rounded-full" data-ai-hint="emblem logo" />
          <div>
            {branding ? (
                <>
                 <div className="font-headline text-xl font-bold tracking-tight text-foreground">
                    {branding.headerTitle}
                 </div>
                 <p className="text-sm text-muted-foreground">{branding.headerSubtitle}</p>
                </>
            ) : (
                <div className='space-y-2'>
                    <Skeleton className='h-6 w-48' />
                    <Skeleton className='h-4 w-32' />
                </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="ghost" asChild>
            <Link href="/login">Participant Login</Link>
          </Button>
          <Button asChild>
            <Link href="/register">Register Now</Link>
          </Button>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 md:px-6 py-8 md:py-12">
        <div className="grid lg:grid-cols-3 gap-8 lg:gap-12 items-start">
          <div className="lg:col-span-1 space-y-6">
            <NoticeBoard />
            <HomepageContentDisplay />
          </div>
          <div className="lg:col-span-2 space-y-6">
            <Card className="glass-card">
                <CardHeader className="text-center">
                    <CardTitle className="font-headline text-3xl font-bold tracking-tight">Register for the Contest</CardTitle>
                    <CardDescription className="text-muted-foreground pt-2">Fill out the form below to participate in the World Tourism Day 2025 contest by Nellore District Administration.</CardDescription>
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
                </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <footer className="border-t bg-transparent">
        <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-4 py-6 md:flex-row md:px-6">
           {branding ? (
             <p className="text-sm text-muted-foreground">
                {branding.footerText}
             </p>
            ) : <Skeleton className='h-4 w-72' />}
          <nav className="flex gap-4">
            <Link href="/admin/login" className="text-sm text-muted-foreground hover:text-foreground">
              Admin Login
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
