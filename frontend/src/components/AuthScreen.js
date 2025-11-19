import React, { useState } from 'react';
import { axiosInstance } from '../App';
import { toast } from 'sonner';

const translations = {
  en: {
    title: 'Vihar Seva Group',
    subtitle: 'Serving Jain Monks with Safety and Devotion',
    sendOtp: 'Send OTP',
    verifyOtp: 'Verify OTP',
    register: 'Register',
    login: 'Login',
    phoneNumber: 'Phone Number',
    enterOtp: 'Enter OTP',
    password: 'Password',
    name: 'Full Name',
    photo: 'Photo URL',
    age: 'Age',
    area: 'Area',
    address: 'Address',
    haveCar: 'Do you have a car?',
    adminLogin: 'Admin? Login with Password',
    userLogin: 'User? Login with OTP',
    completeRegistration: 'Complete Registration',
    otpSentSuccess: 'OTP sent successfully!',
    otpVerified: 'OTP verified!',
    loginSuccess: 'Login successful!',
    registrationSuccess: 'Registration successful!',
    errorOccurred: 'An error occurred',
  },
  gu: {
    title: '\u0ab5\u0abf\u0ab9\u0abe\u0ab0 \u0ab8\u0ac7\u0ab5\u0abe \u0a97\u0acd\u0ab0\u0ac1\u0aaa',
    subtitle: '\u0a9c\u0ac8\u0aa8 \u0ab8\u0abe\u0aa7\u0ac1\u0a93\u0aa8\u0ac0 \u0ab8\u0ac1\u0ab0\u0a95\u0acd\u0ab7\u0abe \u0a85\u0aa8\u0ac7 \u0aad\u0a95\u0acd\u0aa4\u0abf \u0ab8\u0abe\u0aa5\u0ac7 \u0ab8\u0ac7\u0ab5\u0abe',
    sendOtp: 'OTP \u0aae\u0acb\u0a95\u0ab2\u0acb',
    verifyOtp: 'OTP \u0a9a\u0a95\u0abe\u0ab8\u0acb',
    register: '\u0aa8\u0acb\u0a82\u0aa7\u0aa3\u0ac0 \u0a95\u0ab0\u0acb',
    login: '\u0ab2\u0acb\u0a97\u0abf\u0aa8',
    phoneNumber: '\u0aab\u0acb\u0aa8 \u0aa8\u0a82\u0aac\u0ab0',
    enterOtp: 'OTP \u0aa6\u0abe\u0a96\u0ab2 \u0a95\u0ab0\u0acb',
    password: '\u0aaa\u0abe\u0ab8\u0ab5\u0ab0\u0acd\u0aa1',
    name: '\u0aaa\u0ac2\u0ab0\u0ac1\u0a82 \u0aa8\u0abe\u0aae',
    photo: '\u0aab\u0acb\u0a9f\u0acb URL',
    age: '\u0a89\u0a82\u0aae\u0ab0',
    area: '\u0ab5\u0abf\u0ab8\u0acd\u0aa4\u0abe\u0ab0',
    address: '\u0ab8\u0ab0\u0aa8\u0abe\u0aae\u0ac1\u0a82',
    haveCar: '\u0ab6\u0ac1\u0a82 \u0aa4\u0aae\u0abe\u0ab0\u0ac0 \u0aaa\u0abe\u0ab8\u0ac7 \u0a95\u0abe\u0ab0 \u0a9b\u0ac7?',
    adminLogin: '\u0a8f\u0aa1\u0aae\u0abf\u0aa8? \u0aaa\u0abe\u0ab8\u0ab5\u0ab0\u0acd\u0aa1 \u0ab8\u0abe\u0aa5\u0ac7 \u0ab2\u0acb\u0a97\u0abf\u0aa8 \u0a95\u0ab0\u0acb',
    userLogin: '\u0aaf\u0ac1\u0a9d\u0ab0? OTP \u0ab8\u0abe\u0aa5\u0ac7 \u0ab2\u0acb\u0a97\u0abf\u0aa8 \u0a95\u0ab0\u0acb',
    completeRegistration: '\u0aa8\u0acb\u0a82\u0aa7\u0aa3\u0ac0 \u0aaa\u0ac2\u0ab0\u0acd\u0aa3 \u0a95\u0ab0\u0acb',
    otpSentSuccess: 'OTP \u0ab8\u0aab\u0ab3\u0aa4\u0abe\u0aaa\u0ac2\u0ab0\u0acd\u0ab5\u0a95 \u0aae\u0acb\u0a95\u0ab2\u0acd\u0aaf\u0acb!',
    otpVerified: 'OTP \u0a9a\u0a95\u0abe\u0ab8\u0abe\u0a88 \u0a97\u0aaf\u0acb!',
    loginSuccess: '\u0ab2\u0acb\u0a97\u0abf\u0aa8 \u0ab8\u0aab\u0ab3!',
    registrationSuccess: '\u0aa8\u0acb\u0a82\u0aa7\u0aa3\u0ac0 \u0ab8\u0aab\u0ab3!',
    errorOccurred: '\u0a8f\u0a95 \u0aad\u0ac2\u0ab2 \u0a86\u0ab5\u0ac0',
  },
};

