import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const error = requestUrl.searchParams.get('error');

  // Handle error cases
  if (error) {
    console.error('Auth callback error:', error);
    return NextResponse.redirect(`${requestUrl.origin}/login?error=${error}`);
  }

  if (code) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: any) {
            cookieStore.set({ name, value, ...options });
          },
          remove(name: string, options: any) {
            cookieStore.set({ name, value: '', ...options });
          },
        },
      }
    );
    
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (error) {
      console.error('Auth callback error:', error);
      return NextResponse.redirect(`${requestUrl.origin}/login?error=auth_callback_error`);
    }

    // Get participant data after successful authentication
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
          return NextResponse.redirect(`${requestUrl.origin}/login?error=participant_not_found`);
        }

        // Link the participant with the auth user
        const { error: updateError } = await supabase
          .from('participants')
          .update({ auth_id: data.user.id })
          .eq('id', participantByEmail.id);

        if (updateError) {
          console.error('Error linking participant with auth:', updateError);
          return NextResponse.redirect(`${requestUrl.origin}/login?error=auth_link_failed`);
        }

        participant = { ...participantByEmail, auth_id: data.user.id };
      }

      // Create a page that sets the session and redirects
      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Authenticating...</title>
          </head>
          <body>
            <script>
              // Set the participant session in localStorage
              localStorage.setItem('participant_session', '${participant.id}');
              // Redirect to submit page
              window.location.href = '${requestUrl.origin}/submit';
            </script>
            <div style="text-align: center; margin-top: 50px;">
              <h2>Authenticating...</h2>
              <p>Please wait while we log you in.</p>
            </div>
          </body>
        </html>
      `;

      return new NextResponse(html, {
        headers: {
          'Content-Type': 'text/html',
        },
      });
    }
  }

  // Fallback redirect if no code or user
  return NextResponse.redirect(`${requestUrl.origin}/login?error=invalid_auth`);
}