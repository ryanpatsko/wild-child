import Link from 'next/link';
import pageBanner from '../assets/page-headers/misc-makeup.png';
import CTASection from './CTASection';

function ClassCard({ card }) {
  const extended =
    (Array.isArray(card.includedItems) && card.includedItems.length > 0) ||
    (Array.isArray(card.pricingItems) && card.pricingItems.length > 0);

  return (
    <div className="class-card">
      <div className="class-header">
        <h3 className="class-name">{card.name}</h3>
        <div className="class-price">{card.price}</div>
      </div>
      <div className="class-perfect-for">
        <strong>Perfect For:</strong> {card.perfectFor}
      </div>
      <div className="class-details">
        {extended ? (
          <>
            <strong>What&apos;s Included:</strong>
            <ul style={{ marginTop: '0.5rem', paddingLeft: '1.5rem' }}>
              {card.includedItems.map((li, i) => (
                <li key={i}>{li}</li>
              ))}
            </ul>
            <div style={{ marginTop: '1rem' }}>
              <strong>Pricing:</strong>
              <ul style={{ marginTop: '0.5rem', paddingLeft: '1.5rem' }}>
                {card.pricingItems.map((li, i) => (
                  <li key={i}>{li}</li>
                ))}
              </ul>
            </div>
            {card.additionalInfo ? (
              <div style={{ marginTop: '1rem', fontSize: '0.9rem', fontStyle: 'italic' }}>
                <strong>Additional Info:</strong> {card.additionalInfo}
              </div>
            ) : null}
            {card.learnMorePath && card.learnMoreLabel ? (
              <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                <Link href={card.learnMorePath} className="learn-more-btn">
                  {card.learnMoreLabel}
                </Link>
              </div>
            ) : null}
          </>
        ) : (
          <>
            <strong>Details:</strong> {card.details}
          </>
        )}
      </div>
    </div>
  );
}

const Classes = ({ classes: classesContent }) => {
  return (
    <div className="page-container">
      <div className="page-header">
        <img src={pageBanner.src} alt="Page Banner - Classes" className="page-header-image" />
      </div>
      <h1 className="page-title">{classesContent.pageTitle}</h1>
      <p className="intro-text">{classesContent.introText}</p>
      <div className="classes-grid">
        {classesContent.cards.map((card, idx) => (
          <ClassCard key={`${card.name}-${idx}`} card={card} />
        ))}
      </div>
      <p
        className="muted-text"
        style={{ textAlign: 'center', fontWeight: 500, marginTop: '2rem', marginBottom: '2rem' }}
      >
        {classesContent.hourlyAddOnNote}
      </p>
      <section className="section-card">
        <h2 className="section-title section-title-classes">{classesContent.logisticsTitle}</h2>
        <ul className="styled-list">
          {classesContent.logisticsItems.map((item, i) => (
            <li key={i} dangerouslySetInnerHTML={{ __html: item }} />
          ))}
        </ul>
      </section>
      <CTASection
        title={classesContent.cta.title}
        subtitle={classesContent.cta.subtitle}
        buttonText={classesContent.cta.buttonText}
      />
    </div>
  );
};

export default Classes;
