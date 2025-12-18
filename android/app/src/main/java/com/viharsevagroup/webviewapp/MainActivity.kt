package com.viharsevagroup.webviewapp

import android.annotation.SuppressLint
import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.util.Log
import android.view.Menu
import android.view.MenuItem
import android.view.View
import android.webkit.ValueCallback
import android.webkit.WebChromeClient
import android.webkit.WebSettings
import android.webkit.WebView
import android.widget.ProgressBar
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.isVisible
import androidx.swiperefreshlayout.widget.SwipeRefreshLayout
import com.viharsevagroup.webviewapp.BuildConfig
import com.viharsevagroup.webviewapp.databinding.ActivityMainBinding
import com.viharsevagroup.webviewapp.webview.SecureWebChromeClient
import com.viharsevagroup.webviewapp.webview.SecureWebViewClient
import com.viharsevagroup.webviewapp.webview.WebViewError

/**
 * MainActivity - WebView Wrapper
 * 
 * POLICY NOTES:
 * - Only loads content from allowed domains (see network_security_config.xml)
 * - No file system access except for user-initiated file uploads
 * - All external links (tel:, mailto:, maps, etc.) open in native apps
 * - Cleartext traffic blocked (HTTPS only)
 * - Safe browsing enabled
 * 
 * HOW TO CHANGE BASE_URL:
 * 1. Update BASE_URL constant below
 * 2. Update allowed domains in network_security_config.xml
 * 3. Update deep link hosts in AndroidManifest.xml
 */
class MainActivity : AppCompatActivity() {
    
    companion object {
        // BASE_URL - Change this to your website URL
        // For localhost testing: Use "http://10.0.2.2:3000" (Android emulator)
        // For physical device: Use your computer's IP (e.g., "http://192.168.1.100:3000")
        private const val BASE_URL = "http://10.0.2.2:3000"  // Localhost for emulator
        
        // Allowed domains (for validation)
        private val ALLOWED_DOMAINS = listOf(
            "10.0.2.2",  // Android emulator localhost
            "localhost",
            "127.0.0.1",
            "naranpuraviharsevagroup.com",
            "www.naranpuraviharsevagroup.com"
        )
    }
    
    private lateinit var binding: ActivityMainBinding
    private lateinit var webView: WebView
    private lateinit var progressBar: ProgressBar
    private lateinit var swipeRefresh: SwipeRefreshLayout
    
    private var fileUploadCallback: ValueCallback<Array<Uri>>? = null
    
