-- Migration script to add participant login control and OTP functionality
-- Run this in your Supabase SQL editor

-- 1. Add login_enabled field to participants table
ALTER TABLE participants 
ADD COLUMN login_enabled BOOLEAN DEFAULT true;

-- 2. Create OTP table for participant authentication
CREATE TABLE participant_otps (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    otp_code VARCHAR(6) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create indexes for better performance
CREATE INDEX idx_participant_otps_email ON participant_otps(email);
CREATE INDEX idx_participant_otps_code ON participant_otps(otp_code);
CREATE INDEX idx_participant_otps_expires ON participant_otps(expires_at);

-- 4. Add RLS policies for OTP table
ALTER TABLE participant_otps ENABLE ROW LEVEL SECURITY;

-- Allow all operations on OTP table (for now - you can restrict this later)
CREATE POLICY "Allow all operations on participant_otps" ON participant_otps
    FOR ALL USING (true) WITH CHECK (true);

-- 5. Create function to clean up expired OTPs
CREATE OR REPLACE FUNCTION cleanup_expired_otps()
RETURNS void AS $$
BEGIN
    DELETE FROM participant_otps 
    WHERE expires_at < NOW() OR used = true;
END;
$$ LANGUAGE plpgsql;

-- 6. Create function to generate and store OTP
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

-- 7. Create function to verify OTP
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

-- 8. Add settings for global login control
INSERT INTO settings (key, value) VALUES 
('participant_login_enabled', 'true')
ON CONFLICT (key) DO UPDATE SET 
value = EXCLUDED.value,
updated_at = NOW();

-- 9. Create a view for admin dashboard with login status
CREATE OR REPLACE VIEW participant_login_status AS
SELECT 
    p.id,
    p.name,
    p.email,
    p.profession,
    p.gender,
    p.login_enabled,
    p.created_at,
    p.updated_at,
    CASE 
        WHEN p.login_enabled THEN 'Enabled'
        ELSE 'Disabled'
    END as login_status
FROM participants p
ORDER BY p.created_at DESC;

-- 10. Grant permissions (adjust as needed for your RLS policies)
GRANT SELECT ON participant_login_status TO anon, authenticated;

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
COMMENT ON TABLE participant_otps IS 'Stores OTP codes for participant email authentication';
COMMENT ON FUNCTION generate_participant_otp IS 'Generates and stores a new OTP for participant login';
COMMENT ON FUNCTION verify_participant_otp IS 'Verifies an OTP code for participant login';
COMMENT ON VIEW participant_login_status IS 'View showing participant login status for admin dashboard';
