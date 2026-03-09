import React from 'react';
import BridalLayout from './BridalLayout';
import CTASection from './CTASection';

const BridalServices = () => {
  return (
    <BridalLayout>
      <div className="page-container">
        <h1 className="page-title">Services Breakdown</h1>
        <p className="intro-text" style={{ textAlign: 'left', maxWidth: '700px', margin: '0 auto 2rem' }}>
          What’s included in your bridal package and what may apply. View pricing by region in the sidebar (Pittsburgh or Atlanta).
        </p>

        <article className="brochure-article">
        <section className="section-card brochure-section-card">
          <h2 className="section-title section-title-bridal">Package Investment Details</h2>
          <p className="body-text"><strong>Hair and/or Makeup Services</strong> — Customized, climate-adaptive hair and makeup designed for 12+ hour, tear-proof, and humidity-resistant wear.</p>
          <p className="body-text"><strong>Body Glow</strong> — Shoulders and collarbone for the bride.</p>
          <p className="body-text"><strong>Custom-fit event eyelashes</strong> — To enhance your eye shape and desired look for all guests receiving a makeup service.</p>
          <p className="body-text"><strong>Personalized Beauty Timeline</strong> — For the wedding day based on your services.</p>
          <p className="body-text"><strong>Lip touch-up kit</strong> — For all guests receiving a makeup service on the wedding day.</p>
          <p className="body-text"><strong>Final Polish</strong> — Services conclude with a final detail check and touch-up before our artists depart.</p>
          <p className="body-text"><strong>Travel to your location</strong> — We travel on location for every wedding; some cities already include mileage within the package. See travel notes for your location.</p>
          <p className="body-text"><strong>Gratuity included</strong> — Built into our total so you have one less checklist item.</p>
          <p className="body-text"><strong>Bridal Preview</strong> — At our artist’s location, including up to two looks.</p>
          <p className="body-text"><strong>Booking fee</strong> — Covers all admin and keeps our communication organized and timely.</p>
          <p className="body-text"><strong>Exclusive Beauty Guide</strong> — A prep guide for booked clients to get the most out of your bridal beauty investment.</p>
          <p className="body-text"><strong>Smooth, guided process</strong> — From our booking coordinator, from first inquiry to your final looks.</p>
        </section>

        <section className="section-card brochure-section-card">
          <h2 className="section-title section-title-bridal">Adding Additional Hair or Makeup Services</h2>
          <p className="body-text">
            Additional services can be added to your package total as needed up until 30 days before the wedding date, subject to artist availability. Please inquire for your city’s rates. Services cannot be added on the day of the event.
          </p>
          <p className="body-text">
            Additional stylists can be added as needed — please inquire for your city’s rates.
          </p>
        </section>

        <section className="section-card brochure-section-card">
          <h2 className="section-title section-title-bridal">Travel Notes</h2>
          <p className="body-text"><strong>Georgia &amp; Tennessee:</strong> A set amount of travel is built into your packages; we’re happy to travel beyond that at $1/mile after 80 miles included.</p>
          <p className="body-text"><strong>Pittsburgh, West Virginia &amp; D.C.:</strong> Travel is billed separately to your needs at $1/mile, roundtrip, per artist.</p>
          <p className="body-text"><strong>New Orleans or destination:</strong> Travel is billed based on your specific needs.</p>
          <p className="body-text">Travel over two hours from any location we operate in may require day-before or day-of accommodations, billed to the client.</p>
        </section>

        <section className="section-card brochure-section-card">
          <h2 className="section-title section-title-bridal">Investments That May Apply</h2>
          <p className="body-text"><strong>Early start time fee of $100</strong> — Added to the final total for all services starting before 7:00 a.m.</p>
          <p className="body-text"><strong>Hourly fee</strong> — Applies for multiple events per day when an artist waits between service times.</p>
          <p className="body-text"><strong>Hourly fee</strong> — Applies for artists to stay on location for touch-ups beyond the final polish.</p>
        </section>
        </article>

        <CTASection
          title="Ready to book your bridal hair and makeup?"
          subtitle="Get in touch to reserve your date"
          buttonText="Contact us"
        />
      </div>
    </BridalLayout>
  );
};

export default BridalServices;
