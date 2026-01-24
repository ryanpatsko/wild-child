import React from 'react';
import pageBanner from '../assets/page-headers/curling-iron.png';

const Media = () => {
  return (
    <div className="page-container">
      <div className="page-header">
        <img src={pageBanner} alt="Page Banner - Media" className="page-header-image" />
      </div>
      <h1 className="page-title">Makeup & Hair for Advertising & Media</h1>
      <p className="intro-text">
        Looking to make a lasting impression on screen? We create camera-ready hair and makeup that elevate talent for film, television, advertising, music videos, and other entertainment projects.
      </p>

      <section className="section-card">
        <h2 className="section-title section-title-media">Our Collaborative Process</h2>
        <p className="body-text">Every project starts with a personalized consultation. We'll explore your vision, learn your goals, and note any must-haves or no-gos. From there, we design a hair and makeup aesthetic that stays true to your brand and resonates on camera.</p>
      </section>

      <section className="section-card">
        <h2 className="section-title section-title-media">Why We're Different</h2>
        <div className="grid-auto">
          <div className="content-card">
            <h3 className="accent-text">Camera-Ready Results</h3>
            <p className="body-text">From polished natural beauty to bold transformations, we craft looks that translate flawlessly on screen.</p>
          </div>
          <div className="content-card">
            <h3 className="accent-text">Long-Wear Expertise</h3>
            <p className="body-text">Our products and techniques are chosen specifically for on-set durability, keeping talent fresh through long shooting days.</p>
          </div>
          <div className="content-card">
            <h3 className="accent-text">On-Set Support</h3>
            <p className="body-text">Need touch-ups during filming? We offer continuous, on-set service so every frame looks perfect.</p>
          </div>
        </div>
      </section>

      <section className="section-card">
        <h2 className="section-title section-title-media">Rates</h2>
        <p className="muted-text">All rates include kit rental. Travel fees may apply.</p>
        <div className="grid-rates">
          <div className="content-card">
            <h3>Full day</h3>
            <p className="muted-text">up to 10 hrs</p>
            <p className="price-text">Starting at $750</p>
          </div>
          <div className="content-card">
            <h3>Half day</h3>
            <p className="muted-text">up to 5 hrs</p>
            <p className="price-text">Starting at $475</p>
          </div>
        </div>
      </section>

      <section className="section-card">
        <h2 className="section-title section-title-media">Notable Talent & Clients</h2>
        <div className="grid-clients">
          <div className="content-card">
            <h3 className="accent-text">Athletes</h3>
            <p className="body-text">Pittsburgh Steelers: Cam Hayward, Chase Claypool, Bud Dupree, Terrell Edmunds</p>
          </div>
          <div className="content-card">
            <h3 className="accent-text">National Sports Announcers</h3>
            <p className="body-text">Jenn Brown, Joe Buck, Holly Sonders, Paul Azinger</p>
          </div>
          <div className="content-card">
            <h3 className="accent-text">TV Personalities</h3>
            <p className="body-text">Chef Palak Patel (Food Network Chopped)</p>
          </div>
          <div className="content-card">
            <h3 className="accent-text">High-Profile Politicians</h3>
            <p className="body-text">Details available upon request</p>
          </div>
          <div className="content-card">
            <h3 className="accent-text">Actors / Musicians</h3>
            <p className="body-text">Eugene Hutz (Gogo Bordello), Liev Schreiber, Jeff Kraus & Broken Down Gramophone, Miraj Grbic, Gabrielle Stone</p>
          </div>
        </div>
      </section>

      <section className="section-card">
        <h2 className="section-title section-title-media">Selected TV • Film • Print Work</h2>
        <div className="content-card">
          <p className="body-text">Disney Channel • FOX News & Sports • TLC Return to Amish • Paramount Mayor of Kingstown (S2) • WGN Outsiders • Lifetime Dance Moms • How to Rob a Bank (2026) • Nike • Facebook • Spotify • U.S. Steel • Westinghouse Nuclear • Burberry • Sheetz • Pittsburgh Penguins Foundation • University of Pittsburgh • Carnegie Mellon University & FBI collaboration • UPMC Health Plan • Aetna • Yelp! • PNC • Edgar Snyder & Associates — and many more.</p>
        </div>
        <p className="muted-text">Full client list available upon request.</p>
      </section>
    </div>
  );
};

export default Media;
