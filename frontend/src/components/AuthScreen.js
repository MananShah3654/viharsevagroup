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
    title: 'વિહાર સેવા ગ્રુપ',
    subtitle: 'જૈન સાધુઓની સુરક્ષા અને ભક્તિ સાથે સેવા',
    sendOtp: 'OTP મોકલો',
    verifyOtp: 'OTP ચકાસો',
    register: 'નોંધણી કરો',
    login: 'લોગિન',
    phoneNumber: 'ફોન નંબર',
    enterOtp: 'OTP દાખલ કરો',
    password: 'પાસવર્ડ',
    photo: 'ફોટો URL',
    age: 'ઉંમર',
    area: 'વિસ્તાર',
    address: 'સરનામું',
    haveCar: 'શું તમારી પાસે કાર છે?',
    adminLogin: 'એડમિન? પાસવર્ડ સાથે લોગિન કરો',
    userLogin: 'યુઝર? OTP સાથે લોગિન કરો',
    completeRegistration: 'નોંધણી પૂર્ણ કરો',
    otpSentSuccess: 'OTP સફળતાપૂર્વક મોકલ્યો!',
    otpVerified: 'OTP ચકાસાઈ ગયો!',
    loginSuccess: 'લોગિન સફળ!',
    registrationSuccess: 'નોંધણી સફળ!',
    errorOccurred: 'એક ભૂલ આવી',
  },
};

const AuthScreen = ({ onLogin, language, setLanguage }) => {
  const t = translations[language];
  const [step, setStep] = useState('phone'); // phone, otp, register, adminLogin
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Registration fields
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
        // Existing user - login successful
        toast.success(t.loginSuccess);
        onLogin(response.data.user, response.data.access_token);
      } else {
        // New user - go to registration
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
    if (!password) {
      toast.error('Please enter password');
      return;
    }
    setLoading(true);
    try {
      const response = await axiosInstance.post('/auth/register', {
        phone,
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
          {language === 'en' ? 'ગુજરાતી' : 'English'}
        </button>
      </div>

      <div className="logo-section">
        <img src="https://customer-assets.emergentagent.com/job_72a57afd-ffc1-4052-ab3e-887263a4efab/artifacts/lmq07cni_vsg%20group%20logo.png" alt="VSG Logo" data-testid="vsg-logo" />
        <h1>{t.title}</h1>
        <p>{t.subtitle}</p>
      </div>

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
  );
};

export default AuthScreen;
