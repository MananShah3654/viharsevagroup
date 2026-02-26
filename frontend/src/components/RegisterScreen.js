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
    name: 'Name',
    area: 'Area',
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
    nameRequired: 'Name is required',
    areaRequired: 'Area is required',
    passwordRequired: 'Password is required',
    bloodGroup: 'Blood Group',
    bloodGroupRequired: 'Blood group is required',
    emergencyContact: 'Emergency Contact No',
    emergencyContactRequired: 'Emergency contact number is required',
    dateOfBirth: 'Date of Birth',
    dateOfBirthRequired: 'Date of birth is required',
  },
  gu: {
    title: '\u0ab5\u0abf\u0ab9\u0abe\u0ab0 \u0ab8\u0ac7\u0ab5\u0abe \u0a97\u0acd\u0ab0\u0ac1\u0aaa',
    subtitle: 'જૈન શ્રમણ શ્રમણી ભગવંતોની સુરક્ષા અને ભક્તિ સાથે સેવા',
    register: '\u0ab0\u0ac7\u0a9c\u0abf\u0ab8\u0acd\u0a9f\u0ab0',
    phoneNumber: '\u0aab\u0acb\u0aa8 \u0aa8\u0a82\u0aac\u0ab0',
    name: '\u0aa8\u0abe\u0aae',
    area: '\u0ab5\u0abf\u0ab8\u0acd\u0aa4\u0abe\u0ab0',
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
    nameRequired: '\u0aa8\u0abe\u0aae \u0a86\u0ab5\u0ab6\u0acd\u0aaf\u0a95 \u0ab9\u0ac7',
    areaRequired: '\u0ab5\u0abf\u0ab8\u0acd\u0aa4\u0abe\u0ab0 \u0a86\u0ab5\u0ab6\u0acd\u0aaf\u0a95 \u0ab9\u0ac7',
    passwordRequired: '\u0aaa\u0abe\u0ab8\u0ab5\u0ab0\u0acd\u0aa1 \u0a86\u0ab5\u0ab6\u0acd\u0aaf\u0a95 \u0ab9\u0ac7',
    bloodGroup: '\u0ab0\u0a95\u0acd\u0aa4 \u0a97\u0acd\u0ab0\u0ac1\u0aaa',
    bloodGroupRequired: '\u0ab0\u0a95\u0acd\u0aa4 \u0a97\u0acd\u0ab0\u0ac1\u0aaa \u0a86\u0ab5\u0ab6\u0acd\u0aaf\u0a95 \u0ab9\u0ac7',
    emergencyContact: '\u0a8f\u0a95\u0aa1\u0abf\u0a9c\u0aa8\u0acd\u0ab8\u0ac0 \u0a95\u0aa8\u0acd\u0a9f\u0ac7\u0a95\u0acd\u0a9f \u0aa8\u0a82\u0aac\u0ab0',
    emergencyContactRequired: '\u0a8f\u0a95\u0aa1\u0abf\u0a9c\u0aa8\u0acd\u0ab8\u0ac0 \u0a95\u0aa8\u0acd\u0a9f\u0ac7\u0a95\u0acd\u0a9f \u0aa8\u0a82\u0aac\u0ab0 \u0a86\u0ab5\u0ab6\u0acd\u0aaf\u0a95 \u0ab9\u0ac7',
    dateOfBirth: '\u0a9c\u0aa8\u0acd\u0aae \u0aa4\u0abe\u0ab0\u0ac0\u0a96',
    dateOfBirthRequired: '\u0a9c\u0aa8\u0acd\u0aae \u0aa4\u0abe\u0ab0\u0ac0\u0a96 \u0a86\u0ab5\u0ab6\u0acd\u0aaf\u0a95 \u0ab9\u0ac7',
  },
};

