import React from 'react';
import Gallery from './Gallery';
import RegionsNotice from './RegionsNotice';
import { useLocationsContent } from '../hooks/useLocationsContent';

const Home = () => {
  const { regionsNotice } = useLocationsContent();

  return (
    <div className="page-container">
      <div className="hero-section">
        <h1 className="page-title">HAIR + MAKEUP ARTISTRY</h1>
        <p className="intro-text">
          Luxury beauty experiences with a wild, creative twist. 
          From bridal elegance to avant-garde artistry.
        </p>
        <RegionsNotice text={regionsNotice} variant="home" />
      </div>
      <Gallery />
    </div>
  );
};

export default Home;
