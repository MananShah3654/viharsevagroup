# WebView Integration Guide

This guide explains how to integrate the Vihar Seva Group web app into a native mobile app using WebView.

---

## ✅ Implemented Features

### 1. **Native Splash Screen** ✅
- Custom splash screen component that displays while the app loads
- Automatically hides after minimum duration (1.5 seconds)
- Smooth fade-out animation
- Communicates with native app to hide native splash

**File**: `frontend/src/components/SplashScreen.js`

### 2. **Native App Bar** ✅
- Hides browser UI in WebView
- Communicates with native app to show/hide app bar
- Customizable via `postToNative('setAppBarVisibility', { visible })`

**File**: `frontend/src/utils/webviewConfig.js`

### 3. **Internet Connectivity Check** ✅
- Real-time network status monitoring
- Visual offline banner
- Automatic reconnection detection
- Periodic connectivity checks (every 30 seconds)

**File**: `frontend/src/components/ConnectivityCheck.js`

### 4. **Custom Error Page** ✅
- React Error Boundary for catching JavaScript errors
- User-friendly error messages
- Reload and "Go Home" buttons
- Development mode shows error details

**File**: `frontend/src/components/ErrorBoundary.js`

### 5. **Back Button Handling** ✅
- Android back button support
- Custom hook: `useBackButton()`
- Configurable per route
- Prevents navigation to external domains

**File**: `frontend/src/hooks/useBackButton.js`

### 6. **Disable URL Bar Navigation** ✅
- Prevents URL bar from showing in WebView
- Disables zoom controls
- Optimized viewport settings
- Mobile-optimized meta tags

**File**: `frontend/src/utils/webviewConfig.js` (disableURLBar function)

### 7. **Lock to Your Domain Only** ✅
- Domain whitelist security
- Prevents navigation to external domains
- Blocks external links and window.open
- Configurable allowed domains

**File**: `frontend/src/utils/webviewConfig.js` (lockToDomain function)

---

## 📱 Native App Integration

### React Native (Android & iOS)

#### 1. **Android WebView Setup**

```java
// MainActivity.java
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;

public class MainActivity extends AppCompatActivity {
    private WebView webView;
    
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        webView = new WebView(this);
        WebSettings webSettings = webView.getSettings();
        
        // Enable JavaScript
        webSettings.setJavaScriptEnabled(true);
        
        // Enable DOM storage
        webSettings.setDomStorageEnabled(true);
        
        // Disable zoom
        webSettings.setBuiltInZoomControls(false);
        webSettings.setDisplayZoomControls(false);
        
        // Enable cache
        webSettings.setCacheMode(WebSettings.LOAD_DEFAULT);
        webSettings.setAppCacheEnabled(true);
        
        // Set user agent (optional - to identify as WebView)
        webSettings.setUserAgentString(
            webSettings.getUserAgentString() + " wv"
        );
        
        // Handle navigation
        webView.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                String url = request.getUrl().toString();
                
                // Only allow your domain
                if (!url.startsWith("https://yourdomain.com") && 
                    !url.startsWith("http://localhost")) {
                    return true; // Block navigation
                }
                
                return false; // Allow navigation
            }
            
            @Override
            public void onPageFinished(WebView view, String url) {
                super.onPageFinished(view, url);
                // Inject JavaScript bridge
                injectJavaScriptBridge();
            }
        });
        
        // Handle JavaScript messages
        webView.addJavascriptInterface(new WebAppInterface(this), "Android");
        
        // Load URL
        webView.loadUrl("https://yourdomain.com");
        
        setContentView(webView);
    }
    
    // JavaScript Interface
    public class WebAppInterface {
        Context mContext;
        
        WebAppInterface(Context c) {
            mContext = c;
        }
        
        @JavascriptInterface
        public void hideSplashScreen() {
            runOnUiThread(() -> {
                // Hide native splash screen
                // Your splash screen hiding logic
            });
        }
        
        @JavascriptInterface
        public void setAppBarVisibility(String visible) {
            runOnUiThread(() -> {
                // Show/hide app bar
                // Your app bar visibility logic
            });
        }
        
        @JavascriptInterface
        public void setBackButtonEnabled(String enabled) {
            runOnUiThread(() -> {
                // Enable/disable back button handling
                // Your back button logic
            });
        }
    }
    
    // Handle Android back button
    @Override
    public void onBackPressed() {
        // Check if WebView can go back
        if (webView.canGoBack()) {
            webView.goBack();
        } else {
            super.onBackPressed();
        }
    }
    
    private void injectJavaScriptBridge() {
        String js = "window.Android = {" +
            "hideSplashScreen: function() { Android.hideSplashScreen(); }," +
            "setAppBarVisibility: function(visible) { Android.setAppBarVisibility(visible); }," +
            "setBackButtonEnabled: function(enabled) { Android.setBackButtonEnabled(enabled); }" +
            "};";
        webView.evaluateJavascript(js, null);
    }
}
```

#### 2. **iOS WKWebView Setup**

