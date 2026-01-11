'use client';

import { ChatWidget } from '@/components/widget/ChatWidget';

export default function EmbedPage() {
  const handleClose = () => {
    if (window.parent) {
      window.parent.postMessage('chatbot-close', '*');
    }
  };

  return (
    <div className="h-screen h-[100dvh] w-full bg-gray-100/50 flex items-center justify-center p-2 sm:p-3 md:p-4">
      <div className="w-full h-full max-w-[420px] max-h-[720px]">
        <ChatWidget embedded={true} onClose={handleClose} />
      </div>
    </div>
  );
}
