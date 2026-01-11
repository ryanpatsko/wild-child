import React, { useState, useEffect, useRef } from 'react';
import pageBanner from '../assets/page-headers/tan-swabs-pink-bg.png';
import weddingWireProfile from '../assets/wedding-wire-profile.jpg';
import BridalGallery from './BridalGallery';
import CTASection from './CTASection';

const BridalAtlanta = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isExpanded2, setIsExpanded2] = useState(false);
  const [isExpanded3, setIsExpanded3] = useState(false);
  const badgeRef = useRef(null);

  // Set location-specific meta tags
  useEffect(() => {
    // Update title
    document.title = "Bridal Hair & Makeup in Atlanta, GA | Wild Child Fabrications";
    
    // Update or create meta description
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute('content', 'Professional bridal hair and makeup services in Atlanta, GA. Wild Child Fabrications offers luxury beauty services for your wedding day. Book your bridal trial today!');
    
    // Update geo tags
    let geoRegion = document.querySelector('meta[name="geo.region"]');
    if (!geoRegion) {
      geoRegion = document.createElement('meta');
      geoRegion.setAttribute('name', 'geo.region');
      document.head.appendChild(geoRegion);
    }
    geoRegion.setAttribute('content', 'US-GA');
    
    let geoPlacename = document.querySelector('meta[name="geo.placename"]');
    if (!geoPlacename) {
      geoPlacename = document.createElement('meta');
      geoPlacename.setAttribute('name', 'geo.placename');
      document.head.appendChild(geoPlacename);
    }
    geoPlacename.setAttribute('content', 'Atlanta');
    
    let geoPosition = document.querySelector('meta[name="geo.position"]');
    if (!geoPosition) {
      geoPosition = document.createElement('meta');
      geoPosition.setAttribute('name', 'geo.position');
      document.head.appendChild(geoPosition);
    }
    geoPosition.setAttribute('content', '33.7490;-84.3880');
    
    // Update Open Graph tags
    let ogTitle = document.querySelector('meta[property="og:title"]');
    if (!ogTitle) {
      ogTitle = document.createElement('meta');
      ogTitle.setAttribute('property', 'og:title');
      document.head.appendChild(ogTitle);
    }
    ogTitle.setAttribute('content', 'Bridal Hair & Makeup in Atlanta, GA | Wild Child Fabrications');
    
    let ogDescription = document.querySelector('meta[property="og:description"]');
    if (!ogDescription) {
      ogDescription = document.createElement('meta');
      ogDescription.setAttribute('property', 'og:description');
      document.head.appendChild(ogDescription);
    }
    ogDescription.setAttribute('content', 'Professional bridal hair and makeup services in Atlanta, GA. Book your wedding beauty services today!');
    
    // Update canonical URL
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', 'https://wildchildfabrications.com/bridal-atlanta');
  }, []);

  useEffect(() => {
    // Check if script already exists
    let script = document.querySelector('script[src*="wp-rated.js"]');
    
    if (!script) {
      // Load WeddingWire rated script
      script = document.createElement('script');
      script.src = 'https://cdn1.weddingwire.com/_js/wp-rated.js?v=4';
      script.async = true;
      document.body.appendChild(script);
    }
    
    // Function to initialize the badge
    const initBadge = () => {
      if (badgeRef.current && window.wpShowRatedWW) {
        window.wpShowRatedWW('986013');
      }
      // Initialize award badges
      if (window.wpShowRatedWAv3) {
        window.wpShowRatedWAv3('986013', '2018');
        window.wpShowRatedWAv3('986013', '2019');
        window.wpShowRatedWAv3('986013', '2020');
        window.wpShowRatedWAv3('986013', '2021');
        window.wpShowRatedWAv3('986013', '2022');
        window.wpShowRatedWAv3('986013', '2023');
        window.wpShowRatedWAv3('986013', '2024');
      }
    };

    // Call the function after script loads or if already loaded
    if (window.wpShowRatedWW && window.wpShowRatedWAv3) {
      initBadge();
    } else {
      script.onload = () => {
        setTimeout(initBadge, 200);
      };
    }

    // Also try after a delay to ensure DOM is ready
    const timeoutId = setTimeout(initBadge, 500);

    return () => {
      clearTimeout(timeoutId);
    };
  }, []);

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
        
        {/* WeddingWire Awards Banner */}
        <div style={{ 
          textAlign: 'center', 
          marginBottom: '2rem',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          width: '100%'
        }}>
          <div id="wp-ratedWA">
            <a 
              target="_blank" 
              href="https://www.weddingwire.com/biz/wild-child-fabrications-hair-makeup-pittsburgh/330fd549f6ce63ad.html" 
              rel="nofollow" 
              title="Wild Child Fabrications, WeddingWire Couples' Choice Award Winner 2018"
            >
              <img 
                width="125" 
                height="125" 
                alt="Wild Child Fabrications, WeddingWire Couples' Choice Award Winner 2018" 
                id="wp-ratedWA-img-2018" 
                src="https://cdn1.weddingwire.com/img/badges/2018/badge-weddingawards_en_US.png"
                style={{ display: 'block' }}
              />
            </a>
          </div>
          <div id="wp-ratedWA">
            <a 
              target="_blank" 
              href="https://www.weddingwire.com/biz/wild-child-fabrications-hair-makeup-pittsburgh/330fd549f6ce63ad.html" 
              rel="nofollow" 
              title="WeddingWire Couples' Choice Award Winner 2019"
            >
              <img 
                width="125" 
                height="125" 
                alt="Wild Child Fabrications" 
                id="wp-ratedWA-img-2019" 
                src="https://cdn1.weddingwire.com/img/badges/2019/badge-weddingawards_en_US.png"
                style={{ display: 'block' }}
              />
            </a>
          </div>
          <div id="wp-ratedWA">
            <a 
              target="_blank" 
              href="https://www.weddingwire.com/biz/wild-child-fabrications-hair-makeup-pittsburgh/330fd549f6ce63ad.html" 
              rel="nofollow" 
              title="WeddingWire Couples' Choice Award Winner 2020"
            >
              <img 
                width="125" 
                height="125" 
                alt="Wild Child Fabrications" 
                id="wp-ratedWA-img-2020" 
                src="https://cdn1.weddingwire.com/img/badges/2020/badge-weddingawards_en_US.png"
                style={{ display: 'block' }}
              />
            </a>
          </div>
          <div id="wp-ratedWA">
            <a 
              target="_blank" 
              href="https://www.weddingwire.com/biz/wild-child-fabrications-hair-makeup-pittsburgh/330fd549f6ce63ad.html" 
              rel="nofollow" 
              title="WeddingWire Couples' Choice Award Winner 2021"
            >
              <img 
                width="125" 
                height="125" 
                alt="Wild Child Fabrications" 
                id="wp-ratedWA-img-2021" 
                src="https://cdn1.weddingwire.com/img/badges/2021/badge-weddingawards_en_US.png"
                style={{ display: 'block' }}
              />
            </a>
          </div>
          <div id="wp-ratedWA">
            <a 
              target="_blank" 
              href="https://www.weddingwire.com/biz/wild-child-fabrications-hair-makeup-pittsburgh/330fd549f6ce63ad.html" 
              rel="nofollow" 
              title="WeddingWire Couples' Choice Award Winner 2022"
            >
              <img 
                width="125" 
                height="125" 
                alt="Wild Child Fabrications" 
                id="wp-ratedWA-img-2022" 
                src="https://cdn1.weddingwire.com/img/badges/2022/badge-weddingawards_en_US.png"
                style={{ display: 'block' }}
              />
            </a>
          </div>
          <div id="wp-ratedWA">
            <a 
              target="_blank" 
              href="https://www.weddingwire.com/biz/wild-child-fabrications-hair-makeup-pittsburgh/330fd549f6ce63ad.html" 
              rel="nofollow" 
              title="WeddingWire Couples' Choice Award Winner 2023"
            >
              <img 
                width="125" 
                height="125" 
                alt="Wild Child Fabrications" 
                id="wp-ratedWA-img-2023" 
                src="https://cdn1.weddingwire.com/img/badges/2023/badge-weddingawards_en_US.png"
                style={{ display: 'block' }}
              />
            </a>
          </div>
          <div id="wp-ratedWA">
            <a 
              target="_blank" 
              href="https://www.weddingwire.com/biz/wild-child-fabrications-hair-makeup-pittsburgh/330fd549f6ce63ad.html" 
              rel="nofollow" 
              title="WeddingWire Couples' Choice Award Winner 2024"
            >
              <img 
                width="125" 
                height="125" 
                alt="Wild Child Fabrications" 
                id="wp-ratedWA-img-2024" 
                src="https://cdn1.weddingwire.com/img/badges/2024/badge-weddingawards_en_US.png"
                style={{ display: 'block' }}
              />
            </a>
          </div>
        </div>
        
        {/* WeddingWire 100 Reviews Badge */}
        <div style={{ 
          textAlign: 'center', 
          marginBottom: '2rem',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          width: '100%',
          minHeight: '100px'
        }}>
          <a 
            ref={badgeRef}
            target="_blank" 
            id="wp-rated-img" 
            rel="nofollow" 
            href="https://www.weddingwire.com/biz/wild-child-fabrications-hair-makeup-pittsburgh/330fd549f6ce63ad.html" 
            title="Reviewed on WeddingWire"
            style={{ display: 'inline-block' }}
          >
            <span id="wp-rated-reviews"></span>
          </a>
        </div>

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

        {/* The Knot Button */}
        <div style={{ 
          textAlign: 'center', 
          marginTop: '2rem',
          marginBottom: '2rem',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          width: '100%'
        }}>
          <a 
            target="_blank" 
            href="https://www.theknot.com/marketplace/redirect-1015003?utm_source=vendor_website&utm_medium=banner&utm_term=1807ee0f-02b7-488f-bcdd-a6ce00dbff78&utm_campaign=vendor_badge_assets"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '1rem',
              padding: '1rem 1.5rem',
              border: '2px solid #ff44cb',
              borderRadius: '8px',
              textDecoration: 'none',
              color: '#000',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#fff5fc';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <img 
              alt="TheKnot.com" 
              border="0" 
              height="75" 
              src="https://d13ns7kbjmbjip.cloudfront.net/For_Your_Website/TK-icon_circle_large.png" 
              width="75"
              style={{ display: 'block' }}
            />
            <span style={{ fontSize: '1.1rem', fontWeight: '500' }}>
              Wild Child Fabrications on The Knot
            </span>
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

export default BridalAtlanta;

