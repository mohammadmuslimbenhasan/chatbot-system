# Setup Guide - Multi-Agent Chatbot System

This guide provides step-by-step instructions to set up and configure the entire chatbot system.

## 1. Prerequisites

Before starting, ensure you have:
- Node.js 18 or higher installed
- A Supabase account (free tier works)
- Basic understanding of SQL and Next.js
- A code editor (VS Code recommended)

## 2. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project"
3. Create a new organization (if needed)
4. Click "New Project"
5. Fill in:
   - Project name: `chatbot-system`
   - Database password: (choose a strong password)
   - Region: (select closest to you)
6. Wait for project to be created (2-3 minutes)

## 3. Get Supabase Credentials

1. In your Supabase project dashboard, click on "Settings" (gear icon)
2. Navigate to "API" section
3. Copy the following values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon/public key** (under "Project API keys")

## 4. Configure Environment Variables

1. In your project root, create a file named `.env.local`
2. Add the following:

```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

3. Replace the values with your actual Supabase credentials
4. Save the file

## 5. Install Project Dependencies

Open your terminal in the project directory and run:

```bash
npm install
```

This will install all required packages including:
- Next.js
- Supabase client
- Tailwind CSS
- shadcn/ui components
- TypeScript dependencies

## 6. Set Up Database Schema

### Using SQL Editor in Supabase Dashboard

1. Go to your Supabase dashboard
2. Click on "SQL Editor" in the left sidebar
3. Click "New Query"
4. Copy and paste the following complete SQL script:

```sql
-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text,
  role text NOT NULL DEFAULT 'customer' CHECK (role IN ('admin', 'agent', 'customer')),
  avatar_url text,
  is_active boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create chats table
CREATE TABLE IF NOT EXISTS chats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name text,
  customer_email text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'resolved', 'closed')),
  assigned_agent_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id uuid NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
  sender_type text NOT NULL CHECK (sender_type IN ('customer', 'agent', 'bot')),
  sender_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  content text,
  message_type text DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'document', 'preset')),
  metadata jsonb DEFAULT '{}',
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create presets table
CREATE TABLE IF NOT EXISTS presets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id uuid REFERENCES presets(id) ON DELETE CASCADE,
  question_text text,
  answer_text text,
  button_label text NOT NULL,
  order_index integer DEFAULT 0,
  is_active boolean DEFAULT true,
  escalate_to_agent boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create quick_links table
CREATE TABLE IF NOT EXISTS quick_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  label text NOT NULL,
  url text NOT NULL,
  icon_name text DEFAULT 'ExternalLink',
  order_index integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create brand_settings table
CREATE TABLE IF NOT EXISTS brand_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key text UNIQUE NOT NULL,
  setting_value text,
  updated_at timestamptz DEFAULT now()
);

-- Create file_attachments table
CREATE TABLE IF NOT EXISTS file_attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id uuid NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  file_name text NOT NULL,
  file_url text NOT NULL,
  file_type text CHECK (file_type IN ('image', 'document')),
  file_size integer,
  created_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_chats_status ON chats(status);
CREATE INDEX IF NOT EXISTS idx_chats_assigned_agent ON chats(assigned_agent_id);
CREATE INDEX IF NOT EXISTS idx_messages_chat_id ON messages(chat_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
CREATE INDEX IF NOT EXISTS idx_presets_parent_id ON presets(parent_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE presets ENABLE ROW LEVEL SECURITY;
ALTER TABLE quick_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE brand_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE file_attachments ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can manage all profiles"
  ON profiles FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Chats policies
CREATE POLICY "Anyone can create chats"
  ON chats FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Authenticated users can view chats"
  ON chats FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'agent')
    )
  );

CREATE POLICY "Agents and admins can update chats"
  ON chats FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'agent')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'agent')
    )
  );

-- Messages policies
CREATE POLICY "Anyone can insert messages"
  ON messages FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can view messages"
  ON messages FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can update messages"
  ON messages FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'agent')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'agent')
    )
  );

-- Presets policies
CREATE POLICY "Everyone can view active presets"
  ON presets FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage presets"
  ON presets FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Quick links policies
