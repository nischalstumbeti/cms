import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { sendOtpEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    console.log('Generate OTP request for email:', email);

    if (!email) {
      return NextResponse.json(
        { success: false, message: 'Email is required' },
        { status: 400 }
      );
    }

    // Check if participant exists and login is enabled
    const { data: participant, error: participantError } = await supabase
      .from('participants')
      .select('id, login_enabled')
      .eq('email', email)
      .single();

    if (participantError) {
      console.error('Error checking participant:', participantError);
      return NextResponse.json(
        { success: false, message: 'Participant not found or login disabled' },
        { status: 400 }
      );
    }

    if (!participant || participant.login_enabled === false) {
      return NextResponse.json(
        { success: false, message: 'Participant not found or login disabled' },
        { status: 400 }
      );
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log('Generated OTP for', email, ':', otp);

    // Try to use Supabase function if available, otherwise use direct insert
    try {
      const { error: rpcError } = await supabase.rpc('generate_participant_otp', {
        participant_email: email
      });

      if (rpcError) {
        console.log('RPC function not available, using direct approach:', rpcError.message);
        
        // Fallback: Clean up old OTPs and insert new one
        const { error: deleteError } = await supabase
          .from('participant_otps')
          .delete()
          .eq('email', email);

        if (deleteError) {
          console.error('Error deleting old OTPs:', deleteError);
          // Continue anyway, might be first time
        }

        const { error: insertError } = await supabase
          .from('participant_otps')
          .insert([{
            email: email,
            otp_code: otp,
            expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString() // 10 minutes
          }]);

        if (insertError) {
          console.error('Error inserting OTP:', insertError);
          return NextResponse.json(
            { 
              success: false, 
              message: 'Database not set up. Please run the migration script first.',
              error: insertError.message 
            },
            { status: 500 }
          );
        }
      }
    } catch (rpcError) {
      console.log('RPC function not available, using direct approach');
      
      // Fallback: Clean up old OTPs and insert new one
      const { error: deleteError } = await supabase
        .from('participant_otps')
        .delete()
        .eq('email', email);

      if (deleteError) {
        console.error('Error deleting old OTPs:', deleteError);
        // Continue anyway, might be first time
      }

      const { error: insertError } = await supabase
        .from('participant_otps')
        .insert([{
          email: email,
          otp_code: otp,
          expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString() // 10 minutes
        }]);

      if (insertError) {
        console.error('Error inserting OTP:', insertError);
        return NextResponse.json(
          { 
            success: false, 
            message: 'Database not set up. Please run the migration script first.',
            error: insertError.message 
          },
          { status: 500 }
        );
      }
    }

    // Send OTP via email
    try {
      await sendOtpEmail(email, otp);
      console.log('OTP email sent successfully to:', email);
    } catch (emailError) {
      console.error('Error sending email:', emailError);
      return NextResponse.json(
        { success: false, message: 'Failed to send OTP email' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'OTP sent to your email address.'
    });

  } catch (error) {
    console.error('Error in generate-otp API:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
