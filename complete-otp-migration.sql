-- Complete OTP Migration Script
-- Run this in your Supabase SQL editor to set up the OTP system

-- 1. Add missing columns to participants table
ALTER TABLE participants 
ADD COLUMN IF NOT EXISTS login_enabled BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS auth_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- 2. Update existing participants to have login_enabled = true
UPDATE participants SET login_enabled = true WHERE login_enabled IS NULL;

-- 3. Create participant_otps table for OTP storage
CREATE TABLE IF NOT EXISTS participant_otps (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    otp_code VARCHAR(6) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_participants_login_enabled ON participants(login_enabled);
CREATE INDEX IF NOT EXISTS idx_participants_auth_id ON participants(auth_id);
CREATE INDEX IF NOT EXISTS idx_participant_otps_email ON participant_otps(email);
CREATE INDEX IF NOT EXISTS idx_participant_otps_code ON participant_otps(otp_code);
CREATE INDEX IF NOT EXISTS idx_participant_otps_expires ON participant_otps(expires_at);

-- 5. Enable Row Level Security
ALTER TABLE participant_otps ENABLE ROW LEVEL SECURITY;

-- 6. Create RLS policies
CREATE POLICY "Allow all operations on participant_otps" ON participant_otps
    FOR ALL USING (true) WITH CHECK (true);

-- 7. Create function to clean up expired OTPs
CREATE OR REPLACE FUNCTION cleanup_expired_otps()
RETURNS void AS $$
BEGIN
    DELETE FROM participant_otps 
    WHERE expires_at < NOW() OR used = true;
END;
$$ LANGUAGE plpgsql;

-- 8. Create function to generate and store OTP
CREATE OR REPLACE FUNCTION generate_participant_otp(participant_email VARCHAR(255))
RETURNS VARCHAR(6) AS $$
DECLARE
    otp_code VARCHAR(6);
    participant_exists BOOLEAN;
    login_allowed BOOLEAN;
BEGIN
    -- Check if participant exists and login is enabled
    SELECT EXISTS(
        SELECT 1 FROM participants 
        WHERE email = participant_email AND login_enabled = true
    ) INTO participant_exists;
    
    IF NOT participant_exists THEN
        RAISE EXCEPTION 'Participant not found or login disabled';
    END IF;
    
    -- Generate 6-digit OTP
    otp_code := LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');
    
    -- Clean up old OTPs for this email
    DELETE FROM participant_otps 
    WHERE email = participant_email;
    
    -- Insert new OTP (expires in 10 minutes)
    INSERT INTO participant_otps (email, otp_code, expires_at)
    VALUES (participant_email, otp_code, NOW() + INTERVAL '10 minutes');
    
    RETURN otp_code;
END;
$$ LANGUAGE plpgsql;

-- 9. Create function to verify OTP
CREATE OR REPLACE FUNCTION verify_participant_otp(participant_email VARCHAR(255), input_otp VARCHAR(6))
RETURNS BOOLEAN AS $$
DECLARE
    otp_record RECORD;
    participant_exists BOOLEAN;
BEGIN
    -- Check if participant exists and login is enabled
    SELECT EXISTS(
        SELECT 1 FROM participants 
        WHERE email = participant_email AND login_enabled = true
    ) INTO participant_exists;
    
    IF NOT participant_exists THEN
        RETURN false;
    END IF;
    
    -- Find valid OTP
    SELECT * INTO otp_record
    FROM participant_otps
    WHERE email = participant_email 
    AND otp_code = input_otp 
    AND expires_at > NOW() 
    AND used = false
    ORDER BY created_at DESC
    LIMIT 1;
    
    IF otp_record IS NULL THEN
        RETURN false;
    END IF;
    
    -- Mark OTP as used
    UPDATE participant_otps 
    SET used = true 
    WHERE id = otp_record.id;
    
    RETURN true;
END;
$$ LANGUAGE plpgsql;

-- 10. Grant necessary permissions
GRANT EXECUTE ON FUNCTION cleanup_expired_otps TO anon, authenticated;
GRANT EXECUTE ON FUNCTION generate_participant_otp TO anon, authenticated;
GRANT EXECUTE ON FUNCTION verify_participant_otp TO anon, authenticated;

-- 11. Create trigger to automatically clean up expired OTPs
CREATE OR REPLACE FUNCTION trigger_cleanup_otps()
RETURNS TRIGGER AS $$
BEGIN
    -- Clean up expired OTPs when new ones are created
    PERFORM cleanup_expired_otps();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER cleanup_otps_trigger
    AFTER INSERT ON participant_otps
    FOR EACH STATEMENT
    EXECUTE FUNCTION trigger_cleanup_otps();

-- 12. Add comments for documentation
COMMENT ON COLUMN participants.login_enabled IS 'Controls whether this participant can log in to the system';
COMMENT ON COLUMN participants.auth_id IS 'Links participant to Supabase auth user';
COMMENT ON TABLE participant_otps IS 'Stores OTP codes for participant email authentication';
COMMENT ON FUNCTION generate_participant_otp IS 'Generates and stores a new OTP for participant login';
COMMENT ON FUNCTION verify_participant_otp IS 'Verifies an OTP code for participant login';

-- 13. Test the setup
SELECT 'Migration completed successfully!' as status;
