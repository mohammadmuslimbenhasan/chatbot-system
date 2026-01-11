(function () {
  if (window.ChatbotWidgetLoaded) return;
  window.ChatbotWidgetLoaded = true;

  const WIDGET_BASE_URL = (window.CHATBOT_WIDGET_URL || window.location.origin).replace(/\/$/, "");

  const CHAT_ICON =
    "https://downloads.intercomcdn.com/i/o/qmraeqj3/830340/dfbf63338e4c5a4065703c74281d/38258c6b7facc7e1b605287ea03dd332.png";

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

    #chatbot-widget-button img.chatbot-widget-icon {
      width: 32px;
      height: 32px;
      object-fit: contain;
      pointer-events: none;
    }

    #chatbot-widget-button.open {
      background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
    }

    /* ✅ Desktop: frame + iframe perfectly matched */
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
      from { opacity: 0; transform: translateY(30px) scale(0.95); }
      to   { opacity: 1; transform: translateY(0) scale(1); }
    }

   #chatbot-widget-iframe {
  display: block;                   /* ✅ removes bottom gap */
  width: 100%;
  height: 100%;
  border: 0;
  background: transparent;
  border-radius: 0;                 /* ✅ wrapper clips it */
}

    /* ✅ Tablet / mobile: wrapper is allowed */
    @media (max-width: 768px) {
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

      #chatbot-widget-iframe-wrapper {
        right: 12px;
        bottom: 86px;
        width: calc(100vw - 24px);
        height: calc(100vh - 120px);

        border-radius: 24px !important;
        overflow: hidden !important;
        box-shadow: 0 18px 60px rgba(0, 0, 0, 0.35) !important;
        background: transparent !important;
      }

      #chatbot-widget-iframe {
        border-radius: 24px !important;
        background: transparent !important;
      }
    }

    /* ✅ Small mobile fullscreen */
    @media (max-width: 480px) {
      #chatbot-widget-iframe-wrapper {
        width: 100vw;
        height: 100vh;
        right: 0;
        bottom: 0;
        border-radius: 0 !important;
      }

      #chatbot-widget-iframe {
        border-radius: 0 !important;
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
      0%, 100% { transform: scale(1); opacity: 1; }
      50% { transform: scale(1.3); opacity: 0.6; }
    }
  `;

  const styleSheet = document.createElement("style");
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);

  const container = document.createElement("div");
  container.id = "chatbot-widget-container";

  const button = document.createElement("button");
  button.id = "chatbot-widget-button";
  button.type = "button";
  button.setAttribute("aria-label", "Open chat");

  function setButtonClosed() {
    button.classList.remove("open");
    button.innerHTML = `
      <img src="${CHAT_ICON}" alt="Chat" class="chatbot-widget-icon" />
      <span class="chatbot-pulse"></span>
    `;
  }

  function setButtonOpen() {
    button.classList.add("open");
    button.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
      </svg>
    `;
  }

  setButtonClosed();

  const iframeWrapper = document.createElement("div");
  iframeWrapper.id = "chatbot-widget-iframe-wrapper";

  const iframe = document.createElement("iframe");
  iframe.id = "chatbot-widget-iframe";
  iframe.src = `${WIDGET_BASE_URL}/embed`;
  iframe.allow = "microphone; camera";
  iframe.referrerPolicy = "no-referrer-when-downgrade";
  iframeWrapper.appendChild(iframe);

  button.addEventListener("click", function () {
    const isOpen = iframeWrapper.classList.contains("open");

    if (isOpen) {
      iframeWrapper.classList.remove("open");
      setButtonClosed();
    } else {
      iframeWrapper.classList.add("open");
      setButtonOpen();
    }
  });

  container.appendChild(button);
  container.appendChild(iframeWrapper);
  document.body.appendChild(container);

  window.addEventListener("message", function (event) {
    if (event && event.data === "chatbot-close") {
      iframeWrapper.classList.remove("open");
      setButtonClosed();
    }
  });
})();
