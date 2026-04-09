import React from 'react';

const ChildSafety = () => {
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
        <p style={{ margin: '8px 0 0', fontSize: '16px', opacity: 0.9 }}>Child Safety Standards</p>
      </div>

      {/* Content */}
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        padding: '40px 24px 60px',
        lineHeight: '1.8',
        fontSize: '15px',
      }}>
        <p style={{ marginBottom: '32px' }}>
          At Vihar Seva Group, we are committed to ensuring a safe environment for all users, especially
          minors. We have a zero-tolerance policy toward child sexual abuse and exploitation (CSAE) and
          strictly prohibit any content or behavior that endangers children.
        </p>

        <Section title="1. Prohibited Content">
          Users are strictly forbidden from:
          <ul style={{ marginTop: '10px', paddingLeft: '20px' }}>
            <li>Uploading, sharing, or distributing any child sexual abuse material (CSAM)</li>
            <li>Engaging in grooming, exploitation, or inappropriate interaction with minors</li>
            <li>Promoting or facilitating any form of child abuse or exploitation</li>
          </ul>
        </Section>

        <Section title="2. Content Moderation">
          We actively monitor content on our platform using:
          <ul style={{ marginTop: '10px', paddingLeft: '20px' }}>
            <li>Automated detection systems</li>
            <li>Manual review processes</li>
          </ul>
          Any content that violates our policies is removed immediately.
        </Section>

        <Section title="3. Reporting Mechanism">
          Users can report harmful or suspicious content or behavior by:
          <ul style={{ marginTop: '10px', paddingLeft: '20px' }}>
            <li>Using the in-app reporting feature (if available)</li>
            <li>Contacting us via email (see contact below)</li>
          </ul>
          All reports are reviewed promptly, and appropriate action is taken.
        </Section>

        <Section title="4. Enforcement Actions">
          If a user is found violating our child safety policies, we will:
          <ul style={{ marginTop: '10px', paddingLeft: '20px' }}>
            <li>Remove the offending content</li>
            <li>Suspend or permanently ban the user account</li>
            <li>Report the activity to relevant authorities where required</li>
          </ul>
        </Section>

        <Section title="5. Cooperation with Law Enforcement">
          We comply with applicable laws and cooperate fully with law enforcement agencies in cases
          involving child safety and exploitation.
        </Section>

        <Section title="6. Child Safety Contact">
          If you have concerns regarding child safety on our platform, please contact us:
          <div style={{ marginTop: '12px', padding: '16px', background: '#f0fff4', borderRadius: '8px', border: '1px solid #c6f6d5' }}>
            <strong>Vihar Seva Group</strong><br />
            Email: <a href="mailto:mananshah3654@gmail.com" style={{ color: '#4a7c59' }}>mananshah3654@gmail.com</a>
          </div>
        </Section>

        <p style={{ marginTop: '32px', padding: '16px', background: '#f7fafc', borderRadius: '8px', borderLeft: '4px solid #4a7c59', fontStyle: 'italic' }}>
          We are dedicated to maintaining a safe and respectful community for everyone.
        </p>

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

export default ChildSafety;
