'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authService } from '@/lib/auth';
import { agentService } from '@/lib/agent-service';
import { chatService } from '@/lib/chat-service';
import { supabase } from '@/lib/supabase';
import { Chat, Message, Profile } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Headphones,
  LogOut,
  Send,
  Check,
  MessageSquare,
  User,
  Clock,
  Home,
  Inbox,
  Archive,
  Settings,
  Camera,
  Menu,
  X,
  ChevronLeft,
  ExternalLink,
} from 'lucide-react';
import { playSound } from '@/lib/sounds';

export default function AgentWorkspace() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isOnline, setIsOnline] = useState(false);

  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showChatList, setShowChatList] = useState(true);

  useEffect(() => {
    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (profile) {
      loadChats();
      const unsubscribe = agentService.subscribeToChats(() => {
        loadChats();
        if (selectedChat) loadMessages(selectedChat.id);
      });
      return unsubscribe;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile]);

  useEffect(() => {
    if (selectedChat) {
      loadMessages(selectedChat.id);
      agentService.markMessagesAsRead(selectedChat.id);

      const unsubscribe = chatService.subscribeToMessages(selectedChat.id, (message) => {
        setMessages((prev) => [...prev, message]);
        if (message.sender_type === 'customer') playSound('delivered');
      });

      return unsubscribe;
    }
  }, [selectedChat]);

  const checkAuth = async () => {
    const user = await authService.getCurrentUser();
    if (!user || user.role !== 'agent') {
      router.push('/agent/login');
      return;
    }
    setProfile(user);
    setIsOnline(user.is_active);
    setLoading(false);
  };

  const loadChats = async () => {
    if (!profile) return;
    const data = await agentService.getChats(profile.id);
    setChats(data);
  };

  const loadMessages = async (chatId: string) => {
    const msgs = await chatService.getMessages(chatId);
    setMessages(msgs);
  };

  const handleToggleOnline = async () => {
    if (!profile) return;
    const newStatus = !isOnline;
    await authService.updateAgentStatus(profile.id, newStatus);
    setIsOnline(newStatus);
  };

  const handleSelectChat = async (chat: Chat) => {
    setSelectedChat(chat);
    setShowChatList(false); // Hide chat list on mobile when chat is selected

    if (!chat.assigned_agent_id && profile) {
      await agentService.assignChat(chat.id, profile.id);
      loadChats();
    }
  };

  const handleBackToChatList = () => {
    setShowChatList(true);
    setSelectedChat(null);
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !selectedChat || !profile) return;

    const content = inputValue.trim();
    setInputValue('');

    await agentService.sendMessage(selectedChat.id, content, profile.id);
    playSound('delivered');
  };

  const handleResolveChat = async () => {
    if (!selectedChat) return;
    await agentService.resolveChat(selectedChat.id);
    setSelectedChat(null);
    setShowChatList(true);
    loadChats();
  };

  const handleLogout = async () => {
    if (profile) {
      await authService.updateAgentStatus(profile.id, false);
    }
    await authService.signOut();
    router.push('/agent/login');
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const openAvatarPicker = () => fileRef.current?.click();

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile) return;

    e.target.value = '';

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file.');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      alert('Max avatar size is 2MB.');
      return;
    }

    setUploadingAvatar(true);
    try {
      const ext = file.name.split('.').pop() || 'png';
      const path = `${profile.id}/${Date.now()}.${ext.toLowerCase()}`;

      const { error: uploadErr } = await supabase.storage
        .from('agent-avatars')
        .upload(path, file, {
          upsert: true,
          contentType: file.type,
          cacheControl: '3600',
        });

      if (uploadErr) throw new Error(uploadErr.message);

      const { data } = supabase.storage.from('agent-avatars').getPublicUrl(path);
      const publicUrl = data?.publicUrl;
      if (!publicUrl) throw new Error('Failed to generate avatar url');

      const { error: updateErr } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', profile.id);

      if (updateErr) throw new Error(updateErr.message);

      setProfile((prev) => (prev ? { ...prev, avatar_url: publicUrl } : prev));
    } catch (err: any) {
      console.error(err);
      alert(err?.message || 'Failed to update avatar');
    } finally {
      setUploadingAvatar(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-sm sm:text-base">Loading workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen h-[100dvh] flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 flex-shrink-0">
        <div className="px-3 sm:px-4 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            {/* Logo & Avatar */}
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-600 rounded-lg flex items-center justify-center">
                <Headphones className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
              </div>

              {/* Agent avatar */}
              <div className="relative">
                <button
                  type="button"
                  onClick={openAvatarPicker}
                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center border hover:opacity-90 transition relative"
                  title="Change avatar"
                >
                  {profile?.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={profile.avatar_url} alt="avatar" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                  )}

                  <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-white border flex items-center justify-center">
                    <Camera className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-gray-700" />
                  </span>

                  {uploadingAvatar && (
                    <span className="absolute inset-0 bg-black/30 text-white text-[10px] flex items-center justify-center">
                      ...
                    </span>
                  )}
                </button>

                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
              </div>

              <div className="hidden sm:block">
                <h1 className="text-sm sm:text-lg font-bold text-gray-900">Agent Workspace</h1>
                <p className="text-[10px] sm:text-xs text-gray-500 truncate max-w-[120px] sm:max-w-none">{profile?.email}</p>
              </div>
            </div>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-1">
              <Link href="/">
                <Button variant="ghost" size="sm" className="gap-2">
                  <Home className="w-4 h-4" />
                  Home
                </Button>
              </Link>
              <Link href="/admin/login">
                <Button variant="ghost" size="sm" className="gap-2">
                  <Settings className="w-4 h-4" />
                  Admin
                </Button>
              </Link>
              <Link href="/embed" target="_blank">
                <Button variant="ghost" size="sm" className="gap-2">
                  <ExternalLink className="w-4 h-4" />
                  Widget
                </Button>
              </Link>
            </nav>

            {/* Status & Actions */}
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="flex items-center gap-1 sm:gap-2">
                <span className="text-xs text-gray-600 hidden sm:block">Status:</span>
                <Switch checked={isOnline} onCheckedChange={handleToggleOnline} />
                <Badge variant={isOnline ? 'default' : 'secondary'} className={`text-[10px] sm:text-xs ${isOnline ? 'bg-green-600' : ''}`}>
                  {isOnline ? 'Online' : 'Offline'}
                </Badge>
              </div>
              <Button onClick={handleLogout} variant="outline" size="sm" className="hidden sm:flex">
                <LogOut className="w-4 h-4 sm:mr-2" />
                <span className="hidden md:inline">Logout</span>
              </Button>
              
              {/* Mobile Menu */}
              <button
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu Dropdown */}
          {mobileMenuOpen && (
            <div className="lg:hidden py-3 border-t space-y-2">
              <Link href="/" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="ghost" className="w-full justify-start gap-2">
                  <Home className="w-4 h-4" />
                  Home
                </Button>
              </Link>
              <Link href="/admin/login" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="ghost" className="w-full justify-start gap-2">
                  <Settings className="w-4 h-4" />
                  Admin Login
                </Button>
              </Link>
              <Link href="/embed" target="_blank" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="ghost" className="w-full justify-start gap-2">
                  <ExternalLink className="w-4 h-4" />
                  Preview Widget
                </Button>
              </Link>
              <Button onClick={handleLogout} variant="outline" className="w-full justify-start gap-2">
                <LogOut className="w-4 h-4" />
                Logout
              </Button>
            </div>
          )}
        </div>

        {/* Sub Navigation */}
        <div className="bg-gray-50 border-t border-gray-200 overflow-x-auto">
          <div className="px-3 sm:px-4 lg:px-8">
            <nav className="flex items-center gap-1 h-10 sm:h-12 min-w-max">
              <Button variant="ghost" size="sm" className="gap-1 sm:gap-2 text-xs sm:text-sm">
                <Home className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden xs:inline">Workspace</span>
              </Button>
              <Button variant="ghost" size="sm" className="gap-1 sm:gap-2 text-xs sm:text-sm">
                <Inbox className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden xs:inline">Active</span>
              </Button>
              <Button variant="ghost" size="sm" className="gap-1 sm:gap-2 text-xs sm:text-sm">
                <Archive className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden xs:inline">Resolved</span>
              </Button>
              <Button variant="ghost" size="sm" className="gap-1 sm:gap-2 text-xs sm:text-sm">
                <Settings className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden xs:inline">Settings</span>
              </Button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Chat List Sidebar */}
        <div className={`
          ${showChatList ? 'flex' : 'hidden'} 
          md:flex 
          w-full md:w-72 lg:w-80 
          bg-white border-r border-gray-200 flex-col
        `}>
          <div className="p-3 sm:p-4 border-b flex-shrink-0">
            <h2 className="font-semibold text-gray-900 text-sm sm:text-base">Chat Queue</h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">{chats.length} active conversations</p>
          </div>

          <div className="flex-1 overflow-y-auto">
            {chats.map((chat) => (
              <button
                key={chat.id}
                onClick={() => handleSelectChat(chat)}
                className={`w-full p-3 sm:p-4 border-b hover:bg-gray-50 text-left transition-colors ${
                  selectedChat?.id === chat.id ? 'bg-blue-50 border-l-4 border-l-blue-600' : ''
                }`}
              >
                <div className="flex items-start justify-between mb-1 sm:mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-gray-900 text-sm sm:text-base truncate">{chat.customer_name || 'Anonymous'}</p>
                      <p className="text-[10px] sm:text-xs text-gray-500 truncate">{chat.customer_email || 'No email'}</p>
                    </div>
                  </div>
                  {(chat.unread_count ?? 0) > 0 && (
                    <Badge className="bg-red-600 text-[10px] sm:text-xs">{chat.unread_count}</Badge>
                  )}
                </div>

                {chat.last_message && (
                  <p className="text-xs sm:text-sm text-gray-600 truncate">{chat.last_message.content}</p>
                )}

                <div className="flex items-center gap-1 sm:gap-2 mt-1 sm:mt-2">
                  <Clock className="w-3 h-3 text-gray-400" />
                  <span className="text-[10px] sm:text-xs text-gray-500">{formatTime(chat.updated_at)}</span>
                  <Badge variant="outline" className={`text-[10px] sm:text-xs ${chat.status === 'pending' ? 'border-orange-500 text-orange-700' : ''}`}>
                    {chat.status}
                  </Badge>
                </div>
              </button>
            ))}

            {chats.length === 0 && (
              <div className="p-6 sm:p-8 text-center">
                <MessageSquare className="w-10 h-10 sm:w-12 sm:h-12 text-gray-300 mx-auto mb-3 sm:mb-4" />
                <p className="text-gray-600 text-sm sm:text-base">No active chats</p>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">New chats will appear here</p>
              </div>
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className={`
          ${!showChatList ? 'flex' : 'hidden'} 
          md:flex 
          flex-1 flex-col
        `}>
          {selectedChat ? (
            <>
              {/* Chat Header */}
              <div className="p-3 sm:p-4 border-b bg-white flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-2 sm:gap-3">
                  <button 
                    onClick={handleBackToChatList}
                    className="md:hidden p-1 rounded hover:bg-gray-100"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm sm:text-base">{selectedChat.customer_name || 'Anonymous Customer'}</h3>
                    <p className="text-xs sm:text-sm text-gray-500 truncate max-w-[150px] sm:max-w-none">{selectedChat.customer_email}</p>
                  </div>
                </div>
                <Button onClick={handleResolveChat} variant="outline" size="sm" className="text-xs sm:text-sm">
                  <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 sm:mr-2" />
                  <span className="hidden xs:inline">Resolve</span>
                </Button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4 bg-gray-50">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender_type === 'agent' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] sm:max-w-[70%] rounded-2xl px-3 sm:px-4 py-2 ${
                        message.sender_type === 'agent'
                          ? 'bg-green-600 text-white rounded-br-none'
                          : 'bg-white text-gray-800 rounded-bl-none shadow-sm'
                      }`}
                    >
                      <p className="text-xs sm:text-sm whitespace-pre-wrap">{message.content}</p>
                      <div className={`text-[10px] sm:text-xs mt-1 ${message.sender_type === 'agent' ? 'text-green-100' : 'text-gray-400'}`}>
                        {formatTime(message.created_at)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Input Area */}
              <div className="border-t bg-white p-2 sm:p-4 flex-shrink-0">
                <div className="flex items-center gap-2">
                  <Input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Type your message..."
                    className="flex-1 text-sm"
                  />
                  <Button onClick={handleSendMessage} disabled={!inputValue.trim()} size="sm">
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center p-4">
              <div className="text-center">
                <MessageSquare className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-3 sm:mb-4" />
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">No Chat Selected</h3>
                <p className="text-sm text-gray-600">Select a chat from the queue to start responding</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
