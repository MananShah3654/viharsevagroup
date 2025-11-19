import React, { useState } from 'react';
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
    subtitle: '\u0a9c\u0ac8\u0aa8 \u0ab8\u0abe\u0aa7\u0ac1\u0a93\u0aa8\u0ac0 \u0ab8\u0ac1\u0ab0\u0a95\u0acd\u0ab7\u0abe \u0a85\u0aa8\u0ac7 \u0aad\u0a95\u0acd\u0aa4\u0abf \u0ab8\u0abe\u0aa5\u0ac7 \u0ab8\u0ac7\u0ab5\u0abe',
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
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!phone || !password) {
      toast.error('Please enter phone number and password');
      return;
    }
    setLoading(true);
    try {
      const response = await axiosInstance.post('/auth/login', { phone, password });
      toast.success(t.loginSuccess);
      onLogin(response.data.user, response.data.access_token);
    } catch (error) {
      toast.error(error.response?.data?.detail || t.errorOccurred);
    } finally {
      setLoading(false);
    }
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
          <img src="https://customer-assets.emergentagent.com/job_72a57afd-ffc1-4052-ab3e-887263a4efab/artifacts/lmq07cni_vsg%20group%20logo.png" alt="VSG Logo" data-testid="vsg-logo" />
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
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label>{t.phoneNumber}</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="9429617099"
                data-testid="phone-input"
                required
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
              />
            </div>
            <button className="btn btn-primary" type="submit" disabled={loading} data-testid="login-btn">
              {loading ? 'Logging in...' : t.login}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AuthScreen;
