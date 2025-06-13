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
      case 'TV. FILM. PRINT.':
        return (
          <div className="page-content media-content">
            <div className="media-header">
              <h1>Makeup & Hair for Advertising & Media</h1>
              <p className="media-intro">
                Looking to make a lasting impression on screen? We create camera-ready hair and makeup that elevate talent for film, television, advertising, music videos, and other entertainment projects.
              </p>
            </div>

            <section className="media-section">
              <h2>Our Collaborative Process</h2>
              <p>Every project starts with a personalized consultation. We'll explore your vision, learn your goals, and note any must-haves or no-gos. From there, we design a hair and makeup aesthetic that stays true to your brand and resonates on camera.</p>
            </section>

            <section className="media-section">
              <h2>Why We're Different</h2>
              <div className="features-grid">
                <div className="feature-item">
                  <h3>Camera-Ready Results</h3>
                  <p>From polished natural beauty to bold transformations, we craft looks that translate flawlessly on screen.</p>
                </div>
                <div className="feature-item">
                  <h3>Long-Wear Expertise</h3>
                  <p>Our products and techniques are chosen specifically for on-set durability, keeping talent fresh through long shooting days.</p>
                </div>
                <div className="feature-item">
                  <h3>On-Set Support</h3>
                  <p>Need touch-ups during filming? We offer continuous, on-set service so every frame looks perfect.</p>
                </div>
              </div>
            </section>

            <section className="media-section">
              <h2>Rates</h2>
              <p className="rates-note">All rates include kit rental. Travel outside the Pittsburgh area may incur additional fees.</p>
              <div className="rates-grid">
                <div className="rate-item">
                  <h3>Full day</h3>
                  <p className="rate-duration">up to 10 hrs</p>
                  <p className="rate-price">Starting at $750</p>
                </div>
                <div className="rate-item">
                  <h3>Half day</h3>
                  <p className="rate-duration">up to 5 hrs</p>
                  <p className="rate-price">Starting at $475</p>
                </div>
              </div>
            </section>

            <section className="media-section">
              <h2>Notable Talent & Clients</h2>
              <div className="clients-grid">
                <div className="client-category">
                  <h3>Athletes</h3>
                  <p>Pittsburgh Steelers: Cam Hayward, Chase Claypool, Bud Dupree, Terrell Edmunds</p>
                </div>
                <div className="client-category">
                  <h3>National Sports Announcers</h3>
                  <p>Jenn Brown, Joe Buck, Holly Sonders, Paul Azinger</p>
                </div>
                <div className="client-category">
                  <h3>TV Personalities</h3>
                  <p>Chef Palak Patel (Food Network Chopped)</p>
                </div>
                <div className="client-category">
                  <h3>High-Profile Politicians</h3>
                  <p>Details available upon request</p>
                </div>
              </div>
            </section>

            <section className="media-section">
              <h2>Selected TV • Film • Print Work</h2>
              <div className="work-grid">
                <div className="work-category">
                  <p>Disney Channel • FOX News & Sports • TLC Return to Amish • Paramount Mayor of Kingstown (S2) • WGN Outsiders • Lifetime Dance Moms • Nike • Facebook • Spotify • U.S. Steel • Westinghouse Nuclear • Burberry • Sheetz • Pittsburgh Penguins Foundation • University of Pittsburgh • Carnegie Mellon University & FBI collaboration • UPMC Health Plan • Aetna • Yelp! • PNC • Edgar Snyder & Associates — and many more.</p>
                </div>
              </div>
              <p className="full-list-note">Full client list available upon request.</p>
            </section>
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
