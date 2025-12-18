import React, { useEffect, useState } from 'react';
import './SplashScreen.css';

const SplashScreen = ({ onFinish }) => {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Minimum splash screen duration (0.5 seconds for faster startup)
    const minDuration = 500;
    const startTime = Date.now();

    // Check if app is ready
    const checkReady = () => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, minDuration - elapsed);

      setTimeout(() => {
        setFadeOut(true);
        // Wait for fade animation before calling onFinish
        setTimeout(() => {
          if (onFinish) onFinish();
        }, 200); // Reduced fade animation duration
      }, remaining);
    };

    // Start checking when component mounts
    checkReady();
  }, [onFinish]);

  return (
    <div className={`splash-screen ${fadeOut ? 'fade-out' : ''}`}>
      <div className="splash-content">
        {/* Logo Only */}
        <div className="splash-logo">
          <img 
            src="/images/logo_vsg.png" 
            alt="Vihar Seva Group Logo" 
            className="splash-logo-image"
          />
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;

