'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function MagicLinkPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [participant, setParticipant] = useState<any>(null);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get the session from Supabase Auth
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          setStatus('error');
          setMessage('Authentication error. Please try again.');
          return;
        }

        if (!session || !session.user) {
          setStatus('error');
          setMessage('No active session found. Please try logging in again.');
          return;
        }

        // Get participant data from participants table
        const { data: participantData, error: participantError } = await supabase
          .from('participants')
          .select('id, name, email, login_enabled')
          .eq('email', session.user.email)
          .single();

        if (participantError || !participantData) {
          setStatus('error');
          setMessage('Participant not found. Please contact support.');
          return;
        }

        // Check if login is still enabled
        if (participantData.login_enabled === false) {
          setStatus('error');
          setMessage('Login not enabled by admin. Please contact the administrator.');
          return;
        }

        setStatus('success');
        setMessage('Login successful! Redirecting to dashboard...');
        setParticipant(participantData);
        
        // Store session data
        localStorage.setItem('participant', JSON.stringify(participantData));
        
        // Update last login
        await supabase
          .from('participants')
          .update({ 
            last_login: new Date().toISOString()
          })
          .eq('id', participantData.id);
        
        // Redirect to dashboard after 2 seconds
        setTimeout(() => {
          router.push('/participant-dashboard');
        }, 2000);

      } catch (error) {
        console.error('Error handling auth callback:', error);
        setStatus('error');
        setMessage('An error occurred. Please try again.');
      }
    };

    handleAuthCallback();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Login Verification</CardTitle>
          <CardDescription>
            Verifying your login link...
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {status === 'loading' && (
            <div className="flex items-center justify-center space-x-2">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span>Verifying your login link...</span>
            </div>
          )}

          {status === 'success' && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                {message}
              </AlertDescription>
            </Alert>
          )}

          {status === 'error' && (
            <Alert className="border-red-200 bg-red-50">
              <XCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                {message}
              </AlertDescription>
            </Alert>
          )}

          {status === 'error' && (
            <div className="space-y-2">
              <Button 
                onClick={() => router.push('/login')} 
                className="w-full"
              >
                Try Again
              </Button>
              <Button 
                onClick={() => router.push('/')} 
                variant="outline" 
                className="w-full"
              >
                Go Home
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
