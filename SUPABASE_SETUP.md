# Supabase Setup Guide

This guide will help you set up your Supabase backend for the Event Ticketing App.

## Step 1: Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/log in
2. Click "New Project"
3. Choose your organization
4. Fill in your project details:
   - **Name**: Event Ticketing App (or your preferred name)
   - **Database Password**: Choose a strong password
   - **Region**: Select the region closest to your users
5. Click "Create new project"
6. Wait for the project to be set up (this may take a few minutes)

## Step 2: Configure Authentication

1. In your Supabase dashboard, go to **Authentication** > **Settings**
2. Under **Site URL**, add your development URL: `http://localhost:3000`
3. Under **Redirect URLs**, add: `http://localhost:3000/auth/callback`
4. Enable the authentication providers you want:
   - **Email**: Already enabled by default
   - **Google**: (Optional) Configure if you want Google sign-in
   - **Facebook**: (Optional) Configure if you want Facebook sign-in

### Email Templates (Optional)
You can customize the email templates in **Authentication** > **Email Templates**

## Step 3: Set Up Database Schema

1. Go to **SQL Editor** in your Supabase dashboard
2. Copy the entire content of `supabase-setup.sql` file
3. Paste it into the SQL Editor
4. Click **Run** to execute the script

This will create:
- All necessary tables (users, events, tickets, etc.)
- Indexes for performance
- Row Level Security (RLS) policies
- Triggers for automatic updates
- Helper functions for check-ins and analytics

## Step 4: Configure Storage (Optional)

If you want to allow users to upload event images:

1. Go to **Storage** in your Supabase dashboard
2. Create a new bucket called `event-images`
3. Set the bucket to **Public** if you want images to be publicly accessible
4. Configure upload policies as needed

## Step 5: Get Your Project Credentials

1. Go to **Settings** > **API** in your Supabase dashboard
2. Copy the following values:
   - **Project URL** (something like `https://your-project-id.supabase.co`)
   - **anon public key** (starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)
   - **service_role secret key** (starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)

## Step 6: Configure Environment Variables

1. In your project root, copy `.env.local.example` to `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```

2. Edit `.env.local` and fill in your Supabase credentials:
   ```env
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_public_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_secret_key

   # App Configuration
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   NEXT_PUBLIC_APP_NAME="EventTicket Pro"
   ```

## Step 7: Test the Connection

1. Start your development server:
   ```bash
   yarn dev
   ```

2. Open `http://localhost:3000` in your browser
3. Try to sign up for a new account
4. Check your Supabase dashboard to see if the user was created in the `auth.users` table and the `public.users` table

## Database Schema Overview

The database includes the following main tables:

### Core Tables
- **users**: Extended user profiles (linked to auth.users)
- **events**: Event information and settings
- **ticket_types**: Different ticket types for each event
- **orders**: Purchase orders from customers
- **tickets**: Individual tickets with QR codes
- **check_ins**: Check-in history and audit trail
- **event_analytics**: Real-time event statistics

### Key Features
- **Row Level Security (RLS)**: Ensures users can only access their own data
- **Automatic Analytics**: Ticket sales and check-in stats are updated automatically
- **QR Code Support**: Each ticket has a unique QR code for check-ins
- **Audit Trail**: All check-ins are logged with timestamps and staff info

## Security Considerations

1. **Never expose your service role key** in client-side code
2. The service role key should only be used in API routes or server-side functions
3. All database access is protected by Row Level Security policies
4. Users can only access their own events, orders, and tickets

## Troubleshooting

### Common Issues

1. **"Invalid API key"**: Make sure you're using the correct anon key for client-side operations
2. **"Row Level Security policy violation"**: Check that your RLS policies are correctly configured
3. **"Function not found"**: Make sure you ran the complete SQL setup script
4. **Authentication not working**: Verify your Site URL and Redirect URLs are correctly configured

### Useful SQL Queries for Testing

```sql
-- Check if tables were created
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';

-- Check RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies WHERE schemaname = 'public';

-- View all users
SELECT * FROM public.users;

-- View all events
SELECT * FROM public.events;
```

## Next Steps

Once your Supabase backend is configured:

1. Test user registration and authentication
2. Create your first event through the app
3. Test the ticket purchasing flow
4. Try the QR code check-in functionality

For production deployment, remember to:
- Update your Site URL and Redirect URLs to your production domain
- Configure proper email settings
- Set up proper backup and monitoring
- Review and adjust RLS policies as needed

