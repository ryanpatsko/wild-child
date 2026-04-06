import React from 'react';
import lipsLogo from '../assets/wcf-lips-logo.png';
import { usePagesContent } from '../hooks/usePagesContent';
import { useDocumentMeta } from '../hooks/useDocumentMeta';

const FAQ = () => {
  const { faq } = usePagesContent();
  useDocumentMeta(faq.documentTitle, faq.metaDescription);

  return (
    <div className="page-container">
      <h1 className="page-title">{faq.pageTitle}</h1>
      <p className="intro-text">{faq.introText}</p>

      <section className="section-card">
        {faq.items.map((item, i) => (
          <div key={i} className="faq-item">
            <h3 className="feature-title-with-logo">
              <img src={lipsLogo} alt="Lips logo" className="lips-logo-bullet" />
              {item.question}
            </h3>
            <p
              className="faq-answer"
              dangerouslySetInnerHTML={{ __html: item.answerHtml }}
            />
          </div>
        ))}
      </section>
    </div>
  );
};

export default FAQ;
