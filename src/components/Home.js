import React from 'react';
import Gallery from './Gallery';

const Home = () => {
  return (
    <div className="page-container">
      <div className="hero-section">
        <h1 className="page-title">HAIR + MAKEUP ARTISTRY</h1>
        <p className="intro-text">
          Luxury beauty experiences with a wild, creative twist. 
          From bridal elegance to avant-garde artistry.
        </p>
        <div style={{
          backgroundColor: '#fff3cd',
          border: '2px solid #ffc107',
          borderRadius: '8px',
          padding: '1.5rem',
          margin: '1.5rem 0',
          textAlign: 'center',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '80px'
        }}>
          <div style={{
            fontSize: '1.1rem',
            fontWeight: '600',
            color: '#856404',
            lineHeight: '1.6'
          }}>
            Proudly serving the following regions: Pittsburgh, D.C., West Virginia, and Atlanta
          </div>
        </div>
      </div>
      <Gallery />
    </div>
  );
};

export default Home;
