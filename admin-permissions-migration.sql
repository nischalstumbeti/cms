-- Admin Permissions Migration
-- Run this in your Supabase SQL editor to add the missing columns

-- Add permissions column to admins table if it doesn't exist
ALTER TABLE admins 
ADD COLUMN IF NOT EXISTS permissions JSONB DEFAULT '{
    "can_manage_announcements": true,
    "can_manage_participants": true,
    "can_manage_submissions": true,
    "can_manage_admins": false,
    "can_manage_settings": false,
    "can_export_data": true
}'::jsonb;

-- Add password column to admins table
ALTER TABLE admins 
ADD COLUMN IF NOT EXISTS password VARCHAR(255) DEFAULT 'password123';

-- Update government column to include more options
ALTER TABLE admins 
DROP CONSTRAINT IF EXISTS admins_government_check;

ALTER TABLE admins 
ADD CONSTRAINT admins_government_check 
CHECK (government IN ('state', 'central', 'outsource', 'other'));

-- Add target_audience column to announcements table if it doesn't exist
ALTER TABLE announcements 
ADD COLUMN IF NOT EXISTS target_audience VARCHAR(20) CHECK (target_audience IN ('public', 'participants')) DEFAULT 'participants';

-- Add age column to participants table if it doesn't exist
ALTER TABLE participants 
ADD COLUMN IF NOT EXISTS age INTEGER CHECK (age > 0 AND age < 150);

-- Create participant_mutations table if it doesn't exist
CREATE TABLE IF NOT EXISTS participant_mutations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    participant_id UUID REFERENCES participants(id) ON DELETE CASCADE,
    admin_id UUID REFERENCES admins(id) ON DELETE SET NULL,
    field_name VARCHAR(50) NOT NULL,
    old_value TEXT,
    new_value TEXT,
    mutation_type VARCHAR(20) CHECK (mutation_type IN ('create', 'update', 'delete')) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_announcements_target_audience ON announcements(target_audience);
CREATE INDEX IF NOT EXISTS idx_participant_mutations_participant_id ON participant_mutations(participant_id);
CREATE INDEX IF NOT EXISTS idx_participant_mutations_admin_id ON participant_mutations(admin_id);
CREATE INDEX IF NOT EXISTS idx_participant_mutations_created_at ON participant_mutations(created_at);

-- Update existing announcements to have default target_audience
UPDATE announcements SET target_audience = 'participants' WHERE target_audience IS NULL;

-- Update existing admins to have default permissions if they don't have any
UPDATE admins 
SET permissions = '{
    "can_manage_announcements": true,
    "can_manage_participants": true,
    "can_manage_submissions": true,
    "can_manage_admins": false,
    "can_manage_settings": false,
    "can_export_data": true
}'::jsonb
WHERE permissions IS NULL;
