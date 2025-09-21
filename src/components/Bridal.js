import React from 'react';
import christalee146 from '../assets/christalee/2025-05-14-Christalee-146.jpg';
import weddingWireProfile from '../assets/wedding-wire-profile.jpg';
import weddingWireLogo from '../assets/weddingwire-vector-logo-2.jpg';
import review1 from '../assets/reviews/wedding-wire-review-1.png';
import review2 from '../assets/reviews/wedding-wire-review-2.png';
import review3 from '../assets/reviews/wedding-wire-review-3.png';
import pricingBrochure from '../assets/2026-WCF-Hair-Makeup Packages.pdf';

const Bridal = () => {
  return (
    <div className="page-container">
      <div className="page-header">
        <img src={christalee146} alt="Christalee - Bridal" className="page-header-image" />
      </div>
      <h1 className="page-title">Bridal Services</h1>
      
      {/* Pricing Brochure CTA */}
      <div className="brochure-section">
        <div className="brochure-content">
          <p className="brochure-description">
            Please download our 2026 brochure to view our current pricing and available packages
          </p>
          <a 
            href={pricingBrochure} 
            target="_blank" 
            rel="noopener noreferrer"
            className="brochure-button"
          >
            <span className="brochure-text">Download 2026 Brochure</span>
            <svg className="brochure-pdf-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
              <path d="M8,12H10V14H8V12M8,16H10V18H8V16M12,12H16V14H12V12M12,16H16V18H12V16Z" />
            </svg>
          </a>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="reviews-section">
        <h2 className="reviews-title">What Our Brides Say</h2>
        
        {/* Wedding Wire Rating */}
        <div className="wedding-wire-section">
          <a 
            href="https://www.weddingwire.com/reviews/wild-child-fabrications-hair-makeup-pittsburgh/330fd549f6ce63ad.html" 
            target="_blank" 
            rel="noopener noreferrer"
            className="wedding-wire-button"
          >
            <div className="wedding-wire-profile-image">
              <img src={weddingWireProfile} alt="Wedding Wire Profile" />
            </div>
            <div className="wedding-wire-content">
              <div className="wedding-wire-rating-row">
                <div className="wedding-wire-stars">
                  <span className="star">★</span>
                  <span className="star">★</span>
                  <span className="star">★</span>
                  <span className="star">★</span>
                  <span className="star">★</span>
                </div>
              </div>
              <div className="wedding-wire-company">Wild Child Fabrications</div>
              <div className="wedding-wire-platform">Over 100 five star ratings on Wedding Wire</div>
            </div>
            <div className="wedding-wire-inner-button">See Our Reviews</div>
          </a>
        </div>

        {/* Review Images */}
        <div className="reviews-stack">
          <img src={review1} alt="Wedding Wire Review 1" className="review-image" />
          <img src={review2} alt="Wedding Wire Review 2" className="review-image" />
          <img src={review3} alt="Wedding Wire Review 3" className="review-image" />
        </div>
      </div>
    </div>
  );
};

export default Bridal;
