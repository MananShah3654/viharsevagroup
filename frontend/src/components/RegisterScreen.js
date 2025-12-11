import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { axiosInstance } from '../App';
import { toast } from 'sonner';

const translations = {
  en: {
    title: 'Vihar Seva Group',
    subtitle: 'Serving Jain Monks with Safety and Devotion',
    register: 'Register',
    phoneNumber: 'Phone Number',
    password: 'Password (4 digits)',
    confirmPassword: 'Confirm Password',
    registerSuccess: 'Registration successful! Redirecting to login...',
    errorOccurred: 'An error occurred',
    createAccount: 'Create your account to participate in Vihar seva',
    alreadyHaveAccount: 'Already have an account?',
    login: 'Login',
    passwordMismatch: 'Passwords do not match',
    passwordInvalid: 'Password must be exactly 4 digits',
    phoneRequired: 'Phone number is required',
    passwordRequired: 'Password is required',
  },
  gu: {
    title: '\u0ab5\u0abf\u0ab9\u0abe\u0ab0 \u0ab8\u0ac7\u0ab5\u0abe \u0a97\u0acd\u0ab0\u0ac1\u0aaa',
    subtitle: '\u0a9c\u0ac8\u0aa8 \u0ab8\u0abe\u0aa7\u0ac1\u0a93\u0aa8\u0ac0 \u0ab8\u0ac1\u0ab0\u0a95\u0acd\u0ab7\u0abe \u0a85\u0aa8\u0ac7 \u0aad\u0a95\u0acd\u0aa4\u0abf \u0ab8\u0abe\u0aa5\u0ac7 \u0ab8\u0ac7\u0ab5\u0abe',
    register: '\u0ab0\u0ac7\u0a9c\u0abf\u0ab8\u0acd\u0a9f\u0ab0',
    phoneNumber: '\u0aab\u0acb\u0aa8 \u0aa8\u0a82\u0aac\u0ab0',
    password: '\u0aaa\u0abe\u0ab8\u0ab5\u0ab0\u0acd\u0aa1 (4 \u0a85\u0a82\u0a95)',
    confirmPassword: '\u0aaa\u0abe\u0ab8\u0ab5\u0ab0\u0acd\u0aa1 \u0aa8\u0abf\u0ab6\u0acd\u0a9a\u0abf\u0aa4 \u0a95\u0ab0\u0acb',
    registerSuccess: '\u0ab0\u0ac7\u0a9c\u0abf\u0ab8\u0acd\u0a9f\u0ab0\u0ac7\u0ab6\u0aa8 \u0ab8\u0aab\u0ab3! \u0ab2\u0acb\u0a97\u0abf\u0aa8 \u0aa8\u0ac7 \u0aa6\u0abf\u0ab0\u0acd\u0a97\u0ac7 \u0a95\u0ab0\u0ab5\u0abe \u0aae\u0abe\u0a9f\u0ac7...',
    errorOccurred: '\u0a8f\u0a95 \u0aad\u0ac2\u0ab2 \u0a86\u0ab5\u0ac0',
    createAccount: '\u0ab5\u0abf\u0ab9\u0abe\u0ab0 \u0ab8\u0ac7\u0ab5\u0abe \u0aae\u0ac7\u0a82 \u0aad\u0abe\u0a97 \u0ab2\u0ac7\u0ab5\u0abe \u0aae\u0abe\u0a9f\u0ac7 \u0a86\u0aaa\u0ac0 \u0a96\u0abe\u0aa4\u0ac1 \u0aac\u0aa8\u0abe\u0ab5\u0acb',
    alreadyHaveAccount: '\u0aaa\u0ab9\u0ac7\u0ab2\u0ac7 \u0a96\u0abe\u0aa4\u0ac1 \u0ab9\u0acb\u0aaf\u0ac7 \u0a9b\u0ac7?',
    login: '\u0ab2\u0acb\u0a97\u0abf\u0aa8',
    passwordMismatch: '\u0aaa\u0abe\u0ab8\u0ab5\u0ab0\u0acd\u0aa1 \u0aae\u0abf\u0ab2\u0aa4\u0ac7 \u0aa8\u0ab9\u0ac0',
    passwordInvalid: '\u0aaa\u0abe\u0ab8\u0ab5\u0ab0\u0acd\u0aa1 \u0aae\u0ac7\u0a82 \u0a95\u0ac7\u0ab5\u0ab2 \u0aae\u0ac7\u0a82 4 \u0a85\u0a82\u0a95 \u0ab9\u0acb\u0ab5\u0abe \u0a9c\u0acb\u0aaf\u0ac7',
    phoneRequired: '\u0aab\u0acb\u0aa8 \u0aa8\u0a82\u0aac\u0ab0 \u0a86\u0ab5\u0ab6\u0acd\u0aaf\u0a95 \u0ab9\u0ac7',
    passwordRequired: '\u0aaa\u0abe\u0ab8\u0ab5\u0ab0\u0acd\u0aa1 \u0a86\u0ab5\u0ab6\u0acd\u0aaf\u0a95 \u0ab9\u0ac7',
  },
};

