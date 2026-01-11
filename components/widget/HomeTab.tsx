'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Home, MessageCircle, ExternalLink, ChevronRight, X } from 'lucide-react';
import { BrandSettings } from '@/types';

interface HomeTabProps {
  brandSettings: BrandSettings;
  onStartChat: () => void;
  onRecentMessage?: () => void;
  onClose?: () => void;
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

  const agents = useMemo(
    () => [
      { id: 1, img: '' },
      { id: 2, img: '' },
      { id: 3, img: '' },
    ],
    []
  );

  const recentMessage = {
    title: 'এই কথোপকথন আপডেট ...',
    by: brandSettings.brand_name || 'MALIK',
    time: '১৫ঘণ্টা',
    hasDot: true,
  };

  const primaryColor = brandSettings.primary_color || '#1e3a8a';
  const gradFrom = brandSettings.home_gradient_from || '#1f2d3a';

  // Handle recent message click - go to chat
  const handleRecentMessageClick = () => {
    if (onRecentMessage) {
      onRecentMessage();
    } else {
      onStartChat();
    }
  };

  return (
    <div 
      className="w-full h-full flex flex-col overflow-hidden rounded-3xl"
      style={{
        background: `linear-gradient(180deg, ${gradFrom} 0%, ${gradFrom} 40%, #ffffff 40%, #ffffff 100%)`,
      }}
    >
      {/* Scrollable Content Area */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="min-h-full flex flex-col justify-around px-4 sm:px-5 py-4 sm:py-6">
          
          {/* Top Section - Logo & Close */}
          <div className="flex items-center justify-between text-white">
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Logo - no border, blends with background */}
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl overflow-hidden flex items-center justify-center bg-white/10">
                {brandSettings.logo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={brandSettings.logo_url} alt="logo" className="w-full h-full object-contain" />
                ) : (
                  <span className="text-sm sm:text-base font-bold text-white">
                    {(brandSettings.brand_name || 'BR').slice(0, 2)}
                  </span>
                )}
              </div>
              <div className="text-sm sm:text-base font-semibold">{brandSettings.brand_name || 'Brand'}</div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              {/* Agent avatars */}
              <div className="flex items-center -space-x-2">
                {agents.map((a) => (
                  <div
                    key={a.id}
                    className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/20 overflow-hidden flex items-center justify-center"
                  >
                    {a.img ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={a.img} alt="agent" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xs">👤</span>
                    )}
                  </div>
                ))}
              </div>

              {onClose && (
                <button
                  type="button"
                  onClick={onClose}
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                  aria-label="Close"
                >
                  <X className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              )}
            </div>
          </div>

          {/* Greeting Section */}
          <div className="text-white text-center py-4 sm:py-6">
            <div className="text-2xl sm:text-3xl font-extrabold leading-tight">
              {brandSettings.home_greeting || 'হাই 👋'}
            </div>
            <div className="mt-2 text-xl sm:text-2xl font-bold leading-tight opacity-90">
              {brandSettings.home_subtext || 'আমরা কিভাবে সাহায্য করতে পারি?'}
            </div>
          </div>

          {/* Recent Message Card - Clickable to go to messages */}
          <div 
            onClick={handleRecentMessageClick}
            className="bg-white rounded-2xl shadow-lg overflow-hidden cursor-pointer hover:shadow-xl transition-shadow mx-auto w-full max-w-[340px]"
          >
            <div className="px-4 pt-3 text-xs sm:text-sm font-semibold text-gray-700">সাম্প্রতিক মেসেজ</div>
            <div className="px-4 pb-4 pt-2 flex items-center gap-3">
              <div className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center flex-shrink-0">
                {brandSettings.logo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={brandSettings.logo_url} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-lg">💬</span>
                )}
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-green-500 text-[10px] font-bold text-white flex items-center justify-center border-2 border-white">
                  1
                </span>
              </div>

              <div className="flex-1 min-w-0">
                <div className="text-[13px] sm:text-[14px] font-semibold text-gray-900 truncate">{recentMessage.title}</div>
                <div className="text-[11px] sm:text-[12px] text-gray-500 flex items-center gap-1 mt-0.5">
                  <span className="font-medium truncate">{recentMessage.by}</span>
                  <span>•</span>
                  <span className="flex-shrink-0">{recentMessage.time}</span>
                </div>
              </div>

              {recentMessage.hasDot && (
                <div className="w-2.5 h-2.5 rounded-full bg-red-500 flex-shrink-0 animate-pulse" />
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 sm:space-y-3 mx-auto w-full max-w-[340px]">
            <button
              onClick={onStartChat}
              className="w-full bg-white rounded-2xl shadow-md px-4 py-3 flex items-center justify-between hover:bg-gray-50 hover:shadow-lg transition-all"
            >
              <span className="text-[13px] sm:text-[15px] font-semibold text-gray-900 truncate pr-2">
                {brandSettings.send_message_text || 'আমাদের একটি মেসেজ পাঠান'}
              </span>
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700" />
              </div>
            </button>

            <button
              onClick={() => go(router, brandSettings.home_proxy_url)}
              className="w-full bg-white rounded-2xl shadow-md px-4 py-3 flex items-center justify-between hover:bg-gray-50 hover:shadow-lg transition-all"
            >
              <span className="text-[13px] sm:text-[15px] font-semibold text-gray-900 truncate pr-2">
                {brandSettings.home_proxy_label || 'আমাদের প্রক্সি লিংক গুলো দেখে নিন'}
              </span>
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                <ExternalLink className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700" />
              </div>
            </button>

            <button
              onClick={() => go(router, brandSettings.home_master_url)}
              className="w-full bg-white rounded-2xl shadow-md px-4 py-3 flex items-center justify-between hover:bg-gray-50 hover:shadow-lg transition-all"
            >
              <span className="text-[13px] sm:text-[15px] font-semibold text-gray-900 truncate pr-2">
                {brandSettings.home_master_label || 'ভোক্তা মাস্টার এজেন্ট লিস্ট'}
              </span>
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                <ExternalLink className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700" />
              </div>
            </button>
          </div>

          {/* Bottom Navigation */}
          <div className="flex items-center justify-center gap-12 sm:gap-16 pt-4">
            <button className="flex flex-col items-center gap-1 text-gray-700">
              <div 
                className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center"
                style={{ backgroundColor: `${primaryColor}20` }}
              >
                <Home className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: primaryColor }} />
              </div>
              <span className="text-[10px] sm:text-xs font-semibold">হোম</span>
            </button>

            <button onClick={onStartChat} className="relative flex flex-col items-center gap-1 text-gray-500">
              <div className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gray-100 flex items-center justify-center">
                <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center border-2 border-white">
                    {unreadCount}
                  </span>
                )}
              </div>
              <span className="text-[10px] sm:text-xs font-semibold">মেসেজ</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
