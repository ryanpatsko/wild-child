import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import weddingWireProfile from '../assets/wedding-wire-profile.jpg';
import BridalLayout from './BridalLayout';
import CTASection from './CTASection';

const Bridal = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isExpanded2, setIsExpanded2] = useState(false);
  const [isExpanded3, setIsExpanded3] = useState(false);
  const badgeRef = useRef(null);

  useEffect(() => {
    document.title = "Bridal Hair & Makeup | Pittsburgh, Atlanta, D.C. | Wild Child Fabrications";
    const desc =
      "Proudly serving Pittsburgh, Washington D.C., West Virginia, Atlanta, Tennessee, and New Orleans. Bridal hair and makeup, wedding beauty, luxury bridal trials. Book your date.";
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'description');
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', desc);
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
        window.wpShowRatedWAv3('986013', '2026');
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
    <BridalLayout>
      <div className="page-container">
        <h1 className="page-title">Bridal Services</h1>

        <div className="bridal-pricing-cta">
          <p className="bridal-pricing-cta-title">Packages & pricing</p>
          <p className="bridal-pricing-cta-sub">
            See current rates and what each package includes for your area.
          </p>
          <div className="bridal-pricing-cta-actions">
            <Link to="/bridal-pittsburgh" className="bridal-pricing-cta-btn">
              Pittsburgh
            </Link>
            <Link to="/bridal-atlanta" className="bridal-pricing-cta-btn">
              Atlanta
            </Link>
          </div>
        </div>

        <div className="bridal-lead-content">
          <p className="body-text">
            For the bride who values exceptional service and doesn't have time for uncertainty, we provide more than refined artistry — as a bridal specialist, we provide reassurance. From the moment you inquire with us, you'll experience prompt, thorough, and friendly communication. We're a company that anticipates your needs before you have to voice them. No chasing vendors or "what now?" — We'll make sure you're seamlessly guided through the entire experience while making it enjoyable along the way.
          </p>
          <p className="body-text">
            Your experience includes curated beauty services, a wedding preview to refine and perfect your look in advance, downloadable beauty guides to help you prep for your day, thoughtfully prepared touch-up kits for the day of your wedding, and more.
          </p>
          <p className="body-text">
            Our part is simple: to make this part of your wedding feel effortless, elevated, fun, and entirely handled — so you can focus on being present and enjoying your time.
          </p>
          <p className="body-text">
            When you book our company, you're not just reserving a date — you're securing a full-service experience that we're happy to be a part of.
          </p>
        </div>

        <div className="bridal-regions-notice">
          <div className="bridal-regions-notice-text">
            Proudly serving the following regions: Pittsburgh, Washington D.C., West Virginia, Atlanta, Tennessee, and New Orleans
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
              rel="nofollow noopener noreferrer" 
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
              rel="nofollow noopener noreferrer" 
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
              rel="nofollow noopener noreferrer" 
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
              rel="nofollow noopener noreferrer" 
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
              rel="nofollow noopener noreferrer" 
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
              rel="nofollow noopener noreferrer" 
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
              rel="nofollow noopener noreferrer" 
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
          <div id="wp-ratedWA">
            <a 
              target="_blank" 
              href="https://www.weddingwire.com/biz/wild-child-fabrications-hair-makeup-pittsburgh/330fd549f6ce63ad.html" 
              rel="nofollow noopener noreferrer" 
              title="WeddingWire Couples' Choice Award Winner 2026"
            >
              <img 
                width="125" 
                height="125" 
                alt="Wild Child Fabrications" 
                id="wp-ratedWA-img-2026" 
                src="https://cdn1.weddingwire.com/img/badges/2026/badge-weddingawards_en_US.png"
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
            rel="nofollow noopener noreferrer" 
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
            rel="noopener noreferrer"
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

      {/* Contact CTA Section */}
      <CTASection
        title="Ready to book your bridal hair and makeup?"
        subtitle="Get in touch to reserve your date"
        buttonText="Contact us"
      />
      </div>
    </BridalLayout>
  );
};

export default Bridal;
