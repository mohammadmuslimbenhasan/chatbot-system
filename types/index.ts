export type UserRole = 'admin' | 'agent' | 'customer';

export type ChatStatus = 'pending' | 'active' | 'resolved' | 'closed';

export type SenderType = 'customer' | 'agent' | 'bot';

export type MessageType = 'text' | 'image' | 'document' | 'preset';

export type FileType = 'image' | 'document';

export interface Profile {
  id: string;
  email: string;
  full_name?: string;
  role: UserRole;
  avatar_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Chat {
  id: string;
  customer_name?: string;
  customer_email?: string;
  status: ChatStatus;
  assigned_agent_id?: string;
  assigned_agent?: Profile;
  created_at: string;
  updated_at: string;
  last_message?: Message;
  unread_count?: number;
}

export interface Message {
  id: string;
  chat_id: string;
  sender_type: SenderType;
  sender_id?: string;
  sender?: Profile;
  content?: string;
  message_type: MessageType;
  metadata?: any;
  is_read: boolean;
  created_at: string;
}

export interface Preset {
  id: string;
  parent_id?: string;
  question_text?: string;
  answer_text?: string;
  button_label: string;
  order_index: number;
  is_active: boolean;
  escalate_to_agent: boolean;
  created_at: string;
  children?: Preset[];
}

export interface QuickLink {
  id: string;
  label: string;
  url: string;
  icon_name: string;
  order_index: number;
  is_active: boolean;
  created_at: string;
}

// types.ts
export type BrandSettings = {
  brand_name?: string;
  primary_color?: string;

  logo_url?: string | null;
  toggle_icon_url?: string | null;

  home_greeting?: string;
  home_subtext?: string;
  send_message_text?: string;
  chat_to_agent_text?: string;

  home_gradient_from?: string;
  home_gradient_to?: string;

  // ✅ New keys (your admin panel uses these)
  home_proxy_label?: string;
  home_proxy_url?: string;
  home_master_label?: string;
  home_master_url?: string;

  // ✅ Old keys (your HomeTab previously used these)
  home_quick_link_1_label?: string;
  home_quick_link_1_url?: string;
  home_quick_link_2_label?: string;
  home_quick_link_2_url?: string;
};



export interface FileAttachment {
  id: string;
  message_id: string;
  file_name: string;
  file_url: string;
  file_type: FileType;
  file_size: number;
  created_at: string;
}
