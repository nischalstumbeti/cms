import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { token, email } = await request.json();

    if (!token || !email) {
      return NextResponse.json(
        { success: false, message: 'Token and email are required' },
        { status: 400 }
      );
    }

    // Verify magic link using Supabase Auth
    const { data, error } = await supabase.auth.verifyOtp({
      email: email,
      token: token,
      type: 'magiclink'
    });

    if (error) {
      console.error('Magic link verification error:', error);
      return NextResponse.json(
        { success: false, message: 'Invalid or expired login link' },
        { status: 400 }
      );
    }

    if (!data.user) {
      return NextResponse.json(
        { success: false, message: 'Invalid login link' },
        { status: 400 }
      );
    }

    // Get participant data
    const { data: participant, error: participantError } = await supabase
      .from('participants')
      .select('id, name, email, login_enabled')
      .eq('email', email)
      .single();

    if (participantError || !participant) {
      return NextResponse.json(
        { success: false, message: 'Participant not found' },
        { status: 404 }
      );
    }

    // Check if login is still enabled
    if (participant.login_enabled === false) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Login not enabled by admin. Please contact the administrator.' 
        },
        { status: 403 }
      );
    }

    // Update last login
    await supabase
      .from('participants')
      .update({ 
        last_login: new Date().toISOString()
      })
      .eq('id', participant.id);

    return NextResponse.json({
      success: true,
      message: 'Login successful',
      participant: {
        id: participant.id,
        name: participant.name,
        email: participant.email
      }
    });

  } catch (error) {
    console.error('Error verifying magic link:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
