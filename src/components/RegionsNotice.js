import React from 'react';

const homeBoxStyle = {
  backgroundColor: '#fff3cd',
  border: '2px solid #ffc107',
  borderRadius: '8px',
  padding: '1rem',
  margin: '1.5rem 0',
  textAlign: 'center',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '60px',
};

const homeTextStyle = {
  fontSize: '1.1rem',
  fontWeight: '600',
  color: '#856404',
  lineHeight: '1.6',
};

export default function RegionsNotice({ text, variant = 'home' }) {
  if (!text) return null;
  if (variant === 'bridal') {
    return (
      <div className="bridal-regions-notice">
        <div className="bridal-regions-notice-text">{text}</div>
      </div>
    );
  }
  return (
    <div style={homeBoxStyle}>
      <div style={homeTextStyle}>{text}</div>
    </div>
  );
}
