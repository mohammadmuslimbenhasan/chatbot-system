'use client';

import { ChatWidget } from '@/components/widget/ChatWidget';

export default function EmbedPage() {
  const handleClose = () => {
    if (window.parent) {
      window.parent.postMessage('chatbot-close', '*');
    }
  };

  return (
    <div className="h-screen h-[100dvh] w-full bg-transparent overflow-hidden">
      <ChatWidget embedded={true} onClose={handleClose} />
    </div>
  );
}
