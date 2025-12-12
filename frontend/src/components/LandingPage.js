import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';

const translations = {
  en: {
    title: 'Vihar Seva Group',
    subtitle: 'Serving Jain Shraman Shramani Bhagvant with Safety and Devotion',
    topSalutation: '|| Shri Purushadaniy Parshvanathay Namah ||',
    secondSalutation: '|| Shri Prem-Bhuvanbhanu-Jayghosh-Dharmajita-Rajendra-Jagavallabh-Meghavallabhsurisaddagurubhyo Namah ||',
    founder1Title: 'Ashirvadadata :: Suvishal Gachchhadhipati P.Poo. Acharyadev',
    founder1Name: 'Shrimadvijay Jayghosh Surishvarji Maharaja',
    founder2Title: 'Prerana-Sansthapaka :: Pravachanashikhar, P.Poo. Acharyadev',
    founder2Name: 'Shrimadvijay Mahabodhi Surishvarji Maharaja',
    enterApp: 'Enter Application',
    login: 'Login',
    register: 'Register',
  },
  gu: {
    title: 'વિહાર સેવા ગ્રુપ',
    subtitle: 'જૈન શ્રમણ શ્રમણી ભગવંતની સુરક્ષા અને ભક્તિ સાથે સેવા',
    topSalutation: '|| શ્રી પુરુષાદાણીય પાર્શ્વનાથાય નમઃ ||',
    secondSalutation: '|| શ્રી પ્રેમ-ભુવનભાનુ-જયઘોષ-ધર્મજિત-રાજેન્દ્ર-જગવલ્લભ-મેઘવલ્લભસૂરિસદ્દગુરુભ્યો નમઃ ||',
    founder1Title: 'આશીર્વાદદાતા :: સુવિશાલ ગચ્છાધિપતિ પ.પૂ. આચાર્યદેવ',
    founder1Name: 'શ્રીમદ્વિજય જયઘોષ સૂરીશ્વરજી મહારાજા',
    founder2Title: 'પ્રેરણા-સંસ્થાપક :: પ્રવચનશિખર, પ.પૂ. આચાર્યદેવ',
    founder2Name: 'શ્રીમદ્વિજય મહાબોધી સૂરીશ્વરજી મહારાજા',
    enterApp: 'એપ્લિકેશનમાં પ્રવેશ કરો',
    login: 'લોગિન',
    register: 'રજીસ્ટર',
  },
};

const LandingPage = ({ language, setLanguage }) => {
  const t = translations[language];
  const navigate = useNavigate();

  return (
    <div className="landing-page">
      {/* Full Width Banner Image */}
      <div className="landing-full-banner">
        <img src="/images/banner.jpeg" alt="Founders Banner" className="landing-banner-full" />
      </div>

      {/* Main Content Area */}
      <div className="landing-main-content">
        {/* Language Toggle */}
        <div className="landing-language-toggle">
          <button onClick={() => setLanguage(language === 'en' ? 'gu' : 'en')}>
            {language === 'en' ? 'ગુજરાતી' : 'English'}
          </button>
        </div>

        {/* Logo Section */}
        <div className="landing-logo-section">
          <img src="/images/logo_vsg.jpg" alt="VSG Logo" className="landing-logo" />
        </div>

        {/* Title and Subtitle - Centered */}
        <div className="landing-title-section">
          <h1 className="landing-title">{t.title}</h1>
          <p className="landing-subtitle">{t.subtitle}</p>
        </div>

        {/* Founders Section */}
        <div className="founders-container">
          {/* Founder 1 - Left */}
          <div className="founder-card founder-left">
            <div className="founder-image-placeholder">
              <div className="founder-icon">👴</div>
            </div>
            <div className="founder-info">
              <div className="founder-title">{t.founder1Title}</div>
              <div className="founder-name">{t.founder1Name}</div>
            </div>
          </div>

          {/* Founder 2 - Right */}
          <div className="founder-card founder-right">
            <div className="founder-image-placeholder">
              <div className="founder-icon">👨</div>
            </div>
            <div className="founder-info">
              <div className="founder-title">{t.founder2Title}</div>
              <div className="founder-name">{t.founder2Name}</div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="landing-actions">
          <button 
            className="btn-landing btn-primary-landing" 
            onClick={() => navigate('/')}
          >
            {t.login}
          </button>
          <button 
            className="btn-landing btn-secondary-landing" 
            onClick={() => navigate('/register')}
          >
            {t.register}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;

