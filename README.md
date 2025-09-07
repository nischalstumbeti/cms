# ContestZen

Unleash Creativity, Seamlessly.

## 🚀 Tech Stack

### Frontend
- **Framework**: Next.js 15.3.3 (React 18.3.1)
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom components
- **UI Components**: Radix UI primitives with custom styling
- **State Management**: React Context API
- **Form Handling**: React Hook Form with Zod validation

### Backend & AI
- **Database**: Supabase (PostgreSQL)
- **AI Framework**: Google Genkit with Gemini 2.5 Flash model
- **Email Service**: Nodemailer with SMTP
- **Server Actions**: Next.js Server Actions for API endpoints
- **Real-time**: Supabase real-time subscriptions

### Deployment
- **Hosting**: Vercel (or any Node.js hosting platform)
- **Database**: Supabase Cloud
- **Email**: SMTP provider of choice

## 🗄️ Database Schema

The application uses PostgreSQL with the following main tables:
- `participants` - Contest participants
- `admins` - System administrators  
- `submissions` - Contest submissions with AI assessment
- `settings` - Application configuration (announcements, branding)

## 🚀 Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd cms
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Supabase**
   - Create a new Supabase project
   - Run the SQL schema from `supabase-schema.sql`
   - Get your project URL and anon key

4. **Configure environment variables**
   ```bash
   cp env.template .env.local
   # Edit .env.local with your actual values
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

## 📖 Migration from Firebase

This project has been migrated from Firebase to Supabase. See `MIGRATION_GUIDE.md` for detailed migration instructions.

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run genkit:dev` - Start Genkit AI development server
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript type checking

## 🎯 Features

- **AI-Powered Prompt Generation**: Automated creative contest prompts using Gemini
- **Real-time Dashboard**: Live updates of participants and submissions
- **File Upload & Assessment**: AI-powered submission evaluation
- **Email Verification**: OTP-based email verification system
- **Admin Panel**: Complete contest management interface
- **Responsive Design**: Mobile-first approach with modern UI

## 🔐 Environment Variables

Required environment variables (see `env.template`):

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SMTP_HOST=your_smtp_host
SMTP_PORT=465
SMTP_USER=your_smtp_username
SMTP_PASS=your_smtp_password
GOOGLE_GENAI_API_KEY=your_google_ai_api_key
```

## 📚 Documentation

- [Migration Guide](MIGRATION_GUIDE.md) - Complete Firebase to Supabase migration guide
- [Supabase Schema](supabase-schema.sql) - Database schema and setup
- [Environment Template](env.template) - Environment variables template

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.