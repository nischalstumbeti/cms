
"use client";

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { RegistrationForm } from '@/components/auth/registration-form';
import { NoticeBoard } from '@/components/notice-board';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useContest } from '@/context/ContestContext';
import { Skeleton } from '@/components/ui/skeleton';

export default function Home() {
    const { branding } = useContest();
  return (
    <div className="flex min-h-screen flex-col">
      <header className="container mx-auto flex h-20 items-center justify-between px-4 md:px-6 bg-transparent">
        <div className="flex items-center gap-4">
          <Image src="https://picsum.photos/40/40" alt="Govt Logo" width={40} height={40} className="rounded-full" data-ai-hint="emblem logo" />
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
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-start">
          <div className="space-y-6">
            <NoticeBoard />
          </div>
          <div className="space-y-6">
            <Card className="glass-card">
                <CardHeader className="text-center">
                    <CardTitle className="font-headline text-3xl font-bold tracking-tight">Register for the Contest</CardTitle>
                    <CardDescription className="text-muted-foreground pt-2">Fill out the form below to participate in the World Tourism Day 2025 celebration.</CardDescription>
                </CardHeader>
                <CardContent>
                    <RegistrationForm />
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
