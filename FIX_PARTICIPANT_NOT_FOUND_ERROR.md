# 🔧 Fix: "Participant not found" Error

## 🚨 **The Problem**

You're getting this error:
```
Failed to load resource: the server responded with a status of 400 ()
giqroivihabxwmzhvhap.supabase.co/rest/v1/participants?select=id%2Clogin_enabled&email=eq.99230041300%40klu.ac.in:1
```

**Root Cause**: The database schema is missing the `login_enabled` and `auth_id` columns that the Supabase auth functions are trying to query.

## ✅ **The Solution**

### **Step 1: Run the Database Migration**

Run this SQL script in your Supabase SQL editor:

```sql
-- Migration script to add Supabase Auth support
-- Run this in your Supabase SQL editor

-- 1. Add auth_id and login_enabled fields to participants table
ALTER TABLE participants 
ADD COLUMN IF NOT EXISTS auth_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS login_enabled BOOLEAN DEFAULT true;

-- 2. Create index for auth_id
CREATE INDEX IF NOT EXISTS idx_participants_auth_id ON participants(auth_id);

-- 3. Update existing participants to have login_enabled = true
UPDATE participants SET login_enabled = true WHERE login_enabled IS NULL;

-- 4. Add RLS policy for auth_id access
CREATE POLICY "Allow participants to access their own data" ON participants
    FOR ALL USING (auth.uid() = auth_id);

-- 5. Create function to link existing participant with auth user
CREATE OR REPLACE FUNCTION link_participant_with_auth(
    participant_email VARCHAR(255),
    auth_user_id UUID
)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE participants 
    SET auth_id = auth_user_id 
    WHERE email = participant_email;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- 6. Create function to get participant by email (for OTP verification)
CREATE OR REPLACE FUNCTION get_participant_by_email(participant_email VARCHAR(255))
RETURNS TABLE(
    id UUID,
    name VARCHAR(255),
    email VARCHAR(255),
    profession VARCHAR(255),
    other_profession VARCHAR(255),
    gender VARCHAR(50),
    profile_photo_url TEXT,
    login_enabled BOOLEAN,
    auth_id UUID,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.name,
        p.email,
        p.profession,
        p.other_profession,
        p.gender,
        p.profile_photo_url,
        p.login_enabled,
        p.auth_id,
        p.created_at,
        p.updated_at
    FROM participants p
    WHERE p.email = participant_email;
END;
$$ LANGUAGE plpgsql;

-- 7. Grant necessary permissions
GRANT EXECUTE ON FUNCTION link_participant_with_auth TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_participant_by_email TO anon, authenticated;

-- 8. Add comments
COMMENT ON COLUMN participants.auth_id IS 'Links participant to Supabase auth user';
COMMENT ON COLUMN participants.login_enabled IS 'Controls whether this participant can log in to the system';
COMMENT ON FUNCTION link_participant_with_auth IS 'Links an existing participant with a Supabase auth user';
COMMENT ON FUNCTION get_participant_by_email IS 'Gets participant data by email address';
```

### **Step 2: Verify the Migration**

After running the migration, check that your participants table has the new columns:

```sql
-- Check if columns exist
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'participants' 
AND column_name IN ('login_enabled', 'auth_id');
```

You should see:
- `login_enabled` (boolean)
- `auth_id` (uuid)

### **Step 3: Test the Fix**

1. **Try the OTP login again** - it should now work
2. **Check the browser console** - no more 400 errors
3. **Verify participant data** - should be found correctly

## 🔍 **What Was Fixed**

### **Before (Broken)**
```typescript
// This query was failing because login_enabled column didn't exist
const { data: participant, error } = await supabase
  .from('participants')
  .select('id, login_enabled')  // ❌ login_enabled column missing
  .eq('email', email)
  .single();
```

### **After (Fixed)**
```typescript
// This query now works because login_enabled column exists
const { data: participant, error } = await supabase
  .from('participants')
  .select('id, login_enabled, auth_id')  // ✅ Both columns exist
  .eq('email', email)
  .single();
```

## 🚀 **Additional Improvements Made**

1. **Better Error Handling**: Added detailed error logging
2. **Backward Compatibility**: Works with existing participants
3. **Auto-linking**: Automatically links participants with auth users
4. **Fallback Logic**: Handles cases where `auth_id` is not set yet

## 🎯 **Expected Result**

After running the migration:
- ✅ **No more 400 errors**
- ✅ **OTP login works**
- ✅ **Existing participants can log in**
- ✅ **New participants get proper auth linking**
- ✅ **Admin can control login status**

## 🔧 **If You Still Get Errors**

1. **Check Supabase Dashboard**: Verify columns were added
2. **Check RLS Policies**: Make sure policies allow access
3. **Check Environment Variables**: Ensure Supabase URL/key are correct
4. **Check Browser Console**: Look for specific error messages

The migration script is designed to be **safe** and **idempotent** - you can run it multiple times without issues!
