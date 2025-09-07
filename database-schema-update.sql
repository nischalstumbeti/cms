-- Database Schema Update for Enhanced Registration Form
-- Run this in your Supabase SQL editor

-- 1. Add contest_type column to participants table
ALTER TABLE participants 
ADD COLUMN IF NOT EXISTS contest_type VARCHAR(50) CHECK (contest_type IN ('photography', 'videography'));

-- 2. Add upload_enabled column to control participant uploads
ALTER TABLE participants 
ADD COLUMN IF NOT EXISTS upload_enabled BOOLEAN DEFAULT false;

-- 3. Update profession column to support new structure
-- First, let's see what current values exist
-- SELECT DISTINCT profession FROM participants;

-- Update existing profession values to match new structure
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

-- 4. Add constraint for profession values
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

-- 5. Create index for better performance
CREATE INDEX IF NOT EXISTS idx_participants_contest_type ON participants(contest_type);
CREATE INDEX IF NOT EXISTS idx_participants_upload_enabled ON participants(upload_enabled);

-- 6. Add RLS policy for contest_type access
CREATE POLICY "Allow participants to view contest type" ON participants
    FOR SELECT USING (true);

-- 7. Add RLS policy for upload_enabled access
CREATE POLICY "Allow participants to view upload status" ON participants
    FOR SELECT USING (true);

-- 8. Create function to enable uploads for specific participants
CREATE OR REPLACE FUNCTION enable_participant_upload(participant_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE participants 
    SET upload_enabled = true 
    WHERE id = participant_id;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- 9. Create function to disable uploads for specific participants
CREATE OR REPLACE FUNCTION disable_participant_upload(participant_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE participants 
    SET upload_enabled = false 
    WHERE id = participant_id;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- 10. Create function to get participant profile data
CREATE OR REPLACE FUNCTION get_participant_profile(participant_id UUID)
RETURNS TABLE(
    id UUID,
    name VARCHAR(255),
    email VARCHAR(255),
    profession VARCHAR(50),
    other_profession VARCHAR(255),
    gender VARCHAR(20),
    contest_type VARCHAR(50),
    profile_photo_url TEXT,
    login_enabled BOOLEAN,
    upload_enabled BOOLEAN,
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
        p.contest_type,
        p.profile_photo_url,
        p.login_enabled,
        p.upload_enabled,
        p.auth_id,
        p.created_at,
        p.updated_at
    FROM participants p
    WHERE p.id = participant_id;
END;
$$ LANGUAGE plpgsql;

-- 11. Grant necessary permissions
GRANT EXECUTE ON FUNCTION enable_participant_upload(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION disable_participant_upload(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_participant_profile(UUID) TO authenticated;

-- 12. Update existing participants with default contest_type if null
UPDATE participants 
SET contest_type = 'photography' 
WHERE contest_type IS NULL;

-- 13. Add comment to document the changes
COMMENT ON COLUMN participants.contest_type IS 'Type of contest: photography or videography';
COMMENT ON COLUMN participants.upload_enabled IS 'Whether participant can upload submissions (controlled by admin)';
COMMENT ON COLUMN participants.profession IS 'Updated profession categories: employee_private, employee_government, student, business_owner, freelancer, retired, unemployed, other';
