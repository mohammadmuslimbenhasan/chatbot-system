# Widget Embedding Guide

This guide explains how to embed the chatbot widget on any website.

## Understanding the Widget Architecture

The chatbot widget uses a **two-layer approach** for maximum compatibility:

1. **Shadow DOM Container**: Prevents CSS conflicts with the host website
2. **Iframe**: Complete isolation for the chat interface
3. **Floating Button**: Always-visible chat trigger

This architecture ensures the widget works on any website without breaking existing styles or functionality.

## Quick Start

### Basic Embedding

Add this code before the closing `</body>` tag on any HTML page:

```html
<script>
  window.CHATBOT_WIDGET_URL = 'https://your-domain.com';
</script>
<script src="https://your-domain.com/widget.js"></script>
```

**That's it!** The widget will automatically appear in the bottom-right corner.

## Configuration Options

### Change Widget Position

The widget is positioned using CSS. To customize, you can modify the `widget.js` file:

```javascript
// Default position (bottom-right)
bottom: 20px;
right: 20px;

// Move to bottom-left
bottom: 20px;
left: 20px;
```

### Change Widget Colors

The widget inherits colors from your brand settings in the admin panel. To customize:

1. Login to Admin Dashboard
2. Go to "Brand Settings"
3. Change "Primary Color"
4. Colors update instantly across all embedded widgets

## Advanced Integration

### Custom Trigger Button

Hide the default floating button and use your own:

```html
<!-- Your custom button -->
<button id="open-chat">Chat with us</button>

<script>
  window.CHATBOT_WIDGET_URL = 'https://your-domain.com';
</script>
<script src="https://your-domain.com/widget.js"></script>

<script>
  // Wait for widget to load
  window.addEventListener('load', function() {
    // Hide default button
    const defaultButton = document.getElementById('chatbot-widget-button');
    if (defaultButton) defaultButton.style.display = 'none';

    // Trigger widget with custom button
    document.getElementById('open-chat').addEventListener('click', function() {
      const iframe = document.getElementById('chatbot-widget-iframe-wrapper');
      if (iframe) {
        iframe.classList.toggle('open');
      }
    });
  });
</script>
```

### Pre-fill Customer Information

Pass customer information to the widget:

```html
<script>
  window.CHATBOT_WIDGET_URL = 'https://your-domain.com';
  window.CHATBOT_CUSTOMER_NAME = 'John Doe';
  window.CHATBOT_CUSTOMER_EMAIL = 'john@example.com';
</script>
<script src="https://your-domain.com/widget.js"></script>
```

Then modify the widget to use these values when creating a chat.

### Auto-Open Widget

Automatically open the widget on page load:

```html
<script>
  window.CHATBOT_WIDGET_URL = 'https://your-domain.com';
</script>
<script src="https://your-domain.com/widget.js"></script>

<script>
  window.addEventListener('load', function() {
    setTimeout(function() {
      const button = document.getElementById('chatbot-widget-button');
      if (button) button.click();
    }, 2000); // Open after 2 seconds
  });
</script>
```

### Trigger on Specific Pages

Only show widget on certain pages:

```html
<script>
  // Only load on contact and support pages
  const currentPath = window.location.pathname;
  const allowedPages = ['/contact', '/support', '/help'];

  if (allowedPages.some(page => currentPath.includes(page))) {
    window.CHATBOT_WIDGET_URL = 'https://your-domain.com';
    const script = document.createElement('script');
    script.src = 'https://your-domain.com/widget.js';
    document.body.appendChild(script);
  }
</script>
```

## Platform-Specific Integration

### WordPress

1. Go to **Appearance** → **Theme File Editor**
2. Select `footer.php`
3. Add the widget code before `</body>`
4. Save changes

**OR** use a plugin:
1. Install "Insert Headers and Footers" plugin
2. Paste widget code in footer section
3. Save

### Shopify

1. Go to **Online Store** → **Themes**
2. Click **Actions** → **Edit code**
3. Open `theme.liquid`
4. Add widget code before `</body>`
5. Save

