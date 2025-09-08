-- Fix participants table to include all required fields
-- Run this in your Supabase SQL editor

-- 1. Add missing columns if they don't exist
ALTER TABLE participants 
ADD COLUMN IF NOT EXISTS contest_type VARCHAR(50) CHECK (contest_type IN ('photography', 'videography')),
ADD COLUMN IF NOT EXISTS upload_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS auth_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS login_enabled BOOLEAN DEFAULT true;

-- 2. Update existing participants with default values
UPDATE participants 
SET contest_type = 'photography' 
WHERE contest_type IS NULL;

UPDATE participants 
SET upload_enabled = false 
WHERE upload_enabled IS NULL;

UPDATE participants 
SET login_enabled = true 
WHERE login_enabled IS NULL;

-- 3. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_participants_contest_type ON participants(contest_type);
CREATE INDEX IF NOT EXISTS idx_participants_upload_enabled ON participants(upload_enabled);
CREATE INDEX IF NOT EXISTS idx_participants_auth_id ON participants(auth_id);
CREATE INDEX IF NOT EXISTS idx_participants_login_enabled ON participants(login_enabled);

-- 4. Update profession constraint to match the new structure
ALTER TABLE participants 
DROP CONSTRAINT IF EXISTS check_profession_values;

ALTER TABLE participants 
ADD CONSTRAINT check_profession_values 
CHECK (profession IN (
    'employee_private', 
    'employee_government', 
    'student', 
    'business_owner', 
    'freelancer', 
    'retired', 
    'unemployed', 
    'other'
));

-- 5. Update existing profession values to match new structure
UPDATE participants 
SET profession = CASE 
    WHEN profession ILIKE '%private%' OR profession ILIKE '%employee%' THEN 'employee_private'
    WHEN profession ILIKE '%government%' OR profession ILIKE '%govt%' THEN 'employee_government'
    WHEN profession ILIKE '%student%' THEN 'student'
    WHEN profession ILIKE '%business%' OR profession ILIKE '%entrepreneur%' THEN 'business_owner'
    WHEN profession ILIKE '%freelancer%' THEN 'freelancer'
    WHEN profession ILIKE '%retired%' THEN 'retired'
    WHEN profession ILIKE '%unemployed%' THEN 'unemployed'
    ELSE 'other'
END;

-- 6. Ensure RLS policies are in place
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow all operations on participants" ON participants;
DROP POLICY IF EXISTS "Allow participants to access their own data" ON participants;

-- Create new policies
CREATE POLICY "Allow all operations on participants" ON participants
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow participants to access their own data" ON participants
    FOR ALL USING (auth.uid() = auth_id);

-- 7. Add comments to document the changes
COMMENT ON COLUMN participants.contest_type IS 'Type of contest: photography or videography';
COMMENT ON COLUMN participants.upload_enabled IS 'Whether participant can upload submissions (controlled by admin)';
COMMENT ON COLUMN participants.auth_id IS 'Reference to Supabase auth user ID';
COMMENT ON COLUMN participants.login_enabled IS 'Whether participant can log in to the system';

-- 8. Verify the table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'participants' 
ORDER BY ordinal_position;
