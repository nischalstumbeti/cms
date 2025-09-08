
"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { GenerateContestPromptOutput } from '@/ai/flows/automated-prompt-generation';

// Types
export interface Participant {
  id: string;
  name: string;
  email: string;
  profession: string;
  otherProfession?: string | null;
  gender: 'male' | 'female' | 'other' | 'prefer-not-to-say';
  age?: number | null;
  contestType?: 'photography' | 'videography';
  profilePhotoUrl?: string;
  login_enabled?: boolean;
  upload_enabled?: boolean;
  auth_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Admin {
    id: string;
    name: string;
    email: string;
    phone: string;
    department: string;
    government: 'state' | 'central' | 'outsource' | 'other';
    place: string;
    role: 'superadmin' | 'admin';
    password?: string;
    permissions?: {
        can_manage_announcements: boolean;
        can_manage_participants: boolean;
        can_manage_submissions: boolean;
        can_manage_admins: boolean;
        can_manage_settings: boolean;
        can_export_data: boolean;
    };
}

export interface Submission {
  id?: string;
  participantId: string;
  submissionType: 'photography' | 'videography';
  submissionStatus: 'pending' | 'approved' | 'rejected' | 'cancelled';
  adminNotes?: string;
  internalRemarks?: string;
  link?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface DriveLinkSubmission {
  participantId: string;
  link: string;
  description: string;
  submissionType: 'photography' | 'videography';
  submissionStatus: 'pending' | 'approved' | 'rejected' | 'cancelled';
}

export interface Announcement {
    title: string;
    description: string;
    theme: string;
}

export interface Branding {
    headerTitle: string;
    headerSubtitle: string;
    footerText: string;
}

export interface BrandingAsset {
    id?: string;
    name: string;
    type: 'header_image' | 'logo' | 'favicon' | 'background' | 'banner';
    fileUrl: string;
    fileSize?: number;
    mimeType?: string;
    width?: number;
    height?: number;
    altText?: string;
    isActive: boolean;
}

export interface CmsContent {
    id?: string;
    title: string;
    content: string;
    type: 'guidelines' | 'news' | 'announcement' | 'faq' | 'terms' | 'privacy';
    status: 'draft' | 'published' | 'archived';
    priority: number;
    placement: 'public' | 'participant' | 'both' | 'admin';
    showOnHomepage: boolean;
    showOnRegistration: boolean;
    createdBy?: string;
}

export interface FormField {
    id?: string;
    fieldName: string;
    fieldLabel: string;
    fieldType: 'text' | 'email' | 'number' | 'select' | 'textarea' | 'checkbox' | 'radio' | 'date';
    fieldOptions?: any;
    isRequired: boolean;
    isActive: boolean;
    displayOrder: number;
    validationRules?: any;
    createdBy?: string;
}

export interface FormSettings {
    ageValidation: {
        enabled: boolean;
        minimumAge: number;
        message: string;
    };
    formConfig: {
        collectAge: boolean;
        ageRequired: boolean;
        showAgeValidation: boolean;
    };
}

export interface RegistrationControl {
    isOpen: boolean;
    closedMessage: string;
    closedTitle: string;
    showContactInfo: boolean;
    contactEmail?: string;
    contactPhone?: string;
}

export interface SubmissionControl {
    isEnabled: boolean;
    maxFileSize: number;
    allowedFormats: string[];
    submissionDeadline?: string | null;
    thankYouMessage: string;
    resultAnnouncementMessage: string;
    collectionMode: 'google_form' | 'drive_links';
    googleFormLink?: string;
}

export interface EnhancedBranding {
    headerImage: {
        url: string;
        width: number;
        height: number;
        altText: string;
    };
    logo: {
        url: string;
        width: number;
        height: number;
        altText: string;
    };
    favicon: {
        url: string;
        altText: string;
    };
    colorScheme: {
        primary: string;
        secondary: string;
        accent: string;
    };
    fonts: {
        heading: string;
        body: string;
    };
}

interface ContestContextType {
  participants: Participant[];
  addParticipant: (participant: Omit<Participant, 'id'>) => Promise<{ success: boolean; message: string }>;
  updateParticipantLoginStatus: (participantId: string, enabled: boolean) => Promise<{ success: boolean; message: string }>;
  updateParticipantUploadStatus: (participantId: string, enabled: boolean) => Promise<{ success: boolean; message: string }>;
  bulkUpdateParticipantLoginStatus: (enabled: boolean) => Promise<{ success: boolean; message: string }>;
  bulkUpdateParticipantUploadStatus: (enabled: boolean) => Promise<{ success: boolean; message: string }>;
  admins: Admin[];
  addAdmin: (admin: Omit<Admin, 'id'>) => Promise<{ success: boolean; message: string }>;
  submissions: Submission[];
  addSubmission: (submission: Omit<Submission, 'id'>) => Promise<{ success: boolean; message: string }>;
  addDriveLinkSubmission: (submission: DriveLinkSubmission) => Promise<{ success: boolean; message: string }>;
  updateSubmission: (submissionId: string, data: Partial<Submission>) => Promise<void>;
  updateSubmissionRemarks: (submissionId: string, remarks: string) => Promise<{ success: boolean; message: string }>;
  findSubmissionByParticipantId: (id: string) => Submission | undefined;
  registrationOpen: boolean;
  setRegistrationOpen: (isOpen: boolean) => void;
  activePrompt: GenerateContestPromptOutput | null;
  setActivePrompt: (prompt: GenerateContestPromptOutput | null) => void;
  announcement: Announcement | null;
  updateAnnouncement: (announcement: Announcement) => Promise<void>;
  branding: Branding | null;
  updateBranding: (branding: Branding) => Promise<void>;
  enhancedBranding: EnhancedBranding | null;
  updateEnhancedBranding: (branding: EnhancedBranding) => Promise<void>;
  brandingAssets: BrandingAsset[];
  addBrandingAsset: (asset: Omit<BrandingAsset, 'id'>) => Promise<{ success: boolean; message: string }>;
  updateBrandingAsset: (assetId: string, asset: Partial<BrandingAsset>) => Promise<{ success: boolean; message: string }>;
  deleteBrandingAsset: (assetId: string) => Promise<{ success: boolean; message: string }>;
  cmsContent: CmsContent[];
  addCmsContent: (content: Omit<CmsContent, 'id'>) => Promise<{ success: boolean; message: string }>;
  updateCmsContent: (contentId: string, content: Partial<CmsContent>) => Promise<{ success: boolean; message: string }>;
  deleteCmsContent: (contentId: string) => Promise<{ success: boolean; message: string }>;
  getCmsContentByPlacement: (placement: 'public' | 'participant' | 'both' | 'admin') => CmsContent[];
  formFields: FormField[];
  addFormField: (field: Omit<FormField, 'id'>) => Promise<{ success: boolean; message: string }>;
  updateFormField: (fieldId: string, field: Partial<FormField>) => Promise<{ success: boolean; message: string }>;
  deleteFormField: (fieldId: string) => Promise<{ success: boolean; message: string }>;
  formSettings: FormSettings | null;
  updateFormSettings: (settings: FormSettings) => Promise<{ success: boolean; message: string }>;
  registrationControl: RegistrationControl | null;
  updateRegistrationControl: (control: RegistrationControl) => Promise<{ success: boolean; message: string }>;
  submissionControl: SubmissionControl | null;
  updateSubmissionControl: (control: SubmissionControl) => Promise<{ success: boolean; message: string }>;
  // OTP functions
  generateOTP: (email: string) => Promise<{ success: boolean; message: string }>;
  verifyOTP: (email: string, otp: string) => Promise<{ success: boolean; message: string; participantId?: string }>;
}

// Context
const ContestContext = createContext<ContestContextType | undefined>(undefined);

// Provider
export const ContestProvider = ({ children }: { children: ReactNode }) => {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [registrationOpen, setRegistrationOpen] = useState(true);
  const [activePrompt, setActivePrompt] = useState<GenerateContestPromptOutput | null>(null);
  const [announcement, setAnnouncement] = useState<Announcement | null>({
    title: "World Tourism Day 2025 Photography Contest",
    description: "The District Administration is pleased to announce a photography contest to celebrate World Tourism Day 2025. Capture the beauty of our district's tourist destinations and win exciting prizes.",
    theme: "Tourism & Green Investments"
  });
  const [branding, setBranding] = useState<Branding | null>({
      headerTitle: " World Tourism Day Contest",
      headerSubtitle: "Nellore District, AP",
      footerText: `© ${new Date().getFullYear()} All rights reserved.`
  });
  const [enhancedBranding, setEnhancedBranding] = useState<EnhancedBranding | null>({
    headerImage: {
      url: "",
      width: 1200,
      height: 300,
      altText: "Header Image"
    },
    logo: {
      url: "",
      width: 200,
      height: 80,
      altText: "Logo"
    },
    favicon: {
      url: "",
      altText: "Favicon"
    },
    colorScheme: {
      primary: "#3b82f6",
      secondary: "#64748b",
      accent: "#f59e0b"
    },
    fonts: {
      heading: "Inter",
      body: "Inter"
    }
  });
  const [brandingAssets, setBrandingAssets] = useState<BrandingAsset[]>([]);
  const [cmsContent, setCmsContent] = useState<CmsContent[]>([]);
  const [formFields, setFormFields] = useState<FormField[]>([]);
  const [formSettings, setFormSettings] = useState<FormSettings | null>({
    ageValidation: {
      enabled: true,
      minimumAge: 15,
      message: "You must be at least 15 years old to participate"
    },
    formConfig: {
      collectAge: true,
      ageRequired: true,
      showAgeValidation: true
    }
  });
  const [registrationControl, setRegistrationControl] = useState<RegistrationControl | null>({
    isOpen: true,
    closedMessage: "Registration is currently closed. Please check back later for updates.",
    closedTitle: "Registration Closed",
    showContactInfo: true,
    contactEmail: "",
    contactPhone: ""
  });
  const [submissionControl, setSubmissionControl] = useState<SubmissionControl | null>({
    isEnabled: true,
    maxFileSize: 10485760, // 10MB
    allowedFormats: ["pdf", "jpg", "jpeg", "png"],
    submissionDeadline: null,
    thankYouMessage: "Thank you for submitting your work! We have received your submission and it is now under review.",
    resultAnnouncementMessage: "Results will be announced soon. Stay tuned for updates!",
    collectionMode: 'google_form',
    googleFormLink: ""
  });

  useEffect(() => {
    // Load from local storage
    const storedPrompt = localStorage.getItem('activePrompt');
    if (storedPrompt) {
      setActivePrompt(JSON.parse(storedPrompt));
    }
    const storedRegistrationStatus = localStorage.getItem('registrationOpen');
    if (storedRegistrationStatus) {
        setRegistrationOpen(JSON.parse(storedRegistrationStatus));
    }

    // Fetch initial data
    const fetchData = async () => {
      try {
        // Fetch participants
        const { data: participantsData, error: participantsError } = await supabase
          .from('participants')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (participantsError) throw participantsError;
        
        // Map database field names to frontend interface
        const mappedParticipants = (participantsData || []).map(participant => ({
          id: participant.id,
          name: participant.name,
          email: participant.email,
          profession: participant.profession,
          otherProfession: participant.other_profession,
          gender: participant.gender,
          age: participant.age,
          contestType: participant.contest_type,
          profilePhotoUrl: participant.profile_photo_url,
          login_enabled: participant.login_enabled,
          upload_enabled: participant.upload_enabled,
          auth_id: participant.auth_id,
          created_at: participant.created_at,
          updated_at: participant.updated_at
        }));
        
        setParticipants(mappedParticipants);

        // Fetch admins
        const { data: adminsData, error: adminsError } = await supabase
          .from('admins')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (adminsError) throw adminsError;
        setAdmins(adminsData || []);

        // Fetch submissions
        const { data: submissionsData, error: submissionsError } = await supabase
          .from('submissions')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (submissionsError) throw submissionsError;
        
        // Map database field names to frontend interface
        const mappedSubmissions = (submissionsData || []).map(submission => ({
          id: submission.id,
          participantId: submission.participant_id,
          submissionType: submission.submission_type || 'photography',
          submissionStatus: submission.submission_status || 'pending',
          adminNotes: submission.admin_notes,
          internalRemarks: submission.internal_remarks,
          link: submission.link,
          createdAt: submission.created_at,
          updatedAt: submission.updated_at
        }));
        
        setSubmissions(mappedSubmissions);

        // Fetch announcement settings
        const { data: announcementData, error: announcementError } = await supabase
          .from('settings')
          .select('value')
          .eq('key', 'announcement')
          .single();
        
        if (announcementError && announcementError.code !== 'PGRST116') throw announcementError;
        if (announcementData && announcementData.value) {
          setAnnouncement(announcementData.value as Announcement);
        }

        // Fetch branding settings
        const { data: brandingData, error: brandingError } = await supabase
          .from('settings')
          .select('value')
          .eq('key', 'branding')
          .single();
        
        if (brandingError && brandingError.code !== 'PGRST116') throw brandingError;
        if (brandingData && brandingData.value) {
          setBranding(brandingData.value as Branding);
        }

        // Fetch enhanced branding settings
        const { data: enhancedBrandingData, error: enhancedBrandingError } = await supabase
          .from('settings')
          .select('value')
          .eq('key', 'enhanced_branding')
          .single();
        
        if (enhancedBrandingError && enhancedBrandingError.code !== 'PGRST116') throw enhancedBrandingError;
        if (enhancedBrandingData && enhancedBrandingData.value) {
          setEnhancedBranding(enhancedBrandingData.value as EnhancedBranding);
        }

        // Fetch branding assets
        const { data: brandingAssetsData, error: brandingAssetsError } = await supabase
          .from('branding_assets')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (brandingAssetsError) throw brandingAssetsError;
        
        const mappedBrandingAssets = (brandingAssetsData || []).map(asset => ({
          id: asset.id,
          name: asset.name,
          type: asset.type,
          fileUrl: asset.file_url,
          fileSize: asset.file_size,
          mimeType: asset.mime_type,
          width: asset.width,
          height: asset.height,
          altText: asset.alt_text,
          isActive: asset.is_active
        }));
        
        setBrandingAssets(mappedBrandingAssets);

        // Fetch CMS content
        const { data: cmsContentData, error: cmsContentError } = await supabase
          .from('cms_content')
          .select('*')
          .order('priority', { ascending: true });
        
        if (cmsContentError) throw cmsContentError;
        
        const mappedCmsContent = (cmsContentData || []).map(content => ({
          id: content.id,
          title: content.title,
          content: content.content,
          type: content.type,
          status: content.status,
          priority: content.priority,
          placement: content.placement,
          showOnHomepage: content.show_on_homepage,
          showOnRegistration: content.show_on_registration,
          createdBy: content.created_by
        }));
        
        setCmsContent(mappedCmsContent);

        // Fetch form fields
        const { data: formFieldsData, error: formFieldsError } = await supabase
          .from('form_fields')
          .select('*')
          .eq('is_active', true)
          .order('display_order', { ascending: true });
        
        if (formFieldsError) throw formFieldsError;
        
        const mappedFormFields = (formFieldsData || []).map(field => ({
          id: field.id,
          fieldName: field.field_name,
          fieldLabel: field.field_label,
          fieldType: field.field_type,
          fieldOptions: field.field_options,
          isRequired: field.is_required,
          isActive: field.is_active,
          displayOrder: field.display_order,
          validationRules: field.validation_rules,
          createdBy: field.created_by
        }));
        
        setFormFields(mappedFormFields);

        // Fetch form settings
        const { data: formSettingsData, error: formSettingsError } = await supabase
          .from('form_settings')
          .select('*');
        
        if (formSettingsError) throw formSettingsError;
        
        if (formSettingsData && formSettingsData.length > 0) {
          const ageValidation = formSettingsData.find(s => s.key === 'age_validation')?.value;
          const formConfig = formSettingsData.find(s => s.key === 'form_config')?.value;
          
          if (ageValidation && formConfig) {
            setFormSettings({
              ageValidation,
              formConfig
            });
          }
        }

        // Fetch registration control settings
        const { data: registrationControlData, error: registrationControlError } = await supabase
          .from('settings')
          .select('*')
          .eq('key', 'registration_control')
          .single();
        
        if (registrationControlError && registrationControlError.code !== 'PGRST116') {
          console.error('Error fetching registration control:', registrationControlError);
        } else if (registrationControlData) {
          setRegistrationControl(registrationControlData.value);
        }

        // Fetch submission control settings
        const { data: submissionControlData, error: submissionControlError } = await supabase
          .from('settings')
          .select('*')
          .eq('key', 'submission_control')
          .single();
        
        if (submissionControlError && submissionControlError.code !== 'PGRST116') {
          console.error('Error fetching submission control:', submissionControlError);
        } else if (submissionControlData) {
          setSubmissionControl(submissionControlData.value);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        console.error('Error details:', {
          message: error instanceof Error ? error.message : 'Unknown error',
          code: (error as any)?.code,
          details: (error as any)?.details,
          hint: (error as any)?.hint
        });
      }
    };

    fetchData();

    // Set up real-time subscriptions
    const participantsSubscription = supabase
      .channel('participants-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'participants' },
        () => {
          // Refetch participants when changes occur
          supabase.from('participants').select('*').order('created_at', { ascending: false })
            .then(({ data, error }) => {
              if (!error && data) {
                // Map database field names to frontend interface
                const mappedParticipants = data.map(participant => ({
                  id: participant.id,
                  name: participant.name,
                  email: participant.email,
                  profession: participant.profession,
                  otherProfession: participant.other_profession,
                  gender: participant.gender,
                  age: participant.age,
                  contestType: participant.contest_type,
                  profilePhotoUrl: participant.profile_photo_url,
                  login_enabled: participant.login_enabled,
                  upload_enabled: participant.upload_enabled,
                  auth_id: participant.auth_id,
                  created_at: participant.created_at,
                  updated_at: participant.updated_at
                }));
                setParticipants(mappedParticipants);
              }
            });
        }
      )
      .subscribe();

    const adminsSubscription = supabase
      .channel('admins-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'admins' },
        () => {
          // Refetch admins when changes occur
          supabase.from('admins').select('*').order('created_at', { ascending: false })
            .then(({ data, error }) => {
              if (!error && data) setAdmins(data);
            });
        }
      )
      .subscribe();

    const submissionsSubscription = supabase
      .channel('submissions-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'submissions' },
        () => {
          // Refetch submissions when changes occur
          supabase.from('submissions').select('*').order('created_at', { ascending: false })
            .then(({ data, error }) => {
              if (!error && data) {
                // Map database field names to frontend interface
                const mappedSubmissions = data.map(submission => ({
                  id: submission.id,
                  participantId: submission.participant_id,
                  submissionType: submission.submission_type || 'photography',
                  submissionStatus: submission.submission_status || 'pending',
                  adminNotes: submission.admin_notes,
                  internalRemarks: submission.internal_remarks,
                  link1: submission.link1,
                  link2: submission.link2,
                  link3: submission.link3,
                  link4: submission.link4,
                  link5: submission.link5,
                  createdAt: submission.created_at,
                  updatedAt: submission.updated_at
                }));
                setSubmissions(mappedSubmissions);
              }
            });
        }
      )
      .subscribe();

    const settingsSubscription = supabase
      .channel('settings-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'settings' },
        (payload) => {
          // Update specific settings when they change
          if (payload.new && (payload.new as any).key === 'announcement') {
            setAnnouncement((payload.new as any).value as Announcement);
          }
          if (payload.new && (payload.new as any).key === 'branding') {
            setBranding((payload.new as any).value as Branding);
          }
          if (payload.new && (payload.new as any).key === 'enhanced_branding') {
            setEnhancedBranding((payload.new as any).value as EnhancedBranding);
          }
        }
      )
      .subscribe();

    const brandingAssetsSubscription = supabase
      .channel('branding-assets-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'branding_assets' },
        () => {
          // Refetch branding assets when changes occur
          supabase.from('branding_assets').select('*').order('created_at', { ascending: false })
            .then(({ data, error }) => {
              if (!error && data) {
                const mappedBrandingAssets = data.map(asset => ({
                  id: asset.id,
                  name: asset.name,
                  type: asset.type,
                  fileUrl: asset.file_url,
                  fileSize: asset.file_size,
                  mimeType: asset.mime_type,
                  width: asset.width,
                  height: asset.height,
                  altText: asset.alt_text,
                  isActive: asset.is_active
                }));
                setBrandingAssets(mappedBrandingAssets);
              }
            });
        }
      )
      .subscribe();

    const cmsContentSubscription = supabase
      .channel('cms-content-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'cms_content' },
        () => {
          // Refetch CMS content when changes occur
          supabase.from('cms_content').select('*').order('priority', { ascending: true })
            .then(({ data, error }) => {
              if (!error && data) {
                const mappedCmsContent = data.map(content => ({
                  id: content.id,
                  title: content.title,
                  content: content.content,
                  type: content.type,
                  status: content.status,
                  priority: content.priority,
                  placement: content.placement,
                  showOnHomepage: content.show_on_homepage,
                  showOnRegistration: content.show_on_registration,
                  createdBy: content.created_by
                }));
                setCmsContent(mappedCmsContent);
              }
            });
        }
      )
      .subscribe();

    return () => {
      participantsSubscription.unsubscribe();
      adminsSubscription.unsubscribe();
      submissionsSubscription.unsubscribe();
      settingsSubscription.unsubscribe();
      brandingAssetsSubscription.unsubscribe();
      cmsContentSubscription.unsubscribe();
    };
  }, []);

  const addParticipant = async (participantData: Omit<Participant, 'id'>) => {
    try {
      console.log('Starting addParticipant with data:', participantData);
      console.log('Supabase client:', supabase);
      console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
      
      // Check if email already exists
      const { data: existingParticipant, error: checkError } = await supabase
        .from('participants')
        .select('id')
        .eq('email', participantData.email)
        .single();

      if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is "not found" error
        console.error('Error checking existing participant:', checkError);
        throw checkError;
      }

      if (existingParticipant) {
        return { success: false, message: "An account with this email already exists." };
      }
      
      // Map frontend field names to database field names
      const dbParticipantData = {
        name: participantData.name,
        email: participantData.email,
        profession: participantData.profession,
        other_profession: participantData.otherProfession,
        gender: participantData.gender,
        contest_type: participantData.contestType,
        profile_photo_url: participantData.profilePhotoUrl,
        upload_enabled: false // Default to false, admin can enable later
      };
      
      console.log('Database participant data:', dbParticipantData);
      console.log('About to insert into participants table...');
      
      // Use direct HTTP request instead of Supabase client
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      const requestUrl = `${supabaseUrl}/rest/v1/participants`;
      const requestBody = JSON.stringify([dbParticipantData]);
      
      console.log('=== HTTP REQUEST DETAILS ===');
      console.log('Method: POST');
      console.log('URL:', requestUrl);
      console.log('Headers:', {
        'Content-Type': 'application/json',
        'apikey': supabaseKey ? 'Present' : 'Missing',
        'Authorization': `Bearer ${supabaseKey}`,
        'Prefer': 'return=representation'
      });
      console.log('Request Body:', requestBody);
      console.log('============================');
      
      // Make direct HTTP request
      const response = await fetch(requestUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseKey!,
          'Authorization': `Bearer ${supabaseKey}`,
          'Prefer': 'return=representation'
        },
        body: requestBody
      });
      
      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));
      
