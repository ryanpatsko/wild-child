import React from 'react';
import fx1 from '../assets/gallery-fx/fx-1.jpg';
import fx6 from '../assets/gallery-fx/fx-6.jpg';
import fx3 from '../assets/gallery-fx/fx-3.jpg';
import fx4 from '../assets/gallery-fx/fx-4.jpg';
import fx5 from '../assets/gallery-fx/fx-5.jpg';
import { usePagesContent } from '../hooks/usePagesContent';
import { useDocumentMeta } from '../hooks/useDocumentMeta';

const CreativeFX = () => {
  const { creativeFx } = usePagesContent();
  useDocumentMeta(creativeFx.documentTitle, creativeFx.metaDescription);

  return (
    <div className="page-container">
      <div className="page-header">
        <img src={fx1} alt="Page Banner - Creative & FX" className="page-header-image" />
      </div>
      <h1 className="page-title">{creativeFx.pageTitle}</h1>
      <p className="intro-text">{creativeFx.introText}</p>

      <section className="section-card">
        <h2 className="section-title section-title-creative">{creativeFx.servicesTitle}</h2>
        <ul className="styled-list">
          {creativeFx.serviceItems.map((item, i) => (
            <li key={i} dangerouslySetInnerHTML={{ __html: item }} />
          ))}
        </ul>
      </section>

      <div className="fx-images-row">
        <div className="fx-image-container">
          <img src={fx4} alt="Creative FX Work 4" className="fx-image" />
        </div>
        <div className="fx-image-container">
          <img src={fx5} alt="Creative FX Work 5" className="fx-image" />
        </div>
      </div>

      <section className="section-card">
        <h2 className="section-title section-title-creative">{creativeFx.pricingTitle}</h2>
        <ul className="styled-list">
          {creativeFx.pricingItems.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="section-card">
        <h2 className="section-title section-title-creative">{creativeFx.bookingTitle}</h2>
        {creativeFx.bookingParagraphs.map((para, i) => (
          <p key={i} className="body-text">
            {para}
          </p>
        ))}
      </section>

      <div className="fx-images-row">
        <div className="fx-image-container">
          <img src={fx6} alt="Creative FX Work 6" className="fx-image" />
        </div>
        <div className="fx-image-container">
          <img src={fx3} alt="Creative FX Work 3" className="fx-image" />
        </div>
      </div>
    </div>
  );
};

export default CreativeFX;
