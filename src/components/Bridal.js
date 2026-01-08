import React, { useState } from 'react';
import pageBanner from '../assets/page-headers/tan-swabs-pink-bg.png';
import weddingWireProfile from '../assets/wedding-wire-profile.jpg';
import BridalGallery from './BridalGallery';
import CTASection from './CTASection';

const Bridal = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isExpanded2, setIsExpanded2] = useState(false);
  const [isExpanded3, setIsExpanded3] = useState(false);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const toggleExpanded2 = () => {
    setIsExpanded2(!isExpanded2);
  };

  const toggleExpanded3 = () => {
    setIsExpanded3(!isExpanded3);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <img src={pageBanner} alt="Page Banner - Bridal" className="page-header-image" />
      </div>
      <h1 className="page-title">Bridal Services</h1>
      
      {/* PDF Downloads Section */}
      <div className="brochure-section">
        <div className="brochure-content">
          <p className="intro-text" style={{ marginBottom: '1rem' }}>
            Download our 2026 resources to view pricing, booking process, and trial information
          </p>
          <div style={{
            backgroundColor: '#fff3cd',
            border: '2px solid #ffc107',
            borderRadius: '8px',
            padding: '1.5rem',
            margin: '0 0 1.5rem 0',
            textAlign: 'center',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '80px'
          }}>
            <div style={{
              fontSize: '1.1rem',
              fontWeight: '600',
              color: '#856404',
              lineHeight: '1.6'
            }}>
              <div style={{ marginBottom: '0.5rem' }}>Pittsburgh - now accepting bookings through 7/20/2026</div>
              <div>Atlanta - now accepting bookings for August 2026 and beyond</div>
            </div>
          </div>
          <div className="pdf-buttons">
            <a 
              href="/2026-WCF-Hair-Makeup-Packages.pdf" 
              target="_blank" 
              rel="noopener noreferrer"
              className="brochure-button"
            >
              <span className="brochure-text">2026 Brochure</span>
              <svg className="brochure-pdf-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                <path d="M8,12H10V14H8V12M8,16H10V18H8V16M12,12H16V14H12V12M12,16H16V18H12V16Z" />
              </svg>
            </a>
            <a 
              href="/2026-Booking-Process.pdf" 
              target="_blank" 
              rel="noopener noreferrer"
              className="brochure-button"
            >
              <span className="brochure-text">Booking Process</span>
              <svg className="brochure-pdf-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                <path d="M8,12H10V14H8V12M8,16H10V18H8V16M12,12H16V14H12V12M12,16H16V18H12V16Z" />
              </svg>
            </a>
            <a 
              href="/Trial-Q-A-2026.pdf" 
              target="_blank" 
              rel="noopener noreferrer"
              className="brochure-button"
            >
              <span className="brochure-text">Trial Q&A</span>
              <svg className="brochure-pdf-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                <path d="M8,12H10V14H8V12M8,16H10V18H8V16M12,12H16V14H12V12M12,16H16V18H12V16Z" />
              </svg>
            </a>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="reviews-section">
        <h2 className="section-title section-title-bridal">What Our Brides Say</h2>
        
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

        {/* Testimonials Banner */}
        <div className="testimonials-banner">
          <div className="testimonial-card">
            <div className="testimonial-header">
              <div className="testimonial-avatar">
                <span className="testimonial-initial">J</span>
              </div>
              <div className="testimonial-info">
                <div className="testimonial-name">Jenna</div>
                <div className="testimonial-date">Sent on 07/28/2025</div>
              </div>
            </div>
            
            <div className="testimonial-rating">
              <div className="testimonial-stars">
                <span className="star">★</span>
                <span className="star">★</span>
                <span className="star">★</span>
                <span className="star">★</span>
                <span className="star">★</span>
              </div>
              <span className="testimonial-rating-number">5.0</span>
            </div>
            
            <h3 className="testimonial-title">Couldn't recommend Christalee enough</h3>
            
            <div className="testimonial-text">
              {isExpanded ? (
                <p>
                  Christalee was an absolute life saver. A month before my wedding my original hair and makeup company fell through. I was thankfully introduced to Christalee and she saved the day. The experience with her and her team couldn't have been better. Her communication was above and beyond and she genuinely made an extremely stressful situation such a breeze. She ensured I had a trial and was happy to change things up when I decided my original vision wasn't what I wanted. She was incredible to work with and made me feel beautiful on my wedding day. She and her team were so professional and made sure to take care of me and my wedding party. We were all so happy with their work and would absolutely recommend. The service was truly above expectations and I wish I would have found her sooner!
                </p>
              ) : (
                <p>
                  Christalee was an absolute life saver. A month before my wedding my original hair and makeup company fell through...
                </p>
              )}
              <button className="testimonial-more-btn" onClick={toggleExpanded}>
                {isExpanded ? 'Show less' : 'more'}
              </button>
            </div>
          </div>

          <div className="testimonial-card">
            <div className="testimonial-header">
              <div className="testimonial-avatar">
                <span className="testimonial-initial">B</span>
              </div>
              <div className="testimonial-info">
                <div className="testimonial-name">Brittney</div>
                <div className="testimonial-date">Sent on 06/16/2025</div>
              </div>
            </div>
            
            <div className="testimonial-rating">
              <div className="testimonial-stars">
                <span className="star">★</span>
                <span className="star">★</span>
                <span className="star">★</span>
                <span className="star">★</span>
                <span className="star">★</span>
              </div>
              <span className="testimonial-rating-number">5.0</span>
            </div>
            
            <h3 className="testimonial-title">Hair & Makeup Goals Achieved! 😍</h3>
            
            <div className="testimonial-text">
              {isExpanded2 ? (
                <p>
                  I had such a great experience working with Christalee! She was amazing in every aspect professional, kind, and incredibly talented. She really listened to what I wanted and made me feel so comfortable throughout the whole process. On my wedding day, the hair and makeup turned out even better than I imagined. It lasted all day and looked flawless in photos. I felt so beautiful and confident thanks to her. Highly recommend!
                </p>
              ) : (
                <p>
                  I had such a great experience working with Christalee! She was amazing in every aspect professional, kind, and incredibly talented...
                </p>
              )}
              <button className="testimonial-more-btn" onClick={toggleExpanded2}>
                {isExpanded2 ? 'Show less' : 'more'}
              </button>
            </div>
          </div>

          <div className="testimonial-card">
            <div className="testimonial-header">
              <div className="testimonial-avatar">
                <span className="testimonial-initial">C</span>
              </div>
              <div className="testimonial-info">
                <div className="testimonial-name">Christiana</div>
                <div className="testimonial-date">Sent on 06/15/2025</div>
              </div>
            </div>
            
            <div className="testimonial-rating">
              <div className="testimonial-stars">
                <span className="star">★</span>
                <span className="star">★</span>
                <span className="star">★</span>
                <span className="star">★</span>
                <span className="star">★</span>
              </div>
              <span className="testimonial-rating-number">5.0</span>
            </div>
            
            <h3 className="testimonial-title">Perfect Wedding Partner</h3>
            
            <div className="testimonial-text">
              {isExpanded3 ? (
                <p>
                  From our first calls thru the end of our reception, I could not be happier with how awesome Wildchild was for my wedding party and I. She was affordable and extremely knowledgeable of the best way to achieve the classic look I was going for. Not only did she deliver with both hair and makeup, but she still gave my other wedding party members a great look that followed my desired aesthetic with their own personal style. All of us looked amazing till the very end of our wonderful day. I cannot recommend her more.
                </p>
              ) : (
                <p>
                  From our first calls thru the end of our reception, I could not be happier with how awesome Wildchild was for my wedding party and I...
                </p>
              )}
              <button className="testimonial-more-btn" onClick={toggleExpanded3}>
                {isExpanded3 ? 'Show less' : 'more'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bridal Gallery */}
      <div className="gallery-section">
        <h2 className="section-title section-title-bridal">Bridal Gallery</h2>
        <BridalGallery />
      </div>

      {/* Contact CTA Section */}
      <CTASection />
    </div>
  );
};

export default Bridal;
