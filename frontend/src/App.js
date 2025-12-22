import React, { useState, useEffect, Suspense, lazy } from 'react';
import './App.css';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import { Toaster } from './components/ui/sonner';
import SplashScreen from './components/SplashScreen';
import ConnectivityCheck from './components/ConnectivityCheck';
import ErrorBoundary from './components/ErrorBoundary';
import { initWebView, isWebView, postToNative } from './utils/webviewConfig';

// Lazy load heavy components for code splitting
const AuthScreen = lazy(() => import('./components/AuthScreen'));
const RegisterScreen = lazy(() => import('./components/RegisterScreen'));
const AdminDashboard = lazy(() => import('./components/AdminDashboard'));
const UserDashboard = lazy(() => import('./components/UserDashboard'));
const LandingPage = lazy(() => import('./components/LandingPage'));
const ViharPathMargdarshika = lazy(() => import('./components/ViharPathMargdarshika'));

// Loading fallback component
const LoadingFallback = () => (
  <div className="loading-screen">
    <div className="spinner"></div>
  </div>
);

// Backend URL configuration
// For Vercel: Backend is on the same domain, so we use relative path in production
// For local development: Use localhost
const getBackendURL = () => {
  // If explicitly set via environment variable, use it
  if (process.env.REACT_APP_BACKEND_URL) {
    return process.env.REACT_APP_BACKEND_URL;
  }
  
  // In production (any domain), backend is on same domain
  if (process.env.NODE_ENV === 'production') {
    return window.location.origin; // Same domain as frontend
  }
  
  // Development default
  return 'http://localhost:8000';
};

const BACKEND_URL = getBackendURL();
const API = `${BACKEND_URL}/api`;

// Log for debugging (will show in browser console)
if (process.env.NODE_ENV === 'production') {
  console.log('Backend URL:', BACKEND_URL);
  console.log('API Base URL:', API);
} else {
  console.log('Backend URL:', BACKEND_URL);
}

export const axiosInstance = axios.create({
  baseURL: API,
  timeout: 30000, // 30 second timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Add response interceptor for better error handling
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle network errors (common on mobile)
    if (!error.response) {
      if (error.message === 'Network Error' || error.code === 'ERR_NETWORK') {
        console.error('Network error - check backend URL:', BACKEND_URL);
        console.error('Full error:', error);
        // More helpful error message
        const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        if (isLocalhost) {
          error.userMessage = `Cannot connect to backend at ${BACKEND_URL}. Make sure the backend server is running on port 8000.`;
        } else {
          error.userMessage = 'Network error. Please check your internet connection.';
        }
      }
    }
    return Promise.reject(error);
  }
);

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSplash, setShowSplash] = useState(true);
  const [language, setLanguage] = useState('en'); // en or gu

  // Initialize WebView features
  useEffect(() => {
    // Initialize WebView configuration
    const webViewInitialized = initWebView();
    
    if (!webViewInitialized) {
      console.error('WebView initialization failed - domain not allowed');
    }

    // Notify native app that app is ready
    if (isWebView()) {
      postToNative('appReady', {});
    }
  }, []);

  useEffect(() => {
    try {
      const token = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');
      
      if (token && savedUser) {
        setUser(JSON.parse(savedUser));
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      // Clear potentially corrupted data
      try {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } catch (e) {
        // Ignore errors when clearing
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Handle splash screen finish
  const handleSplashFinish = () => {
    setShowSplash(false);
    if (isWebView()) {
      postToNative('hideSplashScreen', {});
    }
  };

  const handleLogin = (userData, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  // Show splash screen while loading or if explicitly shown
  if (showSplash || loading) {
    return <SplashScreen onFinish={handleSplashFinish} />;
  }

  return (
    <ErrorBoundary>
      <ConnectivityCheck>
        <div className="App">
          <BrowserRouter>
            <Suspense fallback={<LoadingFallback />}>
              <Routes>
                <Route
                  path="/"
                  element={
                    <LandingPage language={language} setLanguage={setLanguage} />
                  }
                />
                <Route
                  path="/login"
                  element={
                    user ? (
                      user.role === 'admin' ? (
                        <Navigate to="/admin" replace />
                      ) : (
                        <Navigate to="/dashboard" replace />
                      )
                    ) : (
                      <AuthScreen onLogin={handleLogin} language={language} setLanguage={setLanguage} />
                    )
                  }
                />
                <Route
                  path="/register"
                  element={
                    user ? (
                      user.role === 'admin' ? (
                        <Navigate to="/admin" replace />
                      ) : (
                        <Navigate to="/dashboard" replace />
                      )
                    ) : (
                      <RegisterScreen onLogin={handleLogin} language={language} setLanguage={setLanguage} />
                    )
                  }
                />
                <Route
                  path="/admin"
                  element={
                    user && user.role === 'admin' ? (
                      <AdminDashboard user={user} onLogout={handleLogout} language={language} setLanguage={setLanguage} />
                    ) : (
                      <Navigate to="/" replace />
                    )
                  }
                />
                <Route
                  path="/dashboard"
                  element={
                    user ? (
                      <UserDashboard user={user} onLogout={handleLogout} language={language} setLanguage={setLanguage} />
                    ) : (
                      <Navigate to="/" replace />
                    )
                  }
                />
                <Route
                  path="/vihar-path-margdarshika"
                  element={
                    <ViharPathMargdarshika language={language} setLanguage={setLanguage} />
                  }
                />
              </Routes>
            </Suspense>
          </BrowserRouter>
          <Toaster position="top-right" richColors />
        </div>
      </ConnectivityCheck>
    </ErrorBoundary>
  );
}

export default App;
