'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Home, MessageCircle, ExternalLink, ChevronRight, X } from 'lucide-react';
import { BrandSettings } from '@/types';

interface HomeTabProps {
  brandSettings: BrandSettings;
  onStartChat: () => void;
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

export function HomeTab({ brandSettings, onStartChat, onClose }: HomeTabProps) {
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

  const gradFrom = brandSettings.home_gradient_from || '#1f2d3a';
  const gradTo = brandSettings.home_gradient_to || '#243a52';

  return (
    <div 
      className="w-full h-full flex flex-col overflow-hidden"
      style={{
        background: `linear-gradient(180deg, ${gradFrom} 0%, ${gradTo} 55%, ${gradTo} 100%)`,
      }}
    >
      {/* TOP BAR - Fixed */}
      <div className="flex-shrink-0 px-4 sm:px-5 pt-4 sm:pt-6 pb-3 text-white">
        <div className="flex items-center justify-between">
          {/* Logo top-left */}
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-white/10 border border-white/15 overflow-hidden flex items-center justify-center">
              {brandSettings.logo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={brandSettings.logo_url} alt="logo" className="w-full h-full object-cover" />
              ) : (
                <span className="text-xs sm:text-sm font-bold">
                  {(brandSettings.brand_name || 'BR').slice(0, 2)}
                </span>
              )}
            </div>
            <div className="text-xs sm:text-sm font-semibold">{brandSettings.brand_name || 'Brand'}</div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex items-center -space-x-2">
              {agents.map((a) => (
                <div
                  key={a.id}
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border-2 border-black/20 bg-white/10 overflow-hidden flex items-center justify-center"
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
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/10 hover:bg-white/15 flex items-center justify-center transition-colors"
                aria-label="Close"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Greeting */}
        <div className="mt-6 sm:mt-10">
          <div className="flex items-center gap-2 text-xl sm:text-[26px] font-extrabold leading-none">
            <span>{brandSettings.home_greeting || 'হাই 👋'}</span>
          </div>

          <div className="mt-2 text-xl sm:text-[26px] font-extrabold leading-[1.15] tracking-tight">
            {brandSettings.home_subtext || (
              <>
                আমরা কিভাবে সাহায্য <br />
                করতে পারি?
              </>
            )}
          </div>
        </div>
      </div>

      {/* BODY - Scrollable */}
      <div className="flex-1 min-h-0 flex flex-col bg-[#F3F5F7] rounded-t-[24px] sm:rounded-t-[28px] overflow-hidden">
        <div className="flex-1 overflow-y-auto px-4 sm:px-5 pt-4 sm:pt-6 pb-2">
          {/* Recent message */}
          <div className="bg-white rounded-2xl border border-black/10 shadow-sm overflow-hidden">
            <div className="px-3 sm:px-4 pt-3 text-xs sm:text-sm font-semibold text-gray-800">সাম্প্রতিক মেসেজ</div>

            <div className="px-3 sm:px-4 pb-3 sm:pb-4 pt-2 sm:pt-3 flex items-center gap-2 sm:gap-3">
              <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-2xl overflow-hidden border border-black/10 bg-gray-100 flex items-center justify-center flex-shrink-0">
                {brandSettings.logo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={brandSettings.logo_url} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-base sm:text-lg">💬</span>
                )}
                <span className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-lime-500 text-[10px] sm:text-[11px] font-bold text-white flex items-center justify-center border-2 border-white">
                  1
                </span>
              </div>

              <div className="flex-1 min-w-0">
                <div className="text-[13px] sm:text-[14px] font-semibold text-gray-900 truncate">{recentMessage.title}</div>
                <div className="text-[11px] sm:text-[12px] text-gray-500 flex items-center gap-1 sm:gap-2 mt-0.5">
                  <span className="font-medium truncate">{recentMessage.by}</span>
                  <span>•</span>
                  <span className="flex-shrink-0">{recentMessage.time}</span>
                </div>
              </div>

              {recentMessage.hasDot && <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-red-500 flex-shrink-0" />}
            </div>
          </div>

          {/* Buttons */}
          <div className="mt-3 sm:mt-4 space-y-2">
            <button
              onClick={onStartChat}
              className="w-full bg-white rounded-2xl border border-black/10 shadow-sm px-3 sm:px-4 py-2 flex items-center justify-between hover:bg-gray-50 transition"
            >
              <span className="text-[13px] sm:text-[15px] font-semibold text-gray-900 truncate pr-2">
                {brandSettings.send_message_text || 'আমাদের একটি মেসেজ পাঠান'}
              </span>
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-800" />
              </div>
            </button>

            <button
              onClick={() => go(router, brandSettings.home_proxy_url)}
              className="w-full bg-white rounded-2xl border border-black/10 shadow-sm px-3 sm:px-4 py-2 flex items-center justify-between hover:bg-gray-50 transition"
            >
              <span className="text-[13px] sm:text-[15px] font-semibold text-gray-900 truncate pr-2">
                {brandSettings.home_proxy_label || 'আমাদের প্রক্সি লিংক গুলো দেখে নিন'}
              </span>
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                <ExternalLink className="w-4 h-4 sm:w-5 sm:h-5 text-gray-800" />
              </div>
            </button>

            <button
              onClick={() => go(router, brandSettings.home_master_url)}
              className="w-full bg-white rounded-2xl border border-black/10 shadow-sm px-3 sm:px-4 py-2 flex items-center justify-between hover:bg-gray-50 transition"
            >
              <span className="text-[13px] sm:text-[15px] font-semibold text-gray-900 truncate pr-2">
                {brandSettings.home_master_label || 'ভোক্তা মাস্টার এজেন্ট লিস্ট'}
              </span>
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                <ExternalLink className="w-4 h-4 sm:w-5 sm:h-5 text-gray-800" />
              </div>
            </button>
          </div>
        </div>

        {/* Bottom nav - Fixed at bottom */}
        <div className="flex-shrink-0 bg-white border-t border-black/10 px-6 sm:px-8 pt-4 sm:pt-5 pb-3">
          <div className="flex items-center justify-between max-w-[200px] mx-auto">
            <button className="flex flex-col items-center gap-1 text-gray-900">
              <div className="w-10 h-9 sm:w-11 sm:h-10 rounded-2xl bg-gray-100 flex items-center justify-center">
                <Home className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <span className="text-[10px] sm:text-xs font-semibold">হোম</span>
            </button>

            <button onClick={onStartChat} className="relative flex flex-col items-center gap-1 text-gray-600">
              <div className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gray-100 flex items-center justify-center">
                <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-2 -right-2 min-w-[18px] sm:min-w-[22px] h-5 sm:h-6 px-1 rounded-full bg-red-500 text-white text-[10px] sm:text-[12px] font-bold flex items-center justify-center border-2 border-white">
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
