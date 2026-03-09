import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import BridalLayout from './BridalLayout';
import CTASection from './CTASection';
import lipsLogo from '../assets/wcf-lips-logo.png';

const BridalPittsburgh = () => {
  useEffect(() => {
    document.title = "Bridal Hair & Makeup in Pittsburgh, PA | Wild Child Fabrications";
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute('content', 'Professional bridal hair and makeup packages in Pittsburgh, PA. Wild Child Fabrications offers luxury beauty services for your wedding day. Book your bridal trial today!');
  }, []);

  return (
    <BridalLayout>
      <div className="page-container">
        <h1 className="page-title">Pittsburgh</h1>
        <p className="intro-text" style={{ marginBottom: '2rem' }}>
          Bridal hair and makeup packages for Pittsburgh and surrounding areas. View our <Link to="/bridal-services" className="contact-info-link">services breakdown</Link> for full details on what each package includes.
        </p>

        <div className="classes-grid">
          <div className="class-card">
            <div className="class-header">
              <h3 className="class-name class-name-with-logo">
              <img src={lipsLogo} alt="" className="lips-logo-bullet" />
              Bride Only
            </h3>
              <div className="class-price">$1,100</div>
            </div>
            <ul className="styled-list class-card-list">
              <li>Bridal Hair + Makeup — customized, climate-adaptive, 12+ hour tear-proof and humidity-resistant wear</li>
              <li>Body Glow on shoulders and collarbone</li>
              <li>Custom fit event eyelashes to enhance your eye shape and desired look</li>
              <li>Lip touch-up kit on the wedding day</li>
              <li>Final Polish — detail check and touch-up before the artist departs</li>
              <li>Gratuity included</li>
              <li>Bridal Preview at artist’s location — up to 2 looks</li>
              <li>Booking fee — admin and organized, timely communication</li>
              <li>PDF Beauty Guide — prep guide for booked clients</li>
              <li>Smooth, guided process from inquiry to final looks</li>
            </ul>
          </div>

          <div className="class-card">
            <div className="class-header">
              <h3 className="class-name class-name-with-logo">
              <img src={lipsLogo} alt="" className="lips-logo-bullet" />
              Bride + 3 Guests: Hair + Makeup
            </h3>
              <div className="class-price">$2,000</div>
            </div>
            <ul className="styled-list class-card-list">
              <li>Bridal Hair + Makeup — customized, climate-adaptive, longwear</li>
              <li>Up to 3 additional guests hair + makeup — customized, longwear &amp; durable</li>
              <li>Custom fit event eyelashes for each guest</li>
              <li>Lip touch-up kit on the wedding day for each guest</li>
              <li>Final Polish — detail check and touch-up before the artist departs</li>
              <li>Gratuity included</li>
              <li>Bridal Preview at artist’s location — up to 2 looks</li>
              <li>Booking fee</li>
              <li>Smooth, guided process from inquiry to final looks</li>
              <li>PDF Beauty Guide for booked clients</li>
            </ul>
          </div>

          <div className="class-card">
            <div className="class-header">
              <h3 className="class-name class-name-with-logo">
              <img src={lipsLogo} alt="" className="lips-logo-bullet" />
              Bride + 7 — Hair Only
            </h3>
              <div className="class-price">$2,000</div>
            </div>
            <ul className="styled-list class-card-list">
              <li>Bride hair styling — customized, climate-adaptive, 12+ hour durable wear</li>
              <li>Up to 7 guests hair styling — customized for extended wear</li>
              <li>Final Polish — detail check and touch-up before the artist departs</li>
              <li>Gratuity included</li>
              <li>Bridal Preview at artist’s location — up to 2 looks</li>
              <li>Booking fee</li>
              <li>Smooth, guided process from inquiry to final looks</li>
              <li>PDF Beauty Guide for booked clients</li>
            </ul>
          </div>

          <div className="class-card">
            <div className="class-header">
              <h3 className="class-name class-name-with-logo">
              <img src={lipsLogo} alt="" className="lips-logo-bullet" />
              Bride + 7 — Makeup Only
            </h3>
              <div className="class-price">$2,000</div>
            </div>
            <ul className="styled-list class-card-list">
              <li>Bridal makeup — curated, long-wear application for heat, humidity &amp; tears</li>
              <li>Up to 7 guests makeup — customized, longwear &amp; durable application</li>
              <li>Custom fit event eyelashes for each guest</li>
              <li>Lip touch-up kit on the wedding day for each guest</li>
              <li>Gratuity included</li>
              <li>Bridal Preview at artist’s location — up to 2 looks</li>
              <li>Booking fee</li>
              <li>Smooth, guided process from inquiry to final looks</li>
              <li>PDF Beauty Guide for booked clients</li>
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
              <li>Skin / blemish touchup — customize skin prep + light long-wear application, brow/facial hair pomade &amp; styling (style only — no cut/shave) — $50</li>
              <li>Hair styling (short) — polished &amp; ready for photos — $50</li>
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
              Age 3–9 only. Hair styling + blush, lip gloss &amp; glitter eyeshadow.
            </p>
          </div>
        </div>

        <section className="section-card" style={{ marginTop: '2rem' }}>
          <h2 className="section-title section-title-bridal">Additional Investments That May Apply</h2>
          <ul className="styled-list">
            <li>Travel &amp; parking fees will be applied based on your specific needs.</li>
            <li>Early start time fee may apply before 7:30 a.m. — $100.</li>
            <li>Additional stylists — $75 per stylist.</li>
            <li>Additional services — $175/service. Can be added into the package total up until 30 days before the wedding date, subject to availability.</li>
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

export default BridalPittsburgh;
