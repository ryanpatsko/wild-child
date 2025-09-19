import React from 'react';
import pinkHairspray from '../assets/pink-brand-hairspray.png';

const AboutMe = () => {
  return (
    <div className="page-container">
      <h1 className="page-title">About the Artist & Company</h1>
      <p className="intro-text">Hi, I'm Christalee! Your tiny, spunky, spooky, and silly face behind Wild Child Fabrications. A few things you can expect when choosing Wild Child Fabrications Hair & Makeup:</p>
      
      <div className="about-layout">
        <div className="about-image-container">
          <img 
            src={pinkHairspray} 
            alt="Christalee Lema - Professional Hair and Makeup Artist" 
            className="about-image"
          />
        </div>
        <div className="about-text-container">
          <div className="about-features">
            <div className="feature-item">
              <h3 className="feature-title">Personalized Support</h3>
              <p className="body-text">Providing seamless support for your projects, weddings, or events to ensure your beauty journey is stress free. You can expect prompt, professional, and friendly communication during our business hours.</p>
            </div>
            
            <div className="feature-item">
              <h3 className="feature-title">Expert Artists & Continuous Improvement</h3>
              <p className="body-text">Whether it's just myself on your project or our team of artists, you can expect skilled and professional stylists. We regularly educate ourselves in all areas - including, but not limited to our artistry skills, communication, and beauty products/trends.</p>
            </div>
            
            <div className="feature-item">
              <h3 className="feature-title">Transparent Pricing</h3>
              <p className="body-text">Whether it's for your wedding, an event, or an advertising project - we'll make sure you've seen and approved the pricing before it goes on your event contract. There are no hidden fees - allowing you to focus on your event day.</p>
            </div>
            
            <div className="feature-item">
              <h3 className="feature-title">Inclusive & Affirming Services</h3>
              <p className="body-text">Our company is committed to providing services that feel true to our clients without question. We will listen to what you want and offer tailored beauty solutions for all ages, couples, genders, and hair/skin types, tones, colors, etc.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutMe;