const RegisterScreen = ({ onLogin, language, setLanguage }) => {
  const t = translations[language];
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [area, setArea] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [bloodGroup, setBloodGroup] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
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
    
    if (!name || name.trim() === '') {
      toast.error(t.nameRequired);
      return;
    }
    
    if (!area || area.trim() === '') {
      toast.error(t.areaRequired);
      return;
    }
    
    if (!bloodGroup || bloodGroup.trim() === '') {
      toast.error(t.bloodGroupRequired);
      return;
    }
    
    if (!emergencyContact || emergencyContact.trim() === '') {
      toast.error(t.emergencyContactRequired);
      return;
    }
    
    if (!dateOfBirth || dateOfBirth.trim() === '') {
      toast.error(t.dateOfBirthRequired);
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
      const response = await axiosInstance.post('/auth/register', { 
        phone, 
        password, 
        name: name.trim(), 
        area: area.trim(),
        blood_group: bloodGroup.trim(),
        emergency_contact: emergencyContact.trim(),
        date_of_birth: dateOfBirth.trim()
      });
      
      // If we get here, registration was successful
      if (response && response.data) {
        registrationSucceeded = true;
        toast.success(t.registerSuccess);
        setPhone('');
        setName('');
        setArea('');
        setPassword('');
        setConfirmPassword('');
        setBloodGroup('');
        setEmergencyContact('');
        setDateOfBirth('');
        setTimeout(() => {
          navigate('/login');
        }, 1500);
        return;
      }
    } catch (error) {
      console.error('Registration error:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        response: error.response,
        status: error.response?.status,
        data: error.response?.data
      });
      
      // For ANY error, verify if user was actually created by attempting login
      // This handles cases where:
      // 1. Network error but user was created
      // 2. Response timeout but user was created
      // 3. Any other error but user was created
      setTimeout(async () => {
        try {
          const loginCheck = await axiosInstance.post('/auth/login', { phone, password });
          if (loginCheck.data && loginCheck.data.user) {
            // User was created successfully - registration worked!
            toast.success(t.registerSuccess);
            setPhone('');
            setName('');
            setArea('');
            setPassword('');
            setConfirmPassword('');
            setBloodGroup('');
            setEmergencyContact('');
            setDateOfBirth('');
            setTimeout(() => {
              navigate('/');
            }, 1500);
            return;
          }
        } catch (loginError) {
          // Login failed - user was not created, show actual error
          console.error('Login verification failed:', loginError);
        }
        
        // If we get here, user was not created - show the actual error
        if (error.response) {
          // Server responded with error
          const errorMessage = error.response.data?.detail || error.response.data?.message || t.errorOccurred;
          toast.error(errorMessage);
        } else if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
          toast.error('Network error. Please check your internet connection and try again.');
        } else {
          toast.error(error.message || t.errorOccurred);
        }
      }, 1500); // Wait 1.5 seconds for backend to finish processing
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
          <h2>{t.register}</h2>
          <p style={{ textAlign: 'center', color: '#757575', marginBottom: '24px', fontSize: '0.95rem' }}>
            {t.createAccount}
          </p>
          <form onSubmit={handleRegister} noValidate className="register-form">
            <div className="form-group form-group-full">
              <label>{t.phoneNumber} <span style={{ color: 'red' }}>*</span></label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                placeholder="9876543210"
                data-testid="register-phone-input"
                required
                autoComplete="tel"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength="10"
              />
            </div>
            <div className="form-group form-group-full">
              <label>{t.name} <span style={{ color: 'red' }}>*</span></label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                data-testid="register-name-input"
                required
                autoComplete="name"
              />
            </div>
            <div className="form-group">
              <label>{t.area} <span style={{ color: 'red' }}>*</span></label>
              <input
                type="text"
                value={area}
                onChange={(e) => setArea(e.target.value)}
                placeholder="Enter your area"
                data-testid="register-area-input"
                required
                autoComplete="address-level2"
              />
            </div>
            <div className="form-group">
              <label>{t.bloodGroup} <span style={{ color: 'red' }}>*</span></label>
              <input
                type="text"
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value)}
                placeholder="A+, B+, O+, etc."
                data-testid="register-blood-group-input"
                required
              />
            </div>
            <div className="form-group">
              <label>{t.emergencyContact} <span style={{ color: 'red' }}>*</span></label>
              <input
                type="tel"
                value={emergencyContact}
                onChange={(e) => setEmergencyContact(e.target.value.replace(/\D/g, ''))}
                placeholder="9429617099"
                maxLength="10"
                data-testid="register-emergency-contact-input"
                required
                inputMode="numeric"
                pattern="[0-9]*"
              />
            </div>
            <div className="form-group">
              <label>{t.dateOfBirth} <span style={{ color: 'red' }}>*</span></label>
              <input
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                data-testid="register-date-of-birth-input"
                required
              />
            </div>
            <div className="form-group">
              <label>{t.password} <span style={{ color: 'red' }}>*</span></label>
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
              <label>{t.confirmPassword} <span style={{ color: 'red' }}>*</span></label>
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
              style={{ gridColumn: '1 / -1', width: '100%' }}
            >
              {loading ? 'Registering...' : t.register}
            </button>
            <p className="text-link" style={{ gridColumn: '1 / -1', textAlign: 'center', marginTop: '8px' }}>
              {t.alreadyHaveAccount} <span onClick={() => navigate('/login')}>{t.login}</span>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterScreen;

