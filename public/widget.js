(function () {
  if (window.ChatbotWidgetLoaded) return;
  window.ChatbotWidgetLoaded = true;

  // 🚫 Disable chatbot and show payment notice
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.bottom = '24px';
  container.style.right = '24px';
  container.style.zIndex = '999999';
  container.style.fontFamily = 'system-ui, -apple-system, sans-serif';

  const box = document.createElement('div');
  box.style.width = '300px';
  box.style.padding = '16px';
  box.style.borderRadius = '12px';
  box.style.background = '#fff';
  box.style.boxShadow = '0 10px 30px rgba(0,0,0,0.2)';
  box.style.textAlign = 'center';
  box.style.border = '1px solid #eee';

  box.innerHTML = `
    <h4 style="margin:0 0 8px; color:#e74c3c;">Service Disabled</h4>
    <p style="font-size:14px; margin:0; color:#555;">
      This chatbot is temporarily unavailable.<br>
      Please clear the pending payment to reactivate the service.
    </p>
  `;

  container.appendChild(box);
  document.body.appendChild(container);
})();
