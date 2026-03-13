import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import BridalLayout from './BridalLayout';
import CTASection from './CTASection';
import lipsLogo from '../assets/wcf-lips-logo.png';

const BridalAtlanta = () => {
  useEffect(() => {
    document.title = "Bridal Hair & Makeup in Atlanta, GA | Wild Child Fabrications";
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute('content', 'Bridal hair and makeup Atlanta, GA. Proudly serving Pittsburgh, Washington D.C., West Virginia, Atlanta, Tennessee, and New Orleans. Wedding makeup & hair packages. Book your bridal trial.');
  }, []);

  return (
    <BridalLayout>
      <div className="page-container">
        <h1 className="page-title">Atlanta</h1>
        <p className="intro-text" style={{ marginBottom: '2rem' }}>
          Bridal hair and makeup packages for Atlanta. View our <Link to="/bridal-services" className="contact-info-link">services breakdown</Link> for full details on what each package includes.
        </p>

        <div className="classes-grid">
          <div className="class-card">
            <div className="class-header">
              <h3 className="class-name class-name-with-logo">
              <img src={lipsLogo} alt="" className="lips-logo-bullet" />
              Bride Only
            </h3>
              <div className="class-price">$1,300</div>
            </div>
            <ul className="styled-list class-card-list">
              <li>Bridal Hair + Makeup — customized, climate-adaptive, 12+ hour tear-proof and humidity-resistant wear</li>
              <li>Up to four hours spent with the bride on wedding day (2 hours per service allotted)</li>
              <li>Wedding day travel — up to 40 miles from the artist’s location</li>
              <li>Custom fitted event eyelashes to enhance your eye shape and desired bridal look</li>
              <li>Lip touch-up kit on the wedding day</li>
              <li>Veil or accessory placement on wedding day</li>
              <li>Bridal Body Glow on collarbone &amp; shoulders</li>
              <li>Final Polish — detail check and touch-up before the artist departs</li>
              <li>Included gratuity</li>
              <li>Bridal Preview at artist’s location — up to 2 looks per service included</li>
              <li>Booking fee — admin and organized, timely communication</li>
              <li>Smooth, guided process from first inquiry to last look</li>
              <li>Beauty Guide — prep guide for secured clients</li>
            </ul>
          </div>

          <div className="class-card">
            <div className="class-header">
              <h3 className="class-name class-name-with-logo">
              <img src={lipsLogo} alt="" className="lips-logo-bullet" />
              Bride + 3 — Hair + Makeup
            </h3>
              <div className="class-price">$2,200</div>
            </div>
            <ul className="styled-list class-card-list">
              <li>Bridal Hair + Makeup — customized, climate-adaptive, longwear</li>
              <li>Up to 6 additional individual hair or makeup services — customized, longwear &amp; durable</li>
              <li>Custom fitted event eyelashes for each guest receiving makeup</li>
              <li>Lip touch-up kit for bride + all guests receiving makeup</li>
              <li>Bridal Body Glow on chest &amp; shoulders for bride</li>
              <li>Veil or accessory placement for bride</li>
              <li>Final Polish — detail check and touch-up before the artist departs</li>
              <li>Included gratuity</li>
              <li>Wedding day travel up to 40 miles from artist’s location (80 miles RT)</li>
              <li>Bride Hair + Makeup Preview at artist’s location — up to 2 looks per service</li>
              <li>Booking fee</li>
              <li>Smooth, guided process designed to keep you stress-free</li>
              <li>Beauty Guide for secured clients</li>
            </ul>
          </div>

          <div className="class-card">
            <div className="class-header">
              <h3 className="class-name class-name-with-logo">
              <img src={lipsLogo} alt="" className="lips-logo-bullet" />
              Bride + 7 — Hair Only
            </h3>
              <div className="class-price">$2,100</div>
            </div>
            <ul className="styled-list class-card-list">
              <li>Bride hair styling — customized, climate-adaptive, 12+ hour durable wear</li>
              <li>Up to 7 guests hair styling — customized for extended wear</li>
              <li>Wedding day travel up to 40 mi (80 RT) from artist’s location</li>
              <li>Veil or accessory placement on wedding day</li>
              <li>Bridal Hair Preview at artist’s location — up to 2 looks per service</li>
              <li>Final Polish — detail check and touch-up before the artist departs</li>
              <li>Included gratuity</li>
              <li>Smooth, guided process designed to keep you stress-free</li>
              <li>Booking fee</li>
              <li>Beauty Guide for secured clients</li>
            </ul>
          </div>

          <div className="class-card">
            <div className="class-header">
              <h3 className="class-name class-name-with-logo">
              <img src={lipsLogo} alt="" className="lips-logo-bullet" />
              Bride + 7 — Makeup Only
            </h3>
              <div className="class-price">$2,100</div>
            </div>
            <ul className="styled-list class-card-list">
              <li>Bridal makeup — curated, long-wear application for heat, humidity &amp; tears</li>
              <li>Up to 7 additional attendants makeup — customized, longwear &amp; durable</li>
              <li>Bridal Body Glow on shoulders &amp; chest</li>
              <li>Custom fitted event eyelashes for each guest receiving makeup</li>
              <li>Lip touch-up kit for bride + all guests receiving makeup</li>
              <li>Wedding day travel up to 40 mi from artist’s location (80 miles RT)</li>
              <li>Final Polish — detail check and touch-up before the artist departs</li>
              <li>Included gratuity</li>
              <li>Bridal Makeup Preview at artist’s location — up to 2 looks included</li>
              <li>Smooth, guided process designed to keep you stress-free</li>
              <li>Booking fee</li>
              <li>Beauty Guide for secured clients</li>
            </ul>
          </div>

          <div className="class-card">
            <div className="class-header">
              <h3 className="class-name class-name-with-logo">
              <img src={lipsLogo} alt="" className="lips-logo-bullet" />
              Groom / Male Presenting Touchups
            </h3>
              <div className="class-price">Add-on</div>
            </div>
            <ul className="styled-list class-card-list">
              <li>Skin / blemish touchup — skin prep + light long-wear application, brow/facial hair pomade &amp; styling (style only — no cut/shave) — $50</li>
              <li>Hair styling (short style) — polished &amp; ready for photos — $50</li>
              <li>Hair styling (below chin) — polished &amp; ready for photos — $65</li>
            </ul>
          </div>

          <div className="class-card">
            <div className="class-header">
              <h3 className="class-name class-name-with-logo">
              <img src={lipsLogo} alt="" className="lips-logo-bullet" />
              Flower Girl Experience — Add-on
            </h3>
              <div className="class-price">$60</div>
            </div>
            <p className="class-details" style={{ marginTop: '0.5rem', marginBottom: 0, fontSize: '0.95rem' }}>
              Ages 3–9 only. Hair styling + blush, lip gloss &amp; glitter eyeshadow.
            </p>
          </div>
        </div>

        <section className="section-card" style={{ marginTop: '2rem' }}>
          <h2 className="section-title section-title-bridal">Additional Investments That May Apply</h2>
          <ul className="styled-list">
            <li>Early start time fee may apply before 7:00 a.m. — $100.</li>
            <li>Additional services can be added at artist availability — $175/service.</li>
            <li>Mileage over 40 miles (80 RT) — $1/mile.</li>
            <li>Hair longer than mid back or clip-in extensions placed — additional $25 + 20 minutes added to style time.</li>
            <li>Additional stylists — $150 per stylist (includes their travel up to 30 miles).</li>
          </ul>
        </section>

        <CTASection
          title="Ready to book your bridal hair and makeup?"
          subtitle="Get in touch to reserve your date"
          buttonText="Contact us"
        />
      </div>
    </BridalLayout>
  );
};

export default BridalAtlanta;
