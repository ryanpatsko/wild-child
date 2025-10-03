import React from 'react';
import { Link } from 'react-router-dom';
import pageBanner from '../assets/page-banner.jpg';

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
      <section className="section-card">
        <div className="classes-grid">
          <div className="class-card">
            <div className="class-header">
              <h3 className="class-name">The Newbie</h3>
              <div className="class-price">$250</div>
            </div>
            <div className="class-perfect-for">
              <strong>Perfect For:</strong> Beginners who want a natural, everyday look
            </div>
            <div className="class-details">
              <strong>Details:</strong> 3-hour session: consultation, full application with pro kit, step-by-step guidance, customized product list emailed afterward
            </div>
          </div>

          <div className="class-card">
            <div className="class-header">
              <h3 className="class-name">The Makeup Lover</h3>
              <div className="class-price">$275</div>
            </div>
            <div className="class-perfect-for">
              <strong>Perfect For:</strong> Those who own plenty of products and want to level up
            </div>
            <div className="class-details">
              <strong>Details:</strong> 3-hour session: bring your makeup bag; we combine your products with ours, demo half your face, you complete the other, product list emailed
            </div>
          </div>

          <div className="class-card">
            <div className="class-header">
              <h3 className="class-name">Age-Appropriate Makeup<br/>(Teens or Mature Skin)</h3>
              <div className="class-price">$275</div>
            </div>
            <div className="class-perfect-for">
              <strong>Perfect For:</strong> Anyone learning age-specific techniques or adapting to changing skin
            </div>
            <div className="class-details">
              <strong>Details:</strong> 3-hour session: skincare review, trend coaching, customized look, product list emailed
            </div>
          </div>
        </div>
        <p className="muted-text" style={{textAlign: 'center', fontWeight: 500, marginTop: '1.5rem'}}>Hourly add-on: $75 / hour for extended practice or extra looks.</p>
      </section>
      <section className="section-card">
        <h2 className="section-title section-title-classes">Class Logistics</h2>
        <ul className="styled-list">
          <li>Classes are held at our studio (ZIP 15221).</li>
          <li>Travel may be arranged; standard travel fees apply.</li>
          <li><strong>Retainer:</strong> $150 non-refundable, applied to your balance. Retainers do not roll over to new dates.</li>
        </ul>
      </section>
      <div className="cta-section">
        <p className="body-text">Ready to look—and feel—your best? <strong><Link to="/contact" style={{color: 'inherit', textDecoration: 'none'}}>Contact us to reserve your date.</Link></strong></p>
      </div>
    </div>
  );
};

export default Classes;
