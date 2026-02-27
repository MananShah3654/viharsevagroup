import React from 'react';

const PrivacyPolicy = () => {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#FFFCF7',
      fontFamily: "'Nunito', sans-serif",
      color: '#2d3748',
    }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #4a7c59 0%, #6aaa7a 100%)',
        padding: '40px 24px',
        textAlign: 'center',
        color: '#fff',
      }}>
        <img src="/images/logo_vsg.png" alt="VSG Logo" style={{ height: '60px', marginBottom: '12px', display: 'block', margin: '0 auto 12px' }} />
        <h1 style={{ margin: 0, fontSize: '26px', fontWeight: 800 }}>Vihar Seva Group</h1>
        <p style={{ margin: '8px 0 0', fontSize: '16px', opacity: 0.9 }}>Privacy Policy</p>
      </div>

      {/* Content */}
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        padding: '40px 24px 60px',
        lineHeight: '1.8',
        fontSize: '15px',
      }}>
        <p style={{ color: '#718096', marginBottom: '32px' }}>
          <strong>Last updated:</strong> February 2026
        </p>

        <Section title="1. Introduction">
          Vihar Seva Group ("we", "our", or "us") operates the Vihar Seva Group mobile application
          and website (the "Service"). This Privacy Policy explains how we collect, use, and protect
          information when you use our Service. By using the Service, you agree to this policy.
        </Section>

        <Section title="2. Information We Collect">
          We collect the following information when you register or use our app:
          <ul style={{ marginTop: '10px', paddingLeft: '20px' }}>
            <li><strong>Name</strong> — your full name for identification within the group</li>
            <li><strong>Phone number</strong> — used as your login identifier</li>
            <li><strong>City / Location</strong> — to assign you to the relevant Vihar Seva region</li>
            <li><strong>Vihar route data</strong> — routes submitted by administrators for Jain pilgrimage paths</li>
          </ul>
          We do <strong>not</strong> collect: payment information, precise GPS location, photos, contacts,
          or any sensitive personal data.
        </Section>

        <Section title="3. How We Use Your Information">
          <ul style={{ marginTop: '10px', paddingLeft: '20px' }}>
            <li>To authenticate you and provide access to the app</li>
            <li>To display vihar route information relevant to your region</li>
            <li>To allow administrators to manage vihar seva activities</li>
            <li>To improve the Service and fix issues</li>
          </ul>
          We do <strong>not</strong> sell, rent, or share your personal information with third parties
          for marketing purposes.
        </Section>

        <Section title="4. Data Storage and Security">
          Your data is stored securely on cloud servers (MongoDB Atlas). We use industry-standard
          encryption (HTTPS/TLS) for all data transmission. Access to user data is restricted to
          authorised administrators only. Passwords are stored as secure hashes and are never
          stored or transmitted in plain text.
        </Section>

        <Section title="5. Data Sharing">
          We do not share your personal information with any third parties except:
          <ul style={{ marginTop: '10px', paddingLeft: '20px' }}>
            <li>Cloud infrastructure providers (for hosting and storage)</li>
            <li>When required by law or government authorities</li>
          </ul>
        </Section>

        <Section title="6. User Rights">
          You have the right to:
          <ul style={{ marginTop: '10px', paddingLeft: '20px' }}>
            <li>Access your personal data stored in the app</li>
            <li>Request correction of inaccurate data</li>
            <li>Request deletion of your account and associated data</li>
          </ul>
          To exercise these rights, contact us at the email below.
        </Section>

        <Section title="7. Children's Privacy">
          Our Service is not directed to children under the age of 13. We do not knowingly collect
          personal information from children. If you believe a child has provided us personal
          information, please contact us and we will delete it promptly.
        </Section>

        <Section title="8. Changes to This Policy">
          We may update this Privacy Policy from time to time. We will notify users of significant
          changes by updating the "Last updated" date at the top of this page. Continued use of the
          Service after changes constitutes acceptance of the updated policy.
        </Section>

        <Section title="9. Contact Us">
          If you have any questions about this Privacy Policy or wish to exercise your data rights,
          please contact:
          <div style={{ marginTop: '12px', padding: '16px', background: '#f0fff4', borderRadius: '8px', border: '1px solid #c6f6d5' }}>
            <strong>Vihar Seva Group</strong><br />
            Email: <a href="mailto:viharsevagroup@gmail.com" style={{ color: '#4a7c59' }}>viharsevagroup@gmail.com</a><br />
            Phone: <a href="tel:+918905093981" style={{ color: '#4a7c59' }}>+91 89050 93981</a>
          </div>
        </Section>

        <div style={{ marginTop: '40px', textAlign: 'center', color: '#a0aec0', fontSize: '13px' }}>
          © {new Date().getFullYear()} Vihar Seva Group. All rights reserved.
        </div>
      </div>
    </div>
  );
};

const Section = ({ title, children }) => (
  <div style={{ marginBottom: '28px' }}>
    <h2 style={{
      fontSize: '17px',
      fontWeight: 700,
      color: '#4a7c59',
      marginBottom: '10px',
      paddingBottom: '6px',
      borderBottom: '2px solid #c6f6d5',
    }}>
      {title}
    </h2>
    <div>{children}</div>
  </div>
);

export default PrivacyPolicy;
