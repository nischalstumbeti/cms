"use client";

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ParticipantMagicLinkLoginForm } from '@/components/auth/participant-magic-link-login-form';
import { Logo } from '@/components/logo';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const handleAuthTokens = async () => {
      // Check if we have authentication tokens in the URL fragment
      const hash = window.location.hash;
      if (hash && hash.includes('access_token')) {
        setIsProcessing(true);
        
        try {
          // Parse the URL fragment to extract tokens
          const params = new URLSearchParams(hash.substring(1));
          const accessToken = params.get('access_token');
          const refreshToken = params.get('refresh_token');
          const expiresAt = params.get('expires_at');
          const tokenType = params.get('token_type');

          if (accessToken && refreshToken) {
            // Set the session using Supabase
            const { data, error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken
            });

            if (error) {
              console.error('Error setting session:', error);
              setIsProcessing(false);
              return;
            }

            if (data.user) {
              // First try to find participant by auth_id
              let { data: participant, error: participantError } = await supabase
                .from('participants')
                .select('*')
                .eq('auth_id', data.user.id)
                .single();

              // If not found by auth_id, try to find by email and link them
              if (participantError || !participant) {
                console.log('Participant not found by auth_id, trying to find by email:', data.user.email);
                
                const { data: participantByEmail, error: emailError } = await supabase
                  .from('participants')
                  .select('*')
                  .eq('email', data.user.email)
                  .single();

                if (emailError || !participantByEmail) {
                  console.error('Participant lookup error by email:', emailError);
                  setIsProcessing(false);
                  return;
                }

                // Link the participant with the auth user
                const { error: updateError } = await supabase
                  .from('participants')
                  .update({ auth_id: data.user.id })
                  .eq('id', participantByEmail.id);

                if (updateError) {
                  console.error('Error linking participant with auth:', updateError);
                  setIsProcessing(false);
                  return;
                }

                participant = { ...participantByEmail, auth_id: data.user.id };
              }

              // Set participant session in localStorage
              localStorage.setItem('participant_session', participant.id);
              
              // Clear the URL hash and redirect to participant dashboard
              window.history.replaceState({}, document.title, window.location.pathname);
              router.push('/participant-dashboard');
              return;
            }
          }
        } catch (error) {
          console.error('Error processing auth tokens:', error);
        } finally {
          setIsProcessing(false);
        }
      }

      // Check for error parameters
      const error = searchParams.get('error');
      if (error) {
        console.error('Auth error:', error);
        // Clear the error from URL
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.delete('error');
        window.history.replaceState({}, document.title, newUrl.pathname);
      }
    };

    handleAuthTokens();
  }, [router, searchParams]);

  if (isProcessing) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6 text-center">
          <div className="flex justify-center">
            <Logo />
          </div>
          <div className="flex items-center justify-center space-x-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Authenticating...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="flex justify-center">
          <Logo />
        </div>
        <ParticipantMagicLinkLoginForm />
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6 text-center">
          <div className="flex justify-center">
            <Logo />
          </div>
          <div className="flex items-center justify-center space-x-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading...</span>
          </div>
        </div>
      </div>
    }>
      <LoginPageContent />
    </Suspense>
  );
}
