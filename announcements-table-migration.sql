-- Add announcements table to existing database
-- Run this in your Supabase SQL editor

-- Create the update_updated_at_column function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create announcements table
CREATE TABLE announcements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    hyperlink TEXT,
    document_url TEXT,
    document_name VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for better performance
CREATE INDEX idx_announcements_created_at ON announcements(created_at DESC);
CREATE INDEX idx_announcements_is_active ON announcements(is_active);

-- Create trigger for updated_at
CREATE TRIGGER update_announcements_updated_at BEFORE UPDATE ON announcements
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for announcements
CREATE POLICY "Allow all operations on announcements" ON announcements
    FOR ALL USING (true) WITH CHECK (true);

-- Insert sample announcements
INSERT INTO announcements (title, content, hyperlink, document_name, is_active) VALUES 
('Contest Registration Open', 'Registration for World Tourism Day 2025 Photography Contest is now open. Submit your entries before the deadline.', 'https://example.com/register', 'contest-rules.pdf', true),
('Submission Guidelines Updated', 'Please review the updated submission guidelines before submitting your entries.', 'https://example.com/guidelines', 'submission-guidelines.pdf', true),
('Prize Distribution Ceremony', 'Join us for the prize distribution ceremony on October 15th, 2025 at District Collectorate.', 'https://example.com/ceremony', null, true);
