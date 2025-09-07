-- Check what tables exist in your database
-- Run this in your Supabase SQL editor to see current state

-- 1. Check if participants table has required columns
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'participants' 
ORDER BY ordinal_position;

-- 2. Check if participant_otps table exists
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_name IN ('participants', 'participant_otps', 'admins', 'submissions', 'settings')
ORDER BY table_name;

-- 3. Check if login_enabled column exists
SELECT 
    COUNT(*) as total_participants,
    COUNT(login_enabled) as with_login_enabled
FROM participants;

-- 4. Test participant lookup (replace with your actual email)
SELECT 
    id,
    name,
    email,
    profession,
    login_enabled,
    created_at
FROM participants 
WHERE email = '99230041300@klu.ac.in'
LIMIT 1;