const AuthScreen = ({ onLogin, language, setLanguage }) => {
  const t = translations[language];
  const [step, setStep] = useState('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [name, setName] = useState('');
  const [photo, setPhoto] = useState('');
  const [age, setAge] = useState('');
  const [area, setArea] = useState('');
  const [address, setAddress] = useState('');
  const [car, setCar] = useState(false);

  const handleSendOTP = async () => {
    if (!phone) {
      toast.error('Please enter phone number');
      return;
    }
    setLoading(true);
    try {
      await axiosInstance.post('/auth/send-otp', { phone });
      toast.success(t.otpSentSuccess);
      setStep('otp');
    } catch (error) {
      toast.error(error.response?.data?.detail || t.errorOccurred);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp) {
      toast.error('Please enter OTP');
      return;
    }
    setLoading(true);
    try {
      const response = await axiosInstance.post('/auth/verify-otp', { phone, otp });
      
      if (response.data.access_token) {
        toast.success(t.loginSuccess);
        onLogin(response.data.user, response.data.access_token);
      } else {
        toast.success(t.otpVerified);
        setStep('register');
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || t.errorOccurred);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!name || !password) {
      toast.error('Please enter name and password');
      return;
    }
    setLoading(true);
    try {
      const response = await axiosInstance.post('/auth/register', {
        phone,
        name,
        password,
        photo,
        age: age ? parseInt(age) : null,
        area,
        address,
        car,
      });
      toast.success(t.registrationSuccess);
      onLogin(response.data.user, response.data.access_token);
    } catch (error) {
      toast.error(error.response?.data?.detail || t.errorOccurred);
    } finally {
      setLoading(false);
    }
  };

  const handleAdminLogin = async () => {
    if (!phone || !password) {
      toast.error('Please enter phone and password');
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
          {step === 'phone' && (
            <>
              <h2>{t.sendOtp}</h2>
              <div className="form-group">
                <label>{t.phoneNumber}</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="9429617099"
                  data-testid="phone-input"
                />
              </div>
              <button className="btn btn-primary" onClick={handleSendOTP} disabled={loading} data-testid="send-otp-btn">
                {loading ? 'Sending...' : t.sendOtp}
              </button>
              <div className="text-link">
                <span onClick={() => setStep('adminLogin')} data-testid="admin-login-link">{t.adminLogin}</span>
              </div>
            </>
          )}

          {step === 'otp' && (
            <>
              <h2>{t.verifyOtp}</h2>
              <div className="form-group">
                <label>{t.enterOtp}</label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="123456"
                  data-testid="otp-input"
                />
              </div>
              <button className="btn btn-primary" onClick={handleVerifyOTP} disabled={loading} data-testid="verify-otp-btn">
                {loading ? 'Verifying...' : t.verifyOtp}
              </button>
              <button className="btn btn-secondary" onClick={() => setStep('phone')} data-testid="back-btn">
                Back
              </button>
            </>
          )}

          {step === 'register' && (
            <>
              <h2>{t.completeRegistration}</h2>
              <div className="form-group">
                <label>{t.name} *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Full Name"
                  data-testid="name-input"
                />
              </div>
              <div className="form-group">
                <label>{t.password} *</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  data-testid="password-input"
                />
              </div>
              <div className="form-group">
                <label>{t.photo}</label>
                <input
                  type="text"
                  value={photo}
                  onChange={(e) => setPhoto(e.target.value)}
                  placeholder="https://..."
                  data-testid="photo-input"
                />
              </div>
              <div className="form-group">
                <label>{t.age}</label>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  data-testid="age-input"
                />
              </div>
              <div className="form-group">
                <label>{t.area}</label>
                <input
                  type="text"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  data-testid="area-input"
                />
              </div>
              <div className="form-group">
                <label>{t.address}</label>
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  rows="3"
                  data-testid="address-input"
                />
              </div>
              <div className="checkbox-group">
                <input
                  type="checkbox"
                  checked={car}
                  onChange={(e) => setCar(e.target.checked)}
                  data-testid="car-checkbox"
                />
                <label>{t.haveCar}</label>
              </div>
              <button className="btn btn-primary" onClick={handleRegister} disabled={loading} data-testid="register-btn">
                {loading ? 'Registering...' : t.register}
              </button>
            </>
          )}

          {step === 'adminLogin' && (
            <>
              <h2>{t.login}</h2>
              <div className="form-group">
                <label>{t.phoneNumber}</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="9429617099"
                  data-testid="admin-phone-input"
                />
              </div>
              <div className="form-group">
                <label>{t.password}</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  data-testid="admin-password-input"
                />
              </div>
              <button className="btn btn-primary" onClick={handleAdminLogin} disabled={loading} data-testid="admin-login-btn">
                {loading ? 'Logging in...' : t.login}
              </button>
              <div className="text-link">
                <span onClick={() => setStep('phone')} data-testid="user-login-link">{t.userLogin}</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthScreen;
