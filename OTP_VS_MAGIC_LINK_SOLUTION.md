# 🔐 OTP vs Magic Link: Complete Solution

## 🚨 **The Problem**

Users are getting **verification links** instead of **numeric OTP codes** because:

1. **Supabase Default Behavior**: `signInWithOtp()` sends magic links by default
2. **User Expectation**: Users expect 6-digit numeric codes like `123456`
3. **UX Mismatch**: Magic links require clicking, OTP codes are more convenient

## ✅ **The Solution**

I've updated the system to use **custom numeric OTP** instead of Supabase's magic links:

### **What Changed**

1. **Updated Auth Functions**: Now use custom API routes for OTP
2. **Fixed Package Issues**: Replaced deprecated `@supabase/auth-helpers-nextjs` with `@supabase/ssr`
3. **Custom OTP System**: Sends 6-digit numeric codes via email

### **How It Works Now**

```typescript
// Before (Magic Link)
const { data, error } = await supabase.auth.signInWithOtp({
  email: email,
  options: { emailRedirectTo: `${window.location.origin}/auth/callback` }
});

// After (Numeric OTP)
const response = await fetch('/api/generate-otp', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email }),
});
```

## 🚀 **Setup Required**

### **Step 1: Run Database Migration**

Execute this in your Supabase SQL editor:

```sql
-- Add missing columns for OTP system
ALTER TABLE participants 
ADD COLUMN IF NOT EXISTS login_enabled BOOLEAN DEFAULT true;

-- Create OTP table
CREATE TABLE IF NOT EXISTS participant_otps (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    otp_code VARCHAR(6) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_participant_otps_email ON participant_otps(email);
CREATE INDEX IF NOT EXISTS idx_participant_otps_code ON participant_otps(otp_code);

-- Enable RLS
ALTER TABLE participant_otps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations on participant_otps" ON participant_otps
    FOR ALL USING (true) WITH CHECK (true);
```

### **Step 2: Verify API Routes Exist**

Make sure these files exist:
- ✅ `src/app/api/generate-otp/route.ts`
- ✅ `src/app/api/verify-otp/route.ts`

### **Step 3: Test the System**

1. **Try OTP Login**: Should now send numeric codes
2. **Check Email**: Should receive 6-digit code like `123456`
3. **Verify Login**: Should work with the numeric code

## 📧 **Email Template**

The OTP email will look like this:

```
Subject: Your OTP Code for Contest Login

Hello [Name],

Your OTP code is: 123456

This code will expire in 10 minutes.

If you didn't request this code, please ignore this email.

Best regards,
Contest Team
```

## 🔧 **Technical Details**

### **OTP Generation Process**

1. **User enters email** → System checks if participant exists
2. **Generate 6-digit code** → Store in database with expiration
3. **Send email** → Using nodemailer with SMTP
4. **User enters code** → System verifies and authenticates

### **Security Features**

- ✅ **10-minute expiration** for OTP codes
- ✅ **One-time use** - codes are marked as used
- ✅ **Rate limiting** - prevents spam
- ✅ **Email validation** - only registered participants
- ✅ **Login control** - admin can disable participant login

## 🎯 **Expected User Experience**

### **Before (Magic Link)**
1. User enters email
2. Receives email with link
3. Must click link to login
4. Redirected to app

### **After (Numeric OTP)**
1. User enters email
2. Receives email with 6-digit code
3. Enters code in app
4. Immediately logged in

## 🚀 **Benefits of Numeric OTP**

- ✅ **Better UX**: No need to switch between email and app
- ✅ **Mobile Friendly**: Easy to type on mobile devices
- ✅ **Familiar**: Users understand numeric codes
- ✅ **Fast**: No waiting for email links to load
- ✅ **Secure**: Still maintains security with expiration

## 🔍 **Troubleshooting**

### **If OTP Still Not Working**

1. **Check Database**: Ensure `participant_otps` table exists
2. **Check Email Config**: Verify SMTP settings in `.env.local`
3. **Check API Routes**: Ensure `/api/generate-otp` and `/api/verify-otp` exist
4. **Check Console**: Look for error messages in browser console

### **Environment Variables Required**

```env
# SMTP Configuration
SMTP_HOST=your-smtp-host
SMTP_PORT=465
SMTP_USER=your-email@domain.com
SMTP_PASS=your-email-password

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

The system now sends **numeric OTP codes** instead of magic links! 🎉
