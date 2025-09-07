import { supabase } from '@/lib/supabase';

export interface Participant {
  id: string;
  name: string;
  email: string;
  profession: string;
  otherProfession?: string | null;
  gender: 'male' | 'female' | 'other' | 'prefer-not-to-say';
  contestType?: 'photography' | 'videography';
  profilePhotoUrl?: string;
  login_enabled?: boolean;
  upload_enabled?: boolean;
  auth_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface AuthResult {
  success: boolean;
  message: string;
  participant?: Participant;
  user?: any;
}

/**
 * Register a new participant using Supabase Auth
 */
export async function registerParticipant(participantData: {
  name: string;
  email: string;
  profession: string;
  otherProfession?: string;
  gender: 'male' | 'female' | 'other' | 'prefer-not-to-say';
  profilePhotoUrl?: string;
}): Promise<AuthResult> {
  try {
    // 1. Sign up user with Supabase Auth (this sends OTP email automatically)
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: participantData.email,
      password: Math.random().toString(36), // Temporary password
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        data: {
          name: participantData.name,
          profession: participantData.profession
        }
      }
    });

    if (authError) {
      console.error('Auth signup error:', authError);
      return { 
        success: false, 
        message: authError.message 
      };
    }

    // 2. Create participant record linked to auth user
    const { data: participant, error: participantError } = await supabase
      .from('participants')
      .insert([{
        name: participantData.name,
        email: participantData.email,
        profession: participantData.profession,
        other_profession: participantData.otherProfession,
        gender: participantData.gender,
        profile_photo_url: participantData.profilePhotoUrl,
        auth_id: authData.user?.id,
        login_enabled: true
      }])
      .select()
      .single();

    if (participantError) {
      console.error('Participant creation error:', participantError);
      return { 
        success: false, 
        message: 'Failed to create participant record' 
      };
    }

    return { 
      success: true, 
      message: 'Registration successful! Please check your email for verification.',
      participant: {
        id: participant.id,
        name: participant.name,
        email: participant.email,
        profession: participant.profession,
        otherProfession: participant.other_profession,
        gender: participant.gender,
        profilePhotoUrl: participant.profile_photo_url,
        login_enabled: participant.login_enabled,
        auth_id: participant.auth_id,
        created_at: participant.created_at,
        updated_at: participant.updated_at
      }
    };
  } catch (error) {
    console.error('Registration error:', error);
    return { 
      success: false, 
      message: 'Registration failed. Please try again.' 
    };
  }
}

/**
 * Send magic link to participant's email using Supabase Auth
 */
export async function sendOTP(email: string): Promise<AuthResult> {
  try {
    // Check if participant exists and login is enabled
    const { data: participant, error: participantError } = await supabase
      .from('participants')
      .select('id, login_enabled, auth_id')
      .eq('email', email)
      .single();

    if (participantError) {
      console.error('Participant query error:', participantError);
      return { 
        success: false, 
        message: 'Participant not found' 
      };
    }

    if (!participant) {
      return { 
        success: false, 
        message: 'Participant not found' 
      };
    }

    if (participant.login_enabled === false) {
      return { 
        success: false, 
        message: 'Login is disabled for this participant' 
      };
    }

    // Send magic link using Supabase Auth with PKCE flow
    const { data, error } = await supabase.auth.signInWithOtp({
      email: email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        shouldCreateUser: false // Don't create user if they don't exist
      }
    });

    if (error) {
      console.error('Magic link send error:', error);
      return { 
        success: false, 
        message: error.message 
      };
    }

    return { 
      success: true, 
      message: 'Magic link sent to your email address. Please check your email and click the link to login.' 
    };
  } catch (error) {
    console.error('Send magic link error:', error);
    return { 
      success: false, 
      message: 'Failed to send magic link. Please try again.' 
    };
  }
}

/**
 * Verify magic link and authenticate participant
 * This function is called after the user clicks the magic link
 */
export async function verifyOTP(email: string, token: string): Promise<AuthResult> {
  try {
    // Verify the magic link token using Supabase Auth
    const { data, error } = await supabase.auth.verifyOtp({
      email: email,
      token: token,
      type: 'email'
    });

    if (error) {
      console.error('Magic link verification error:', error);
      return { 
        success: false, 
        message: error.message 
      };
    }

    // Get participant data by email (in case auth_id is not set yet)
    const { data: participant, error: participantError } = await supabase
      .from('participants')
      .select('*')
      .eq('email', email)
      .single();

    if (participantError || !participant) {
      console.error('Participant lookup error:', participantError);
      return { 
        success: false, 
        message: 'Participant data not found' 
      };
    }

    // If participant doesn't have auth_id, link it now
    if (!participant.auth_id && data.user) {
      const { error: updateError } = await supabase
        .from('participants')
        .update({ auth_id: data.user.id })
        .eq('id', participant.id);

      if (updateError) {
        console.error('Error linking participant with auth:', updateError);
      } else {
        participant.auth_id = data.user.id;
      }
    }

    return { 
      success: true, 
      message: 'Magic link verified successfully',
      user: data.user,
      participant: {
        id: participant.id,
        name: participant.name,
        email: participant.email,
        profession: participant.profession,
        otherProfession: participant.other_profession,
        gender: participant.gender,
        profilePhotoUrl: participant.profile_photo_url,
        login_enabled: participant.login_enabled,
        auth_id: participant.auth_id,
        created_at: participant.created_at,
        updated_at: participant.updated_at
      }
    };
  } catch (error) {
    console.error('Verify magic link error:', error);
    return { 
      success: false, 
      message: 'Failed to verify magic link. Please try again.' 
    };
  }
}

/**
 * Get current authenticated user
 */
export async function getCurrentUser() {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
      return null;
    }

    // First try to find participant by auth_id
    let { data: participant, error: participantError } = await supabase
      .from('participants')
      .select('*')
      .eq('auth_id', user.id)
      .single();

    // If not found by auth_id, try to find by email and link them
    if (participantError || !participant) {
      console.log('Participant not found by auth_id, trying to find by email:', user.email);
      
      const { data: participantByEmail, error: emailError } = await supabase
        .from('participants')
        .select('*')
        .eq('email', user.email)
        .single();

      if (emailError || !participantByEmail) {
        console.error('Participant lookup error by email:', emailError);
        return {
          user,
          participant: null
        };
      }

      // Link the participant with the auth user
      const { error: updateError } = await supabase
        .from('participants')
        .update({ auth_id: user.id })
        .eq('id', participantByEmail.id);

      if (updateError) {
        console.error('Error linking participant with auth:', updateError);
        return {
          user,
          participant: null
        };
      }

      participant = { ...participantByEmail, auth_id: user.id };
    }

    return {
      user,
      participant: participant ? {
        id: participant.id,
        name: participant.name,
        email: participant.email,
        profession: participant.profession,
        otherProfession: participant.other_profession,
        gender: participant.gender,
        age: participant.age,
        contestType: participant.contest_type,
        profilePhotoUrl: participant.profile_photo_url,
        login_enabled: participant.login_enabled,
        upload_enabled: participant.upload_enabled,
        auth_id: participant.auth_id,
        created_at: participant.created_at,
        updated_at: participant.updated_at
      } : null
    };
  } catch (error) {
    console.error('Get current user error:', error);
    return null;
  }
}

/**
 * Sign out current user
 */
export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    
    // Clear local storage
    localStorage.removeItem('participant_session');
    
    return { success: true };
  } catch (error) {
    console.error('Sign out error:', error);
    return { success: false, message: error instanceof Error ? error.message : 'Sign out failed' };
  }
}
