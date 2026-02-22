import React from 'react';
import pageBanner from '../assets/page-headers/tan-swabs-pink-bg.png';
import CTASection from './CTASection';

const BridalServicesBrochure = () => {
  return (
    <div className="page-container">
      <div className="page-header">
        <img src={pageBanner} alt="Bridal hair and makeup services - Wild Child Fabrications" className="page-header-image" />
      </div>

      <header className="brochure-page-header">
        <h1 className="page-title">2026 Hair & Makeup Packages</h1>
        <p className="intro-text">
          Wild Child Fabrications bridal hair and makeup services. View pricing, packages, and booking information below.
        </p>
        <a
          href="/2026-WCF-Hair-Makeup-Packages.pdf"
          target="_blank"
          rel="noopener noreferrer"
          className="brochure-button"
          style={{ marginTop: '0.5rem' }}
        >
          <span className="brochure-text">Download PDF</span>
          <svg className="brochure-pdf-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
            <path d="M8,12H10V14H8V12M8,16H10V18H8V16M12,12H16V14H12V12M12,16H16V18H12V16Z" />
          </svg>
        </a>
      </header>

      <article className="brochure-article">
        <section className="section-card brochure-section-card">
          <h2 className="section-title section-title-bridal">Bride Hair Styling</h2>
          <ul className="styled-list">
            <li><strong>Bride Hair</strong> — Shoulder blades or above: <strong>$150</strong> (Blowout <strong>$175</strong>)</li>
            <li><strong>Bride Hair XL</strong> — Shoulder blade to mid back: <strong>$175</strong> (Blowout <strong>$200</strong>)</li>
            <li><strong>Bride Hair XXL</strong> — Mid to low back or longer: <strong>$200</strong> (Blowout <strong>$225</strong>)</li>
          </ul>
        </section>

        <section className="section-card brochure-section-card">
          <h2 className="section-title section-title-bridal">Groom Hair Styling</h2>
          <ul className="styled-list">
            <li><strong>Above the ears length / short</strong> — <strong>$40</strong> (combing, pomade, fly aways, styling, anti-humidity spray)</li>
            <li><strong>Chin length to shoulders</strong> — <strong>$65</strong></li>
            <li><strong>Below shoulders or specialty style</strong> — Please inquire</li>
            <li><strong>Facial hair grooming add-on</strong> — <strong>$25</strong> (brow gel, mustache/beard comb, product as needed)</li>
          </ul>
          <p className="body-text" style={{ marginTop: '0.75rem', fontWeight: 600 }}>No cut or shave available — styling only.</p>
        </section>

        <section className="section-card brochure-section-card">
          <h2 className="section-title section-title-bridal">Bridal Party Hair Styling</h2>
          <ul className="styled-list">
            <li><strong>Above shoulder length</strong> — <strong>$100</strong> <em>(pixie cut to chin length)</em></li>
            <li><strong>Collarbone to shoulder blade</strong> — <strong>$125</strong> (Blowout <strong>$140</strong>)</li>
            <li><strong>XL — Shoulder blade to mid back</strong> — <strong>$150</strong> <em>(blowout not available)</em></li>
            <li><strong>XXL — Mid to low back or longer</strong> — <strong>$175</strong> <em>(blowout not available)</em></li>
            <li><strong>Flower Girl Hair</strong> — <strong>$50</strong> <em>(ages 3–8 only)</em></li>
            <li><strong>Jr. Bridesmaid Hair</strong> — <strong>$75</strong> <em>(ages 9–11; ages 12+ considered bridal party)</em></li>
          </ul>
          <p className="body-text" style={{ marginTop: '0.75rem' }}><em>Each length is booked with a specific amount of time planned in the timeline. Please book accordingly.</em></p>
        </section>

        <section className="section-card brochure-section-card">
          <h2 className="section-title section-title-bridal">Hair Style Booking Info</h2>
          <p className="body-text"><strong>For one stylist:</strong> We book up to six people total and require a five-hour time slot minimum. A service appointment schedule will be provided based on your requested number of services and hair lengths booked.</p>
          <p className="body-text"><strong>To book over 6 services:</strong> We can add styling time with the main artist or add additional stylists based on availability. Booking an additional stylist(s) is <strong>$75 add-on + travel</strong> per stylist.</p>
          <p className="body-text"><strong>Gratuity:</strong> A 20% included gratuity will be factored into pricing on contract.</p>
          <p className="body-text">Styling for bridal party members includes a consultation, proper tools and styling products, experience, education, and 14+ years in the industry. Our timing ensures you and your party are not rushed and get a Pinterest-worthy style.</p>
          <p className="body-text"><strong>Extensions:</strong> Placement of extensions on bride or any bridal party member is <strong>$25 + 20-minute service time</strong> add-on. Must be human hair; we cannot use heat tools on synthetic extensions.</p>
          <p className="body-text"><strong>Minimum:</strong> Four-person minimum required to book at base price. If under four services, an additional <strong>$25</strong> is added to each service.</p>
          <p className="body-text">Prices do not include travel fees or any applicable start time fees. Those are determined before contract in addition to styling fees listed above.</p>
        </section>

        <section className="section-card brochure-section-card">
          <h2 className="section-title section-title-bridal">Bridal Makeup Services</h2>
          <p className="body-text"><strong>Bride / Groom Makeup — $150</strong></p>
          <p className="body-text"><strong>Complimentary bridal service:</strong> When the bride or groom books a full-face makeup service with us, they receive a <strong>free</strong> 24-swatch color season palette analysis during their trial session.</p>
          <p className="body-text"><strong>Wedding day service includes:</strong> A consultation, custom skin prep, high-end makeup application + chest/collarbone glow, custom-fit event eyelashes, professional setting sprays, and a lip touch-up kit.</p>
          <p className="body-text"><em>Scar or tattoo cover is an additional investment + consultation needed. Base price does not include travel or early start time fee; 20% gratuity factored into final pricing.</em></p>
        </section>

        <section className="section-card brochure-section-card">
          <h2 className="section-title section-title-bridal">Guest Makeup Services</h2>
          <ul className="styled-list">
            <li><strong>Bridal party member or guest</strong> — <strong>$125</strong> (age 14+)</li>
            <li><strong>Junior makeup</strong> — <strong>$90</strong> (age 10–13) <em>Does not include lashes</em></li>
            <li><strong>Men's touch-up</strong> — <strong>$50</strong> (blemishes + skin prep only)</li>
            <li><strong>Flower girl</strong> — Complimentary blush + gloss (age 3–9)</li>
          </ul>
          <p className="body-text">Guest makeup includes a consultation, custom skin prep, makeup application, custom-fit event eyelashes, professional setting sprays, and a lip touch-up kit per person.</p>
          <p className="body-text"><strong>Trial option:</strong> Open to anyone; pricing and session length same as bridal trials. Complimentary bridal color analysis not included but can be added for an additional investment.</p>
          <p className="body-text"><strong>Four-person minimum</strong> or $25 added per service for peak Saturdays. Base price does not include travel or early start fee. 20% gratuity factored into final pricing.</p>
        </section>

        <section className="section-card brochure-section-card">
          <h2 className="section-title section-title-bridal">Bride Only + Elopements</h2>
          <p className="body-text"><strong>Saturdays (Feb–Nov):</strong> One service only <strong>$450 + travel</strong>; Hair + Makeup <strong>$550 + travel</strong></p>
          <p className="body-text"><strong>Friday / Sunday / Weekday:</strong> One service only <strong>$325 + travel</strong>; Hair + Makeup <strong>$400 + travel</strong></p>
          <p className="body-text"><em>Please see travel notes below. Trials available day before with artist availability. Booking fee + retainer apply.</em></p>
        </section>

        <section className="section-card brochure-section-card">
          <h2 className="section-title section-title-bridal">LGBTQIA+ Friendly</h2>
          <p className="body-text">Our company is and always will be extremely LGBTQIA+ friendly. For weddings featuring two full bridal parties, we're pleased to offer exclusive discounts that may be available based on the total number of services booked — please inquire for details.</p>
        </section>

        <section className="section-card brochure-section-card">
          <h2 className="section-title section-title-bridal">General Booking Info</h2>
          <p className="body-text"><strong>Additional artists:</strong> We do not book an additional artist with less than eight total services. If your day-of timing requires it, we may be able to accommodate.</p>
          <p className="body-text"><strong>Travel / accommodations:</strong> We're happy to cross county lines. Weddings requiring artist travel over 1.5 hours require accommodations for artists the night before, booked with the wedding party block at the same venue.</p>
          <p className="body-text"><strong>Travel + parking:</strong> Booked based on your location. Valet parking charged to client at all downtown locations.</p>
          <p className="body-text">We do not require you to book both hair and makeup, although we highly welcome it. <strong>Early start time fee of $100 applies if before 7:30 a.m.</strong> A customized service timeline will be provided.</p>
          <p className="body-text"><strong>Booking fee:</strong> A <strong>$75</strong> one-time booking fee is required at contract return (does not come off your balance; covers in-office coordination and communication).</p>
          <p className="body-text"><strong>Retainer:</strong> A <strong>$100</strong> retainer is due at contract return and does come off your final balance.</p>
          <p className="body-text"><strong>Gratuity:</strong> 20% factored into pricing upon booking and reflected in contract.</p>
          <p className="body-text"><strong>Trials:</strong> Not required but highly encouraged. Scheduled on weekdays based on artist availability. <strong>$150 per service, 1 hour</strong>, due day of ($300 / 2–2.5 hours for both hair + makeup).</p>
          <p className="body-text">Contract, retainer, and booking fee must be received within <strong>7 days</strong> to hold your date. We accept <strong>Venmo only</strong> for retainer and booking.</p>
        </section>
      </article>

      <CTASection
        title="Ready to book your bridal hair and makeup?"
        subtitle="Get in touch to reserve your date"
        buttonText="Contact Us to Book"
      />
    </div>
  );
};

export default BridalServicesBrochure;
