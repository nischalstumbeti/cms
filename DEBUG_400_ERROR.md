# Debug 400 Error Guide

## 🔍 **What I Fixed**

The 400 Bad Request error was likely caused by:
1. **Missing database tables** - The `participant_otps` table didn't exist
2. **Missing database functions** - The Supabase RPC functions weren't created
3. **Missing participant data** - No participants in the database to test with

## ✅ **Solutions Implemented**

### **1. Fallback Logic**
- ✅ **API routes now work without database functions**
- ✅ **Direct table operations** if RPC functions don't exist
- ✅ **Better error logging** to identify issues

### **2. Enhanced Error Handling**
- ✅ **Detailed console logs** for debugging
- ✅ **Participant validation** before OTP generation
- ✅ **Login status checking** before allowing OTP requests

### **3. Minimal Database Setup**
- ✅ **`minimal-database-setup.sql`** - Creates only essential tables
- ✅ **Safe to run** - Won't break existing data
- ✅ **Quick setup** - Just the basics needed for OTP to work

## 🚀 **Quick Fix Steps**

### **Step 1: Run Minimal Database Setup**
```sql
-- Copy and paste the content from minimal-database-setup.sql
-- into your Supabase SQL editor and run it
```

### **Step 2: Add a Test Participant**
```sql
-- Insert a test participant (if you don't have any)
INSERT INTO participants (name, email, profession, gender, login_enabled)
VALUES ('Test User', 'test@example.com', 'Developer', 'other', true);
```

### **Step 3: Test the API**
1. **Open browser console** to see detailed logs
2. **Try the OTP login** with the test email
3. **Check the logs** for specific error messages

## 🔍 **Debugging Information**

### **Console Logs to Look For**
```
Generate OTP request for email: test@example.com
Generated OTP for test@example.com: 123456
OTP email sent successfully to: test@example.com
```

### **Common Error Messages**
- `"Participant not found or login disabled"` → No participant with that email
- `"Failed to generate OTP"` → Database table doesn't exist
- `"Failed to send OTP email"` → SMTP configuration issue

### **Check These Things**
1. **Database Tables**: Do `participants` and `participant_otps` tables exist?
2. **Participant Data**: Is there a participant with the email you're testing?
3. **Login Status**: Is `login_enabled` set to `true` for the participant?
4. **SMTP Config**: Are email settings configured in `.env.local`?

## 🧪 **Test the Fix**

### **1. Check Database**
```sql
-- Verify tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_name IN ('participants', 'participant_otps');

-- Check participants
SELECT id, name, email, login_enabled FROM participants;
```

### **2. Test API Directly**
```bash
# Test with curl (replace with actual email)
curl -X POST http://localhost:3000/api/generate-otp \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'
```

### **3. Check Browser Console**
- Look for detailed error messages
- Check network tab for API responses
- Verify the request payload is correct

## 🎯 **Expected Behavior**

After the fix:
1. ✅ **API returns 200** instead of 400
2. ✅ **OTP is generated** and stored in database
3. ✅ **Email is sent** (if SMTP is configured)
4. ✅ **Console shows success logs**

## 🚨 **If Still Getting 400**

1. **Check the exact error message** in browser console
2. **Verify participant exists** in database
3. **Ensure `login_enabled` is true**
4. **Run the minimal database setup**
5. **Check SMTP configuration**

The enhanced error logging will now show you exactly what's causing the 400 error! 🔍
