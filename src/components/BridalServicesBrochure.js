import pageBanner from '../assets/page-headers/tan-swabs-pink-bg.png';
import CTASection from './CTASection';

const BridalServicesBrochure = () => {
  return (
    <div className="page-container">
      <div className="page-header">
        <img src={pageBanner.src} alt="Bridal hair and makeup services - Wild Child Fabrications" className="page-header-image" />
      </div>

      <header className="brochure-page-header">
        <h1 className="page-title">2026 Hair & Makeup Packages</h1>
        <p className="intro-text">
          Wild Child Fabrications bridal hair and makeup services. View pricing, packages, and booking information below.
        </p>
        <a href="/2026-WCF-Hair-Makeup-Packages.pdf" target="_blank" rel="noopener noreferrer" className="brochure-button" style={{ marginTop: '0.5rem' }}>
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
            <li><strong>Above the ears length / short</strong> — <strong>$40</strong></li>
            <li><strong>Chin length to shoulders</strong> — <strong>$65</strong></li>
            <li><strong>Below shoulders or specialty style</strong> — Please inquire</li>
            <li><strong>Facial hair grooming add-on</strong> — <strong>$25</strong></li>
          </ul>
          <p className="body-text" style={{ marginTop: '0.75rem', fontWeight: 600 }}>No cut or shave available — styling only.</p>
        </section>

        <section className="section-card brochure-section-card">
          <h2 className="section-title section-title-bridal">Bridal Party Hair Styling</h2>
          <ul className="styled-list">
            <li><strong>Above shoulder length</strong> — <strong>$100</strong></li>
            <li><strong>Collarbone to shoulder blade</strong> — <strong>$125</strong> (Blowout <strong>$140</strong>)</li>
            <li><strong>XL — Shoulder blade to mid back</strong> — <strong>$150</strong></li>
            <li><strong>XXL — Mid to low back or longer</strong> — <strong>$175</strong></li>
            <li><strong>Flower Girl Hair</strong> — <strong>$50</strong></li>
            <li><strong>Jr. Bridesmaid Hair</strong> — <strong>$75</strong></li>
          </ul>
        </section>

        <section className="section-card brochure-section-card">
          <h2 className="section-title section-title-bridal">Hair Style Booking Info</h2>
          <p className="body-text"><strong>For one stylist:</strong> We book up to six people total and require a five-hour time slot minimum.</p>
          <p className="body-text"><strong>To book over 6 services:</strong> Additional stylist add-on is <strong>$75 + travel</strong> per stylist.</p>
          <p className="body-text"><strong>Gratuity:</strong> A 20% included gratuity will be factored into pricing on contract.</p>
          <p className="body-text"><strong>Extensions:</strong> Placement of extensions is <strong>$25 + 20-minute service time</strong> add-on. Must be human hair.</p>
          <p className="body-text"><strong>Minimum:</strong> Four-person minimum required at base price. Under four services adds <strong>$25</strong> per service.</p>
        </section>

        <section className="section-card brochure-section-card">
          <h2 className="section-title section-title-bridal">Bridal Makeup Services</h2>
          <p className="body-text"><strong>Bride / Groom Makeup — $150</strong></p>
          <p className="body-text"><strong>Complimentary bridal service:</strong> Free 24-swatch color season palette analysis during trial session.</p>
          <p className="body-text"><strong>Wedding day service includes:</strong> Consultation, custom skin prep, high-end makeup application + chest/collarbone glow, custom-fit event eyelashes, professional setting sprays, and a lip touch-up kit.</p>
        </section>

        <section className="section-card brochure-section-card">
          <h2 className="section-title section-title-bridal">Guest Makeup Services</h2>
          <ul className="styled-list">
            <li><strong>Bridal party member or guest</strong> — <strong>$125</strong> (age 14+)</li>
            <li><strong>Junior makeup</strong> — <strong>$90</strong> (age 10–13)</li>
            <li><strong>Men&apos;s touch-up</strong> — <strong>$50</strong></li>
            <li><strong>Flower girl</strong> — Complimentary blush + gloss (age 3–9)</li>
          </ul>
        </section>

        <section className="section-card brochure-section-card">
          <h2 className="section-title section-title-bridal">Bride Only + Elopements</h2>
          <p className="body-text"><strong>Saturdays (Feb–Nov):</strong> One service only <strong>$450 + travel</strong>; Hair + Makeup <strong>$550 + travel</strong></p>
          <p className="body-text"><strong>Friday / Sunday / Weekday:</strong> One service only <strong>$325 + travel</strong>; Hair + Makeup <strong>$400 + travel</strong></p>
        </section>

        <section className="section-card brochure-section-card">
          <h2 className="section-title section-title-bridal">LGBTQIA+ Friendly</h2>
          <p className="body-text">Our company is and always will be extremely LGBTQIA+ friendly. Exclusive discounts may be available for weddings featuring two full bridal parties — please inquire.</p>
        </section>

        <section className="section-card brochure-section-card">
          <h2 className="section-title section-title-bridal">General Booking Info</h2>
          <p className="body-text"><strong>Travel / accommodations:</strong> Weddings requiring over 1.5 hours of travel require artist accommodations the night before.</p>
          <p className="body-text"><strong>Early start time fee of $100 applies if before 7:30 a.m.</strong></p>
          <p className="body-text"><strong>Booking fee:</strong> A <strong>$75</strong> one-time booking fee is required at contract return.</p>
          <p className="body-text"><strong>Retainer:</strong> A <strong>$100</strong> retainer is due at contract return and comes off your final balance.</p>
          <p className="body-text"><strong>Trials:</strong> Not required but highly encouraged. <strong>$150 per service, 1 hour</strong>, due day of.</p>
          <p className="body-text">Contract, retainer, and booking fee must be received within <strong>7 days</strong> to hold your date. We accept <strong>Venmo only</strong> for retainer and booking.</p>
        </section>
      </article>

      <CTASection
        title="Ready to book your bridal hair and makeup?"
        subtitle="Get in touch to reserve your date"
        buttonText="Contact us"
      />
    </div>
  );
};

export default BridalServicesBrochure;
