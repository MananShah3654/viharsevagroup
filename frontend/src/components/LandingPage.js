import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';

const translations = {
  en: {
    title: 'Vihar Seva Group',
    subtitle: 'Serving Jain Shraman Shramani Bhagvant with Safety and Devotion',
    convenor1Title: 'Convenor - All India Vihar Seva Group',
    convenor1Name: 'Rupeshbhai Shaileshbhai Vora',
    convenor1Phone: '+91 89050 93981',
    convenor2Title: 'Convenor - Gujarat Vihar Seva Group',
    convenor2Name: 'Shreyanshbhai Dilipbhai Ramani',
    convenor2Phone: '+91 89050 93881',
    convenor3Title: 'Convenor - Naranpura Vihar Seva Group',
    convenor3Name: 'Vardhaman Atulbhai Shah',
    convenor3Phone: '+91 86907 03224',
    convenor4Title: 'Convenor - Naranpura Vihar Seva Group',
    convenor4Name: 'Hardikbhai Shah',
    convenor4Phone: '+91 94291 31760',
    enterApp: 'Enter Application',
    login: 'Login',
    register: 'Register',
    ourTeam: 'Our Leadership Team',
    viharPathGuide: 'Vihar Path Margdarshika',
  },
  gu: {
    title: 'વિહાર સેવા ગ્રુપ',
    subtitle: 'જૈન શ્રમણ શ્રમણી ભગવંતોની સુરક્ષા અને ભક્તિ સાથે સેવા',
    convenor1Title: 'કન્વીનર - ઓલ ઇન્ડિયા વિહાર સેવા ગ્રુપ',
    convenor1Name: 'રૂપેશભાઈ શૈલેષભાઈ વોરા',
    convenor1Phone: '+91 89050 93981',
    convenor2Title: 'કન્વીનર - ગુજરાત વિહાર સેવા ગ્રુપ', 
    convenor2Name: 'શ્રેયાંસભાઈ દિલીપભાઈ રામાણી',
    convenor2Phone: '+91 89050 93881',
    convenor3Title: 'કન્વીનર - નારણપુરા વિહાર સેવા ગ્રુપ',
    convenor3Name: 'વર્ધમાન અતુલભાઇ શાહ',
    convenor3Phone: '+91 86907 03224',
    convenor4Title: 'કન્વીનર - નારણપુરા વિહાર સેવા ગ્રુપ',
    convenor4Name: 'હાર્દિકભાઈ શાહ',
    convenor4Phone: '+91 94291 31760',
    enterApp: 'એપ્લિકેશનમાં પ્રવેશ કરો',
    login: 'લોગિન',
    register: 'રજીસ્ટર',
    ourTeam: 'અમારી લીડરશિપ ટીમ',
    viharPathGuide: 'વિહાર પથ માર્ગદર્શિકા',
  },
};

const LandingPage = ({ language, setLanguage }) => {
  const t = translations[language];
  const navigate = useNavigate();

  return (
    <div className="landing-page">
      {/* Header with Language Toggle and Action Buttons */}
      <header className="landing-header">
        <div className="landing-header-content">
          <div className="landing-header-actions">
            <button 
              className="btn-header btn-header-primary"
              onClick={() => navigate('/login')}
            >
              {t.login}
            </button>
            <button 
              className="btn-header btn-header-secondary"
              onClick={() => navigate('/register')}
            >
              {t.register}
            </button>
            {/* Gujarati Language Toggle Button - Hidden/Commented Out */}
            {/* <button 
              className="landing-language-toggle-btn"
              onClick={() => setLanguage(language === 'en' ? 'gu' : 'en')}
            >
              {language === 'en' ? 'ગુજરાતી' : 'English'}
            </button> */}
          </div>
        </div>
      </header>

      {/* Hero Section with Logo and Banner */}
      <section className="landing-hero">
        <div className="landing-hero-container">
          <div className="landing-hero-content">
            <div className="landing-logo-section">
              <img src="/images/logo_vsg.png" alt="VSG Logo" className="landing-logo" />
            </div>
            <div className="landing-title-group">
              <h1 className="landing-title">{t.title}</h1>
              <p className="landing-subtitle">{t.subtitle}</p>
            </div>
          </div>
          <div className="landing-banner-section">
            <img src="/images/banner.jpeg" alt="Vihar Seva Group Banner" className="landing-banner-image" />
          </div>
        </div>
      </section>

      {/* Convenors Section */}
      <section className="landing-convenors-section">
        <div className="landing-section-container">
          <h2 className="landing-section-title">{t.ourTeam}</h2>
          
          {/* Top Two Convenors */}
          <div className="convenors-grid">
            <div className="convenor-card">
              <div className="convenor-image-wrapper">
                <img src="/images/Rupeshbhai_vora.jpeg" alt={t.convenor1Name} className="convenor-image" />
              </div>
              <div className="convenor-info">
                <div className="convenor-title">{t.convenor1Title}</div>
                <div className="convenor-name">{t.convenor1Name}</div>
                <div className="convenor-phone">{t.convenor1Phone}</div>
              </div>
            </div>

            <div className="convenor-card">
              <div className="convenor-image-wrapper">
                <img src="/images/ShreyanshBhai_ramani.jpeg" alt={t.convenor2Name} className="convenor-image" />
              </div>
              <div className="convenor-info">
                <div className="convenor-title">{t.convenor2Title}</div>
                <div className="convenor-name">{t.convenor2Name}</div>
                <div className="convenor-phone">{t.convenor2Phone}</div>
              </div>
            </div>
          </div>

          {/* Middle Two Convenors */}
          <div className="convenors-grid">
            <div className="convenor-card">
              <div className="convenor-image-wrapper">
                <img src="/images/Vardhaman.jpeg" alt={t.convenor3Name} className="convenor-image" />
              </div>
              <div className="convenor-info">
                <div className="convenor-title">{t.convenor3Title}</div>
                <div className="convenor-name">{t.convenor3Name}</div>
                <div className="convenor-phone">{t.convenor3Phone}</div>
              </div>
            </div>

            <div className="convenor-card">
              <div className="convenor-image-wrapper">
                <img src="/images/Hardikbhai.jpeg" alt={t.convenor4Name} className="convenor-image" />
              </div>
              <div className="convenor-info">
                <div className="convenor-title">{t.convenor4Title}</div>
                <div className="convenor-name">{t.convenor4Name}</div>
                <div className="convenor-phone">{t.convenor4Phone}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="landing-cta-section">
        <div className="landing-section-container">
          <div className="landing-actions">
            <button 
              className="btn-landing btn-primary-landing" 
              onClick={() => navigate('/login')}
            >
              {t.login}
            </button>
            <button 
              className="btn-landing btn-secondary-landing" 
              onClick={() => navigate('/register')}
            >
              {t.register}
            </button>
            <button 
              className="btn-landing btn-tertiary-landing" 
              onClick={() => navigate('/vihar-path-margdarshika')}
            >
              📍 {t.viharPathGuide}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
