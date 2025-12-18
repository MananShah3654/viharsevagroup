package com.viharsevagroup.webviewapp.webview

import android.util.Log
import android.webkit.ConsoleMessage
import android.webkit.ValueCallback
import android.webkit.WebChromeClient
import android.webkit.WebView

/**
 * SecureWebChromeClient
 * 
 * Handles WebView UI callbacks:
 * - Progress updates for loading indicator
 * - File upload dialogs (input type=file)
 * - JavaScript alerts, confirms, prompts (optional)
 * - Console messages for debugging
 * 
 * POLICY NOTES:
 * - File uploads use Activity Result API for security
 * - No automatic file access granted
 */
class SecureWebChromeClient(
    private val onProgressChanged: ((Int) -> Unit)? = null,
    private val onShowFileChooser: ((
        filePathCallback: ValueCallback<Array<android.net.Uri>>?,
        fileChooserParams: FileChooserParams?
    ) -> Boolean)? = null
) : WebChromeClient() {
    
    override fun onProgressChanged(view: WebView?, newProgress: Int) {
        super.onProgressChanged(view, newProgress)
        onProgressChanged?.invoke(newProgress)
    }
    
    // Enable console logging for debugging
    override fun onConsoleMessage(consoleMessage: ConsoleMessage?): Boolean {
        consoleMessage?.let {
            val level = when (it.messageLevel()) {
                ConsoleMessage.MessageLevel.ERROR -> Log.e
                ConsoleMessage.MessageLevel.WARNING -> Log.w
                ConsoleMessage.MessageLevel.LOG -> Log.i
                ConsoleMessage.MessageLevel.DEBUG -> Log.d
                else -> Log.v
            }
            val message = "${it.sourceId()}:${it.lineNumber()} ${it.message()}"
            level("WebView", message)
            
            // Log chart-related messages for debugging
            if (it.message().contains("chart", ignoreCase = true) || 
                it.message().contains("recharts", ignoreCase = true) ||
                it.message().contains("svg", ignoreCase = true) ||
                it.message().contains("ResizeObserver", ignoreCase = true)) {
                Log.d("WebViewCharts", message)
            }
        }
        return true
    }
    
    // Handle JavaScript alerts (optional - uncomment if your site uses alerts)
    /*
    override fun onJsAlert(
        view: WebView?,
        url: String?,
        message: String?,
        result: android.webkit.JsResult?
    ): Boolean {
        // Show native alert or handle silently
        result?.confirm()
        return true
    }
    */
    
    override fun onShowFileChooser(
        webView: WebView?,
        filePathCallback: ValueCallback<Array<android.net.Uri>>?,
        fileChooserParams: FileChooserParams?
    ): Boolean {
        // Delegate to activity for file selection
        return onShowFileChooser?.invoke(filePathCallback, fileChooserParams) ?: false
    }
    
    // Optional: Handle JavaScript alerts
    // Uncomment if your website uses alert(), confirm(), or prompt()
    /*
    override fun onJsAlert(
        view: WebView?,
        url: String?,
        message: String?,
        result: android.webkit.JsResult?
    ): Boolean {
        // Show native alert dialog
        // Return true to indicate we handled it
        return true
    }
    
    override fun onJsConfirm(
        view: WebView?,
        url: String?,
        message: String?,
        result: android.webkit.JsResult?
    ): Boolean {
        // Show native confirm dialog
        return true
    }
    
    override fun onJsPrompt(
        view: WebView?,
        url: String?,
        message: String?,
        defaultValue: String?,
        result: android.webkit.JsPromptResult?
    ): Boolean {
        // Show native prompt dialog
        return true
    }
    */
}