const RegisterScreen = ({ onLogin, language, setLanguage }) => {
  const t = translations[language];
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);


  const handleRegister = async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    // Validation
    if (!phone) {
      toast.error(t.phoneRequired);
      return;
    }
    
    if (!password) {
      toast.error(t.passwordRequired);
      return;
    }
    
    if (password.length !== 4 || !/^\d+$/.test(password)) {
      toast.error(t.passwordInvalid);
      return;
    }
    
    if (password !== confirmPassword) {
      toast.error(t.passwordMismatch);
      return;
    }
    
    if (loading) return;
    
    setLoading(true);
    let registrationSucceeded = false;
    
    try {
      const response = await axiosInstance.post('/auth/register', { phone, password });
      
      // If we reach here, registration was successful
      registrationSucceeded = true;
      toast.success(t.registerSuccess);
      setPhone('');
      setPassword('');
      setConfirmPassword('');
      // Redirect to login screen after a short delay
      setTimeout(() => {
        navigate('/');
      }, 1500);
    } catch (error) {
      console.error('Registration error:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        response: error.response,
        status: error.response?.status,
        data: error.response?.data
      });
      
      // Check if the error is actually a network error or if it's a server error
      if (error.response) {
        // Server responded with error status (4xx or 5xx)
        const errorMessage = error.response.data?.detail || error.response.data?.message || t.errorOccurred;
        toast.error(errorMessage);
      } else if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        // Network error - but user might have been created (backend processed it)
        // Wait a moment for backend to finish, then verify by trying to login
        setTimeout(async () => {
          try {
            const loginCheck = await axiosInstance.post('/auth/login', { phone, password });
            // If login works, registration succeeded but response was lost
            if (loginCheck.data && loginCheck.data.user) {
              toast.success(t.registerSuccess);
              setPhone('');
              setPassword('');
              setConfirmPassword('');
              setTimeout(() => {
                navigate('/');
              }, 1500);
              return;
            }
          } catch (loginError) {
            // Login failed, so registration actually failed or user doesn't exist
            console.error('Login check failed:', loginError);
          }
          // If we get here, registration likely failed
          toast.error('Network error. Please check your internet connection and try again.');
        }, 1000);
      } else {
        // Other errors
        toast.error(error.message || t.errorOccurred);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleButtonClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    handleRegister(e);
  };

  return (
    <div className="auth-container">
      <div className="language-toggle">
        <button onClick={() => setLanguage(language === 'en' ? 'gu' : 'en')} data-testid="language-toggle-btn">
          {language === 'en' ? 'ગુજરાતી' : 'English'}
        </button>
      </div>

      <div className="auth-left">
        <div className="logo-hero">
          <img src="/images/logo_vsg.jpg" alt="VSG Logo" data-testid="vsg-logo" />
          <h1>{t.title}</h1>
          <p>{t.subtitle}</p>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-card">
          <h2>{t.register}</h2>
          <p style={{ textAlign: 'center', color: '#757575', marginBottom: '24px', fontSize: '0.95rem' }}>
            {t.createAccount}
          </p>
          <form onSubmit={handleRegister} noValidate>
            <div className="form-group">
              <label>{t.phoneNumber}</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                placeholder="9429617099"
                data-testid="register-phone-input"
                required
                autoComplete="tel"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength="10"
              />
            </div>
            <div className="form-group">
              <label>{t.password}</label>
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                  setPassword(value);
                }}
                placeholder="1234"
                data-testid="register-password-input"
                required
                autoComplete="new-password"
                inputMode="numeric"
                pattern="[0-9]{4}"
                maxLength="4"
              />
            </div>
            <div className="form-group">
              <label>{t.confirmPassword}</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                  setConfirmPassword(value);
                }}
                placeholder="1234"
                data-testid="register-confirm-password-input"
                required
                autoComplete="new-password"
                inputMode="numeric"
                pattern="[0-9]{4}"
                maxLength="4"
              />
            </div>
            <button 
              className="btn btn-primary" 
              type="submit" 
              disabled={loading} 
              data-testid="register-btn"
              onClick={handleButtonClick}
              onTouchStart={(e) => {
                e.currentTarget.style.opacity = '0.8';
              }}
              onTouchEnd={(e) => {
                e.currentTarget.style.opacity = '1';
              }}
            >
              {loading ? 'Registering...' : t.register}
            </button>
            <p className="text-link">
              {t.alreadyHaveAccount} <span onClick={() => navigate('/')}>{t.login}</span>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterScreen;

