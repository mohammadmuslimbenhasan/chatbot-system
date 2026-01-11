(function () {
  var cfg = window.CHATBOT_CONFIG || {};
  var base = (cfg.widgetBase || "https://chatbot-system-mocha.vercel.app").replace(/\/$/, "");

  // Avoid loading twice
  if (window.__CHATBOT_LOADED__) return;
  window.__CHATBOT_LOADED__ = true;

  // Create iframe (isolates Next.js routing and prevents host-site 404s)
  var iframe = document.createElement("iframe");
  iframe.src =
    base +
    "/embed" +
    "?proxyUrl=" + encodeURIComponent(cfg.proxyUrl || "") +
    "&agentUrl=" + encodeURIComponent(cfg.agentUrl || "");

  iframe.style.position = "fixed";
  iframe.style.bottom = (cfg.bottom ?? 20) + "px";
  iframe.style.right = (cfg.right ?? 20) + "px";
  iframe.style.width = (cfg.width ?? 380) + "px";
  iframe.style.height = (cfg.height ?? 640) + "px";
  iframe.style.border = "0";
  iframe.style.borderRadius = "18px";
  iframe.style.zIndex = "2147483647";
  iframe.allow = "clipboard-write";

  document.body.appendChild(iframe);
})();
