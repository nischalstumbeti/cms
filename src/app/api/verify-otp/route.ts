import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { email, otp } = await request.json();
    console.log('Verify OTP request for email:', email, 'OTP:', otp);

    if (!email || !otp) {
      return NextResponse.json(
        { success: false, message: 'Email and OTP are required' },
        { status: 400 }
      );
    }

    // Check if participant exists and login is enabled
    const { data: participant, error: participantError } = await supabase
      .from('participants')
      .select('id, login_enabled')
      .eq('email', email)
      .single();

    if (participantError || !participant) {
      console.error('Error checking participant:', participantError);
      return NextResponse.json(
        { success: false, message: 'Participant not found' },
        { status: 404 }
      );
    }

    if (participant.login_enabled === false) {
      return NextResponse.json(
        { success: false, message: 'Participant login is disabled' },
        { status: 400 }
      );
    }

    // Try to use Supabase function if available, otherwise use direct query
    let isValid = false;
    
    try {
      const { data: rpcResult, error: rpcError } = await supabase.rpc('verify_participant_otp', {
        participant_email: email,
        input_otp: otp
      });

      if (rpcError) {
        console.log('RPC function not available, using direct approach:', rpcError.message);
        
        // Fallback: Direct OTP verification
        const { data: otpRecord, error: otpError } = await supabase
          .from('participant_otps')
          .select('*')
          .eq('email', email)
          .eq('otp_code', otp)
          .eq('used', false)
          .gt('expires_at', new Date().toISOString())
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (otpError || !otpRecord) {
          isValid = false;
        } else {
          // Mark OTP as used
          await supabase
            .from('participant_otps')
            .update({ used: true })
            .eq('id', otpRecord.id);
          isValid = true;
        }
      } else {
        isValid = rpcResult;
      }
    } catch (rpcError) {
      console.log('RPC function not available, using direct approach');
      
      // Fallback: Direct OTP verification
      const { data: otpRecord, error: otpError } = await supabase
        .from('participant_otps')
        .select('*')
        .eq('email', email)
        .eq('otp_code', otp)
        .eq('used', false)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (otpError || !otpRecord) {
        isValid = false;
      } else {
        // Mark OTP as used
        await supabase
          .from('participant_otps')
          .update({ used: true })
          .eq('id', otpRecord.id);
        isValid = true;
      }
    }

    if (isValid) {
      console.log('OTP verified successfully for:', email);
      return NextResponse.json({
        success: true,
        message: 'OTP verified successfully.',
        participantId: participant.id
      });
    } else {
      console.log('Invalid or expired OTP for:', email);
      return NextResponse.json(
        { success: false, message: 'Invalid or expired OTP' },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Error in verify-otp API:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
