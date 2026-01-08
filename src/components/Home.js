import React from 'react';
import Gallery from './Gallery';

const Home = () => {
  return (
    <div className="page-container">
      <div className="hero-section">
        <h1 className="page-title">HAIR + MAKEUP ARTISTRY</h1>
        <p className="intro-text">
          Luxury beauty services with a wild, creative twist. 
          From bridal elegance to avant-garde artistry.
        </p>
        <p style={{ fontStyle: 'italic', textAlign: 'center', fontSize: '1.2rem', marginTop: '0.5rem', marginBottom: '0.5rem' }}>Operating in Pittsburgh + Atlanta</p>
      </div>
      <Gallery />
    </div>
  );
};

export default Home;