### Wix

1. Go to **Settings** → **Custom Code**
2. Click **Add Custom Code**
3. Paste widget script
4. Set to load on "All pages"
5. Place code in "Body - end"
6. Apply

### Webflow

1. Go to **Project Settings** → **Custom Code**
2. Scroll to **Footer Code**
3. Paste widget script
4. Save and publish

### React/Next.js

```jsx
// components/ChatbotWidget.js
import { useEffect } from 'react';

export default function ChatbotWidget() {
  useEffect(() => {
    // Set configuration
    window.CHATBOT_WIDGET_URL = 'https://your-domain.com';

    // Load script
    const script = document.createElement('script');
    script.src = 'https://your-domain.com/widget.js';
    script.async = true;
    document.body.appendChild(script);

    // Cleanup
    return () => {
      document.body.removeChild(script);
      const widget = document.getElementById('chatbot-widget-container');
      if (widget) widget.remove();
    };
  }, []);

  return null;
}

// In your layout or page
import ChatbotWidget from '@/components/ChatbotWidget';

export default function Layout({ children }) {
  return (
    <>
      {children}
      <ChatbotWidget />
    </>
  );
}
```

### Vue.js

```vue
<!-- ChatbotWidget.vue -->
<template>
  <div></div>
</template>

<script>
export default {
  mounted() {
    window.CHATBOT_WIDGET_URL = 'https://your-domain.com';

    const script = document.createElement('script');
    script.src = 'https://your-domain.com/widget.js';
    script.async = true;
    document.body.appendChild(script);
  },

  beforeUnmount() {
    const widget = document.getElementById('chatbot-widget-container');
    if (widget) widget.remove();
  }
}
</script>
```

## Customization Examples

### Change Button Position to Bottom-Left

```html
<script>
  window.CHATBOT_WIDGET_URL = 'https://your-domain.com';
</script>
<script src="https://your-domain.com/widget.js"></script>

<style>
  #chatbot-widget-container {
    left: 20px !important;
    right: auto !important;
  }

  #chatbot-widget-iframe-wrapper {
    left: 20px !important;
    right: auto !important;
  }
</style>
```

### Larger Widget Size

```html
<script>
  window.CHATBOT_WIDGET_URL = 'https://your-domain.com';
</script>
<script src="https://your-domain.com/widget.js"></script>

<style>
  #chatbot-widget-iframe-wrapper {
    width: 500px !important;
    height: 700px !important;
  }
</style>
```

### Mobile-Only Widget

```html
<script>
  if (window.innerWidth <= 768) {
    window.CHATBOT_WIDGET_URL = 'https://your-domain.com';
    const script = document.createElement('script');
    script.src = 'https://your-domain.com/widget.js';
    document.body.appendChild(script);
  }
</script>
```

### Desktop-Only Widget

```html
<script>
  if (window.innerWidth > 768) {
    window.CHATBOT_WIDGET_URL = 'https://your-domain.com';
    const script = document.createElement('script');
    script.src = 'https://your-domain.com/widget.js';
    document.body.appendChild(script);
  }
</script>
```

## Events and Callbacks

### Listen for Widget Events

```javascript
// Widget opened
window.addEventListener('chatbot-opened', function() {
  console.log('Chatbot opened');
  // Track with analytics
  gtag('event', 'chatbot_opened');
});

// Widget closed
window.addEventListener('chatbot-closed', function() {
  console.log('Chatbot closed');
});

// Message sent
window.addEventListener('chatbot-message-sent', function(e) {
  console.log('Message sent:', e.detail);
});
```

### Control Widget Programmatically

```javascript
// Open widget
window.openChatbot = function() {
  const button = document.getElementById('chatbot-widget-button');
  if (button && !button.classList.contains('open')) {
    button.click();
  }
};

// Close widget
window.closeChatbot = function() {
  const button = document.getElementById('chatbot-widget-button');
  if (button && button.classList.contains('open')) {
    button.click();
  }
};

// Toggle widget
window.toggleChatbot = function() {
  const button = document.getElementById('chatbot-widget-button');
  if (button) button.click();
};
```

