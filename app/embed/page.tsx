'use client';

import { ChatWidget } from '@/components/widget/ChatWidget';

export default function EmbedPage() {
  const handleClose = () => {
    if (window.parent) {
      window.parent.postMessage('chatbot-close', '*');
    }
  };

  return (
    <div className="min-h-screen min-h-[100dvh] w-full bg-gray-100/50 flex items-center justify-center p-2 sm:p-3 md:p-4">
      <ChatWidget embedded={true} onClose={handleClose} />
    </div>
  );
}
