# Firebase to Supabase Migration Guide

## Overview
This guide covers the complete migration from Firebase to Supabase for the ContestZen project, preserving all existing functionality while switching to a PostgreSQL-based backend.

## 🗄️ Database Migration

### 1. Create Supabase Project
1. Go to [supabase.com](https://supabase.com) and create a new project
2. Note down your project URL and anon key from the project settings

### 2. Set Up Database Schema
Run the SQL commands from `supabase-schema.sql` in your Supabase SQL editor:

```sql
-- The schema includes:
- participants table
- admins table  
- submissions table
- settings table
- Indexes for performance
- Row Level Security (RLS) policies
- Triggers for updated_at timestamps
```

### 3. Environment Variables
Create a `.env.local` file with the following variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Email Configuration (for OTP)
SMTP_HOST=your_smtp_host
SMTP_PORT=465
SMTP_USER=your_smtp_username
SMTP_PASS=your_smtp_password

# Google AI Configuration (for Genkit)
GOOGLE_GENAI_API_KEY=your_google_ai_api_key
```

## 🔧 Code Changes Made

### 1. Dependencies Updated
- ✅ Removed: `firebase`
- ✅ Added: `@supabase/supabase-js`

### 2. Configuration Files
- ✅ Created: `src/lib/supabase.ts` - Supabase client configuration
- ✅ Deleted: `src/lib/firebase.ts` - Firebase configuration
- ✅ Deleted: `apphosting.yaml` - Firebase hosting config
- ✅ Created: `vercel.json` - Vercel deployment config

### 3. Context Updates
- ✅ Updated `src/context/ContestContext.tsx` to use Supabase:
  - Real-time subscriptions using Supabase channels
  - CRUD operations using Supabase client
  - Error handling for PostgreSQL operations
  - Type-safe database operations

### 4. Database Operations
All Firebase Firestore operations have been replaced with Supabase PostgreSQL operations:

| Firebase Operation | Supabase Equivalent |
|-------------------|-------------------|
| `collection().addDoc()` | `supabase.from().insert()` |
| `collection().getDocs()` | `supabase.from().select()` |
| `doc().updateDoc()` | `supabase.from().update()` |
| `onSnapshot()` | `supabase.channel().on()` |

## 🚀 Deployment

### Option 1: Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push

### Option 2: Other Platforms
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## 🔐 Authentication (Optional)
The current implementation doesn't use Firebase Auth. If you need authentication:

1. Enable Supabase Auth in your project settings
2. Update components to use Supabase Auth methods
3. Implement proper RLS policies based on user authentication

## 📊 Data Migration (If Needed)
If you have existing Firebase data to migrate:

1. Export data from Firebase Firestore
2. Transform data to match PostgreSQL schema
3. Import using Supabase dashboard or API

## 🧪 Testing
1. Install dependencies: `npm install`
2. Set up environment variables
3. Run development server: `npm run dev`
4. Test all functionality:
   - User registration
   - Admin creation
   - Submission upload
   - AI prompt generation
   - Real-time updates

## 🔍 Key Differences

### Real-time Updates
- **Firebase**: `onSnapshot()` with automatic reconnection
- **Supabase**: `supabase.channel().on()` with manual subscription management

### Data Types
- **Firebase**: NoSQL documents with flexible schemas
- **Supabase**: PostgreSQL with strict schemas and relationships

### Error Handling
- **Firebase**: JavaScript errors
- **Supabase**: PostgreSQL error codes (e.g., `PGRST116` for "not found")

## 🛠️ Troubleshooting

### Common Issues
1. **Connection errors**: Check Supabase URL and anon key
2. **RLS policies**: Ensure policies allow your operations
3. **Real-time not working**: Check channel subscriptions
4. **Type errors**: Verify database schema matches TypeScript types

### Performance Tips
1. Use indexes for frequently queried columns
2. Implement pagination for large datasets
3. Use Supabase's built-in caching
4. Monitor query performance in Supabase dashboard

## 📈 Benefits of Migration

1. **Better Performance**: PostgreSQL is faster for complex queries
2. **ACID Compliance**: Better data consistency
3. **SQL Support**: Full SQL capabilities
4. **Cost Effective**: More predictable pricing
5. **Open Source**: No vendor lock-in
6. **Better Tooling**: Rich ecosystem of PostgreSQL tools

## 🔄 Rollback Plan
If you need to rollback to Firebase:
1. Keep the original Firebase configuration
2. Revert package.json dependencies
3. Restore Firebase context implementation
4. Update deployment configuration

## 📞 Support
- Supabase Documentation: https://supabase.com/docs
- Supabase Discord: https://discord.supabase.com
- GitHub Issues: Create an issue in your repository