Usage:
```html
<button onclick="window.openChatbot()">Need Help?</button>
```

## Testing the Widget

### Local Testing

1. Start your development server:
```bash
npm run dev
```

2. Create a test HTML file:
```html
<!DOCTYPE html>
<html>
<head>
  <title>Widget Test</title>
</head>
<body>
  <h1>Test Page</h1>
  <p>The widget should appear in the bottom-right corner.</p>

  <script>
    window.CHATBOT_WIDGET_URL = 'http://localhost:3000';
  </script>
  <script src="http://localhost:3000/widget.js"></script>
</body>
</html>
```

3. Open the HTML file in your browser

### Production Testing

1. Deploy your application
2. Replace `localhost:3000` with your production URL
3. Test on different devices and browsers

### Browser Compatibility

The widget is tested and works on:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Troubleshooting

### Widget Not Appearing

**Check 1**: Verify script loads
```javascript
// In browser console
console.log(window.CHATBOT_WIDGET_URL);
```

**Check 2**: Look for errors
- Open browser DevTools (F12)
- Check Console tab for errors
- Check Network tab for failed requests

**Check 3**: CORS Issues
- Ensure your domain allows iframe embedding
- Check Supabase CORS settings

### Widget Conflicts with Site Styles

The Shadow DOM should prevent conflicts, but if issues occur:

```html
<style>
  /* Increase specificity */
  #chatbot-widget-container * {
    all: initial;
    font-family: system-ui, -apple-system, sans-serif !important;
  }
</style>
```

### Widget Not Responsive

Ensure viewport meta tag is present:
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0">
```

### Performance Issues

**Lazy Load Widget**:
```javascript
// Only load when user scrolls 50%
let loaded = false;
window.addEventListener('scroll', function() {
  if (!loaded && window.scrollY > document.body.scrollHeight * 0.5) {
    loaded = true;
    window.CHATBOT_WIDGET_URL = 'https://your-domain.com';
    const script = document.createElement('script');
    script.src = 'https://your-domain.com/widget.js';
    document.body.appendChild(script);
  }
});
```

## Security Considerations

### Content Security Policy (CSP)

If your site uses CSP, add these directives:

```
Content-Security-Policy:
  frame-src https://your-domain.com;
  script-src https://your-domain.com;
  connect-src https://your-domain.com https://*.supabase.co;
```

### XSS Protection

The widget sanitizes user input, but ensure:
- Don't pass unsanitized data to widget config
- Validate customer information before passing
- Use HTTPS in production

## Analytics Integration

### Google Analytics

```javascript
window.addEventListener('chatbot-opened', function() {
  gtag('event', 'chatbot_interaction', {
    'event_category': 'Chat',
    'event_label': 'Opened'
  });
});

window.addEventListener('chatbot-message-sent', function() {
  gtag('event', 'chatbot_interaction', {
    'event_category': 'Chat',
    'event_label': 'Message Sent'
  });
});
```

### Facebook Pixel

```javascript
window.addEventListener('chatbot-opened', function() {
  fbq('trackCustom', 'ChatbotOpened');
});
```

## Best Practices

1. **Always use HTTPS** in production
2. **Test on multiple devices** before launch
3. **Monitor widget performance** with analytics
4. **Keep widget.js cached** with proper headers
5. **Update CHATBOT_WIDGET_URL** for different environments
6. **Test widget in incognito mode** to verify functionality
7. **Set appropriate timeout** for auto-open widgets
8. **Provide fallback contact** if widget fails

## Support

For widget integration issues:
1. Check browser console for errors
2. Verify CHATBOT_WIDGET_URL is correct
3. Ensure scripts load successfully
4. Test in different browsers
5. Check network requests in DevTools

---

**Happy Embedding!** Your customers can now get instant support through the beautiful chatbot widget.
