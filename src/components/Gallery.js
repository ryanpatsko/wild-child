import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import ImageGallery from 'react-image-gallery';
import 'react-image-gallery/styles/css/image-gallery.css';
import './Gallery.css';

const Gallery = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    // Dynamically import all images from the gallery-home folder
    const importGalleryImages = async () => {
      try {
        // Get all image files from the gallery-home folder
        const imageFiles = [
          '122491403_10220592792223139_3374943557985010405_n.jpg',
          'Screenshot_20241207-093429.png',
          'Screenshot_20241207-093455.png',
          'Screenshot_20241207-093846.png',
          'Screenshot_20241207-093933.png',
          'Screenshot_20241207-094049.png',
          'Screenshot_20241207-094111.png'
        ];

        const imagePromises = imageFiles.map(async (filename) => {
          try {
            const imageModule = await import(`../assets/gallery-home/${filename}`);
            return {
              original: imageModule.default,
              thumbnail: imageModule.default,
              originalAlt: `Gallery image - ${filename}`,
              thumbnailAlt: `Gallery thumbnail - ${filename}`,
              filename: filename
            };
          } catch (error) {
            console.warn(`Failed to load image: ${filename}`, error);
            return null;
          }
        });

        const loadedImages = (await Promise.all(imagePromises)).filter(Boolean);
        setImages(loadedImages);
        setLoading(false);
      } catch (error) {
        console.error('Error loading gallery images:', error);
        setLoading(false);
      }
    };

    importGalleryImages();
  }, []);

  const openModal = (index) => {
    setCurrentImageIndex(index);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  if (loading) {
    return (
      <div className="gallery-loading">
        <p>Loading gallery...</p>
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div className="gallery-empty">
        <p>No images found in gallery.</p>
      </div>
    );
  }

  return (
    <div className="gallery-wrapper">
      {/* Tiled Grid Layout */}
      <div className="gallery-grid">
        {images.map((image, index) => (
          <div
            key={index}
            className="gallery-grid-item"
            onClick={() => openModal(index)}
          >
            <img
              src={image.original}
              alt={image.originalAlt}
              className="gallery-grid-image"
            />
            <div className="gallery-grid-overlay">
              <div className="gallery-grid-icon">🔍</div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Gallery */}
      {isModalOpen && createPortal(
        <div className="gallery-modal" onClick={closeModal}>
          <div className="gallery-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="gallery-modal-close" onClick={closeModal}>
              ×
            </button>
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
              onImageLoad={() => console.log('Image loaded')}
              onSlide={(index) => console.log('Slide to index:', index)}
            />
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default Gallery;