      let data = null;
      let error = null;
      
      if (!response.ok) {
        const errorText = await response.text();
        console.log('Error response body:', errorText);
        error = {
          message: `HTTP ${response.status}: ${response.statusText}`,
          status: response.status,
          statusText: response.statusText,
          details: errorText
        };
      } else {
        data = await response.json();
        console.log('Success response body:', data);
      }
        
      console.log('Insert result - data:', data);
      console.log('Insert result - error:', error);

      if (error) {
        console.error('Error inserting participant:', error);
        console.error('Error details:', {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint,
          fullError: JSON.stringify(error, null, 2)
        });
        console.error('Raw error object:', error);
        console.error('Error type:', typeof error);
        console.error('Error constructor:', error.constructor.name);
        throw error;
      }
      
      return { success: true, message: "Registration successful!" };
    } catch (error) {
      console.error('Error adding participant:', error);
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        code: (error as any)?.code,
        details: (error as any)?.details,
        hint: (error as any)?.hint,
        fullError: JSON.stringify(error, null, 2)
      });
      console.error('Raw error object:', error);
      console.error('Error type:', typeof error);
      console.error('Error constructor:', error?.constructor?.name);
      return { success: false, message: "Registration failed. Please try again." };
    }
  };

  const addAdmin = async (adminData: Omit<Admin, 'id'>) => {
    try {

      // Check if email already exists
      const { data: existingAdmin, error: checkError } = await supabase
        .from('admins')
        .select('id')
        .eq('email', adminData.email)
        .single();

      if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is "not found" error
        throw checkError;
      }

      if (existingAdmin) {
        return { success: false, message: "An admin with this email already exists." };
      }

      // Prepare admin data for database insertion
      const dbAdminData: any = {
        name: adminData.name,
        email: adminData.email,
        phone: adminData.phone,
        department: adminData.department,
        government: adminData.government,
        place: adminData.place,
        role: adminData.role || 'admin',
        password: adminData.password || 'password123',
      };

      // Only include permissions if they exist and the field is supported
      if (adminData.permissions) {
        dbAdminData.permissions = adminData.permissions;
      }

      
      const { data, error } = await supabase
        .from('admins')
        .insert([dbAdminData])
        .select();

      if (error) {
        console.error('Supabase error details:', {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint
        });
        throw error;
      }
      
      
      return { success: true, message: "Admin created successfully." };
    } catch (error) {
      console.error('Error adding admin:', error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      return { success: false, message: `Admin creation failed: ${errorMessage}` };
    }
  }

  const addSubmission = async (submissionData: Omit<Submission, 'id'>) => {
    try {
      // Check if submission already exists
      const existing = submissions.find(s => s.participantId === submissionData.participantId);
      
      // Map frontend field names to database field names
      const dbSubmissionData = {
        participant_id: submissionData.participantId,
        submission_type: submissionData.submissionType,
        submission_status: submissionData.submissionStatus,
        admin_notes: submissionData.adminNotes,
        internal_remarks: submissionData.internalRemarks,
        link: submissionData.link
      };
      
      if (existing && existing.id) {
        // Update existing submission
        const { error } = await supabase
          .from('submissions')
          .update(dbSubmissionData)
          .eq('id', existing.id);

        if (error) throw error;
      } else {
        // Add new submission
        const { error } = await supabase
          .from('submissions')
          .insert([dbSubmissionData]);

        if (error) throw error;
      }

      // Refresh submissions data
      const { data: submissionsData, error: submissionsError } = await supabase
        .from('submissions')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (submissionsError) throw submissionsError;
      
      // Map database field names to frontend interface
      const mappedSubmissions = (submissionsData || []).map(submission => ({
        id: submission.id,
        participantId: submission.participant_id,
        submissionType: submission.submission_type || 'photography',
        submissionStatus: submission.submission_status || 'pending',
        adminNotes: submission.admin_notes,
        internalRemarks: submission.internal_remarks,
        link: submission.link,
        createdAt: submission.created_at,
        updatedAt: submission.updated_at
      }));
      
      setSubmissions(mappedSubmissions);
      
      return { success: true, message: "Submission added successfully." };
    } catch (error) {
      console.error('Error adding/updating submission:', error);
      return { success: false, message: "Failed to add submission." };
    }
  };

  const addDriveLinkSubmission = async (submissionData: DriveLinkSubmission) => {
    try {
      // Check if submission already exists
      const existing = submissions.find(s => s.participantId === submissionData.participantId);
      
      if (existing) {
        return { success: false, message: "You have already submitted a link. Only one submission per participant is allowed." };
      }
      
      // Map frontend field names to database field names
      const dbSubmissionData = {
        participant_id: submissionData.participantId,
        submission_type: submissionData.submissionType,
        submission_status: submissionData.submissionStatus,
        link: submissionData.link
      };
      
      // Add new submission
      const { error } = await supabase
        .from('submissions')
        .insert([dbSubmissionData]);

      if (error) throw error;

      // Refresh submissions data
      const { data: submissionsData, error: submissionsError } = await supabase
        .from('submissions')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (submissionsError) throw submissionsError;
      
      // Map database field names to frontend interface
      const mappedSubmissions = (submissionsData || []).map(submission => ({
        id: submission.id,
        participantId: submission.participant_id,
        submissionType: submission.submission_type || 'photography',
        submissionStatus: submission.submission_status || 'pending',
        adminNotes: submission.admin_notes,
        internalRemarks: submission.internal_remarks,
        link: submission.link,
        createdAt: submission.created_at,
        updatedAt: submission.updated_at
      }));
      
      setSubmissions(mappedSubmissions);
      
      return { success: true, message: "Drive link submission added successfully." };
    } catch (error) {
      console.error('Error adding drive link submission:', error);
      return { success: false, message: "Failed to add drive link submission." };
    }
  };

  const updateSubmission = async (submissionId: string, data: Partial<Submission>) => {
    try {
      // Map frontend field names to database field names
      const dbUpdateData: any = {};
      if (data.submissionType !== undefined) dbUpdateData.submission_type = data.submissionType;
      if (data.submissionStatus !== undefined) dbUpdateData.submission_status = data.submissionStatus;
      if (data.adminNotes !== undefined) dbUpdateData.admin_notes = data.adminNotes;
      if (data.internalRemarks !== undefined) dbUpdateData.internal_remarks = data.internalRemarks;
      if (data.link !== undefined) dbUpdateData.link = data.link;
      
      const { error } = await supabase
        .from('submissions')
        .update(dbUpdateData)
        .eq('id', submissionId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating submission:', error);
      throw error;
    }
  }

  const findSubmissionByParticipantId = (id: string) => submissions.find(s => s.participantId === id);
  
  const handleSetRegistrationOpen = (isOpen: boolean) => {
      setRegistrationOpen(isOpen);
      localStorage.setItem('registrationOpen', JSON.stringify(isOpen));
  }

  const handleSetActivePrompt = (prompt: GenerateContestPromptOutput | null) => {
      setActivePrompt(prompt);
      if(prompt) {
          localStorage.setItem('activePrompt', JSON.stringify(prompt));
      } else {
          localStorage.removeItem('activePrompt');
      }
  }

  const updateAnnouncement = async (announcementData: Announcement) => {
    try {
      const { error } = await supabase
        .from('settings')
        .upsert({ key: 'announcement', value: announcementData });

      if (error) throw error;
    } catch (error) {
      console.error('Error updating announcement:', error);
      throw error;
    }
  }

  const updateBranding = async (brandingData: Branding) => {
    try {
      const { error } = await supabase
        .from('settings')
        .upsert({ key: 'branding', value: brandingData });

      if (error) throw error;
    } catch (error) {
      console.error('Error updating branding:', error);
      throw error;
    }
  }

  const updateParticipantLoginStatus = async (participantId: string, enabled: boolean) => {
    try {
      const { error } = await supabase
        .from('participants')
        .update({ login_enabled: enabled })
        .eq('id', participantId);

      if (error) throw error;
      
      return { 
        success: true, 
        message: `Participant login ${enabled ? 'enabled' : 'disabled'} successfully.` 
      };
    } catch (error) {
      console.error('Error updating participant login status:', error);
      return { 
        success: false, 
        message: 'Failed to update participant login status.' 
      };
    }
  }

  const updateParticipantUploadStatus = async (participantId: string, enabled: boolean) => {
    try {
      const { error } = await supabase
        .from('participants')
        .update({ upload_enabled: enabled })
        .eq('id', participantId);

      if (error) throw error;
      
      return { 
        success: true, 
        message: `Participant upload ${enabled ? 'enabled' : 'disabled'} successfully.` 
      };
    } catch (error) {
      console.error('Error updating participant upload status:', error);
      return { 
        success: false, 
        message: 'Failed to update participant upload status.' 
      };
    }
  }

  const bulkUpdateParticipantLoginStatus = async (enabled: boolean) => {
    try {
      
      // Get all participant IDs first
      const { data: participants, error: fetchError } = await supabase
        .from('participants')
        .select('id');

      if (fetchError) {
        console.error('Error fetching participants:', fetchError);
        throw fetchError;
      }

      if (!participants || participants.length === 0) {
        return { success: true, message: 'No participants found to update' };
      }

      // Update each participant individually to avoid RLS issues
      const updatePromises = participants.map(participant => 
        supabase
          .from('participants')
          .update({ login_enabled: enabled })
          .eq('id', participant.id)
      );

      const results = await Promise.all(updatePromises);
      
      // Check for any errors
      const errors = results.filter(result => result.error);
      if (errors.length > 0) {
        console.error('Some updates failed:', errors);
        throw new Error(`Failed to update ${errors.length} participants`);
      }


      // Update local state
      setParticipants(prev => 
        prev.map(p => ({ ...p, login_enabled: enabled }))
      );

      return { success: true, message: `Login status ${enabled ? 'enabled' : 'disabled'} for all ${participants.length} participants` };
    } catch (error) {
      console.error('Error bulk updating participant login status:', error);
      return { 
        success: false, 
        message: `Failed to update login status for all participants: ${error instanceof Error ? error.message : 'Unknown error'}` 
      };
    }
  };

  const bulkUpdateParticipantUploadStatus = async (enabled: boolean) => {
    try {
      
      // Get all participant IDs first
      const { data: participants, error: fetchError } = await supabase
        .from('participants')
        .select('id');

      if (fetchError) {
        console.error('Error fetching participants:', fetchError);
        throw fetchError;
      }

      if (!participants || participants.length === 0) {
        return { success: true, message: 'No participants found to update' };
      }

      // Update each participant individually to avoid RLS issues
      const updatePromises = participants.map(participant => 
        supabase
          .from('participants')
          .update({ upload_enabled: enabled })
          .eq('id', participant.id)
      );

      const results = await Promise.all(updatePromises);
      
      // Check for any errors
      const errors = results.filter(result => result.error);
      if (errors.length > 0) {
        console.error('Some updates failed:', errors);
        throw new Error(`Failed to update ${errors.length} participants`);
      }


      // Update local state
      setParticipants(prev => 
        prev.map(p => ({ ...p, upload_enabled: enabled }))
      );

      return { success: true, message: `Upload status ${enabled ? 'enabled' : 'disabled'} for all ${participants.length} participants` };
    } catch (error) {
      console.error('Error bulk updating participant upload status:', error);
      return { 
        success: false, 
        message: `Failed to update upload status for all participants: ${error instanceof Error ? error.message : 'Unknown error'}` 
      };
    }
  };

  const generateOTP = async (email: string) => {
    try {
      const response = await fetch('/api/participant-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error generating magic link:', error);
      return { 
        success: false, 
        message: 'Failed to send magic link. Please try again.' 
      };
    }
  }

  const verifyOTP = async (email: string, token: string) => {
    try {
      const response = await fetch('/api/verify-magic-link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, token }),
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error verifying magic link:', error);
      return { 
        success: false, 
        message: 'Failed to verify magic link. Please try again.' 
      };
    }
  }

  const updateSubmissionRemarks = async (submissionId: string, remarks: string) => {
    try {
      const { error } = await supabase
        .from('submissions')
        .update({ internal_remarks: remarks })
        .eq('id', submissionId);

      if (error) throw error;
      
      return { 
        success: true, 
        message: 'Submission remarks updated successfully.' 
      };
    } catch (error) {
      console.error('Error updating submission remarks:', error);
      return { 
        success: false, 
        message: 'Failed to update submission remarks.' 
      };
    }
  }

  const updateEnhancedBranding = async (brandingData: EnhancedBranding) => {
    try {
      const { error } = await supabase
        .from('settings')
        .upsert({ key: 'enhanced_branding', value: brandingData });

      if (error) throw error;
    } catch (error) {
      console.error('Error updating enhanced branding:', error);
      throw error;
    }
  }

  const addBrandingAsset = async (assetData: Omit<BrandingAsset, 'id'>) => {
    try {
      const dbAssetData = {
        name: assetData.name,
        type: assetData.type,
        file_url: assetData.fileUrl,
        file_size: assetData.fileSize,
        mime_type: assetData.mimeType,
        width: assetData.width,
        height: assetData.height,
        alt_text: assetData.altText,
        is_active: assetData.isActive
      };

      const { data, error } = await supabase
        .from('branding_assets')
        .insert([dbAssetData])
        .select();

      if (error) throw error;
      
      return { success: true, message: "Branding asset added successfully." };
    } catch (error) {
      console.error('Error adding branding asset:', error);
      return { success: false, message: "Failed to add branding asset." };
    }
  }

  const updateBrandingAsset = async (assetId: string, assetData: Partial<BrandingAsset>) => {
    try {
      const dbUpdateData: any = {};
      if (assetData.name !== undefined) dbUpdateData.name = assetData.name;
      if (assetData.type !== undefined) dbUpdateData.type = assetData.type;
      if (assetData.fileUrl !== undefined) dbUpdateData.file_url = assetData.fileUrl;
      if (assetData.fileSize !== undefined) dbUpdateData.file_size = assetData.fileSize;
      if (assetData.mimeType !== undefined) dbUpdateData.mime_type = assetData.mimeType;
      if (assetData.width !== undefined) dbUpdateData.width = assetData.width;
      if (assetData.height !== undefined) dbUpdateData.height = assetData.height;
      if (assetData.altText !== undefined) dbUpdateData.alt_text = assetData.altText;
      if (assetData.isActive !== undefined) dbUpdateData.is_active = assetData.isActive;

      const { error } = await supabase
        .from('branding_assets')
        .update(dbUpdateData)
        .eq('id', assetId);

      if (error) throw error;
      
      return { success: true, message: "Branding asset updated successfully." };
    } catch (error) {
      console.error('Error updating branding asset:', error);
      return { success: false, message: "Failed to update branding asset." };
    }
  }

  const deleteBrandingAsset = async (assetId: string) => {
    try {
      const { error } = await supabase
        .from('branding_assets')
        .delete()
        .eq('id', assetId);

      if (error) throw error;
      
      return { success: true, message: "Branding asset deleted successfully." };
    } catch (error) {
      console.error('Error deleting branding asset:', error);
      return { success: false, message: "Failed to delete branding asset." };
    }
  }

  const addCmsContent = async (contentData: Omit<CmsContent, 'id'>) => {
    try {
      const dbContentData = {
        title: contentData.title,
        content: contentData.content,
        type: contentData.type,
        status: contentData.status,
        priority: contentData.priority,
        created_by: contentData.createdBy
      };

      const { data, error } = await supabase
        .from('cms_content')
        .insert([dbContentData])
        .select();

      if (error) throw error;
      
      return { success: true, message: "CMS content added successfully." };
    } catch (error) {
      console.error('Error adding CMS content:', error);
      return { success: false, message: "Failed to add CMS content." };
    }
  }

  const updateCmsContent = async (contentId: string, contentData: Partial<CmsContent>) => {
    try {
      const dbUpdateData: any = {};
      if (contentData.title !== undefined) dbUpdateData.title = contentData.title;
      if (contentData.content !== undefined) dbUpdateData.content = contentData.content;
      if (contentData.type !== undefined) dbUpdateData.type = contentData.type;
      if (contentData.status !== undefined) dbUpdateData.status = contentData.status;
      if (contentData.priority !== undefined) dbUpdateData.priority = contentData.priority;

      const { error } = await supabase
        .from('cms_content')
        .update(dbUpdateData)
        .eq('id', contentId);

      if (error) throw error;
      
      return { success: true, message: "CMS content updated successfully." };
    } catch (error) {
      console.error('Error updating CMS content:', error);
      return { success: false, message: "Failed to update CMS content." };
    }
  }

  const deleteCmsContent = async (contentId: string) => {
    try {
      const { error } = await supabase
        .from('cms_content')
        .delete()
        .eq('id', contentId);

      if (error) throw error;
      
      return { success: true, message: "CMS content deleted successfully." };
    } catch (error) {
      console.error('Error deleting CMS content:', error);
      return { success: false, message: "Failed to delete CMS content." };
    }
  }

  const getCmsContentByPlacement = (placement: 'public' | 'participant' | 'both' | 'admin') => {
    return cmsContent.filter(content => 
      content.status === 'published' && 
      (content.placement === placement || content.placement === 'both')
    );
  }

  const addFormField = async (fieldData: Omit<FormField, 'id'>) => {
    try {
      const dbFieldData = {
        field_name: fieldData.fieldName,
        field_label: fieldData.fieldLabel,
        field_type: fieldData.fieldType,
        field_options: fieldData.fieldOptions,
        is_required: fieldData.isRequired,
        is_active: fieldData.isActive,
        display_order: fieldData.displayOrder,
        validation_rules: fieldData.validationRules,
        created_by: fieldData.createdBy
      };

      const { data, error } = await supabase
        .from('form_fields')
        .insert([dbFieldData])
        .select();

      if (error) throw error;
      
      return { success: true, message: "Form field added successfully." };
    } catch (error) {
      console.error('Error adding form field:', error);
      return { success: false, message: "Failed to add form field." };
    }
  }

  const updateFormField = async (fieldId: string, fieldData: Partial<FormField>) => {
    try {
      const dbUpdateData: any = {};
      if (fieldData.fieldName !== undefined) dbUpdateData.field_name = fieldData.fieldName;
      if (fieldData.fieldLabel !== undefined) dbUpdateData.field_label = fieldData.fieldLabel;
      if (fieldData.fieldType !== undefined) dbUpdateData.field_type = fieldData.fieldType;
      if (fieldData.fieldOptions !== undefined) dbUpdateData.field_options = fieldData.fieldOptions;
      if (fieldData.isRequired !== undefined) dbUpdateData.is_required = fieldData.isRequired;
      if (fieldData.isActive !== undefined) dbUpdateData.is_active = fieldData.isActive;
      if (fieldData.displayOrder !== undefined) dbUpdateData.display_order = fieldData.displayOrder;
      if (fieldData.validationRules !== undefined) dbUpdateData.validation_rules = fieldData.validationRules;

      const { error } = await supabase
        .from('form_fields')
        .update(dbUpdateData)
        .eq('id', fieldId);

      if (error) throw error;
      
      return { success: true, message: "Form field updated successfully." };
    } catch (error) {
      console.error('Error updating form field:', error);
      return { success: false, message: "Failed to update form field." };
    }
  }

  const deleteFormField = async (fieldId: string) => {
    try {
      const { error } = await supabase
        .from('form_fields')
        .delete()
        .eq('id', fieldId);

      if (error) throw error;
      
      return { success: true, message: "Form field deleted successfully." };
    } catch (error) {
      console.error('Error deleting form field:', error);
      return { success: false, message: "Failed to delete form field." };
    }
  }

  const updateFormSettings = async (settings: FormSettings) => {
    try {
      // Update age validation settings
      const { error: ageError } = await supabase
        .from('form_settings')
        .upsert({ key: 'age_validation', value: settings.ageValidation });

      if (ageError) throw ageError;

      // Update form config settings
      const { error: configError } = await supabase
        .from('form_settings')
        .upsert({ key: 'form_config', value: settings.formConfig });

      if (configError) throw configError;

      setFormSettings(settings);
      
      return { success: true, message: "Form settings updated successfully." };
    } catch (error) {
      console.error('Error updating form settings:', error);
      return { success: false, message: "Failed to update form settings." };
    }
  }

  const updateRegistrationControl = async (control: RegistrationControl) => {
    try {
      const { error } = await supabase
        .from('settings')
        .upsert({ 
          key: 'registration_control', 
          value: control,
          description: 'Registration control settings including open/closed status and custom messages'
        }, {
          onConflict: 'key'
        });

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      setRegistrationControl(control);
      
      return { success: true, message: "Registration control updated successfully." };
    } catch (error) {
      console.error('Error updating registration control:', error);
      return { success: false, message: `Failed to update registration control: ${error instanceof Error ? error.message : 'Unknown error'}` };
    }
  }

  const updateSubmissionControl = async (control: SubmissionControl) => {
    try {
      const { error } = await supabase
        .from('settings')
        .upsert({ 
          key: 'submission_control', 
          value: control,
          description: 'Submission control settings including file upload restrictions and messages'
        }, {
          onConflict: 'key'
        });

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      setSubmissionControl(control);
      
      return { success: true, message: "Submission control updated successfully." };
    } catch (error) {
      console.error('Error updating submission control:', error);
      return { success: false, message: `Failed to update submission control: ${error instanceof Error ? error.message : 'Unknown error'}` };
    }
  }


  const value = {
    participants,
    addParticipant,
    updateParticipantLoginStatus,
    updateParticipantUploadStatus,
    bulkUpdateParticipantLoginStatus,
    bulkUpdateParticipantUploadStatus,
    admins,
    addAdmin,
    submissions,
    addSubmission,
    addDriveLinkSubmission,
    updateSubmission,
    updateSubmissionRemarks,
    findSubmissionByParticipantId,
    registrationOpen,
    setRegistrationOpen: handleSetRegistrationOpen,
    activePrompt,
    setActivePrompt: handleSetActivePrompt,
    announcement,
    updateAnnouncement,
    branding,
    updateBranding,
    enhancedBranding,
    updateEnhancedBranding,
    brandingAssets,
    addBrandingAsset,
    updateBrandingAsset,
    deleteBrandingAsset,
    cmsContent,
    addCmsContent,
    updateCmsContent,
    deleteCmsContent,
    getCmsContentByPlacement,
    formFields,
    addFormField,
    updateFormField,
    deleteFormField,
    formSettings,
    updateFormSettings,
    registrationControl,
    updateRegistrationControl,
    submissionControl,
    updateSubmissionControl,
    generateOTP,
    verifyOTP,
  };

  return (
    <ContestContext.Provider value={value}>
      {children}
    </ContestContext.Provider>
  );
};

// Hook
export const useContest = () => {
  const context = useContext(ContestContext);
  if (context === undefined) {
    throw new Error('useContest must be used within a ContestProvider');
  }
  return context;
};
