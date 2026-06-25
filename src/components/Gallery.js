'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import ImageGallery from 'react-image-gallery';
import 'react-image-gallery/styles/css/image-gallery.css';
import {
  createDefaultGalleryHomeContent,
  galleryHomeImageUrl,
  loadGalleryHomeContent,
} from '../content/galleryHomeContent';
import './Gallery.css';

const FALLBACK_IMAGE_FILES = [
  'home-1.jpg',
  'home-2.jpg',
  'home-3.jpg',
  'home-4.jpg',
  'home-5.jpg',
  'home-6.jpg',
];

async function loadBundledFallbackImages() {
  const imagePromises = FALLBACK_IMAGE_FILES.map(async (filename) => {
    try {
      const imageModule = await import(`../assets/gallery-home/${filename}`);
      return {
        original: imageModule.default.src,
        thumbnail: imageModule.default.src,
        originalAlt: `Gallery image - ${filename}`,
        thumbnailAlt: `Gallery thumbnail - ${filename}`,
        filename,
      };
    } catch {
      return null;
    }
  });
  return (await Promise.all(imagePromises)).filter(Boolean);
}

function manifestToGalleryItems(filenames) {
  return filenames.map((filename) => {
    const url = galleryHomeImageUrl(filename);
    return {
      original: url,
      thumbnail: url,
      originalAlt: `Gallery image - ${filename}`,
      thumbnailAlt: `Gallery thumbnail - ${filename}`,
      filename,
    };
  });
}

const Gallery = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const manifest = await loadGalleryHomeContent();
        if (cancelled) return;
        if (manifest.images.length > 0) {
          setImages(manifestToGalleryItems(manifest.images));
          setLoading(false);
          return;
        }
      } catch {
        /* fall through to bundled assets */
      }

      try {
        const bundled = await loadBundledFallbackImages();
        if (cancelled) return;
        if (bundled.length > 0) {
          setImages(bundled);
        } else {
          const def = createDefaultGalleryHomeContent();
          setImages(manifestToGalleryItems(def.images));
        }
      } catch {
        if (!cancelled) {
          const def = createDefaultGalleryHomeContent();
          setImages(manifestToGalleryItems(def.images));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const openModal = (index) => {
    setCurrentImageIndex(index);
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  if (loading) {
    return <div className="gallery-loading"><p>Loading gallery...</p></div>;
  }

  if (images.length === 0) {
    return <div className="gallery-empty"><p>No images found in gallery.</p></div>;
  }

  return (
    <div className="gallery-wrapper">
      <div className="gallery-grid">
        {images.map((image, index) => (
          <div key={image.filename ?? index} className="gallery-grid-item" onClick={() => openModal(index)}>
            <img src={image.original} alt={image.originalAlt} className="gallery-grid-image" />
            <div className="gallery-grid-overlay">
              <div className="gallery-grid-icon">🔍</div>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && createPortal(
        <div className="gallery-modal" onClick={closeModal}>
          <div className="gallery-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="gallery-modal-close" onClick={closeModal}>×</button>
            <ImageGallery
              items={images}
              startIndex={currentImageIndex}
              showThumbnails={true}
              showFullscreenButton={true}
              showPlayButton={false}
              showNav={true}
              autoPlay={false}
              slideInterval={3000}
              slideDuration={450}
              thumbnailPosition="bottom"
              useBrowserFullscreen={true}
              showIndex={true}
              indexSeparator=" of "
              lazyLoad={true}
            />
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default Gallery;
