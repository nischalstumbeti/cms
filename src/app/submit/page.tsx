"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useContest } from '@/context/ContestContext';
import { SubmissionForm } from '@/components/submission-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Logo } from '@/components/logo';
import { Lightbulb, Frown } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function SubmitPage() {
    const { activePrompt, participants } = useContest();
    const router = useRouter();
    const [participantId, setParticipantId] = useState<string | null>(null);

    useEffect(() => {
        const storedId = localStorage.getItem('participant_session');
        if (!storedId || !participants.find(p => p.id === storedId)) {
            router.replace('/login');
        } else {
            setParticipantId(storedId);
        }
    }, [router, participants]);

    if (!participantId) {
        return null; // or a loading skeleton
    }

    return (
        <div className="container mx-auto flex min-h-screen flex-col items-center justify-center p-4">
            <div className="w-full max-w-2xl space-y-6">
                <div className="flex justify-center">
                    <Logo />
                </div>
                {activePrompt ? (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 font-headline text-2xl">
                                <Lightbulb className="h-6 w-6 text-primary" />
                                Contest Submission
                            </CardTitle>
                            <CardDescription>Your creative challenge awaits. Submit your entry below.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="mb-6 space-y-2 rounded-lg border bg-muted/50 p-4">
                               <h3 className="font-semibold">Active Prompt:</h3>
                               <p className="text-lg font-medium text-primary">"{activePrompt.prompt}"</p>
                            </div>
                            <SubmissionForm promptText={activePrompt.prompt} participantId={participantId} />
                        </CardContent>
                    </Card>
                ) : (
                    <Alert>
                        <Frown className="h-4 w-4" />
                        <AlertTitle>No Active Contest</AlertTitle>
                        <AlertDescription>
                            The submission period hasn't started yet. Please check back later for the contest prompt.
                        </AlertDescription>
                         <div className="mt-4">
                            <Button onClick={() => router.push('/')}>Go to Homepage</Button>
                         </div>
                    </Alert>
                )}
            </div>
        </div>
    );
}
