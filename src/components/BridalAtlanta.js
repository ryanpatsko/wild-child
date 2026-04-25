import Link from 'next/link';
import lipsLogo from '../assets/wcf-lips-logo.png';
import CTASection from './CTASection';

const BridalAtlanta = ({ r }) => {
  return (
    <div className="page-container">
      <h1 className="page-title">{r.pageHeader}</h1>
      <p className="intro-text" style={{ marginBottom: '2rem' }}>
        {r.introBeforeLink}
        <Link href="/bridal-services" className="contact-info-link">{r.servicesLinkText}</Link>
        {r.introAfterLink}
      </p>

      <div className="classes-grid">
        {r.packages.map((pkg, index) => (
          <div key={index} className="class-card">
            <div className="class-header">
              <h3 className="class-name class-name-with-logo">
                <img src={lipsLogo.src} alt="" className="lips-logo-bullet" />
                {pkg.title}
              </h3>
              <div className="class-price">{pkg.price}</div>
            </div>
            {pkg.items && pkg.items.length > 0 ? (
              <ul className="styled-list class-card-list">
                {pkg.items.map((item, li) => <li key={li}>{item}</li>)}
              </ul>
            ) : null}
            {pkg.detailText ? (
              <p className="class-details" style={{ marginTop: '0.5rem', marginBottom: 0, fontSize: '0.95rem' }}>
                {pkg.detailText}
              </p>
            ) : null}
          </div>
        ))}
      </div>

      <section className="section-card" style={{ marginTop: '2rem' }}>
        <h2 className="section-title section-title-bridal">{r.additionalSectionTitle}</h2>
        <ul className="styled-list">
          {r.additionalBullets.map((line, i) => <li key={i}>{line}</li>)}
        </ul>
      </section>

      <CTASection title={r.cta.title} subtitle={r.cta.subtitle} buttonText={r.cta.buttonText} />
    </div>
  );
};

export default BridalAtlanta;