```swift
// ViewController.swift
import UIKit
import WebKit

class ViewController: UIViewController, WKNavigationDelegate, WKUIDelegate {
    var webView: WKWebView!
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        // Configure WebView
        let config = WKWebViewConfiguration()
        config.preferences.javaScriptEnabled = true
        config.preferences.javaScriptCanOpenWindowsAutomatically = true
        
        // Add message handler
        config.userContentController.add(self, name: "nativeHandler")
        
        webView = WKWebView(frame: view.bounds, configuration: config)
        webView.navigationDelegate = self
        webView.uiDelegate = self
        
        // Disable zoom
        webView.scrollView.minimumZoomScale = 1.0
        webView.scrollView.maximumZoomScale = 1.0
        
        // Load URL
        if let url = URL(string: "https://yourdomain.com") {
            webView.load(URLRequest(url: url))
        }
        
        view.addSubview(webView)
    }
    
    // Handle navigation
    func webView(_ webView: WKWebView, decidePolicyFor navigationAction: WKNavigationAction, 
                 decisionHandler: @escaping (WKNavigationActionPolicy) -> Void) {
        guard let url = navigationAction.request.url else {
            decisionHandler(.cancel)
            return
        }
        
        // Only allow your domain
        if url.host != "yourdomain.com" && url.host != "localhost" {
            decisionHandler(.cancel)
            return
        }
        
        decisionHandler(.allow)
    }
    
    // Handle JavaScript messages
    func userContentController(_ userContentController: WKUserContentController, 
                              didReceive message: WKScriptMessage) {
        if message.name == "nativeHandler" {
            if let body = message.body as? [String: Any] {
                let type = body["type"] as? String
                
                switch type {
                case "hideSplashScreen":
                    // Hide native splash screen
                    break
                case "setAppBarVisibility":
                    // Show/hide app bar
                    break
                case "setBackButtonEnabled":
                    // Enable/disable back button
                    break
                default:
                    break
                }
            }
        }
    }
}
```

---

## 🔧 Configuration

### Domain Whitelist

Edit `frontend/src/utils/webviewConfig.js`:

```javascript
export const ALLOWED_DOMAINS = [
  window.location.hostname,
  'localhost',
  '127.0.0.1',
  'yourdomain.com',        // Add your production domain
  'www.yourdomain.com',    // Add www variant
];
```

### Backend URL

The app automatically detects the backend URL. For WebView, ensure:

1. **Production**: Backend is on the same domain
2. **Development**: Set `REACT_APP_BACKEND_URL` environment variable

---

## 📋 Native App Requirements

### Android
- **Min SDK**: 21 (Android 5.0)
- **Target SDK**: 33+
- **Permissions**:
  ```xml
  <uses-permission android:name="android.permission.INTERNET" />
  <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
  ```

### iOS
- **Min Version**: iOS 12.0
- **Target Version**: iOS 16.0+
- **Info.plist**:
  ```xml
  <key>NSAppTransportSecurity</key>
  <dict>
    <key>NSAllowsArbitraryLoads</key>
    <false/>
    <key>NSExceptionDomains</key>
    <dict>
      <key>yourdomain.com</key>
      <dict>
        <key>NSIncludesSubdomains</key>
        <true/>
        <key>NSExceptionAllowsInsecureHTTPLoads</key>
        <false/>
      </dict>
    </dict>
  </dict>
  ```

---

## 🧪 Testing

### Test WebView Features

1. **Splash Screen**: Should show for at least 1.5 seconds
2. **Connectivity**: Disconnect internet, should show banner
3. **Back Button**: Press Android back button, should navigate back
4. **Domain Lock**: Try to navigate to external site, should be blocked
5. **Error Handling**: Trigger an error, should show custom error page

### Test Checklist

- [ ] Splash screen displays correctly
- [ ] App bar is hidden in WebView
- [ ] Connectivity check works
- [ ] Back button navigates correctly
- [ ] External links are blocked
- [ ] Error page displays on errors
- [ ] URL bar is hidden
- [ ] Zoom is disabled

---

## 🚀 Deployment

### Build for Production

```bash
cd frontend
npm run build
```

### Serve Built Files

The `build` folder contains optimized static files that can be:
1. Served via CDN
2. Embedded in native app assets
3. Served via native app's local server

---

## 📝 JavaScript Bridge API

The web app communicates with native app via:

### Methods Available to Web App

```javascript
// Hide native splash screen
postToNative('hideSplashScreen', {});

// Show/hide app bar
postToNative('setAppBarVisibility', { visible: true });

// Enable/disable back button
postToNative('setBackButtonEnabled', { enabled: true });

// Notify app is ready
postToNative('appReady', {});

// Notify WebView is ready
postToNative('webViewReady', {});
```

### Methods Native App Should Implement

1. **hideSplashScreen()** - Hide native splash screen
2. **setAppBarVisibility(visible)** - Show/hide app bar
3. **setBackButtonEnabled(enabled)** - Enable/disable back button handling
4. **handleBackButton()** - Handle back button press (send 'backbutton' event)

---

## 🔒 Security Considerations

1. **Domain Whitelist**: Only allow your domains
2. **HTTPS Only**: Use HTTPS in production
3. **Certificate Pinning**: Consider certificate pinning for extra security
4. **Content Security Policy**: Implement CSP headers
5. **Input Validation**: Validate all user inputs

---

## 📚 Additional Resources

- [Android WebView Guide](https://developer.android.com/develop/ui/views/layout/webview)
- [iOS WKWebView Guide](https://developer.apple.com/documentation/webkit/wkwebview)
- [React Native WebView](https://github.com/react-native-webview/react-native-webview)

---

**Last Updated**: 2025-01-27
**Version**: 1.0.0

