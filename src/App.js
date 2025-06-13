import React, { useState } from 'react';
import './App.css';
import pinkHairspray from './assets/pink-brand-hairspray.png';
import siteLogo from './assets/site-logo.png';

function App() {
  const [activeTab, setActiveTab] = useState('HOME');

  const navItems = [
    'HOME',
    'ABOUT ME',
    'CONTACT',
    'TV. FILM. PRINT.',
    'BRIDAL',
    'BEAUTY & EVENTS',
    'CREATIVE & FX'
  ];

  const renderContent = () => {
    switch(activeTab) {
      case 'HOME':
        return (
          <div className="home-content">
            <div className="hero-section">
              <h2 className="tagline">HAIR + MAKEUP ARTISTRY</h2>
              <p className="hero-description">
                Luxury beauty services with a wild, creative twist. 
                From bridal elegance to avant-garde artistry.
              </p>
            </div>
            <div className="gallery-placeholder">
              <p>Gallery coming soon...</p>
            </div>
          </div>
        );
      case 'ABOUT ME':
        return (
          <div className="page-content">
            <div className="about-content">
              <div className="about-image-container">
                <img 
                  src={pinkHairspray} 
                  alt="Pink Brand Hairspray" 
                  className="about-image"
                />
              </div>
              <div className="about-text">
                <h2>About Christalee Lema</h2>
                <p>Professional hair and makeup artist bringing luxury and creativity to every look. With years of experience in the beauty industry, I specialize in creating stunning transformations for every occasion.</p>
                <p>From bridal elegance to avant-garde artistry, I bring passion and precision to every client's vision.</p>
              </div>
            </div>
            
            <div className="testimonial-box">
              <blockquote className="testimonial-quote">
                She's sexy. She's funny. She's smart. She's creative. She's driven. She's passionate. She's strong. She's resilient. She's kind. She's compassionate. She's loyal. She's savage. She's multi-talented. And she's the best damn makeup artist in town. Hire this woman.
              </blockquote>
              <cite className="testimonial-author">— Totally Anonymous Reviewer</cite>
            </div>
          </div>
        );
      case 'CONTACT':
        return (
          <div className="page-content">
            <h2>Get In Touch</h2>
            <p>Ready to create something beautiful together?</p>
          </div>
        );
      default:
        return (
          <div className="page-content">
            <h2>{activeTab}</h2>
            <p>Content for {activeTab} coming soon...</p>
          </div>
        );
    }
  };

  return (
    <div className="App">
      <header className="main-header">
        <div className="header-content">
          <div className="logo-section">
            <img src={siteLogo} alt="Wild Child Fabrications" className="site-logo" />
          </div>
          
          <nav className="main-nav">
            {navItems.map((item) => (
              <button
                key={item}
                className={`nav-item ${activeTab === item ? 'active' : ''}`}
                onClick={() => setActiveTab(item)}
              >
                {item}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="main-content">
        {renderContent()}
      </main>
    </div>
  );
}

export default App;
