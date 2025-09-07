-- Minimal database setup for OTP functionality
-- Run this in your Supabase SQL editor if you haven't run the full migration yet

-- 1. Add login_enabled field to participants table (if not exists)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'participants' AND column_name = 'login_enabled') THEN
        ALTER TABLE participants ADD COLUMN login_enabled BOOLEAN DEFAULT true;
    END IF;
END $$;

-- 2. Create participant_otps table (if not exists)
CREATE TABLE IF NOT EXISTS participant_otps (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    otp_code VARCHAR(6) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_participant_otps_email ON participant_otps(email);
CREATE INDEX IF NOT EXISTS idx_participant_otps_code ON participant_otps(otp_code);
CREATE INDEX IF NOT EXISTS idx_participant_otps_expires ON participant_otps(expires_at);

-- 4. Enable RLS and create policies
ALTER TABLE participant_otps ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Allow all operations on participant_otps" ON participant_otps;

-- Create new policy
CREATE POLICY "Allow all operations on participant_otps" ON participant_otps
    FOR ALL USING (true) WITH CHECK (true);

-- 5. Update existing participants to have login_enabled = true
UPDATE participants SET login_enabled = true WHERE login_enabled IS NULL;

-- 6. Add comment for documentation
COMMENT ON COLUMN participants.login_enabled IS 'Controls whether this participant can log in to the system';
COMMENT ON TABLE participant_otps IS 'Stores OTP codes for participant email authentication';
