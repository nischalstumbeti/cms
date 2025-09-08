import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { success: false, message: 'Email is required' },
        { status: 400 }
      );
    }

    // Check if participant exists and login is enabled
    const { data: participant, error: participantError } = await supabase
      .from('participants')
      .select('id, name, email, login_enabled')
      .eq('email', email)
      .single();

    if (participantError) {
      console.error('Error checking participant:', participantError);
      return NextResponse.json(
        { success: false, message: 'Participant not found' },
        { status: 404 }
      );
    }

    if (!participant) {
      return NextResponse.json(
        { success: false, message: 'Participant not found' },
        { status: 404 }
      );
    }

    // Check if login is enabled
    if (participant.login_enabled === false) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Login not enabled by admin. Please contact the administrator to enable your account.' 
        },
        { status: 403 }
      );
    }

    // Send magic link using Supabase Auth
    const { data, error } = await supabase.auth.signInWithOtp({
      email: email,
      options: {
        
        shouldCreateUser: true // Don't create user if they don't exist
      }
    });

    if (error) {
      console.error('Magic link send error:', error);
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Magic link sent to your email address. Please check your inbox and click the link to login.'
    });

  } catch (error) {
    console.error('Error in participant login:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