CREATE POLICY "Everyone can view active quick links"
  ON quick_links FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage quick links"
  ON quick_links FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Brand settings policies
CREATE POLICY "Everyone can view brand settings"
  ON brand_settings FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage brand settings"
  ON brand_settings FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- File attachments policies
CREATE POLICY "Everyone can view file attachments"
  ON file_attachments FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert file attachments"
  ON file_attachments FOR INSERT
  WITH CHECK (true);

-- Insert default brand settings
INSERT INTO brand_settings (setting_key, setting_value) VALUES
  ('brand_name', 'MALIK.VIP'),
  ('primary_color', '#1e3a8a'),
  ('logo_url', ''),
  ('home_greeting', 'হাই 👋'),
  ('home_subtext', 'আমরা কিভাবে সাহায্য করতে পারি?'),
  ('send_message_text', 'আমাদের একটি মেসেজ পাঠান'),
  ('chat_to_agent_text', 'কথা বলুন গ্রাহক এক্সিকিউটিভ এর সাথে আমাদের এর উপরে ক্লিক করুন')
ON CONFLICT (setting_key) DO NOTHING;

-- Insert sample quick links
INSERT INTO quick_links (label, url, icon_name, order_index) VALUES
  ('আমাদের ওয়েবসাইট ভিজিট করুন', 'https://malik.club', 'Globe', 1),
  ('হোয়াটসঅ্যাপ এ এক্সিকিউটিভ এর সাথে যোগাযোগ করুন', 'https://wa.me/1234567890', 'MessageCircle', 2)
ON CONFLICT DO NOTHING;

-- Insert sample presets
INSERT INTO presets (id, parent_id, question_text, answer_text, button_label, order_index, escalate_to_agent) VALUES
  ('11111111-1111-1111-1111-111111111111', NULL, NULL, NULL, '9WKTS', 1, false),
  ('22222222-2222-2222-2222-222222222222', NULL, NULL, NULL, 'কথা বলুন গ্রাহক এক্সিকিউটিভ এর সাথে', 2, true)
ON CONFLICT DO NOTHING;

-- Insert nested presets
INSERT INTO presets (parent_id, question_text, answer_text, button_label, order_index) VALUES
  ('11111111-1111-1111-1111-111111111111', NULL, 'আপনি যদি লটারি তে নতুন হয়ে থাকেন তাহলে নিচের লিংক এ আমাদের এর উপরে ক্লিক করুন', 'LOTTERY - লটারি নাম্বার সাম্বাদ', 1),
  ('11111111-1111-1111-1111-111111111111', NULL, '9WKTS সম্বন্ধে আরো বিস্তারিত জানতে আমাদের ওয়েবসাইট ভিজিট করুন', '9WKTS - ম্যানুয়াল ডিপোজিট এর নিয়মিত', 2)
ON CONFLICT DO NOTHING;

-- Create update trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chats_updated_at BEFORE UPDATE ON chats
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_brand_settings_updated_at BEFORE UPDATE ON brand_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

5. Click "Run" to execute the script
6. You should see "Success. No rows returned" message
7. Verify tables were created by going to "Table Editor" in the sidebar

## 7. Create Storage Bucket

1. In Supabase dashboard, click on "Storage" in the sidebar
2. Click "Create a new bucket"
3. Set bucket name: `chat-attachments`
4. Make it **public** (toggle the public option)
5. Click "Create bucket"

### Configure Storage Policies

1. Click on your `chat-attachments` bucket
2. Go to "Policies" tab
3. Add the following policies:

**Upload Policy**:
```sql
CREATE POLICY "Anyone can upload files"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'chat-attachments');
```

**Download Policy**:
```sql
CREATE POLICY "Public can download files"
ON storage.objects FOR SELECT
USING (bucket_id = 'chat-attachments');
```

## 8. Create Admin Account

### Option A: Using Setup Page (Recommended)

1. Navigate to `http://localhost:3000/setup`
2. The setup page will check if an admin account exists
3. If no admin exists, fill in:
   - Full Name
   - Email address
   - Password (minimum 6 characters)
