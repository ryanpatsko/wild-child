import React from 'react';
import { Link } from 'react-router-dom';

const CTASection = () => {
  return (
    <div className="cta-section">
      <div className="cta-content">
        <h3 className="cta-title">Ready to look—and feel—your best?</h3>
        <p className="cta-subtitle">Let's create something beautiful together</p>
        <Link to="/contact" className="cta-button">
          Contact us to reserve your date
        </Link>
      </div>
    </div>
  );
};

export default CTASection;
