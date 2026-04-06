import React from 'react';
import pinkHairspray from '../assets/pink-brand-hairspray.png';
import lipsLogo from '../assets/wcf-lips-logo.png';
import { useAboutContent } from '../hooks/useAboutContent';

const AboutMe = () => {
  const { pageHeader, mainText, listIntro, items } = useAboutContent();

  return (
    <div className="page-container">
      <h1 className="page-title">{pageHeader}</h1>
      <p className="intro-text">{mainText}</p>
      <p className="intro-text" style={{ marginTop: '1rem' }}>
        {listIntro}
      </p>

      <div className="about-layout">
        <div className="about-image-container">
          <img
            src={pinkHairspray}
            alt="ChristaLee Lema - Professional Hair and Makeup Artist"
            className="about-image"
          />
        </div>
        <section className="section-card">
          {items.map((item, index) => (
            <div key={index} className="faq-item">
              <h3 className="feature-title-with-logo">
                <img src={lipsLogo} alt="" className="lips-logo-bullet" />
                {item.title}
              </h3>
              <p className="body-text">{item.body}</p>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
};

export default AboutMe;
