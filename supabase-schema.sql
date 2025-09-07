-- Supabase Database Schema for ContestZen
-- Run this in your Supabase SQL editor

-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Create participants table
CREATE TABLE participants (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    profession VARCHAR(255) NOT NULL,
    other_profession VARCHAR(255),
    gender VARCHAR(50) CHECK (gender IN ('male', 'female', 'other', 'prefer-not-to-say')) NOT NULL,
    profile_photo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create admins table
CREATE TABLE admins (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) NOT NULL,
    department VARCHAR(255) NOT NULL,
    government VARCHAR(50) CHECK (government IN ('state', 'central')) NOT NULL,
    place VARCHAR(255) NOT NULL,
    role VARCHAR(50) CHECK (role IN ('superadmin', 'admin')) DEFAULT 'admin',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create submissions table
CREATE TABLE submissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    participant_id UUID REFERENCES participants(id) ON DELETE CASCADE,
    file_data_uri TEXT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    adherence_score DECIMAL(3,2) CHECK (adherence_score >= 0 AND adherence_score <= 1),
    rationale TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create settings table for announcements and branding
CREATE TABLE settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    key VARCHAR(100) UNIQUE NOT NULL,
    value JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_participants_email ON participants(email);
CREATE INDEX idx_admins_email ON admins(email);
CREATE INDEX idx_submissions_participant_id ON submissions(participant_id);
CREATE INDEX idx_settings_key ON settings(key);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_participants_updated_at BEFORE UPDATE ON participants
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_admins_updated_at BEFORE UPDATE ON admins
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_submissions_updated_at BEFORE UPDATE ON submissions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default settings
INSERT INTO settings (key, value) VALUES 
('announcement', '{
    "title": "World Tourism Day 2025 Photography Contest",
    "description": "The District Administration is pleased to announce a photography contest to celebrate World Tourism Day 2025. Capture the beauty of our district''s tourist destinations and win exciting prizes.",
    "theme": "Tourism & Green Investments"
}'),
('branding', '{
    "headerTitle": "World Tourism Day Contest",
    "headerSubtitle": "Nellore District, AP",
    "footerText": "Devloped by Nextlinkers Managed by District Administration All rights reserved."
}');

-- Enable Row Level Security (RLS)
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (adjust based on your auth requirements)
-- For now, allowing all operations - you can restrict these based on your needs

-- Participants policies
CREATE POLICY "Allow all operations on participants" ON participants
    FOR ALL USING (true) WITH CHECK (true);

-- Admins policies
CREATE POLICY "Allow all operations on admins" ON admins
    FOR ALL USING (true) WITH CHECK (true);

-- Submissions policies
CREATE POLICY "Allow all operations on submissions" ON submissions
    FOR ALL USING (true) WITH CHECK (true);

-- Settings policies
CREATE POLICY "Allow all operations on settings" ON settings
    FOR ALL USING (true) WITH CHECK (true);