    // Activity Result Launcher for file uploads (modern API)
    private val fileUploadLauncher = registerForActivityResult(
        ActivityResultContracts.StartActivityForResult()
    ) { result ->
        val results = when {
            result.resultCode != RESULT_OK -> null
            result.data?.data != null -> arrayOf(result.data!!.data!!)
            result.data?.clipData != null -> {
                val uris = mutableListOf<Uri>()
                for (i in 0 until result.data!!.clipData!!.itemCount) {
                    uris.add(result.data!!.clipData!!.getItemAt(i).uri)
                }
                uris.toTypedArray()
            }
            else -> null
        }
        
        fileUploadCallback?.onReceiveValue(results)
        fileUploadCallback = null
    }
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)
        
        setupWebView()
        setupSwipeRefresh()
        setupOfflineHandler()
        
        // Load the website
        loadUrl(BASE_URL)
    }
    
    @SuppressLint("SetJavaScriptEnabled")
    private fun setupWebView() {
        webView = binding.webView
        progressBar = binding.progressBar
        swipeRefresh = binding.swipeRefreshLayout
        
        // Configure WebView settings (see SecureWebViewClient for details)
        with(webView.settings) {
            // JavaScript - REQUIRED for React apps and charts
            javaScriptEnabled = true
            javaScriptCanOpenWindowsAutomatically = true
            
            // DOM Storage - REQUIRED for React state management
            domStorageEnabled = true
            databaseEnabled = true
            
            // Zoom
            setSupportZoom(true)
            builtInZoomControls = true
            displayZoomControls = false // Hide zoom controls (use pinch)
            
            // Load images and resources
            loadsImagesAutomatically = true
            blockNetworkImage = false
            blockNetworkLoads = false
            
            // Media playback
            mediaPlaybackRequiresUserGesture = false // Allow autoplay for videos/audio if needed
            
            // User agent - Use standard Chrome user agent for better compatibility
            // Some websites check user agent and may serve different content
            userAgentString = defaultUserAgentString
            
            // Mixed content: NEVER ALLOW (Play Store requirement)
            mixedContentMode = WebView.MIXED_CONTENT_NEVER_ALLOW
            
            // File access: DISABLED for security
            allowFileAccess = false
            allowContentAccess = false
            allowFileAccessFromFileURLs = false
            allowUniversalAccessFromFileURLs = false
            
            // Safe browsing enabled
            safeBrowsingEnabled = true
            
            // Cache - Use default for better performance
            cacheMode = WebView.LOAD_DEFAULT
            setAppCacheEnabled(false) // Deprecated, but explicitly disabled
            
            // Third-party cookies: ENABLED (required for authentication/login flows)
            thirdPartyCookiesEnabled = true
            
            // Layout algorithm - Better for modern web apps and SVG rendering
            layoutAlgorithm = WebSettings.LayoutAlgorithm.TEXT_AUTOSIZING
            
            // Enable hardware acceleration for better performance
            // This helps with rendering charts and animations
            setRenderPriority(WebSettings.RenderPriority.HIGH)
            
            // Additional settings for SVG and chart rendering
            useWideViewPort = true // Better for responsive layouts
            loadWithOverviewMode = true // Better for responsive content
            
            // Enable support for modern web features
            setSupportMultipleWindows(false) // Single window app
        }
        
        // Enable hardware acceleration for WebView (critical for SVG/chart rendering)
        webView.setLayerType(WebView.LAYER_TYPE_HARDWARE, null)
        
        // Additional WebView configuration for better rendering
        webView.isScrollbarFadingEnabled = true
        webView.scrollBarStyle = View.SCROLLBARS_INSIDE_OVERLAY
        
        // Enable WebView debugging in debug builds (for troubleshooting)
        if (BuildConfig.DEBUG) {
            WebView.setWebContentsDebuggingEnabled(true)
        }
        
        // Set WebView clients
        webView.webViewClient = SecureWebViewClient(
            allowedDomains = ALLOWED_DOMAINS,
            onPageStarted = { url ->
                progressBar.isVisible = true
                binding.offlineLayout.root.isVisible = false
                webView.isVisible = true
            },
            onPageFinished = { url ->
                progressBar.isVisible = false
                swipeRefresh.isRefreshing = false
                
                // Inject JavaScript to fix chart rendering issues in WebView
                // This ensures React charts (Recharts) render properly
                webView.evaluateJavascript("""
                    (function() {
                        console.log('WebView: Page loaded, initializing chart support');
                        
                        // Polyfill for ResizeObserver if needed (for ResponsiveContainer)
                        if (!window.ResizeObserver) {
                            console.warn('ResizeObserver not available, using fallback');
                            window.ResizeObserver = function(callback) {
                                return {
                                    observe: function() {},
                                    unobserve: function() {},
                                    disconnect: function() {}
                                };
                            };
                        }
                        
                        // Force SVG rendering
                        if (document.querySelectorAll('svg').length > 0) {
                            console.log('SVG elements found, ensuring proper rendering');
                            // Trigger reflow to ensure SVG renders
                            document.querySelectorAll('svg').forEach(function(svg) {
                                svg.style.display = 'none';
                                svg.offsetHeight; // Trigger reflow
                                svg.style.display = '';
                            });
                        }
                        
                        // Wait for React to be ready, then force chart re-render
                        function ensureChartsRender() {
                            // Check if Recharts components exist
                            var chartContainers = document.querySelectorAll('[class*="recharts"], [class*="ResponsiveContainer"]');
                            if (chartContainers.length > 0) {
                                console.log('Found ' + chartContainers.length + ' chart containers');
                                
                                // Force resize event to trigger ResponsiveContainer recalculation
                                setTimeout(function() {
                                    window.dispatchEvent(new Event('resize'));
                                }, 100);
                                
                                setTimeout(function() {
                                    window.dispatchEvent(new Event('resize'));
                                }, 500);
                                
                                setTimeout(function() {
                                    window.dispatchEvent(new Event('resize'));
                                }, 1000);
                            }
                        }
                        
                        // Try multiple times to ensure charts render
                        ensureChartsRender();
                        setTimeout(ensureChartsRender, 500);
                        setTimeout(ensureChartsRender, 1500);
                        setTimeout(ensureChartsRender, 3000);
                        
                        // Listen for React app ready
                        if (window.React && window.ReactDOM) {
                            console.log('React detected, charts should render');
                        }
                    })();
                """.trimIndent(), null)
            },
            onReceivedError = { error: WebViewError ->
                handleWebViewError(error)
            },
            onShouldOverrideUrlLoading = { url ->
                handleExternalLink(url)
            }
        )
        
        webView.webChromeClient = SecureWebChromeClient(
            onProgressChanged = { progress ->
                progressBar.progress = progress
                if (progress == 100) {
                    progressBar.isVisible = false
                }
            },
            onShowFileChooser = { filePathCallback, fileChooserParams ->
                handleFileUpload(filePathCallback, fileChooserParams)
                true
            }
        )
    }
    
    private fun setupSwipeRefresh() {
        swipeRefresh.setOnRefreshListener {
            webView.reload()
        }
        
        // Disable swipe refresh when scrolling
        swipeRefresh.setColorSchemeResources(
            android.R.color.holo_blue_bright,
            android.R.color.holo_green_light,
            android.R.color.holo_orange_light,
            android.R.color.holo_red_light
        )
    }
    
    private fun setupOfflineHandler() {
        binding.offlineLayout.retryButton.setOnClickListener {
            if (NetworkUtils.isNetworkAvailable(this)) {
                binding.offlineLayout.root.isVisible = false
                webView.reload()
            } else {
                NetworkUtils.showNoInternetDialog(this)
            }
        }
    }
    
    private fun loadUrl(url: String) {
        if (NetworkUtils.isNetworkAvailable(this)) {
            // Clear any previous errors
            webView.clearHistory()
            
            // Load URL with proper headers
            val headers = mapOf(
                "Accept" to "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
                "Accept-Language" to "en-US,en;q=0.9",
                "Accept-Encoding" to "gzip, deflate, br",
                "Cache-Control" to "no-cache"
            )
            
            webView.loadUrl(url, headers)
            
            Log.d("MainActivity", "Loading URL: $url")
        } else {
            showOfflineScreen()
        }
    }
    
    private fun showOfflineScreen() {
        binding.offlineLayout.root.isVisible = true
        webView.isVisible = false
    }
    
    private fun handleWebViewError(error: WebViewError) {
        when (error) {
            is WebViewError.NetworkError -> {
                if (!NetworkUtils.isNetworkAvailable(this)) {
                    showOfflineScreen()
                } else {
                    // Show error message
                    webView.loadUrl("about:blank")
                }
            }
            is WebViewError.HttpError -> {
                // HTTP error (404, 500, etc.) - let WebView handle it
            }
            is WebViewError.SslError -> {
                // SSL error - should not happen with proper certificates
                // In production, this indicates a security issue
            }
        }
    }
    
    /**
     * Handle external links (tel:, mailto:, maps, etc.)
     * Returns true if link was handled externally, false to load in WebView
     */
    private fun handleExternalLink(url: String): Boolean {
        val uri = Uri.parse(url)
        val scheme = uri.scheme?.lowercase()
        
        return when (scheme) {
            "tel" -> {
                // Phone calls
                startActivity(Intent(Intent.ACTION_DIAL, uri))
                true
            }
            "mailto" -> {
                // Email
                startActivity(Intent(Intent.ACTION_SENDTO, uri))
                true
            }
            "sms" -> {
                // SMS
                startActivity(Intent(Intent.ACTION_SENDTO, uri))
                true
            }
            "whatsapp", "whatsapp-api" -> {
                // WhatsApp
                try {
                    startActivity(Intent(Intent.ACTION_VIEW, uri))
                } catch (e: Exception) {
                    // WhatsApp not installed
                    openInBrowser(url)
                }
                true
            }
            "intent" -> {
                // Android Intent URLs
                try {
                    val intent = Intent.parseUri(url, Intent.URI_INTENT_SCHEME)
                    if (intent.resolveActivity(packageManager) != null) {
                        startActivity(intent)
                    } else {
                        // Fallback to browser
                        val fallbackUrl = intent.getStringExtra("browser_fallback_url")
                        if (fallbackUrl != null) {
                            openInBrowser(fallbackUrl)
                        }
                    }
                } catch (e: Exception) {
                    // Invalid intent URL
                }
                true
            }
            "geo", "google.streetview" -> {
                // Maps
                startActivity(Intent(Intent.ACTION_VIEW, uri))
                true
            }
            "market" -> {
                // Play Store
                startActivity(Intent(Intent.ACTION_VIEW, uri))
                true
            }
            "http", "https" -> {
                // Check if it's a payment URL or should open externally
                val host = uri.host?.lowercase() ?: ""
                val shouldOpenExternally = when {
                    host.contains("paypal") -> true
                    host.contains("stripe") -> true
                    host.contains("razorpay") -> true
                    host.contains("payu") -> true
                    host.contains("phonepe") -> true
                    host.contains("gpay") -> true
                    // Add other payment domains as needed
                    else -> false
                }
                
                if (shouldOpenExternally) {
                    openInBrowser(url)
                    true
                } else {
                    // Check if URL is from allowed domain
                    val isAllowedDomain = ALLOWED_DOMAINS.any { domain ->
                        host == domain || host.endsWith(".$domain")
                    }
                    
                    if (!isAllowedDomain) {
                        // External link - open in browser
                        openInBrowser(url)
                        true
                    } else {
                        // Same domain - load in WebView
                        false
                    }
                }
            }
            else -> {
                // Unknown scheme - try to open externally
                try {
                    startActivity(Intent(Intent.ACTION_VIEW, uri))
                    true
                } catch (e: Exception) {
                    false
                }
            }
        }
    }
    
    private fun openInBrowser(url: String) {
        val intent = Intent(Intent.ACTION_VIEW, Uri.parse(url))
        startActivity(intent)
    }
    
    /**
     * Handle file upload from WebView (input type=file)
     * Uses Activity Result API for secure file selection (modern approach)
     */
    private fun handleFileUpload(
        filePathCallback: ValueCallback<Array<Uri>>?,
        fileChooserParams: WebChromeClient.FileChooserParams?
    ) {
        fileUploadCallback = filePathCallback
        
        val intent = fileChooserParams?.createIntent() ?: Intent(Intent.ACTION_GET_CONTENT).apply {
            addCategory(Intent.CATEGORY_OPENABLE)
            type = "*/*"
            putExtra(Intent.EXTRA_MIME_TYPES, arrayOf(
                "image/*",
                "application/pdf",
                "application/msword",
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            ))
        }
        
        try {
            fileUploadLauncher.launch(intent)
        } catch (e: Exception) {
            // No file picker available
            fileUploadCallback?.onReceiveValue(null)
            fileUploadCallback = null
        }
    }
    
    override fun onBackPressed() {
        if (webView.canGoBack()) {
            webView.goBack()
        } else {
            super.onBackPressed()
        }
    }
    
    override fun onCreateOptionsMenu(menu: Menu): Boolean {
        menuInflater.inflate(R.menu.main_menu, menu)
        return true
    }
    
    override fun onOptionsItemSelected(item: MenuItem): Boolean {
        return when (item.itemId) {
            R.id.menu_refresh -> {
                webView.reload()
                true
            }
            R.id.menu_clear_cache -> {
                clearCacheAndCookies()
                true
            }
            R.id.menu_about -> {
                showAboutDialog()
                true
            }
            else -> super.onOptionsItemSelected(item)
        }
    }
    
    private fun clearCacheAndCookies() {
        webView.clearCache(true)
        webView.clearHistory()
        
        // Clear cookies
        android.webkit.CookieManager.getInstance().apply {
            removeAllCookies(null)
            flush()
        }
        
        // Reload
        webView.reload()
        
        // Show confirmation
        android.widget.Toast.makeText(
            this,
            getString(R.string.cache_cleared),
            android.widget.Toast.LENGTH_SHORT
        ).show()
    }
    
    private fun showAboutDialog() {
        androidx.appcompat.app.AlertDialog.Builder(this)
            .setTitle(R.string.app_name)
            .setMessage(getString(R.string.about_message, BASE_URL))
            .setPositiveButton(android.R.string.ok, null)
            .show()
    }
    
    override fun onPause() {
        super.onPause()
        webView.onPause()
    }
    
    override fun onResume() {
        super.onResume()
        webView.onResume()
    }
    
    override fun onDestroy() {
        webView.destroy()
        super.onDestroy()
    }
}

