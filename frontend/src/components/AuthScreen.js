import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { axiosInstance } from '../App';
import { toast } from 'sonner';

const translations = {
  en: {
    title: 'Vihar Seva Group',
    subtitle: 'Serving Jain Monks with Safety and Devotion',
    login: 'Login',
    phoneNumber: 'Phone Number',
    password: 'Password',
    loginSuccess: 'Login successful!',
    errorOccurred: 'An error occurred',
    enterCredentials: 'Enter your phone number and password provided by admin',
  },
  gu: {
    title: '\u0ab5\u0abf\u0ab9\u0abe\u0ab0 \u0ab8\u0ac7\u0ab5\u0abe \u0a97\u0acd\u0ab0\u0ac1\u0aaa',
    subtitle: 'જૈન શ્રમણ શ્રમણી ભગવંતોની સુરક્ષા અને ભક્તિ સાથે સેવા',
    login: '\u0ab2\u0acb\u0a97\u0abf\u0aa8',
    phoneNumber: '\u0aab\u0acb\u0aa8 \u0aa8\u0a82\u0aac\u0ab0',
    password: '\u0aaa\u0abe\u0ab8\u0ab5\u0ab0\u0acd\u0aa1',
    loginSuccess: '\u0ab2\u0acb\u0a97\u0abf\u0aa8 \u0ab8\u0aab\u0ab3!',
    errorOccurred: '\u0a8f\u0a95 \u0aad\u0ac2\u0ab2 \u0a86\u0ab5\u0ac0',
    enterCredentials: '\u0a8f\u0aa1\u0aae\u0abf\u0aa8 \u0aa6\u0acd\u0ab5\u0abe\u0ab0\u0abe \u0a86\u0aaa\u0ac7\u0ab2 \u0aab\u0acb\u0aa8 \u0aa8\u0a82\u0aac\u0ab0 \u0a85\u0aa8\u0ac7 \u0aaa\u0abe\u0ab8\u0ab5\u0ab0\u0acd\u0aa1 \u0aa6\u0abe\u0a96\u0ab2 \u0a95\u0ab0\u0acb',
  },
};

const AuthScreen = ({ onLogin, language, setLanguage }) => {
  const t = translations[language];
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!phone || !password) {
      toast.error('Please enter phone number and password');
      return;
    }
    if (loading) return; // Prevent double submission
    
    setLoading(true);
    try {
      const response = await axiosInstance.post('/auth/login', { phone, password });
      toast.success(t.loginSuccess);
      onLogin(response.data.user, response.data.access_token);
    } catch (error) {
      console.error('Login error:', error);
      let errorMessage = t.errorOccurred;
      
      if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (error.userMessage) {
        errorMessage = error.userMessage;
      } else if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        // Check if backend URL might be misconfigured
        const backendUrl = window.location.hostname.includes('vercel.app') 
          ? 'Backend should be on same domain. Check Vercel deployment.'
          : '';
        errorMessage = `Network error. ${backendUrl} Please check your internet connection and try again.`;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Handle button click for mobile compatibility
  const handleButtonClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    handleLogin(e);
  };

  return (
    <div className="auth-container">
      <div className="language-toggle">
        <button onClick={() => setLanguage(language === 'en' ? 'gu' : 'en')} data-testid="language-toggle-btn">
          {language === 'en' ? '\u0a97\u0ac1\u0a9c\u0ab0\u0abe\u0aa4\u0ac0' : 'English'}
        </button>
      </div>

      <div className="auth-left">
        <div className="logo-hero">
          <img 
            src="/images/logo_vsg.png" 
            alt="VSG Logo" 
            data-testid="vsg-logo"
            onClick={() => navigate('/')}
            style={{ cursor: 'pointer' }}
          />
          <h1>{t.title}</h1>
          <p>{t.subtitle}</p>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-card">
          <h2>{t.login}</h2>
          <p style={{ textAlign: 'center', color: '#757575', marginBottom: '24px', fontSize: '0.95rem' }}>
            {t.enterCredentials}
          </p>
          <form onSubmit={handleLogin} noValidate>
            <div className="form-group">
              <label>{t.phoneNumber}</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                  setPhone(value);
                }}
                placeholder="9429617099"
                data-testid="phone-input"
                required
                autoComplete="tel"
                inputMode="numeric"
                pattern="[0-9]{10}"
                maxLength="10"
              />
            </div>
            <div className="form-group">
              <label>{t.password}</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                data-testid="password-input"
                required
                autoComplete="current-password"
              />
            </div>
            <button 
              className="btn btn-primary" 
              type="submit" 
              disabled={loading} 
              data-testid="login-btn"
              onClick={handleButtonClick}
              onTouchStart={(e) => {
                // Ensure touch events work on mobile
                e.currentTarget.style.opacity = '0.8';
              }}
              onTouchEnd={(e) => {
                e.currentTarget.style.opacity = '1';
              }}
            >
              {loading ? 'Logging in...' : t.login}
            </button>
            <p className="text-link">
              Don't have an account? <span onClick={() => navigate('/register')}>Register</span>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AuthScreen;
