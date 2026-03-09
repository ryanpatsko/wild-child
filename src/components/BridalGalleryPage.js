import React from 'react';
import BridalLayout from './BridalLayout';
import BridalGallery from './BridalGallery';
import CTASection from './CTASection';

const INSTAGRAM_URL = 'https://www.instagram.com/wildchildfabrications/';

const BridalGalleryPage = () => {
  return (
    <BridalLayout>
      <div className="page-container">
        <h1 className="page-title">Bridal Gallery</h1>
        <p className="gallery-instagram-note">
          Many more pictures available on our{' '}
          <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer">
            Instagram page
          </a>
          .
        </p>
        <div className="gallery-section">
          <BridalGallery />
        </div>
        <CTASection
          title="Ready to book your bridal hair and makeup?"
          subtitle="Get in touch to reserve your date"
          buttonText="Contact us"
        />
      </div>
    </BridalLayout>
  );
};

export default BridalGalleryPage;
