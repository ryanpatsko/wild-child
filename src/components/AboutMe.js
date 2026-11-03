'use client';

import React, { useEffect, useState } from 'react';
import pinkHairspray from '../assets/pink-brand-hairspray.png';
import lipsLogo from '../assets/wcf-lips-logo.png';
import {
  galleryAboutImageUrl,
  loadGalleryAboutContent,
} from '../content/galleryAboutContent';

const FALLBACK_PHOTO = {
  src: pinkHairspray.src,
  alt: 'ChristaLee Lema - Professional Hair and Makeup Artist',
};

const AboutMe = ({ content }) => {
  const { pageHeader, mainText, listIntro, items } = content;
  const [photos, setPhotos] = useState([FALLBACK_PHOTO]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const manifest = await loadGalleryAboutContent();
        if (cancelled || manifest.images.length === 0) return;
        setPhotos(
          manifest.images.map((filename, index) => ({
            src: galleryAboutImageUrl(filename),
            alt:
              manifest.images.length === 1
                ? FALLBACK_PHOTO.alt
                : `ChristaLee Lema - photo ${index + 1}`,
          })),
        );
      } catch {
        /* Keep the bundled photo until the gallery manifest is available. */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="page-container">
      <h1 className="page-title">{pageHeader}</h1>
      <p className="intro-text">{mainText}</p>
      <p className="intro-text" style={{ marginTop: '1rem' }}>{listIntro}</p>

      <div className="about-layout">
        <div className="about-image-container">
          {photos.map((photo) => (
            <img key={photo.src} src={photo.src} alt={photo.alt} className="about-image" />
          ))}
        </div>
        <section className="section-card">
          {items.map((item, index) => (
            <div key={index} className="faq-item">
              <h3 className="feature-title-with-logo">
                <img src={lipsLogo.src} alt="" className="lips-logo-bullet" />
                {item.title}
              </h3>
              <p className="body-text">{item.body}</p>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
};

export default AboutMe;
