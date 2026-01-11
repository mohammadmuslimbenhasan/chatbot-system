'use client';

import { useState, useEffect, useRef } from 'react';
import {
  ChevronLeft,
  X,
  Send,
  Paperclip,
  Image as ImageIcon,
  FileText,
  Smile,
  MoreVertical,
} from 'lucide-react';
import { BrandSettings, Message, Preset } from '@/types';
import { chatService } from '@/lib/chat-service';
import { playSound } from '@/lib/sounds';
import { Input } from '@/components/ui/input';

interface ChatTabProps {
  chatId: string | null;
  brandSettings: BrandSettings;
  onBack: () => void;
  onClose?: () => void;
}

type PresetNavState = {
  currentPresetId: string | null;
  showPresets: boolean;
  presetPath: Array<{ id: string; label: string }>;
};

const presetStateKey = (chatId: string) => `chatbot_preset_state:${chatId}`;

export function ChatTab({ chatId, brandSettings, onBack, onClose }: ChatTabProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const [presets, setPresets] = useState<Preset[]>([]);
  const [currentPresetId, setCurrentPresetId] = useState<string | null>(null);
  const [showPresets, setShowPresets] = useState(true);
  const [isFirstMessage, setIsFirstMessage] = useState(true);

  const [presetPath, setPresetPath] = useState<Array<{ id: string; label: string }>>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Safe fallbacks
  const primaryColor = brandSettings.primary_color ?? '#1e3a8a';
  const brandName = brandSettings.brand_name ?? 'Brand';
  const chatToAgentText =
    brandSettings.chat_to_agent_text ?? 'কথা বলুন গ্রাহক এক্সিকিউটিভ এর সাথে';

  useEffect(() => {
    if (!chatId) return;

    loadMessages();
    loadRootPresets();
    restorePresetNavState(chatId);

    const unsubscribe = chatService.subscribeToMessages(chatId, handleNewMessage);
    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatId]);

  useEffect(() => {
    scrollToBottom();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages]);

  // Check if this is the first customer message
  useEffect(() => {
    const customerMessages = messages.filter(m => m.sender_type === 'customer');
    setIsFirstMessage(customerMessages.length === 0);
  }, [messages]);

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  };

  const loadMessages = async () => {
    if (!chatId) return;
    const msgs = await chatService.getMessages(chatId);
    setMessages(msgs);
  };

  const loadRootPresets = async () => {
    const root = await chatService.getPresets(null);
    if (root.length > 0) {
      setPresets(root);
      setShowPresets(true);
    }
  };

  const savePresetNavState = (next: PresetNavState) => {
    if (!chatId) return;
    try {
      localStorage.setItem(presetStateKey(chatId), JSON.stringify(next));
    } catch {
      // ignore
    }
  };

  const restorePresetNavState = async (cid: string) => {
    try {
      const raw = localStorage.getItem(presetStateKey(cid));

      if (!raw) {
        const root = await chatService.getPresets(null);
        setPresets(root);
        setCurrentPresetId(null);
        setShowPresets(true);
        setPresetPath([]);
        savePresetNavState({ currentPresetId: null, showPresets: true, presetPath: [] });
        return;
      }

      const state: PresetNavState = JSON.parse(raw);

      setCurrentPresetId(state.currentPresetId ?? null);
      setShowPresets(state.showPresets ?? true);
      setPresetPath(Array.isArray(state.presetPath) ? state.presetPath : []);

      const parentId = state.currentPresetId ?? null;
      const list = await chatService.getPresets(parentId);

      if (list.length > 0) {
        setPresets(list);
      } else {
        const root = await chatService.getPresets(null);
        setPresets(root);
        setCurrentPresetId(null);
        setShowPresets(true);
        setPresetPath([]);
        savePresetNavState({ currentPresetId: null, showPresets: true, presetPath: [] });
      }
    } catch {
      const root = await chatService.getPresets(null);
      setPresets(root);
      setCurrentPresetId(null);
      setShowPresets(true);
      setPresetPath([]);
      savePresetNavState({ currentPresetId: null, showPresets: true, presetPath: [] });
    }
  };

  const pushOptimisticCustomerMessage = (text: string) => {
    const optimistic: Message = {
      id: `optimistic_${Date.now()}`,
      chat_id: chatId || '',
      content: text,
      sender_type: 'customer',
      message_type: 'text',
      created_at: new Date().toISOString(),
      metadata: {},
    } as any;

    setMessages((prev) => [...prev, optimistic]);
  };

  const handleNewMessage = (message: Message) => {
    setMessages((prev) => {
      if (message.sender_type === 'customer') {
        const hasOptimistic = prev.some(
          (m: any) =>
            typeof m.id === 'string' &&
            m.id.startsWith('optimistic_') &&
            m.sender_type === 'customer' &&
            m.content === message.content
        );

        if (hasOptimistic) {
          const filtered = prev.filter(
            (m: any) =>
              !(
                typeof m.id === 'string' &&
                m.id.startsWith('optimistic_') &&
                m.sender_type === 'customer' &&
                m.content === message.content
              )
          );
          return [...filtered, message];
        }
      }

      return [...prev, message];
    });

    if (message.sender_type !== 'customer') {
      playSound('delivered');
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !chatId) return;

    const content = inputValue.trim();
    setInputValue('');

    playSound('delivered');

    pushOptimisticCustomerMessage(content);

    // Send customer message
    await chatService.sendMessage(chatId, content, 'customer');

    // Auto-reply with greeting and show presets for first message or any message
    setIsTyping(true);
    
    // Small delay to simulate typing
    setTimeout(async () => {
      // Get auto-reply message
      const autoReply = await chatService.getAutoReplyMessage();
      await chatService.sendMessage(chatId, autoReply, 'bot');
      
      setIsTyping(false);
      
      // Always show presets after auto-reply
      const root = await chatService.getPresets(null);
      if (root.length > 0) {
        setPresets(root);
        setCurrentPresetId(null);
        setShowPresets(true);
        setPresetPath([]);
        savePresetNavState({ currentPresetId: null, showPresets: true, presetPath: [] });
      }
    }, 1000);
  };

  const handlePresetClick = async (preset: Preset) => {
    if (!chatId) return;

    pushOptimisticCustomerMessage(preset.button_label);

    const nextPath = [...presetPath, { id: preset.id, label: preset.button_label }];
    setPresetPath(nextPath);

    if (preset.escalate_to_agent) {
      playSound('loading');
      setShowPresets(false);

      savePresetNavState({
        currentPresetId: preset.id,
        showPresets: false,
        presetPath: nextPath,
      });

      await chatService.sendMessage(chatId, preset.button_label, 'customer');
      await chatService.sendMessage(chatId, chatToAgentText, 'bot');
      return;
    }

    await chatService.sendMessage(chatId, preset.button_label, 'customer');

    if (preset.answer_text) {
      await chatService.sendMessage(chatId, preset.answer_text, 'bot');
    }

    const childPresets = await chatService.getPresets(preset.id);

    if (childPresets.length > 0) {
      setPresets(childPresets);
      setCurrentPresetId(preset.id);
      setShowPresets(true);

      savePresetNavState({
        currentPresetId: preset.id,
        showPresets: true,
        presetPath: nextPath,
      });
    } else {
      // No child presets, show root presets again
      const root = await chatService.getPresets(null);
      if (root.length > 0) {
        setPresets(root);
        setCurrentPresetId(null);
        setShowPresets(true);
        setPresetPath([]);
        savePresetNavState({ currentPresetId: null, showPresets: true, presetPath: [] });
      } else {
        setShowPresets(false);
        savePresetNavState({
          currentPresetId: preset.id,
          showPresets: false,
          presetPath: nextPath,
        });
      }
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !chatId) return;

    const fileUrl = await chatService.uploadFile(file, chatId);
    if (fileUrl) {
      const messageType = file.type.startsWith('image/') ? 'image' : 'document';
      await chatService.sendMessage(chatId, file.name, 'customer', undefined, messageType, {
        file_url: fileUrl,
        file_name: file.name,
        file_size: file.size,
      });
      playSound('delivered');
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header - Fixed */}
      <div
        className="flex-shrink-0 flex items-center justify-between px-3 sm:px-4 py-2 sm:py-3 text-white"
        style={{
          background: `linear-gradient(135deg, ${primaryColor} 0%, #0f172a 100%)`,
        }}
      >
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button onClick={onBack} className="text-white/90 hover:text-white flex-shrink-0">
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-1 flex-shrink-0">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/20 flex items-center justify-center text-sm">👤</div>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/20 flex items-center justify-center -ml-2 text-sm">👤</div>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/20 flex items-center justify-center -ml-2 text-sm">👤</div>
          </div>

          <div className="min-w-0">
            <div className="font-semibold text-xs sm:text-sm truncate">{brandName}</div>
            <div className="text-[10px] sm:text-xs text-white/70 truncate">সাধারণত সক্রিয় থাকে</div>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          <button className="text-white/90 hover:text-white">
            <MoreVertical className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          {onClose && (
            <button onClick={onClose} className="text-white/90 hover:text-white">
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Messages Container - Scrollable */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 min-h-0 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4 bg-gray-50"
      >
        {messages.length === 0 && (
          <div className="text-center py-6 sm:py-8">
            <div className="text-3xl sm:text-4xl mb-2">👋</div>
            <p className="text-gray-500 text-xs sm:text-sm">আপনার প্রশ্ন জিজ্ঞাসা করুন</p>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender_type === 'customer' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] sm:max-w-[75%] rounded-2xl px-3 sm:px-4 py-2 ${
                message.sender_type === 'customer'
                  ? 'bg-blue-600 text-white rounded-br-none'
                  : 'bg-white text-gray-800 rounded-bl-none shadow-sm'
              }`}
            >
              {message.message_type === 'image' && message.metadata?.file_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={message.metadata.file_url}
                  alt="Attachment"
                  className="rounded-lg mb-2 max-w-full"
                />
              )}

              {message.message_type === 'document' && message.metadata?.file_url && (
                <a
                  href={message.metadata.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 mb-2 hover:underline"
                >
                  <FileText className="w-4 h-4 flex-shrink-0" />
                  <span className="text-xs sm:text-sm truncate">{message.content}</span>
                </a>
              )}

              {message.message_type === 'text' && (
                <p className="text-xs sm:text-sm whitespace-pre-wrap break-words">{message.content}</p>
              )}

              <div
                className={`text-[10px] sm:text-xs mt-1 ${
                  message.sender_type === 'customer' ? 'text-blue-100' : 'text-gray-400'
                }`}
              >
                {formatTime(message.created_at)}
              </div>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white rounded-2xl rounded-bl-none px-3 sm:px-4 py-2 sm:py-3 shadow-sm">
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
              </div>
            </div>
          </div>
        )}

        {/* Always show presets if available */}
        {showPresets && presets.length > 0 && (
          <div className="flex flex-col items-end gap-2 pt-2">
            <div className="flex flex-wrap justify-end gap-1.5 sm:gap-2 max-w-[90%] sm:max-w-[85%]">
              {presets.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => handlePresetClick(preset)}
                  className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-white border border-gray-200 shadow-sm text-xs sm:text-sm font-medium text-gray-800 hover:bg-gray-50 transition-colors"
                >
                  {preset.button_label}
                </button>
              ))}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area - Fixed at bottom */}
      <div className="flex-shrink-0 border-t bg-white p-2 sm:p-4">
        <div className="flex items-center gap-2">
          <div className="flex-1 flex items-center gap-1 sm:gap-2 bg-gray-100 rounded-full px-3 sm:px-4 py-1.5 sm:py-2">
            <Input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="মেসেজ..."
              className="flex-1 bg-transparent border-none focus:outline-none focus:ring-0 text-xs sm:text-sm h-auto py-0"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="text-gray-500 hover:text-blue-600 flex-shrink-0"
            >
              <Paperclip className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <button className="text-gray-500 hover:text-blue-600 flex-shrink-0 hidden sm:block">
              <ImageIcon className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <button className="text-gray-500 hover:text-blue-600 flex-shrink-0 hidden sm:block">
              <Smile className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>

          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim()}
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-white disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 transition-colors"
            style={{ backgroundColor: primaryColor }}
          >
            <Send className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,.pdf,.doc,.docx"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
}
