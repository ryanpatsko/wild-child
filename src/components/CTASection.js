import React from 'react';
import { Link } from 'react-router-dom';

const CTASection = ({ 
  title = "Ready to look—and feel—your best?", 
  subtitle = "Let's create something beautiful together", 
  buttonText = "Contact us to reserve your date" 
}) => {
  return (
    <div className="cta-section">
      <div className="cta-content">
        <h3 className="cta-title">{title}</h3>
        <p className="cta-subtitle">{subtitle}</p>
        <Link to="/contact" className="cta-button">
          {buttonText}
        </Link>
      </div>
    </div>
  );
};

export default CTASection;
