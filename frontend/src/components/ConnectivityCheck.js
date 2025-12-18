import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import './ConnectivityCheck.css';

const ConnectivityCheck = ({ children }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showOfflineBanner, setShowOfflineBanner] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowOfflineBanner(false);
      toast.success('Internet connection restored', {
        duration: 3000,
      });
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowOfflineBanner(true);
      toast.error('No internet connection', {
        duration: 5000,
      });
    };

    // Listen to online/offline events
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Periodic connectivity check (every 30 seconds)
    const connectivityInterval = setInterval(async () => {
      try {
        // Try to fetch a small resource to verify connectivity
        const response = await fetch('/favicon.ico', { 
          method: 'HEAD',
          cache: 'no-cache',
          signal: AbortSignal.timeout(5000) // 5 second timeout
        });
        
        if (response.ok && !isOnline) {
          handleOnline();
        }
      } catch (error) {
        // Network error - might be offline
        if (navigator.onLine && isOnline) {
          // Browser says online but fetch failed
          // This might be a backend issue, not connectivity
          console.warn('Connectivity check failed:', error);
        } else if (!navigator.onLine && isOnline) {
          handleOffline();
        }
      }
    }, 30000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(connectivityInterval);
    };
  }, [isOnline]);

  return (
    <>
      {children}
      {showOfflineBanner && (
        <div className="offline-banner">
          <div className="offline-content">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="2"/>
              <path d="M6 6 L14 14 M14 6 L6 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <span>No internet connection. Please check your network.</span>
          </div>
        </div>
      )}
    </>
  );
};

export default ConnectivityCheck;

