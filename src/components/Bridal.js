'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import weddingWireProfile from '../assets/wedding-wire-profile.jpg';
import CTASection from './CTASection';
import RegionsNotice from './RegionsNotice';

const Bridal = ({ bridal, regionsNotice }) => {
  const { overview } = bridal;
  const [isExpanded, setIsExpanded] = useState(false);
  const [isExpanded2, setIsExpanded2] = useState(false);
  const [isExpanded3, setIsExpanded3] = useState(false);
  const badgeRef = useRef(null);

  useEffect(() => {
    let script = document.querySelector('script[src*="wp-rated.js"]');
    if (!script) {
      script = document.createElement('script');
      script.src = 'https://cdn1.weddingwire.com/_js/wp-rated.js?v=4';
      script.async = true;
      document.body.appendChild(script);
    }

    const initBadge = () => {
      if (badgeRef.current && window.wpShowRatedWW) {
        window.wpShowRatedWW('986013');
      }
      if (window.wpShowRatedWAv3) {
        ['2018', '2019', '2020', '2021', '2022', '2023', '2024', '2026'].forEach((year) => {
          window.wpShowRatedWAv3('986013', year);
        });
      }
    };

    if (window.wpShowRatedWW && window.wpShowRatedWAv3) {
      initBadge();
    } else {
      script.onload = () => setTimeout(initBadge, 200);
    }
    const timeoutId = setTimeout(initBadge, 500);
    return () => clearTimeout(timeoutId);
  }, []);

  return (
    <div className="page-container">
      <h1 className="page-title">{overview.pageHeader}</h1>

      <div className="bridal-pricing-cta">
        <p className="bridal-pricing-cta-title">{overview.pricingCtaTitle}</p>
        <p className="bridal-pricing-cta-sub">{overview.pricingCtaSub}</p>
        <div className="bridal-pricing-cta-actions">
          <Link href="/bridal-hair-makeup-pittsburgh" className="bridal-pricing-cta-btn">
            {overview.pittsburghButtonLabel}
          </Link>
          <Link href="/bridal-hair-makeup-atlanta-new-orleans" className="bridal-pricing-cta-btn">
            {overview.atlantaButtonLabel}
          </Link>
        </div>
      </div>

      <div className="bridal-lead-content">
        {overview.leadParagraphs.map((text, index) => (
          <p key={index} className="body-text">{text}</p>
        ))}
      </div>

      <RegionsNotice text={regionsNotice} variant="bridal" />

      <div className="reviews-section">
        <h2 className="section-title section-title-bridal">What Our Brides Say</h2>

        <div style={{ textAlign: 'center', marginBottom: '2rem', display: 'flex', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', width: '100%' }}>
          {['2018', '2019', '2020', '2021', '2022', '2023', '2024', '2026'].map((year) => (
            <div key={year} id="wp-ratedWA">
              <a target="_blank" href="https://www.weddingwire.com/biz/wild-child-fabrications-hair-makeup-pittsburgh/330fd549f6ce63ad.html" rel="nofollow noopener noreferrer" title={`WeddingWire Couples' Choice Award Winner ${year}`}>
                <img width="125" height="125" alt={`Wild Child Fabrications, WeddingWire Award ${year}`} id={`wp-ratedWA-img-${year}`} src={`https://cdn1.weddingwire.com/img/badges/${year}/badge-weddingawards_en_US.png`} style={{ display: 'block' }} />
              </a>
            </div>
          ))}
        </div>

        <div style={{ textAlign: 'center', marginBottom: '2rem', display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', minHeight: '100px' }}>
          <a ref={badgeRef} target="_blank" id="wp-rated-img" rel="nofollow noopener noreferrer" href="https://www.weddingwire.com/biz/wild-child-fabrications-hair-makeup-pittsburgh/330fd549f6ce63ad.html" title="Reviewed on WeddingWire" style={{ display: 'inline-block' }}>
            <span id="wp-rated-reviews"></span>
          </a>
        </div>

        <div className="wedding-wire-section">
          <a href="https://www.weddingwire.com/reviews/wild-child-fabrications-hair-makeup-pittsburgh/330fd549f6ce63ad.html" target="_blank" rel="noopener noreferrer" className="wedding-wire-button">
            <div className="wedding-wire-profile-image">
              <img src={weddingWireProfile.src} alt="Wedding Wire Profile" />
            </div>
            <div className="wedding-wire-content">
              <div className="wedding-wire-rating-row">
                <div className="wedding-wire-stars">
                  {[...Array(5)].map((_, i) => <span key={i} className="star">★</span>)}
                </div>
              </div>
              <div className="wedding-wire-company">Wild Child Fabrications</div>
              <div className="wedding-wire-platform">Over 100 five star ratings on Wedding Wire</div>
            </div>
            <div className="wedding-wire-inner-button">See Our Reviews</div>
          </a>
        </div>

        <div style={{ textAlign: 'center', marginTop: '2rem', marginBottom: '2rem', display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
          <a target="_blank" rel="noopener noreferrer" href="https://www.theknot.com/marketplace/redirect-1015003?utm_source=vendor_website&utm_medium=banner&utm_term=1807ee0f-02b7-488f-bcdd-a6ce00dbff78&utm_campaign=vendor_badge_assets" style={{ display: 'inline-flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.5rem', border: '2px solid #ff44cb', borderRadius: '8px', textDecoration: 'none', color: '#000', transition: 'all 0.3s ease' }}>
            <img alt="TheKnot.com" border="0" height="75" src="https://d13ns7kbjmbjip.cloudfront.net/For_Your_Website/TK-icon_circle_large.png" width="75" style={{ display: 'block' }} />
            <span style={{ fontSize: '1.1rem', fontWeight: '500' }}>Wild Child Fabrications on The Knot</span>
          </a>
        </div>

        <div className="testimonials-banner">
          {[
            {
              initial: 'J', name: 'Jenna', date: 'Sent on 07/28/2025',
              title: "Couldn't recommend Christalee enough",
              full: "Christalee was an absolute life saver. A month before my wedding my original hair and makeup company fell through. I was thankfully introduced to Christalee and she saved the day. The experience with her and her team couldn't have been better. Her communication was above and beyond and she genuinely made an extremely stressful situation such a breeze. She ensured I had a trial and was happy to change things up when I decided my original vision wasn't what I wanted. She was incredible to work with and made me feel beautiful on my wedding day. She and her team were so professional and made sure to take care of me and my wedding party. We were all so happy with their work and would absolutely recommend. The service was truly above expectations and I wish I would have found her sooner!",
              preview: "Christalee was an absolute life saver. A month before my wedding my original hair and makeup company fell through...",
              expanded: isExpanded, toggle: () => setIsExpanded((v) => !v),
            },
            {
              initial: 'B', name: 'Brittney', date: 'Sent on 06/16/2025',
              title: 'Hair & Makeup Goals Achieved! 😍',
              full: "I had such a great experience working with Christalee! She was amazing in every aspect professional, kind, and incredibly talented. She really listened to what I wanted and made me feel so comfortable throughout the whole process. On my wedding day, the hair and makeup turned out even better than I imagined. It lasted all day and looked flawless in photos. I felt so beautiful and confident thanks to her. Highly recommend!",
              preview: "I had such a great experience working with Christalee! She was amazing in every aspect professional, kind, and incredibly talented...",
              expanded: isExpanded2, toggle: () => setIsExpanded2((v) => !v),
            },
            {
              initial: 'C', name: 'Christiana', date: 'Sent on 06/15/2025',
              title: 'Perfect Wedding Partner',
              full: "From our first calls thru the end of our reception, I could not be happier with how awesome Wildchild was for my wedding party and I. She was affordable and extremely knowledgeable of the best way to achieve the classic look I was going for. Not only did she deliver with both hair and makeup, but she still gave my other wedding party members a great look that followed my desired aesthetic with their own personal style. All of us looked amazing till the very end of our wonderful day. I cannot recommend her more.",
              preview: "From our first calls thru the end of our reception, I could not be happier with how awesome Wildchild was for my wedding party and I...",
              expanded: isExpanded3, toggle: () => setIsExpanded3((v) => !v),
            },
          ].map((t) => (
            <div key={t.name} className="testimonial-card">
              <div className="testimonial-header">
                <div className="testimonial-avatar"><span className="testimonial-initial">{t.initial}</span></div>
                <div className="testimonial-info">
                  <div className="testimonial-name">{t.name}</div>
                  <div className="testimonial-date">{t.date}</div>
                </div>
              </div>
              <div className="testimonial-rating">
                <div className="testimonial-stars">{[...Array(5)].map((_, i) => <span key={i} className="star">★</span>)}</div>
                <span className="testimonial-rating-number">5.0</span>
              </div>
              <h3 className="testimonial-title">{t.title}</h3>
              <div className="testimonial-text">
                <p>{t.expanded ? t.full : t.preview}</p>
                <button className="testimonial-more-btn" onClick={t.toggle}>
                  {t.expanded ? 'Show less' : 'more'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <CTASection
        title="Ready to book your bridal hair and makeup?"
        subtitle="Get in touch to reserve your date"
        buttonText="Contact us"
      />
    </div>
  );
};

export default Bridal;
