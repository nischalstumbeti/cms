-- Database Schema Updates for Enhanced Admin Features (Fixed Version)
-- Run this in your Supabase SQL editor

-- Add internal remarks field to submissions table (if it doesn't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'submissions' 
        AND column_name = 'internal_remarks'
    ) THEN
        ALTER TABLE submissions ADD COLUMN internal_remarks TEXT;
    END IF;
END $$;

-- Add index for internal remarks search (if it doesn't exist)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'idx_submissions_internal_remarks'
    ) THEN
        CREATE INDEX idx_submissions_internal_remarks ON submissions USING gin(to_tsvector('english', internal_remarks));
    END IF;
END $$;

-- Create cms_content table for guidelines, news, and other content (if it doesn't exist)
CREATE TABLE IF NOT EXISTS cms_content (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    type VARCHAR(50) CHECK (type IN ('guidelines', 'news', 'announcement', 'faq', 'terms', 'privacy')) NOT NULL,
    status VARCHAR(20) CHECK (status IN ('draft', 'published', 'archived')) DEFAULT 'draft',
    priority INTEGER DEFAULT 0,
    placement VARCHAR(20) CHECK (placement IN ('public', 'participant', 'both', 'admin')) DEFAULT 'both',
    show_on_homepage BOOLEAN DEFAULT false,
    show_on_registration BOOLEAN DEFAULT false,
    created_by UUID REFERENCES admins(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create form_fields table for dynamic form management (if it doesn't exist)
CREATE TABLE IF NOT EXISTS form_fields (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    field_name VARCHAR(100) NOT NULL,
    field_label VARCHAR(255) NOT NULL,
    field_type VARCHAR(50) CHECK (field_type IN ('text', 'email', 'number', 'select', 'textarea', 'checkbox', 'radio', 'date')) NOT NULL,
    field_options JSONB,
    is_required BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    validation_rules JSONB,
    created_by UUID REFERENCES admins(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create form_settings table for form configuration (if it doesn't exist)
CREATE TABLE IF NOT EXISTS form_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    key VARCHAR(100) UNIQUE NOT NULL,
    value JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create branding_assets table for images and other branding assets (if it doesn't exist)
CREATE TABLE IF NOT EXISTS branding_assets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) CHECK (type IN ('header_image', 'logo', 'favicon', 'background', 'banner')) NOT NULL,
    file_url TEXT NOT NULL,
    file_size INTEGER,
    mime_type VARCHAR(100),
    width INTEGER,
    height INTEGER,
    alt_text VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Update settings table to include description column (if it doesn't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'settings' 
        AND column_name = 'description'
    ) THEN
        ALTER TABLE settings ADD COLUMN description TEXT;
    END IF;
END $$;

-- Insert enhanced branding settings (if they don't exist)
INSERT INTO settings (key, value, description) VALUES 
('enhanced_branding', '{
    "headerImage": {
        "url": "",
        "width": 1200,
        "height": 300,
        "altText": "Header Image"
    },
    "logo": {
        "url": "",
        "width": 200,
        "height": 80,
        "altText": "Logo"
    },
    "favicon": {
        "url": "",
        "altText": "Favicon"
    },
    "colorScheme": {
        "primary": "#3b82f6",
        "secondary": "#64748b",
        "accent": "#f59e0b"
    },
    "fonts": {
        "heading": "Inter",
        "body": "Inter"
    }
}', 'Enhanced branding settings including images and styling options')
ON CONFLICT (key) DO NOTHING;

INSERT INTO settings (key, value, description) VALUES 
('cms_settings', '{
    "enableGuidelines": true,
    "enableNews": true,
    "enableFAQ": true,
    "enableTerms": true,
    "enablePrivacy": true,
    "maxContentLength": 10000
}', 'CMS content management settings')
ON CONFLICT (key) DO NOTHING;

-- Create indexes for better performance (if they don't exist)
CREATE INDEX IF NOT EXISTS idx_cms_content_type ON cms_content(type);
CREATE INDEX IF NOT EXISTS idx_cms_content_status ON cms_content(status);
CREATE INDEX IF NOT EXISTS idx_cms_content_priority ON cms_content(priority);
CREATE INDEX IF NOT EXISTS idx_branding_assets_type ON branding_assets(type);
CREATE INDEX IF NOT EXISTS idx_branding_assets_active ON branding_assets(is_active);

-- Create triggers for updated_at (if they don't exist)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'update_cms_content_updated_at'
    ) THEN
        CREATE TRIGGER update_cms_content_updated_at BEFORE UPDATE ON cms_content
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'update_branding_assets_updated_at'
    ) THEN
        CREATE TRIGGER update_branding_assets_updated_at BEFORE UPDATE ON branding_assets
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- Enable RLS on new tables
ALTER TABLE cms_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE branding_assets ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for new tables (if they don't exist)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'cms_content' 
        AND policyname = 'Allow all operations on cms_content'
    ) THEN
        CREATE POLICY "Allow all operations on cms_content" ON cms_content
            FOR ALL USING (true) WITH CHECK (true);
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'branding_assets' 
        AND policyname = 'Allow all operations on branding_assets'
    ) THEN
        CREATE POLICY "Allow all operations on branding_assets" ON branding_assets
            FOR ALL USING (true) WITH CHECK (true);
    END IF;
END $$;

-- Add some sample CMS content (if it doesn't exist)
INSERT INTO cms_content (title, content, type, status, priority, placement, show_on_homepage, show_on_registration) VALUES 
('Contest Guidelines', 'Please read these guidelines carefully before participating in the contest...', 'guidelines', 'published', 1, 'both', true, true),
('Latest News', 'Stay updated with the latest contest news and announcements...', 'news', 'published', 2, 'public', true, false),
('Frequently Asked Questions', 'Find answers to common questions about the contest...', 'faq', 'published', 3, 'both', false, true)
ON CONFLICT (id) DO NOTHING;

-- Insert form settings (if they don't exist)
INSERT INTO form_settings (key, value) VALUES 
('age_validation', '{
    "enabled": true,
    "minimumAge": 15,
    "message": "You must be at least 15 years old to participate in this contest."
}')
ON CONFLICT (key) DO NOTHING;

INSERT INTO form_settings (key, value) VALUES 
('form_config', '{
    "collectAge": true,
    "ageRequired": true,
    "showAgeValidation": true
}')
ON CONFLICT (key) DO NOTHING;

-- Insert default form fields (if they don't exist)
INSERT INTO form_fields (field_name, field_label, field_type, is_required, is_active, display_order) VALUES 
('name', 'Full Name', 'text', true, true, 1),
('email', 'Email Address', 'email', true, true, 2),
('age', 'Age', 'number', true, true, 3),
('profession', 'Profession', 'select', true, true, 4),
('gender', 'Gender', 'select', true, true, 5),
('phone', 'Phone Number', 'text', false, true, 6),
('address', 'Address', 'textarea', false, true, 7)
ON CONFLICT (id) DO NOTHING;

-- Update profession field with options (if not already set)
UPDATE form_fields 
SET field_options = '{"options": ["Student", "Professional", "Artist", "Photographer", "Videographer", "Other"]}'
WHERE field_name = 'profession' AND field_options IS NULL;

-- Update gender field with options (if not already set)
UPDATE form_fields 
SET field_options = '{"options": ["Male", "Female", "Other", "Prefer not to say"]}'
WHERE field_name = 'gender' AND field_options IS NULL;

-- Add age validation rules (if not already set)
UPDATE form_fields 
SET validation_rules = '{"min": 15, "max": 100, "message": "You must be at least 15 years old to participate"}'
WHERE field_name = 'age' AND validation_rules IS NULL;

-- Ensure settings table has unique constraint on key column
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'settings_key_unique'
    ) THEN
        ALTER TABLE settings ADD CONSTRAINT settings_key_unique UNIQUE (key);
    END IF;
END $$;

-- Add registration control settings
INSERT INTO settings (key, value, description) VALUES 
('registration_control', '{
    "isOpen": true,
    "closedMessage": "Registration is currently closed. Please check back later for updates.",
    "closedTitle": "Registration Closed",
    "showContactInfo": true,
    "contactEmail": "wtd.nlr@nextlinker.in",
    "contactPhone": "--"
}', 'Registration control settings including open/closed status and custom messages')
ON CONFLICT (key) DO NOTHING;

-- Add submission control settings
INSERT INTO settings (key, value, description) VALUES 
('submission_control', '{
    "isEnabled": true,
    "maxFileSize": 10485760,
    "allowedFormats": ["pdf", "jpg", "jpeg", "png"],
    "submissionDeadline": null,
    "thankYouMessage": "Thank you for submitting your work! We have received your submission and it is now under review.",
    "resultAnnouncementMessage": "Results will be announced soon. Stay tuned for updates!"
}', 'Submission control settings including file upload restrictions and messages')
ON CONFLICT (key) DO NOTHING;