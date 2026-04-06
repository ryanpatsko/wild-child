import React from 'react';
import pageBanner from '../assets/page-headers/curling-iron.png';
import { useMediaContent } from '../hooks/useMediaContent';

const Media = () => {
  const m = useMediaContent();

  return (
    <div className="page-container">
      <div className="page-header">
        <img src={pageBanner} alt="Page Banner - Media" className="page-header-image" />
      </div>
      <h1 className="page-title">{m.pageHeader}</h1>
      <p className="intro-text">{m.introText}</p>

      <section className="section-card">
        <h2 className="section-title section-title-media">{m.collaborativeTitle}</h2>
        <p className="body-text">{m.collaborativeBody}</p>
      </section>

      <section className="section-card">
        <h2 className="section-title section-title-media">{m.whyDifferentTitle}</h2>
        <div className="grid-auto">
          {m.whyDifferentPillars.map((pillar, index) => (
            <div key={index} className="content-card">
              <h3 className="accent-text">{pillar.title}</h3>
              <p className="body-text">{pillar.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section-card">
        <h2 className="section-title section-title-media">{m.ratesTitle}</h2>
        <p className="muted-text">{m.ratesNote}</p>
        <div className="grid-rates">
          {m.rates.map((rate, index) => (
            <div key={index} className="content-card">
              <h3>{rate.label}</h3>
              {rate.sublabel ? <p className="muted-text">{rate.sublabel}</p> : null}
              <p className="price-text">{rate.price}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section-card">
        <h2 className="section-title section-title-media">{m.clientsTitle}</h2>
        <div className="grid-clients">
          {m.clientGroups.map((group, index) => (
            <div key={index} className="content-card">
              <h3 className="accent-text">{group.title}</h3>
              <p className="body-text">{group.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section-card">
        <h2 className="section-title section-title-media">{m.selectedWorkTitle}</h2>
        <div className="content-card">
          <p className="body-text">{m.selectedWorkBody}</p>
        </div>
        <p className="muted-text">{m.selectedWorkFootnote}</p>
      </section>
    </div>
  );
};

export default Media;
