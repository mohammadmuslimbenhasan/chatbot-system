'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Home, MessageCircle, ExternalLink, ChevronRight, X } from 'lucide-react';
import { BrandSettings } from '@/types';
import { chatService } from '@/lib/chat-service';

interface HomeTabProps {
  brandSettings: BrandSettings;
  onStartChat: () => void;
  onRecentMessage?: () => void;
  onClose?: () => void;
}

interface Agent {
  id: string;
  avatar_url: string | null;
  name: string;
}

function go(router: any, url?: string) {
  if (!url) return;
  if (url.startsWith('http://') || url.startsWith('https://')) {
    window.open(url, '_blank', 'noopener,noreferrer');
    return;
  }
  router.push(url);
}

export function HomeTab({ brandSettings, onStartChat, onRecentMessage, onClose }: HomeTabProps) {
  const router = useRouter();
  const [unreadCount] = useState(8);
  const [agents, setAgents] = useState<Agent[]>([]);

  useEffect(() => {
    const loadAgents = async () => {
      const activeAgents = await chatService.getActiveAgents(3);
      setAgents(activeAgents);
    };
    loadAgents();
  }, []);

  const recentMessage = {
    title: 'এই কথোপকথন আপডেট ...',
    by: brandSettings.brand_name || 'MALIK',
    time: '১৫ঘণ্টা',
    hasDot: true,
  };

  const primaryColor = brandSettings.primary_color || '#1e3a8a';

  const gradFrom = brandSettings.home_gradient_from || '#1f2d3a';
  const gradFromTransparent =
    gradFrom.startsWith('#') && gradFrom.length === 7 ? `${gradFrom}00` : 'rgba(31,45,58,0)';

  const handleRecentMessageClick = () => {
    if (onRecentMessage) onRecentMessage();
    else onStartChat();
  };

  return (
    // ✅ NO fixed height. Just fill parent.
    <div className="w-full h-full overflow-hidden">
      {/* ✅ Background fills parent */}
      <div
        className="w-full h-full flex flex-col"
        style={{
          background: `linear-gradient(180deg,
            ${gradFrom} 0%,
            ${gradFrom} 55%,
            ${gradFromTransparent} 62%,
            #ffffff00 62%,
            #ffffff 70%,
            #ffffff 100%
          )`,
        }}
      >
        {/* ✅ Scroll area takes remaining height */}
        <div className="flex-1 min-h-0 overflow-y-auto">
          {/* ✅ Padding to prevent cut */}
          <div className="px-3 xs:px-4 pt-4 pb-4 min-h-full flex flex-col justify-between">
            {/* --- your content unchanged below --- */}

            {/* Top Section */}
            <div className="flex items-center justify-between text-white">
              <div className="flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center"
                  style={{
                    background:
                      'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 100%)',
                  }}
                >
                  {brandSettings.logo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={brandSettings.logo_url} alt="logo" className="w-full h-full object-contain" />
                  ) : (
                    <span className="text-xs font-bold text-white/90">
                      {(brandSettings.brand_name || 'BR').slice(0, 2)}
                    </span>
                  )}
                </div>
                <div className="text-xs font-semibold">{brandSettings.brand_name || 'Brand'}</div>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center -space-x-2">
                  {agents.length > 0 ? (
                    agents.map((agent) => (
                      <div
                        key={agent.id}
                        className="w-7 h-7 rounded-full overflow-hidden flex items-center justify-center"
                        style={{
                          background:
                            'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.1) 100%)',
                        }}
                        title={agent.name}
                      >
                        {agent.avatar_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={agent.avatar_url} alt={agent.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-[10px] text-white/80">{agent.name.slice(0, 1).toUpperCase()}</span>
                        )}
                      </div>
                    ))
                  ) : (
                    [1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="w-7 h-7 rounded-full overflow-hidden flex items-center justify-center"
                        style={{
                          background:
                            'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.1) 100%)',
                        }}
                      >
                        <span className="text-[10px]">👤</span>
                      </div>
                    ))
                  )}
                </div>

                {onClose && (
                  <button
                    type="button"
                    onClick={onClose}
                    className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors"
                    style={{
                      background:
                        'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 100%)',
                    }}
                    aria-label="Close"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Greeting */}
            <div className="text-white text-left pt-4 pb-4">
              <div className="text-2xl font-extrabold leading-tight">
                {brandSettings.home_greeting || 'হাই 👋'}
              </div>
              <div className="mt-1 text-lg font-semibold leading-tight opacity-90">
                {brandSettings.home_subtext || 'আমরা কিভাবে সাহায্য করতে পারি?'}
              </div>
            </div>

            {/* Recent Message Card */}
            <div
              onClick={handleRecentMessageClick}
              className="bg-white rounded-2xl shadow-lg overflow-hidden cursor-pointer hover:shadow-xl transition-shadow w-full"
            >
              <div className="px-4 pt-3 text-xs font-semibold text-gray-700">সাম্প্রতিক মেসেজ</div>
              <div className="px-4 pb-4 pt-2 flex items-center gap-3">
                <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center flex-shrink-0">
                  {brandSettings.logo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={brandSettings.logo_url} alt="avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-sm">💬</span>
                  )}
                  <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-green-500 text-[10px] font-bold text-white flex items-center justify-center border-2 border-white">
                    1
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-gray-900 truncate">{recentMessage.title}</div>
                  <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                    <span className="font-medium truncate">{recentMessage.by}</span>
                    <span>•</span>
                    <span className="flex-shrink-0">{recentMessage.time}</span>
                  </div>
                </div>

                {recentMessage.hasDot && (
                  <div className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0 animate-pulse" />
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 w-full mt-4">
              <button
                onClick={onStartChat}
                className="w-full bg-white rounded-2xl shadow-md px-4 py-3 flex items-center justify-between hover:bg-gray-50 hover:shadow-lg transition-all"
              >
                <span className="text-sm font-semibold text-gray-900 truncate pr-2">
                  {brandSettings.send_message_text || 'আমাদের একটি মেসেজ পাঠান'}
                </span>
                <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                  <ChevronRight className="w-5 h-5 text-gray-700" />
                </div>
              </button>

              <button
                onClick={() => go(router, brandSettings.home_proxy_url)}
                className="w-full bg-white rounded-2xl shadow-md px-4 py-3 flex items-center justify-between hover:bg-gray-50 hover:shadow-lg transition-all"
              >
                <span className="text-sm font-semibold text-gray-900 truncate pr-2">
                  {brandSettings.home_proxy_label || 'আমাদের প্রক্সি লিংক গুলো দেখে নিন'}
                </span>
                <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                  <ExternalLink className="w-5 h-5 text-gray-700" />
                </div>
              </button>

              <button
                onClick={() => go(router, brandSettings.home_master_url)}
                className="w-full bg-white rounded-2xl shadow-md px-4 py-3 flex items-center justify-between hover:bg-gray-50 hover:shadow-lg transition-all"
              >
                <span className="text-sm font-semibold text-gray-900 truncate pr-2">
                  {brandSettings.home_master_label || 'ভোক্তা মাস্টার এজেন্ট লিস্ট'}
                </span>
                <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                  <ExternalLink className="w-5 h-5 text-gray-700" />
                </div>
              </button>
            </div>

            {/* Bottom Navigation */}
            <div className="pt-4">
              <div className="flex items-center justify-around w-full">
                <button className="flex flex-col items-center gap-1 text-gray-700">
                  <div
                    className="w-11 h-11 rounded-2xl flex items-center justify-center"
                    style={{ backgroundColor: `${primaryColor}15` }}
                  >
                    <Home className="w-5 h-5" style={{ color: primaryColor }} />
                  </div>
                  <span className="text-[11px] font-semibold">হোম</span>
                </button>

                <button onClick={onStartChat} className="relative flex flex-col items-center gap-1 text-gray-500">
                  <div className="relative w-11 h-11 rounded-2xl bg-gray-100 flex items-center justify-center">
                    <MessageCircle className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center border-2 border-white">
                        {unreadCount}
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] font-semibold">মেসেজ</span>
                </button>
              </div>
            </div>

            {/* --- end content --- */}
          </div>
        </div>
      </div>
    </div>
  );
}
