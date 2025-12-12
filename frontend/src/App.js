import React, { useState, useEffect } from 'react';
import './App.css';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import AuthScreen from './components/AuthScreen';
import RegisterScreen from './components/RegisterScreen';
import AdminDashboard from './components/AdminDashboard';
import UserDashboard from './components/UserDashboard';
import LandingPage from './components/LandingPage';
import { Toaster } from './components/ui/sonner';

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
  return 'http://localhost:8001';
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
        error.userMessage = 'Network error. Please check your internet connection.';
      }
    }
    return Promise.reject(error);
  }
);

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState('en'); // en or gu

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

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route
            path="/landing"
            element={
              <LandingPage language={language} setLanguage={setLanguage} />
            }
          />
          <Route
            path="/"
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
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right" richColors />
    </div>
  );
}

export default App;
