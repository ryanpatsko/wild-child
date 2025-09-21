import React from 'react';
import { Link } from 'react-router-dom';
import christalee146 from '../assets/christalee/2025-05-14-Christalee-146.jpg';

const Classes = () => {
  return (
    <div className="page-container">
      <div className="page-header">
        <img src={christalee146} alt="Christalee - Classes" className="page-header-image" />
      </div>
      <h1 className="page-title">Makeup Classes</h1>
      <p className="intro-text">
        Personalized, hands-on instruction—right where you are in your beauty journey.
      </p>
      <section className="section-card">
        <table className="styled-table">
          <thead>
            <tr>
              <th>Class</th>
              <th>Perfect For</th>
              <th>Details</th>
              <th>Price</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>The Newbie</td>
              <td>Beginners who want a natural, everyday look</td>
              <td>3-hour session: consultation, full application with pro kit, step-by-step guidance, customized product list emailed afterward</td>
              <td>$250</td>
            </tr>
            <tr>
              <td>The Makeup Lover</td>
              <td>Those who own plenty of products and want to level up</td>
              <td>3-hour session: bring your makeup bag; we combine your products with ours, demo half your face, you complete the other, product list emailed</td>
              <td>$275</td>
            </tr>
            <tr>
              <td>Age-Appropriate Makeup<br/>(Teens or Mature Skin)</td>
              <td>Anyone learning age-specific techniques or adapting to changing skin</td>
              <td>3-hour session: skincare review, trend coaching, customized look, product list emailed</td>
              <td>$275</td>
            </tr>
          </tbody>
        </table>
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
