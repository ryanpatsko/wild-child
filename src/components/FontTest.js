import React from 'react';
import lipsLogo from '../assets/wcf-lips-logo.png';

const FontTest = () => {
  const fonts = [
    {
      name: 'Current Font (The Nautigal)',
      fontFamily: 'The Nautigal, cursive',
      className: 'current-font'
    },
    {
      name: 'Viaoda Libre',
      fontFamily: 'Viaoda Libre, cursive',
      className: 'viaoda-libre-font'
    },
    {
      name: 'Castoro Titling',
      fontFamily: 'Castoro Titling, serif',
      className: 'castoro-titling-font'
    }
  ];

  return (
    <div className="page-container">
      <h1 className="page-title">Font Comparison Test</h1>
      <p className="intro-text">
        Comparing different fonts for the site header logo. Each example shows "Wild Child Fabrications" with the lips logo.
      </p>
      
      <div className="font-test-container">
        {fonts.map((font, index) => (
          <div key={index} className="font-test-item">
            <h3 className="font-test-label">{font.name}</h3>
            <div className={`font-test-example ${font.className}`}>
              <span className="font-test-text">Wild Child Fabrications</span>
              <img src={lipsLogo} alt="Lips logo" className="font-test-logo" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FontTest;
