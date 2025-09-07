-- Test script to verify database schema
-- Run this in your Supabase SQL editor to check if everything is set up correctly

-- 1. Check if participants table has required columns
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'participants' 
ORDER BY ordinal_position;

-- 2. Check if login_enabled column exists and has correct values
SELECT 
    COUNT(*) as total_participants,
    COUNT(login_enabled) as with_login_enabled,
    COUNT(CASE WHEN login_enabled = true THEN 1 END) as enabled_count,
    COUNT(CASE WHEN login_enabled = false THEN 1 END) as disabled_count
FROM participants;

-- 3. Check if auth_id column exists
SELECT 
    COUNT(*) as total_participants,
    COUNT(auth_id) as with_auth_id,
    COUNT(CASE WHEN auth_id IS NOT NULL THEN 1 END) as linked_count
FROM participants;

-- 4. Test the get_participant_by_email function
-- Replace 'your-email@example.com' with an actual email from your participants table
SELECT * FROM get_participant_by_email('your-email@example.com');

-- 5. Check if indexes exist
SELECT 
    indexname, 
    indexdef 
FROM pg_indexes 
WHERE tablename = 'participants' 
AND indexname LIKE '%auth%';

-- 6. Check RLS policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'participants';

-- 7. Test participant lookup (replace with actual email)
-- This should return the participant data without errors
SELECT 
    id,
    name,
    email,
    profession,
    login_enabled,
    auth_id,
    created_at
FROM participants 
WHERE email = 'your-email@example.com'
LIMIT 1;
