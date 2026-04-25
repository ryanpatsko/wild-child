import pageBanner from '../assets/page-headers/makeup-brush.png';
import CTASection from './CTASection';

const BeautyEvents = ({ beauty }) => {
  return (
    <div className="page-container">
      <div className="page-header">
        <img src={pageBanner.src} alt="Page Banner - Beauty Events" className="page-header-image" />
      </div>
      <h1 className="page-title">{beauty.pageTitle}</h1>
      <p className="intro-text">{beauty.introText}</p>

      <section className="section-card">
        <h2 className="section-title section-title-beauty">{beauty.hairSectionTitle}</h2>
        <ul className="styled-list">
          {beauty.hairItems.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="section-card">
        <h2 className="section-title section-title-beauty">{beauty.locationSectionTitle}</h2>
        <ul className="styled-list">
          {beauty.locationItems.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="section-card">
        <h2 className="section-title section-title-beauty">{beauty.ratesSectionTitle}</h2>
        <table className="styled-table">
          <thead>
            <tr>
              <th>Service</th>
              <th>Price</th>
            </tr>
          </thead>
          <tbody>
            {beauty.ratesTable.map((row, i) => (
              <tr key={i}>
                <td>{row.service}</td>
                <td>{row.price}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <ul className="styled-list">
          {beauty.ratesNotes.map((note, i) => (
            <li key={i} dangerouslySetInnerHTML={{ __html: note }} />
          ))}
        </ul>
      </section>

      <CTASection
        title={beauty.cta.title}
        subtitle={beauty.cta.subtitle}
        buttonText={beauty.cta.buttonText}
      />
    </div>
  );
};

export default BeautyEvents;
