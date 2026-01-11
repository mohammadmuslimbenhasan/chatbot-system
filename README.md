# Multi-Agent Real-Time Chatbot Plugin System

A professional, self-hosted, and portable chatbot system built with Next.js, Tailwind CSS, and Supabase. Features multi-agent support, real-time messaging, nested preset flows, and complete brand customization.

## Features

### 🚀 Core Capabilities
- **Real-Time Messaging**: Instant message delivery using Supabase Realtime
- **Multi-Agent Support**: Multiple agents with dedicated workspaces and chat queues
- **Embeddable Widget**: Portable widget with Shadow DOM and Iframe technology
- **Nested Presets**: Intelligent conversation flows with parent-child relationships
- **File Attachments**: Support for images and documents (PDF/DOC)
- **Sound Effects**: Audio notifications for message delivery and agent searching
- **Bengali Language Support**: Widget UI in Bengali with English admin/agent interfaces
- **Brand Customization**: Complete control over colors, logos, and text content

### 👥 User Roles
1. **Customers**: Access chatbot widget on any website
2. **Agents**: Manage chats in dedicated workspace with real-time queue
3. **Admins**: Full system control with dashboard for settings and management

## System Architecture

### Frontend
- **Framework**: Next.js 13 (App Router)
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Icons**: Lucide React
- **State Management**: React hooks with local state

### Backend
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth with JWT
- **Real-time**: Supabase Realtime Channels
- **Storage**: Supabase Storage (for file attachments)

## Project Structure

```
├── app/
│   ├── page.tsx                 # Landing page
│   ├── embed/page.tsx           # Embeddable widget page
│   ├── admin/
│   │   ├── page.tsx             # Admin dashboard
│   │   └── login/page.tsx       # Admin login
│   └── agent/
│       ├── page.tsx             # Agent workspace
│       └── login/page.tsx       # Agent login
├── components/
│   ├── admin/
│   │   ├── AgentManagement.tsx  # Agent CRUD
│   │   ├── FlowBuilder.tsx      # Preset & quick link management
│   │   └── BrandSettings.tsx    # Branding customization
│   ├── widget/
│   │   ├── ChatWidget.tsx       # Main widget component
│   │   ├── HomeTab.tsx          # Home tab with quick links
│   │   └── ChatTab.tsx          # Chat interface with messaging
│   └── ui/                      # shadcn/ui components
├── lib/
│   ├── supabase.ts              # Supabase client
│   ├── auth.ts                  # Auth service
│   ├── chat-service.ts          # Chat operations
│   ├── admin-service.ts         # Admin operations
│   ├── agent-service.ts         # Agent operations
│   └── sounds.ts                # Sound effects utility
├── types/
│   └── index.ts                 # TypeScript type definitions
└── public/
    ├── widget.js                # Embeddable widget script
    └── sounds/                  # Sound effect files
```

## Database Schema

### Tables

#### profiles
Stores user information for admins, agents, and references auth.users
- `id` (uuid, primary key)
- `email` (text, unique)
- `full_name` (text)
- `role` ('admin' | 'agent' | 'customer')
- `avatar_url` (text)
- `is_active` (boolean) - Agent online status

#### chats
Stores chat conversations
- `id` (uuid, primary key)
- `customer_name` (text)
- `customer_email` (text)
- `status` ('pending' | 'active' | 'resolved' | 'closed')
- `assigned_agent_id` (uuid, foreign key to profiles)

#### messages
Stores all chat messages
- `id` (uuid, primary key)
- `chat_id` (uuid, foreign key to chats)
- `sender_type` ('customer' | 'agent' | 'bot')
- `sender_id` (uuid, foreign key to profiles)
- `content` (text)
- `message_type` ('text' | 'image' | 'document' | 'preset')
- `metadata` (jsonb) - For file URLs, etc.
- `is_read` (boolean)

#### presets
Stores preset questions/answers with nested structure
- `id` (uuid, primary key)
- `parent_id` (uuid, self-referencing foreign key)
- `question_text` (text)
- `answer_text` (text)
- `button_label` (text)
- `order_index` (integer)
- `escalate_to_agent` (boolean)

#### quick_links
Stores quick links displayed on home tab
- `id` (uuid, primary key)
- `label` (text)
- `url` (text)
- `icon_name` (text) - Lucide icon name
- `order_index` (integer)

#### brand_settings
Key-value store for brand customization
- `id` (uuid, primary key)
- `setting_key` (text, unique)
- `setting_value` (text)

#### file_attachments
Stores file attachment metadata
- `id` (uuid, primary key)
- `message_id` (uuid, foreign key to messages)
- `file_name` (text)
- `file_url` (text)
- `file_type` ('image' | 'document')
- `file_size` (integer)

## Setup Instructions

### 1. Prerequisites
- Node.js 18+ installed
- Supabase account
- npm or yarn package manager

### 2. Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Database Setup

**Note**: The database schema migration file is available but requires Supabase connection. To set up the database:

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Run the migration script from the documentation to create all tables
4. The script includes:
   - Table creation with proper relationships
   - Row Level Security (RLS) policies
   - Default brand settings
   - Sample preset data
   - Indexes for performance

### 4. Storage Buckets

