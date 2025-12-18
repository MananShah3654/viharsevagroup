import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { isWebView, postToNative } from '../utils/webviewConfig';

/**
 * Custom hook to handle Android back button in WebView
 */
const useBackButton = (enabled = true, onBack = null) => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!enabled || !isWebView()) return;

    // Enable back button handling in native app
    postToNative('setBackButtonEnabled', { enabled: true });

    // Handle back button press from native app
    const handleBackButton = (event) => {
      // Check if custom handler is provided
      if (onBack) {
        const result = onBack();
        // If handler returns false, prevent default back navigation
        if (result === false) {
          event.preventDefault();
          return;
        }
      }

      // Default behavior: go back in history or navigate to home
      if (window.history.length > 1) {
        navigate(-1);
      } else {
        navigate('/');
      }
    };

    // Listen for back button events from native app
    window.addEventListener('backbutton', handleBackButton);
    
    // Also handle browser back button (popstate)
    const handlePopState = (event) => {
      if (onBack) {
        const result = onBack();
        if (result === false) {
          event.preventDefault();
          // Push current state back
          window.history.pushState(null, '', location.pathname);
        }
      }
    };

    window.addEventListener('popstate', handlePopState);

    // Push initial state to history stack
    window.history.pushState(null, '', location.pathname);

    return () => {
      window.removeEventListener('backbutton', handleBackButton);
      window.removeEventListener('popstate', handlePopState);
      postToNative('setBackButtonEnabled', { enabled: false });
    };
  }, [enabled, onBack, navigate, location]);
};

export default useBackButton;

