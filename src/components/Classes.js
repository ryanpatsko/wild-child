import React from 'react';
import { Link } from 'react-router-dom';
import pageBanner from '../assets/page-headers/misc-makeup.png';
import CTASection from './CTASection';

const Classes = () => {
  return (
    <div className="page-container">
      <div className="page-header">
        <img src={pageBanner} alt="Page Banner - Classes" className="page-header-image" />
      </div>
      <h1 className="page-title">Makeup Classes</h1>
      <p className="intro-text">
        Personalized, hands-on instruction—right where you are in your beauty journey.
      </p>
      <div className="classes-grid">
        <div className="class-card">
          <div className="class-header">
            <h3 className="class-name">The Newbie</h3>
            <div className="class-price">$275</div>
          </div>
          <div className="class-perfect-for">
            <strong>Perfect For:</strong> Beginners who want a natural, everyday look
          </div>
          <div className="class-details">
            <strong>Details:</strong> 3-hour session: Includes a basic 12 swatch color season analysis, skin + makeup consultation, full makeup application with pro kit, step-by-step guidance, customized product list emailed afterward. You do not need to bring anything but yourself for this option!
          </div>
        </div>

        <div className="class-card">
          <div className="class-header">
            <h3 className="class-name">Makeup Lover</h3>
            <div className="class-price">$375</div>
          </div>
          <div className="class-perfect-for">
            <strong>Perfect For:</strong> Those who own plenty of products and want to level up
          </div>
          <div className="class-details">
            <strong>Details:</strong> 3.5 hour session: Includes a 36 swatch color season analysis. Bring your makeup bag/brushes; we combine your products with ours, demo half your face, you complete the other with our guidance, product list + recommendations emailed after.
          </div>
        </div>

        <div className="class-card">
          <div className="class-header">
            <h3 className="class-name">Age Appropriate</h3>
            <div className="class-price">$300</div>
          </div>
          <div className="class-perfect-for">
            <strong>Perfect For:</strong> Anyone learning age-specific techniques or adapting to changing skin
          </div>
          <div className="class-details">
            <strong>Details:</strong> 3-hour session: Includes basic 12 swatch color analysis, skincare review, trend coaching, customized look, product list emailed after. Bring what you own + use of our professional kit.
          </div>
        </div>

        <div className="class-card">
          <div className="class-header">
            <h3 className="class-name">Personal Palette Profiling</h3>
            <div className="class-price">See pricing below</div>
          </div>
          <div className="class-perfect-for">
            <strong>Perfect For:</strong> Anyone looking to understand their color season and receive expert guidance on makeup and wardrobe choices that truly complement their unique palette.
          </div>
          <div className="class-details">
            <strong>What's Included:</strong>
            <ul style={{marginTop: '0.5rem', paddingLeft: '1.5rem'}}>
              <li>45-minute consultation (per person)</li>
              <li>36-color swatch seasonal analysis</li>
              <li>Personalized makeup and wardrobe recommendations based on your color profile</li>
              <li>Consultation only — no makeup application</li>
            </ul>
            <div style={{marginTop: '1rem'}}>
              <strong>Pricing:</strong>
              <ul style={{marginTop: '0.5rem', paddingLeft: '1.5rem'}}>
                <li>Add-on to an existing hair/makeup service: $100</li>
                <li>1-Hour Session (standalone): $125</li>
                <li>Session for 2: $225 (1.5 hour session for 2 people)</li>
                <li>Party Session: $425 (3.5 hour session for 4 people)</li>
              </ul>
            </div>
            <div style={{marginTop: '1rem', fontSize: '0.9rem', fontStyle: 'italic'}}>
              <strong>Additional Info:</strong> Travel costs may apply when relevant. A 50% retainer is required to book all sessions.
            </div>
          </div>
        </div>
      </div>
      <p className="muted-text" style={{textAlign: 'center', fontWeight: 500, marginTop: '2rem', marginBottom: '2rem'}}>Hourly add-on: $75 / hour for extended practice or extra looks.</p>
      <section className="section-card">
        <h2 className="section-title section-title-classes">Class Logistics</h2>
        <ul className="styled-list">
          <li>Classes are held at our studio (ZIP 15221).</li>
          <li>Travel may be arranged; standard travel fees apply.</li>
          <li><strong>Retainer:</strong> A 50% retainer is required to book all sessions. Retainers do not roll over to new dates.</li>
        </ul>
      </section>
      <CTASection 
        title="Ready to learn something new?"
        subtitle="Let's schedule your time with us"
        buttonText="Contact us to schedule your class"
      />
    </div>
  );
};

export default Classes;
