# NuExis Digital Signage System

A professional digital signage management system built with Next.js 14, TypeScript, and Supabase.

## Features

- 🔐 Secure authentication with Email OTP
- 📺 Screen management and real-time status monitoring
- 🎬 Media library with file upload and organization
- 📋 Playlist creation and management
- ⏰ Advanced scheduling system with recurrence
- 🔄 Real-time content delivery via WebSocket
- 📱 Responsive design with mobile-first approach
- ♿ WCAG AA+ accessibility compliance

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL with RLS)
- **Authentication**: Supabase Auth with Email OTP
- **Real-time**: Socket.io + Supabase Realtime
- **State Management**: React Context + Zustand
- **File Storage**: Supabase Storage with signed URLs
- **UI Components**: Custom components following NDLS design system

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd nuexis-digital-signage
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.local.example .env.local
```

4. Configure your Supabase project:
   - Create a new Supabase project
   - Get your project URL and anon key
   - Update `.env.local` with your Supabase credentials

5. Set up the database:
   - Run the database migrations (see Database Setup section)
   - Configure Row Level Security policies
   - Set up storage buckets

6. Start the development server:
```bash
npm run dev
```

7. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Setup

The application requires several database tables with Row Level Security (RLS) enabled. Follow these steps:

### 1. Create Tables

Run the following SQL in your Supabase SQL editor:

```sql
-- Profiles table
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text,
  avatar_url text,
  timezone text DEFAULT 'UTC',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Screens table
CREATE TABLE screens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  screen_id text UNIQUE NOT NULL,
  description text,
  location text,
  is_online boolean DEFAULT false,
  last_seen timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

### 2. Enable RLS

```sql
-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE screens ENABLE ROW LEVEL SECURITY;
```

### 3. Create RLS Policies

```sql
-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Screens policies
CREATE POLICY "Users can view own screens" ON screens
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own screens" ON screens
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own screens" ON screens
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own screens" ON screens
  FOR DELETE USING (auth.uid() = user_id);
```

### 4. Set up Storage

Create storage buckets in Supabase:
- `user_uploads` (public)
- `user_avatars` (private)

## Project Structure

```
src/
├── app/                    # Next.js 14 app router
│   ├── (auth)/           # Authentication route group
│   ├── (dashboard)/      # Protected route group  
│   ├── layout.tsx        # Root layout
│   └── globals.css       # Global styles
├── components/           # Reusable components
│   ├── ui/              # Base UI components
│   └── shared/          # Application components
├── lib/                 # Utility libraries
│   ├── supabase.ts      # Supabase client configuration
│   ├── auth-context.tsx # Authentication context
│   └── utils.ts         # Helper functions
└── types/               # TypeScript definitions
```

## Design System

The application follows the NuExis Design Language System (NDLS) v2.0:

- **Colors**: Primary blue palette with semantic colors
- **Typography**: Inter font family with consistent scale
- **Spacing**: 8px base unit with consistent spacing scale
- **Components**: Card-based design with subtle shadows
- **Animations**: Smooth transitions and micro-interactions

## Development Phases

The project is developed in 7 sequential phases:

1. **Phase 1**: Authentication & Core Infrastructure ✅
2. **Phase 2**: Screen Management & Basic UI
3. **Phase 3**: Media Library & File Uploads
4. **Phase 4**: Screen Pairing System
5. **Phase 5**: Real-time Content Delivery
6. **Phase 6**: Scheduling System
7. **Phase 7**: Polish & Optimization

## Contributing

1. Follow the established design system
2. Ensure all components are accessible (WCAG AA+)
3. Write TypeScript with strict mode
4. Test all functionality before submitting
5. Follow the phase-based development approach

## License

This project is proprietary software. All rights reserved.