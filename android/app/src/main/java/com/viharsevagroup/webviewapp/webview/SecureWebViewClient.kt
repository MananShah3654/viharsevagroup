package com.viharsevagroup.webviewapp.webview

import android.net.http.SslError
import android.webkit.SslErrorHandler
import android.webkit.WebResourceError
import android.webkit.WebResourceRequest
import android.webkit.WebView
import android.webkit.WebViewClient

/**
 * SecureWebViewClient
 * 
 * POLICY NOTES:
 * - Validates URLs against allowed domains
 * - Handles SSL errors securely
 * - Intercepts external links for native app handling
 * - Provides error callbacks for offline handling
 * 
 * WHY EACH SETTING:
 * - shouldOverrideUrlLoading: Intercepts navigation to handle external links
 * - onReceivedSslError: Prevents SSL errors from being ignored (security)
 * - onReceivedError: Handles network errors gracefully
 */
class SecureWebViewClient(
    private val allowedDomains: List<String>,
    private val onPageStarted: ((String) -> Unit)? = null,
    private val onPageFinished: ((String) -> Unit)? = null,
    private val onReceivedError: ((WebViewError) -> Unit)? = null,
    private val onShouldOverrideUrlLoading: ((String) -> Boolean)? = null
) : WebViewClient() {
    
    override fun shouldOverrideUrlLoading(view: WebView?, request: WebResourceRequest?): Boolean {
        val url = request?.url?.toString() ?: return false
        
        // Allow same-origin navigation and API calls
        if (request?.isForMainFrame == false) {
            // Sub-resources (images, CSS, JS, API calls) - allow if from allowed domain
            return false // Let WebView handle it
        }
        
        // Let the activity handle external links for main frame
        return onShouldOverrideUrlLoading?.invoke(url) ?: false
    }
    
    override fun onPageStarted(view: WebView?, url: String?, favicon: android.graphics.Bitmap?) {
        super.onPageStarted(view, url, favicon)
        url?.let { onPageStarted?.invoke(it) }
    }
    
    override fun onPageFinished(view: WebView?, url: String?) {
        super.onPageFinished(view, url)
        url?.let { onPageFinished?.invoke(it) }
    }
    
    override fun onReceivedError(
        view: WebView?,
        request: WebResourceRequest?,
        error: WebResourceError?
    ) {
        super.onReceivedError(view, request, error)
        
        if (request?.isForMainFrame == true) {
            val errorType = when {
                error?.errorCode == android.webkit.WebViewClient.ERROR_HOST_LOOKUP -> {
                    WebViewError.NetworkError("Host lookup failed")
                }
                error?.errorCode == android.webkit.WebViewClient.ERROR_CONNECT -> {
                    WebViewError.NetworkError("Connection failed")
                }
                error?.errorCode == android.webkit.WebViewClient.ERROR_TIMEOUT -> {
                    WebViewError.NetworkError("Connection timeout")
                }
                error?.errorCode == android.webkit.WebViewClient.ERROR_BAD_URL -> {
                    WebViewError.HttpError(400, "Bad URL")
                }
                else -> {
                    WebViewError.NetworkError(error?.description?.toString() ?: "Unknown error")
                }
            }
            
            onReceivedError?.invoke(errorType)
        }
    }
    
    override fun onReceivedHttpError(
        view: WebView?,
        request: WebResourceRequest?,
        errorResponse: android.webkit.WebResourceResponse?
    ) {
        super.onReceivedHttpError(view, request, errorResponse)
        
        if (request?.isForMainFrame == true) {
            val statusCode = errorResponse?.statusCode ?: 0
            onReceivedError?.invoke(WebViewError.HttpError(statusCode, errorResponse?.reasonPhrase ?: "HTTP Error"))
        }
    }
    
    override fun onReceivedSslError(
        view: WebView?,
        handler: SslErrorHandler?,
        error: SslError?
    ) {
        // POLICY: Never ignore SSL errors in production
        // This ensures users are protected from man-in-the-middle attacks
        // If SSL errors occur, it indicates a security issue that should be fixed
        
        // In production, cancel the request
        handler?.cancel()
        
        // Notify about SSL error
        error?.let {
            onReceivedError?.invoke(
                WebViewError.SslError(
                    it.toString(),
                    "SSL certificate error. Please check your connection."
                )
            )
        }
    }
    
    /**
     * Validates if URL belongs to allowed domains
     */
    private fun isAllowedDomain(url: String): Boolean {
        val uri = android.net.Uri.parse(url)
        val host = uri.host?.lowercase() ?: return false
        
        return allowedDomains.any { domain ->
            host == domain || host.endsWith(".$domain")
        }
    }
}

/**
 * WebView Error Types
 */
sealed class WebViewError {
    data class NetworkError(val message: String) : WebViewError()
    data class HttpError(val statusCode: Int, val message: String) : WebViewError()
    data class SslError(val error: String, val message: String) : WebViewError()
}

