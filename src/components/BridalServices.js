import Link from 'next/link';
import CTASection from './CTASection';

function BodyParagraphHtml({ html }) {
  return <p className="body-text" dangerouslySetInnerHTML={{ __html: html }} />;
}

const BridalServices = ({ s }) => {
  return (
    <div className="page-container">
      <h1 className="page-title">{s.pageHeader}</h1>

      <div className="bridal-pricing-cta">
        <p className="bridal-pricing-cta-title">{s.pricingCtaTitle}</p>
        <p className="bridal-pricing-cta-sub">{s.pricingCtaSub}</p>
        <div className="bridal-pricing-cta-actions">
          <Link href="/bridal-hair-makeup-pittsburgh" className="bridal-pricing-cta-btn">
            {s.pittsburghButtonLabel}
          </Link>
          <Link href="/bridal-hair-makeup-atlanta-new-orleans" className="bridal-pricing-cta-btn">
            {s.atlantaButtonLabel}
          </Link>
        </div>
      </div>

      <p className="intro-text" style={{ textAlign: 'left', maxWidth: '700px', margin: '0 auto 2rem' }}>
        {s.introText}
      </p>

      <article className="brochure-article">
        {s.sections.map((section, si) => (
          <section key={si} className="section-card brochure-section-card">
            <h2 className="section-title section-title-bridal">{section.title}</h2>
            {section.paragraphs.map((html, pi) => (
              <BodyParagraphHtml key={pi} html={html} />
            ))}
          </section>
        ))}
      </article>

      <CTASection title={s.cta.title} subtitle={s.cta.subtitle} buttonText={s.cta.buttonText} />
    </div>
  );
};

export default BridalServices;
