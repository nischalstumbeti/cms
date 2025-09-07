# Supabase Email OTP Setup Guide

## 🎯 **Overview**

This guide shows how to implement email OTP authentication using Supabase's built-in capabilities instead of our custom implementation.

## 🔧 **Setup Steps**

### **Step 1: Enable Email OTP in Supabase Dashboard**

1. **Go to Supabase Dashboard** → Your Project → Authentication → Settings
2. **Enable Email OTP**:
   - Toggle "Enable email confirmations" to ON
   - Set "Email OTP expiry" to 3600 seconds (1 hour)
   - Configure your email templates

### **Step 2: Configure Email Settings**

```typescript
// In your Supabase project settings
{
  "SITE_URL": "http://localhost:3000", // Your app URL
  "SMTP_ADMIN_EMAIL": "admin@yourdomain.com",
  "SMTP_HOST": "smtp.gmail.com",
  "SMTP_PORT": 587,
  "SMTP_USER": "your-email@gmail.com",
  "SMTP_PASS": "your-app-password",
  "SMTP_SENDER_NAME": "Your App Name"
}
```

### **Step 3: Update Database Schema**

```sql
-- Remove custom OTP table (we'll use Supabase's built-in auth)
DROP TABLE IF EXISTS participant_otps;

-- Add auth_id to participants table to link with Supabase auth
ALTER TABLE participants ADD COLUMN auth_id UUID REFERENCES auth.users(id);

-- Create index for better performance
CREATE INDEX idx_participants_auth_id ON participants(auth_id);
```

### **Step 4: Update Participant Registration**

```typescript
// src/lib/auth.ts
import { supabase } from '@/lib/supabase';

export async function registerParticipant(participantData: {
  name: string;
  email: string;
  profession: string;
  gender: string;
  profilePhotoUrl?: string;
}) {
  try {
    // 1. Sign up user with Supabase Auth (this sends OTP email)
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: participantData.email,
      password: 'temp-password', // We'll handle this differently
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`
      }
    });

    if (authError) throw authError;

    // 2. Create participant record linked to auth user
    const { data: participant, error: participantError } = await supabase
      .from('participants')
      .insert([{
        ...participantData,
        auth_id: authData.user?.id,
        login_enabled: true
      }])
      .select()
      .single();

    if (participantError) throw participantError;

    return { success: true, participant };
  } catch (error) {
    console.error('Registration error:', error);
    return { success: false, error: error.message };
  }
}
```

### **Step 5: Update Login Flow**

```typescript
// src/lib/auth.ts
export async function loginWithOTP(email: string) {
  try {
    // Supabase handles OTP generation and email sending
    const { data, error } = await supabase.auth.signInWithOtp({
      email: email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`
      }
    });

    if (error) throw error;
    return { success: true, message: 'OTP sent to your email' };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

export async function verifyOTP(email: string, token: string) {
  try {
    const { data, error } = await supabase.auth.verifyOtp({
      email: email,
      token: token,
      type: 'email'
    });

    if (error) throw error;

    // Get participant data
    const { data: participant } = await supabase
      .from('participants')
      .select('*')
      .eq('auth_id', data.user.id)
      .single();

    return { 
      success: true, 
      user: data.user, 
      participant 
    };
  } catch (error) {
    return { success: false, message: error.message };
  }
}
```

### **Step 6: Create Auth Callback Handler**

```typescript
// src/app/auth/callback/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    const supabase = createRouteHandlerClient({ cookies });
    await supabase.auth.exchangeCodeForSession(code);
  }

  // Redirect to appropriate page
  return NextResponse.redirect(`${requestUrl.origin}/submit`);
}
```

### **Step 7: Update Login Component**

```typescript
// src/components/auth/participant-otp-login-form.tsx
"use client";

import { useState } from 'react';
import { loginWithOTP, verifyOTP } from '@/lib/auth';

export function ParticipantOTPLoginForm() {
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendOTP = async () => {
    setLoading(true);
    const result = await loginWithOTP(email);
    
    if (result.success) {
      setStep('otp');
    } else {
      // Handle error
    }
    setLoading(false);
  };

  const handleVerifyOTP = async () => {
    setLoading(true);
    const result = await verifyOTP(email, otp);
    
    if (result.success) {
      // Store session and redirect
      localStorage.setItem('participant_session', result.participant.id);
      window.location.href = '/submit';
    } else {
      // Handle error
    }
    setLoading(false);
  };

  return (
    <div>
      {step === 'email' ? (
        <div>
          <input 
            type="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
          />
          <button onClick={handleSendOTP} disabled={loading}>
            Send OTP
          </button>
        </div>
      ) : (
        <div>
          <input 
            type="text" 
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="Enter OTP"
          />
          <button onClick={handleVerifyOTP} disabled={loading}>
            Verify OTP
          </button>
        </div>
      )}
    </div>
  );
}
```

## 🔐 **Security Benefits**

### **Supabase Built-in vs Custom**
| Feature | Supabase Built-in | Custom Implementation |
|---------|------------------|---------------------|
| **Security** | ✅ Enterprise-grade | ⚠️ Custom security |
| **Rate Limiting** | ✅ Built-in | ❌ Manual implementation |
| **OTP Expiry** | ✅ Configurable | ✅ Custom (10 min) |
| **Email Templates** | ✅ Customizable | ✅ Custom |
| **Audit Logs** | ✅ Automatic | ❌ Manual |
| **Maintenance** | ✅ Zero maintenance | ⚠️ Custom maintenance |

## 📋 **Migration Steps**

### **1. Remove Custom Implementation**
```bash
# Remove custom API routes
rm -rf src/app/api/generate-otp
rm -rf src/app/api/verify-otp

# Remove custom OTP table
# Run SQL: DROP TABLE participant_otps;
```

### **2. Install Supabase Auth Helpers**
```bash
npm install @supabase/auth-helpers-nextjs
```

### **3. Update Environment Variables**
```env
# Add to .env.local
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### **4. Configure Supabase Dashboard**
- Enable email OTP in Authentication settings
- Configure SMTP settings
- Set up email templates
- Configure redirect URLs

## 🎯 **Recommended Approach**

**Use Supabase Built-in Email OTP** because:

1. ✅ **More Secure**: Enterprise-grade security
2. ✅ **Less Code**: Minimal implementation required
3. ✅ **Better UX**: Handles edge cases automatically
4. ✅ **Maintained**: Regular security updates
5. ✅ **Scalable**: Handles high volume automatically
6. ✅ **Compliant**: Meets security standards

## 🚀 **Quick Start**

1. **Enable Email OTP** in Supabase Dashboard
2. **Configure SMTP** settings
3. **Update registration flow** to use `supabase.auth.signUp()`
4. **Update login flow** to use `supabase.auth.signInWithOtp()`
5. **Remove custom OTP implementation**

This approach is much more robust and secure than our custom implementation! 🎉
