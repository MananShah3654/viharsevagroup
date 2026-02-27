import React from 'react';
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
    convenor3Name: 'Vardhaman Shah',
    convenor3Phone: '+91 86907 03224',
    convenor4Title: 'Convenor - Naranpura Vihar Seva Group',
    convenor4Name: 'Hardikbhai Shah',
    convenor4Phone: '+91 94291 31760',
    enterApp: 'Enter Application',
    login: 'Login',
    register: 'Register',
    ourTeam: 'Our Leadership Team',
    viharPathGuide: 'Vihar Path Margdarshika',
    tagline: '🙏 Jay Jinendra',
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
    convenor3Name: 'વર્ધમાન શાહ',
    convenor3Phone: '+91 86907 03224',
    convenor4Title: 'કન્વીનર - નારણપુરા વિહાર સેવા ગ્રુપ',
    convenor4Name: 'હાર્દિકભાઈ શાહ',
    convenor4Phone: '+91 94291 31760',
    enterApp: 'એપ્લિકેશનમાં પ્રવેશ કરો',
    login: 'લોગિન',
    register: 'રજીસ્ટર',
    ourTeam: 'અમારી લીડરશિપ ટીમ',
    viharPathGuide: 'વિહાર પથ માર્ગદર્શિકા',
    tagline: '🙏 જય જિનેન્દ્ર',
  },
};

const convenors = [
  { image: '/images/Rupeshbhai_vora.jpeg',      key: '1' },
  { image: '/images/ShreyanshBhai_ramani.jpeg', key: '2' },
  { image: '/images/Vardhaman.jpeg',            key: '3' },
  { image: '/images/Hardikbhai.jpeg',           key: '4' },
];

const LandingPage = ({ language, setLanguage }) => {
  const t = translations[language];
  const navigate = useNavigate();

  return (
    <div className="lp-page">

      {/* ── Navbar ── */}
      <header className="lp-header">
        <div className="lp-header-inner">
          <div className="lp-brand">
            <img src="/images/logo_vsg.png" alt="VSG Logo" className="lp-brand-logo" />
            <span className="lp-brand-name">{t.title}</span>
          </div>
          <div className="lp-header-btns">
            <button className="lp-btn lp-btn-outline" onClick={() => navigate('/login')}>
              {t.login}
            </button>
            <button className="lp-btn lp-btn-solid" onClick={() => navigate('/register')}>
              {t.register}
            </button>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="lp-hero">
        <div className="lp-hero-inner">
          {/* Left: logo + text */}
          <div className="lp-hero-left">
            <div className="lp-tagline">{t.tagline}</div>
            <img src="/images/logo_vsg.png" alt="VSG Logo" className="lp-hero-logo" />
            <h1 className="lp-hero-title">{t.title}</h1>
            <p className="lp-hero-sub">{t.subtitle}</p>
            <div className="lp-hero-actions">
              <button className="lp-btn lp-btn-solid lp-btn-lg" onClick={() => navigate('/login')}>
                {t.login}
              </button>
              <button className="lp-btn lp-btn-outline lp-btn-lg" onClick={() => navigate('/register')}>
                {t.register}
              </button>
            </div>
          </div>
          {/* Right: banner */}
          <div className="lp-hero-right">
            <div className="lp-banner-wrap">
              <img src="/images/banner.jpeg" alt="Vihar Seva Group Banner" className="lp-banner-img" />
            </div>
          </div>
        </div>
      </section>

      {/* ── Leadership Team ── */}
      <section className="lp-team">
        <div className="lp-section-inner">
          <div className="lp-section-header">
            <h2 className="lp-section-title">{t.ourTeam}</h2>
            <div className="lp-section-line" />
          </div>

          <div className="lp-team-grid">
            {convenors.map(({ image, key }) => (
              <div className="lp-card" key={key}>
                <div className="lp-card-top-bar" />
                <div className="lp-avatar-wrap">
                  <img src={image} alt={t[`convenor${key}Name`]} className="lp-avatar" />
                </div>
                <div className="lp-card-body">
                  <p className="lp-card-role">{t[`convenor${key}Title`]}</p>
                  <h3 className="lp-card-name">{t[`convenor${key}Name`]}</h3>
                  <a className="lp-card-phone" href={`tel:${t[`convenor${key}Phone`]}`}>
                    📞 {t[`convenor${key}Phone`]}
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="lp-cta">
        <div className="lp-section-inner lp-cta-inner">
          <button className="lp-btn lp-btn-solid lp-btn-lg" onClick={() => navigate('/login')}>
            {t.login}
          </button>
          <button className="lp-btn lp-btn-outline lp-btn-lg" onClick={() => navigate('/register')}>
            {t.register}
          </button>
          <button className="lp-btn lp-btn-blue lp-btn-lg" onClick={() => navigate('/vihar-path-margdarshika')}>
            📍 {t.viharPathGuide}
          </button>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="lp-footer">
        <span>© {new Date().getFullYear()} Vihar Seva Group · {t.tagline}</span>
      </footer>

    </div>
  );
};

export default LandingPage;
