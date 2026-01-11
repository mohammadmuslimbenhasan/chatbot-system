'use client';

import { useState, useEffect } from 'react';
import { HomeTab } from './HomeTab';
import { ChatTab } from './ChatTab';
import { BrandSettings } from '@/types';
import { chatService } from '@/lib/chat-service';

export type TabType = 'home' | 'chat';

interface ChatWidgetProps {
  onClose?: () => void;
  embedded?: boolean;
}

export function ChatWidget({ onClose }: ChatWidgetProps) {
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [chatId, setChatId] = useState<string | null>(null);
  const [brandSettings, setBrandSettings] = useState<BrandSettings>({
    brand_name: 'MALIK.VIP',
    primary_color: '#2c3e50',
  });

  useEffect(() => {
    loadBrandSettings();
    const existingChatId = localStorage.getItem('chatbot_chat_id');
    if (existingChatId) setChatId(existingChatId);
  }, []);

  const loadBrandSettings = async () => {
    const settings = await chatService.getBrandSettings();
    setBrandSettings(settings);
  };

  const startChat = async () => {
    const existingChatId = localStorage.getItem('chatbot_chat_id');
    if (existingChatId) {
      setChatId(existingChatId);
      setActiveTab('chat');
      return;
    }

    const chat = await chatService.createChat();
    if (chat) {
      localStorage.setItem('chatbot_chat_id', chat.id);
      setChatId(chat.id);
      setActiveTab('chat');
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-white overflow-hidden">
      {activeTab === 'home' ? (
        <HomeTab
          brandSettings={brandSettings}
          onStartChat={startChat}
          onRecentMessage={startChat}
          onClose={onClose}
        />
      ) : (
        <ChatTab
          chatId={chatId}
          brandSettings={brandSettings}
          onBack={() => setActiveTab('home')}
          onClose={onClose}
        />
      )}
    </div>
  );
}
