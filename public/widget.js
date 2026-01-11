(function () {
  if (window.ChatbotWidgetLoaded) return;
  window.ChatbotWidgetLoaded = true;

  const WIDGET_BASE_URL = window.CHATBOT_WIDGET_URL || window.location.origin;

  const styles = `
    #chatbot-widget-container {
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 999999;
      font-family: system-ui, -apple-system, sans-serif;
    }

    #chatbot-widget-button {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
      border: none;
      cursor: pointer;
      box-shadow: 0 6px 20px rgba(44, 62, 80, 0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.2s, box-shadow 0.2s;
      position: relative;
    }

    #chatbot-widget-button:hover {
      transform: scale(1.08);
      box-shadow: 0 8px 24px rgba(44, 62, 80, 0.4);
    }

    #chatbot-widget-button:active {
      transform: scale(0.96);
    }

    #chatbot-widget-button svg {
      width: 30px;
      height: 30px;
      color: white;
    }

    #chatbot-widget-button.open {
      background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
    }

   #chatbot-widget-iframe-wrapper {
  position: fixed;
  bottom: 100px;
  right: 24px;

  /* ✅ responsive size on PC */
  width: min(420px, calc(100vw - 48px));
  height: min(720px, calc(100vh - 140px));   /* grows with screen, but never exceeds viewport */

  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.25);
  display: none;
  z-index: 999999;
  background: white;
}


    #chatbot-widget-iframe-wrapper.open {
      display: block;
      animation: slideUp 0.35s cubic-bezier(0.4, 0, 0.2, 1);
    }

    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(30px) scale(0.95);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }

    #chatbot-widget-iframe {
      width: 100%;
      height: 100%;
      border: none;
      background: white;
      border-radius: 24px;
    }

    @media (max-width: 768px) {
      #chatbot-widget-iframe-wrapper {
        width: calc(100vw - 24px);
        height: calc(100vh - 120px);
        right: 12px;
        bottom: 90px;
        border-radius: 20px;
        max-width: none;
        max-height: none;
      }

      #chatbot-widget-container {
        bottom: 16px;
        right: 16px;
      }

      #chatbot-widget-button {
        width: 56px;
        height: 56px;
      }

      #chatbot-widget-button svg {
        width: 26px;
        height: 26px;
      }
    }

    @media (max-width: 480px) {
      #chatbot-widget-iframe-wrapper {
        width: 100vw;
        height: 100vh;
        right: 0;
        bottom: 0;
        border-radius: 0;
      }

      #chatbot-widget-iframe {
        border-radius: 0;
      }
    }

    .chatbot-pulse {
      position: absolute;
      top: 0;
      right: 0;
      width: 14px;
      height: 14px;
      background: #e74c3c;
      border-radius: 50%;
      animation: pulse 2.5s infinite;
      border: 2px solid white;
    }

    @keyframes pulse {
      0%, 100% {
        transform: scale(1);
        opacity: 1;
      }
      50% {
        transform: scale(1.3);
        opacity: 0.6;
      }
    }
  `;

  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);

  const container = document.createElement('div');
  container.id = 'chatbot-widget-container';

  const button = document.createElement('button');
  button.id = 'chatbot-widget-button';
  button.setAttribute('aria-label', 'Open chat');
  button.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12c0 1.54.36 3 .97 4.29L2 22l5.71-.97C9 21.64 10.46 22 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2zm0 18c-1.38 0-2.68-.28-3.88-.78l-.28-.12-2.93.5.5-2.93-.12-.28C4.78 14.68 4.5 13.38 4.5 12c0-4.14 3.36-7.5 7.5-7.5s7.5 3.36 7.5 7.5-3.36 7.5-7.5 7.5z"/>
      <circle cx="8.5" cy="12" r="1.25"/>
      <circle cx="12" cy="12" r="1.25"/>
      <circle cx="15.5" cy="12" r="1.25"/>
    </svg>
    <span class="chatbot-pulse"></span>
  `;

  const iframeWrapper = document.createElement('div');
  iframeWrapper.id = 'chatbot-widget-iframe-wrapper';

  const iframe = document.createElement('iframe');
  iframe.id = 'chatbot-widget-iframe';
  iframe.src = `${WIDGET_BASE_URL}/embed`;
  iframe.allow = 'microphone; camera';

  iframeWrapper.appendChild(iframe);

  button.addEventListener('click', function () {
    const isOpen = iframeWrapper.classList.contains('open');

    if (isOpen) {
      iframeWrapper.classList.remove('open');
      button.classList.remove('open');
      button.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12c0 1.54.36 3 .97 4.29L2 22l5.71-.97C9 21.64 10.46 22 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2zm0 18c-1.38 0-2.68-.28-3.88-.78l-.28-.12-2.93.5.5-2.93-.12-.28C4.78 14.68 4.5 13.38 4.5 12c0-4.14 3.36-7.5 7.5-7.5s7.5 3.36 7.5 7.5-3.36 7.5-7.5 7.5z"/>
          <circle cx="8.5" cy="12" r="1.25"/>
          <circle cx="12" cy="12" r="1.25"/>
          <circle cx="15.5" cy="12" r="1.25"/>
        </svg>
        <span class="chatbot-pulse"></span>
      `;
    } else {
      iframeWrapper.classList.add('open');
      button.classList.add('open');
      button.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
        </svg>
      `;
    }
  });

  container.appendChild(button);
  container.appendChild(iframeWrapper);
  document.body.appendChild(container);

  window.addEventListener('message', function (event) {
    if (event.data === 'chatbot-close') {
      iframeWrapper.classList.remove('open');
      button.classList.remove('open');
      button.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12c0 1.54.36 3 .97 4.29L2 22l5.71-.97C9 21.64 10.46 22 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2zm0 18c-1.38 0-2.68-.28-3.88-.78l-.28-.12-2.93.5.5-2.93-.12-.28C4.78 14.68 4.5 13.38 4.5 12c0-4.14 3.36-7.5 7.5-7.5s7.5 3.36 7.5 7.5-3.36 7.5-7.5 7.5z"/>
          <circle cx="8.5" cy="12" r="1.25"/>
          <circle cx="12" cy="12" r="1.25"/>
          <circle cx="15.5" cy="12" r="1.25"/>
        </svg>
        <span class="chatbot-pulse"></span>
      `;
    }
  });
})();
