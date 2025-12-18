package com.viharsevagroup.webviewapp

import android.content.Context
import android.net.ConnectivityManager
import android.net.NetworkCapabilities
import androidx.appcompat.app.AlertDialog

/**
 * Network Utilities
 * 
 * Checks network connectivity and shows appropriate dialogs
 */
object NetworkUtils {
    
    fun isNetworkAvailable(context: Context): Boolean {
        val connectivityManager = context.getSystemService(Context.CONNECTIVITY_SERVICE) as ConnectivityManager
        
        val network = connectivityManager.activeNetwork ?: return false
        val capabilities = connectivityManager.getNetworkCapabilities(network) ?: return false
        
        return capabilities.hasCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET) &&
               capabilities.hasCapability(NetworkCapabilities.NET_CAPABILITY_VALIDATED)
    }
    
    fun showNoInternetDialog(context: Context) {
        AlertDialog.Builder(context)
            .setTitle(context.getString(R.string.no_internet_title))
            .setMessage(context.getString(R.string.no_internet_message))
            .setPositiveButton(android.R.string.ok, null)
            .show()
    }
}

