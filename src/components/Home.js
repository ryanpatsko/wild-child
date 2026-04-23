import React from 'react';
import Gallery from './Gallery';
import RegionsNotice from './RegionsNotice';
import { useLocationsContent } from '../hooks/useLocationsContent';
import { usePagesContent } from '../context/PagesContentContext';
import { useDocumentMeta } from '../hooks/useDocumentMeta';

const Home = () => {
  const { regionsNotice } = useLocationsContent();
  const { home } = usePagesContent();
  useDocumentMeta(home.documentTitle, home.metaDescription);

  return (
    <div className="page-container">
      <div className="hero-section">
        <h1 className="page-title">{home.pageTitle}</h1>
        <p className="intro-text">{home.introText}</p>
        <RegionsNotice text={regionsNotice} variant="home" />
      </div>
      <Gallery />
    </div>
  );
};

export default Home;
