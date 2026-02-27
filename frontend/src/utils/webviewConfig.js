/**
 * WebView Configuration
 * Configuration for native app WebView integration
 */

// Allowed domains (whitelist)
export const ALLOWED_DOMAINS = [
  window.location.hostname,
  'localhost',
  '127.0.0.1',
  // Add your production domains here
  // 'yourdomain.com',
  // 'www.yourdomain.com',
];

// Check if current domain is allowed
export const isDomainAllowed = () => {
  const currentHost = window.location.hostname;
  return ALLOWED_DOMAINS.some(domain => 
    currentHost === domain || currentHost.endsWith(`.${domain}`)
  );
};

// WebView detection
export const isWebView = () => {
  // Check for common WebView user agents
  const ua = navigator.userAgent || navigator.vendor || window.opera;
  
  // Android WebView
  if (ua.includes('wv')) return true;
  
  // iOS WebView
  if (/iPad|iPhone|iPod/.test(ua) && !window.MSStream) {
    // Check if it's not Safari
    if (!ua.includes('Safari') || ua.includes('CriOS') || ua.includes('FxiOS')) {
      return true;
    }
  }
  
  // Check for custom WebView headers (set by native app)
  if (window.ReactNativeWebView || window.webkit?.messageHandlers) {
    return true;
  }
  
  return false;
};

// Post message to native app
export const postToNative = (type, data = {}) => {
  if (window.ReactNativeWebView) {
    // React Native WebView
    window.ReactNativeWebView.postMessage(JSON.stringify({ type, ...data }));
  } else if (window.webkit?.messageHandlers?.nativeHandler) {
    // iOS WKWebView
    window.webkit.messageHandlers.nativeHandler.postMessage({ type, ...data });
  } else if (window.Android) {
    // Android WebView
    if (window.Android[type]) {
      window.Android[type](JSON.stringify(data));
    }
  }
};

// Request native app bar visibility
export const setAppBarVisibility = (visible) => {
  postToNative('setAppBarVisibility', { visible });
};

// Request native splash screen hide
export const hideSplashScreen = () => {
  postToNative('hideSplashScreen', {});
};

// Request back button handling
export const setBackButtonEnabled = (enabled) => {
  postToNative('setBackButtonEnabled', { enabled });
};

// Lock navigation to current domain
export const lockToDomain = () => {
  // Prevent navigation to external domains
  const currentOrigin = window.location.origin;
  
  // Intercept link clicks
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a');
    if (link && link.href) {
      // Always allow tel:, mailto:, sms: links (tap-to-call/email)
      if (/^(tel:|mailto:|sms:)/i.test(link.href)) return;
      try {
        const url = new URL(link.href);
        if (url.origin !== currentOrigin && !isDomainAllowed(url.hostname)) {
          e.preventDefault();
          console.warn('Navigation blocked to:', url.href);
          return false;
        }
      } catch (err) {
        // Invalid URL, allow it
      }
    }
  }, true);
  
  // Prevent window.open to external domains
  const originalOpen = window.open;
  window.open = function(url, ...args) {
    if (url) {
      try {
        const urlObj = new URL(url, window.location.origin);
        if (urlObj.origin !== currentOrigin && !isDomainAllowed(urlObj.hostname)) {
          console.warn('window.open blocked to:', url);
          return null;
        }
      } catch (err) {
        // Invalid URL, allow it
      }
    }
    return originalOpen.apply(this, [url, ...args]);
  };
  
  // Monitor for navigation attempts
  window.addEventListener('beforeunload', (e) => {
    // Allow navigation within same origin
    if (document.referrer && document.referrer.startsWith(window.location.origin)) {
      return;
    }
    // Block external navigation in WebView
    if (isWebView()) {
      e.preventDefault();
      e.returnValue = '';
      return '';
    }
  });
};

// Disable URL bar (for WebView)
export const disableURLBar = () => {
  if (isWebView()) {
    // Hide address bar on mobile
    setTimeout(() => {
      window.scrollTo(0, 1);
    }, 0);
    
    // Prevent zoom (optional)
    const viewport = document.querySelector('meta[name="viewport"]');
    if (viewport) {
      viewport.setAttribute('content', 
        'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no'
      );
    }
  }
};

// Initialize WebView features
export const initWebView = () => {
  // Check domain security
  if (!isDomainAllowed()) {
    console.error('Domain not allowed:', window.location.hostname);
    // Redirect to error page or show warning
    return false;
  }
  
  // Lock to domain
  lockToDomain();
  
  // Disable URL bar
  disableURLBar();
  
  // Notify native app that WebView is ready
  postToNative('webViewReady', {});
  
  return true;
};

