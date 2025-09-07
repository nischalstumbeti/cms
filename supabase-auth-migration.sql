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
