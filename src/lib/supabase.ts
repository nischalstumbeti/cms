// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable. Please check your .env.local file.')
}

if (!supabaseAnonKey) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable. Please check your .env.local file.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface Database {
  public: {
    Tables: {
      participants: {
        Row: {
          id: string
          name: string
          email: string
          profession: string
          other_profession?: string | null
          gender: 'male' | 'female' | 'other' | 'prefer-not-to-say'
          profile_photo_url?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          profession: string
          other_profession?: string | null
          gender: 'male' | 'female' | 'other' | 'prefer-not-to-say'
          profile_photo_url?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          profession?: string
          other_profession?: string | null
          gender?: 'male' | 'female' | 'other' | 'prefer-not-to-say'
          profile_photo_url?: string
          created_at?: string
          updated_at?: string
        }
      }
      admins: {
        Row: {
          id: string
          name: string
          email: string
          phone: string
          department: string
          government: 'state' | 'central'
          place: string
          role: 'superadmin' | 'admin'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          phone: string
          department: string
          government: 'state' | 'central'
          place: string
          role?: 'superadmin' | 'admin'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          phone?: string
          department?: string
          government?: 'state' | 'central'
          place?: string
          role?: 'superadmin' | 'admin'
          created_at?: string
          updated_at?: string
        }
      }
      submissions: {
        Row: {
          id: string
          participant_id: string
          file_data_uri: string
          file_name: string
          adherence_score?: number
          rationale?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          participant_id: string
          file_data_uri: string
          file_name: string
          adherence_score?: number
          rationale?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          participant_id?: string
          file_data_uri?: string
          file_name?: string
          adherence_score?: number
          rationale?: string
          created_at?: string
          updated_at?: string
        }
      }
      settings: {
        Row: {
          id: string
          key: string
          value: any
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          key: string
          value: any
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          key?: string
          value?: any
          created_at?: string
          updated_at?: string
        }
      }
      announcements: {
        Row: {
          id: string
          title: string
          content: string
          hyperlink?: string | null
          document_url?: string | null
          document_name?: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          content: string
          hyperlink?: string | null
          document_url?: string | null
          document_name?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          content?: string
          hyperlink?: string | null
          document_url?: string | null
          document_name?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}

// Type-safe client
export const supabaseClient = createClient<Database>(supabaseUrl, supabaseAnonKey)
