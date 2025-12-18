package com.viharsevagroup.webviewapp

import android.app.Application

/**
 * Application class
 * 
 * Optional: Initialize analytics, crash reporting, etc. here
 * Currently kept minimal for privacy
 */
class ViharSevaGroupApplication : Application() {
    
    override fun onCreate() {
        super.onCreate()
        
        // Optional: Initialize analytics (OFF by default)
        // Example: FirebaseAnalytics.getInstance(this).setAnalyticsCollectionEnabled(false)
        
        // Optional: Initialize crash reporting
        // Example: FirebaseCrashlytics.getInstance().setCrashlyticsCollectionEnabled(false)
    }
}