4. Click "Create Admin Account"
5. You will be redirected to the login page
6. Login with your new admin credentials

### Option B: Using Supabase Dashboard (Alternative)

1. Go to "Authentication" in Supabase sidebar
2. Click "Add user" → "Create new user"
3. Fill in:
   - Email: `admin@example.com`
   - Password: Choose a secure password
   - Auto Confirm User: **Yes**
4. Click "Create user"
5. Copy the User UID

### Insert Admin Profile

1. Go to "SQL Editor"
2. Run this query (replace `YOUR_USER_ID` with the UID you copied):

```sql
INSERT INTO profiles (id, email, full_name, role, is_active)
VALUES ('YOUR_USER_ID', 'admin@example.com', 'Admin User', 'admin', true);
```

## 9. Run Development Server

In your terminal:

```bash
npm run dev
```

The application should now be running at `http://localhost:3000`

## 10. Initial System Configuration

### Login to Admin Dashboard

1. Navigate to `http://localhost:3000/admin/login`
2. Login with your admin credentials
3. You should see the admin dashboard

### Configure Brand Settings

1. Go to "Brand Settings" tab
2. Customize:
   - Brand Name
   - Primary Color (use color picker)
   - Logo URL (optional)
   - Bengali text content
3. Click "Save Changes"

### Create Agent Accounts

1. Go to "Agent Management" tab
2. Click "Add Agent"
3. Fill in:
   - Email
   - Full Name
   - Password
4. Click "Create Agent"
5. Toggle "Active Status" to make agent online

### Configure Conversation Flow

1. Go to "Flow Builder" tab
2. Under "Preset Questions":
   - Click "Add Preset"
   - Create root-level options
   - Create child options for nested flows
3. Under "Quick Links":
   - Click "Add Quick Link"
   - Add external resource links

## 11. Test the Widget

### Test in Embed Page

1. Navigate to `http://localhost:3000/embed`
2. You should see the chatbot widget
3. Test features:
   - Click through preset options
   - Send text messages
   - Try "Talk to Live Agent" option

### Test with Widget Script

Create a test HTML file:

```html
<!DOCTYPE html>
<html>
<head>
  <title>Chatbot Test</title>
</head>
<body>
  <h1>Test Page</h1>

  <script>
    window.CHATBOT_WIDGET_URL = 'http://localhost:3000';
  </script>
  <script src="http://localhost:3000/widget.js"></script>
</body>
</html>
```

Open this file in a browser to see the widget in action.

## 12. Test Agent Workspace

1. Navigate to `http://localhost:3000/agent/login`
2. Login with agent credentials
3. Set status to "Online"
4. Open the widget in another tab/browser
5. Start a conversation
6. You should see the chat appear in agent queue
7. Click the chat and respond

## 13. Add Sound Effects (Optional)

1. Download or create two short sound files:
   - `delivered.mp3` (notification sound)
   - `loading.mp3` (loading/searching sound)
2. Place them in `public/sounds/` directory
3. The widget will automatically use them

## 14. Build for Production

When ready to deploy:

```bash
npm run build
```

This creates an optimized production build in the `.next` folder.

## Troubleshooting

### "Cannot read properties of undefined"
- Check that `.env.local` exists with correct values
- Restart development server after changing env variables

### "relation does not exist"
- Verify all SQL scripts ran successfully
- Check table names are lowercase in SQL editor

### "row-level security policy violation"
- Confirm RLS policies were created
- Check user role in profiles table

### Widget not appearing
- Check browser console for errors
- Verify `widget.js` loads correctly
- Clear browser cache

### Real-time not working
- Go to Supabase Project Settings → API
- Ensure Realtime is enabled
- Check subscription limits on free tier

## Next Steps

- Customize brand colors and logos
- Create more preset conversation flows
- Add more agents
- Configure file upload limits
- Set up production deployment
- Add custom domain

## Support

If you encounter issues:
1. Check the browser console for errors
2. Review Supabase logs in dashboard
3. Verify all environment variables
4. Ensure database schema is complete
5. Check that RLS policies are correctly set

---

**Congratulations!** Your Multi-Agent Chatbot System is now set up and ready to use.
