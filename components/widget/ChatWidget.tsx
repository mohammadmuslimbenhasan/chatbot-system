'use client';

import { useState, useEffect } from 'react';
import { HomeTab } from './HomeTab';
import { ChatTab } from './ChatTab';
import { BrandSettings } from '@/types';
import { chatService } from '@/lib/chat-service';

interface ChatWidgetProps {
  onClose?: () => void;
  embedded?: boolean;
}

export type TabType = 'home' | 'chat';

export function ChatWidget({ onClose, embedded = false }: ChatWidgetProps) {
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [chatId, setChatId] = useState<string | null>(null);
  const [brandSettings, setBrandSettings] = useState<BrandSettings>({
    brand_name: 'MALIK.VIP',
    primary_color: '#2c3e50',
    logo_url: '',
    toggle_icon_url: '',

    home_greeting: 'হাই 👋',
    home_subtext: 'আমরা কিভাবে সাহায্য করতে পারি?',
    send_message_text: 'আমাদের একটি মেসেজ পাঠান',
    chat_to_agent_text: 'কথা বলুন গ্রাহক এক্সিকিউটিভ এর সাথে',

    home_proxy_label: 'আমাদের প্রক্সি লিংক গুলো দেখে নিন',
    home_proxy_url: '/proxy-link',
    home_master_label: 'ভোক্তা মাস্টার এজেন্ট লিস্ট',
    home_master_url: '/master-agent-list',

    home_gradient_from: '#1f2d3a',
    home_gradient_to: '#243a52',
  });

  useEffect(() => {
    loadBrandSettings();
    const existingChatId = localStorage.getItem('chatbot_chat_id');
    if (existingChatId) {
      setChatId(existingChatId);
    }
  }, []);

  const loadBrandSettings = async () => {
    const settings = await chatService.getBrandSettings();
    setBrandSettings(settings);
  };

  const handleStartChat = async () => {
    const existingChatId = localStorage.getItem('chatbot_chat_id');

    if (existingChatId) {
      setChatId(existingChatId);
      setActiveTab('chat');
      return;
    }

    const chat = await chatService.createChat();
    if (chat) {
      setChatId(chat.id);
      localStorage.setItem('chatbot_chat_id', chat.id);
      setActiveTab('chat');
    }
  };

  const handleRecentMessage = async () => {
    const existingChatId = localStorage.getItem('chatbot_chat_id');

    if (existingChatId) {
      setChatId(existingChatId);
      setActiveTab('chat');
      return;
    }

    const chat = await chatService.createChat();
    if (chat) {
      setChatId(chat.id);
      localStorage.setItem('chatbot_chat_id', chat.id);
      setActiveTab('chat');
    }
  };

  const handleBackToHome = () => {
    setActiveTab('home');
  };

  return (
    <div 
  className={`
    relative flex flex-col bg-white overflow-hidden shadow-2xl rounded-2xl min-h-0
    ${embedded 
      ? 'w-[calc(100%-16px)] h-[calc(100%-16px)] max-w-[380px] max-h-[520px] xs:max-h-[560px] sm:max-w-[400px] sm:max-h-[640px] md:max-h-[680px]' 
      : 'w-[calc(100vw-24px)] h-[calc(100vh-100px)] max-w-[340px] max-h-[480px] xs:max-w-[360px] xs:max-h-[520px] sm:max-w-[380px] sm:max-h-[600px] md:max-w-[400px] md:max-h-[680px]'
    }
  `}
>
      {activeTab === 'home' ? (
        <HomeTab 
          brandSettings={brandSettings} 
          onStartChat={handleStartChat}
          onRecentMessage={handleRecentMessage}
          onClose={onClose}
        />
      ) : (
        <ChatTab
          chatId={chatId}
          brandSettings={brandSettings}
          onBack={handleBackToHome}
          onClose={onClose}
        />
      )}
    </div>
  );
}