Create a storage bucket in Supabase:
1. Go to Storage in Supabase dashboard
2. Create a new bucket named `chat-attachments`
3. Set the bucket to public or configure appropriate policies

### 5. Install Dependencies

```bash
npm install
```

### 6. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` to see the landing page.

### 7. Build for Production

```bash
npm run build
npm start
```

## Usage Guide

### Admin Dashboard (`/admin`)

**Login**: Use admin credentials created in Supabase

**Features**:
1. **Agent Management**
   - Create new agent accounts
   - Toggle agent active status
   - Delete agents

2. **Flow Builder**
   - Create nested preset questions and answers
   - Manage quick links for home tab
   - Set escalation to live agent

3. **Brand Settings**
   - Customize primary color
   - Upload logo URL
   - Edit Bengali text content
   - Preview changes instantly

### Agent Workspace (`/agent`)

**Login**: Use agent credentials

**Features**:
1. **Chat Queue**
   - View all pending and active chats
   - See unread message counts
   - Real-time updates for new chats

2. **Chat Interface**
   - Send text messages to customers
   - View customer message history
   - Mark chats as resolved
   - Toggle online/offline status

3. **Real-Time Notifications**
   - Sound alerts for new messages
   - Live message updates
   - Typing indicators

### Embeddable Widget

#### Method 1: Direct Embed
Navigate to `/embed` to test the widget directly.

#### Method 2: Widget Script
Add this script to any website:

```html
<script>
  window.CHATBOT_WIDGET_URL = 'https://your-domain.com';
</script>
<script src="https://your-domain.com/widget.js"></script>
```

The widget will appear as a floating button in the bottom-right corner.

**Widget Features**:
- Shadow DOM prevents style conflicts
- Iframe for complete isolation
- Fully responsive design
- Mobile-friendly interface
- Bengali language UI
- Smooth animations

## Widget Customization

### Home Tab
- Displays brand logo and name
- Shows active agent avatars
- Quick links to external resources
- "Send Message" call-to-action

### Chat Tab
- Real-time messaging
- Preset question buttons
- File attachment support (images/documents)
- Typing indicators
- Sound notifications
- Emoji picker
- Time stamps on messages

## Sound Effects

Add sound files to `public/sounds/`:
- `delivered.mp3` - Plays when message is sent
- `loading.mp3` - Plays when searching for agent

Recommended: 250-500ms notification sounds

## Security Features

### Row Level Security (RLS)
All tables have RLS enabled with policies:
- Admins: Full access to all data
- Agents: Access to assigned chats and messages
- Customers: Public read for presets and settings
- Public: Can create chats and insert messages

### Authentication
- JWT-based authentication via Supabase Auth
- Role-based access control
- Secure password hashing
- Email confirmation (configurable)

## API Services

### Chat Service (`lib/chat-service.ts`)
- `createChat()` - Create new chat session
- `sendMessage()` - Send customer/bot messages
- `getMessages()` - Retrieve chat history
- `getPresets()` - Get preset questions
- `getBrandSettings()` - Get customization settings
- `subscribeToMessages()` - Real-time message subscription

### Admin Service (`lib/admin-service.ts`)
- `getAgents()` - List all agents
- `createAgent()` - Create new agent account
- `updateAgent()` - Update agent details
- `deleteAgent()` - Remove agent
- `getAllPresets()` - Get all presets
- `createPreset()` - Add new preset
- `updatePreset()` - Modify preset
- `deletePreset()` - Remove preset
- `updateBrandSettings()` - Update branding

### Agent Service (`lib/agent-service.ts`)
- `getChats()` - Get agent chat queue
- `assignChat()` - Assign chat to agent
- `resolveChat()` - Mark chat as resolved
- `sendMessage()` - Send agent message
- `markMessagesAsRead()` - Mark as read
- `subscribeToChats()` - Real-time chat updates

## Deployment

### Recommended Platforms
- **Vercel**: Automatic Next.js optimization
- **Netlify**: Built-in CI/CD
- **Self-hosted**: Docker or PM2

### Environment Variables
Set all environment variables on your hosting platform:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Post-Deployment
1. Create admin account in Supabase dashboard
2. Login to admin panel
3. Create agent accounts
4. Configure brand settings
5. Set up preset flows
6. Test widget on external website

## Troubleshooting

### Build Warnings
- Browserslist warnings are non-critical
- Realtime.js dependency warnings are expected
- Metadata warnings only affect SEO

### Common Issues

**Database connection fails**:
- Verify environment variables
- Check Supabase project status
- Confirm RLS policies are set

**Widget not loading**:
- Check CORS settings
- Verify widget.js is accessible
- Confirm CHATBOT_WIDGET_URL is correct

**Real-time not working**:
- Enable Realtime in Supabase
- Check subscription limits
- Verify database triggers

## Tech Stack

- **Next.js 13**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **shadcn/ui**: Beautiful component library
- **Supabase**: Backend-as-a-Service
  - PostgreSQL database
  - Authentication
  - Realtime subscriptions
  - File storage
- **Lucide React**: Icon library
- **React Hook Form**: Form management
- **Zod**: Schema validation

## License

This project is built as a demonstration of a production-ready chatbot system.

## Support

For setup assistance or bug reports, refer to the documentation or check the code comments.

---

**Built with** ❤️ **using Next.js, Tailwind CSS, and Supabase**
