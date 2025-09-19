import React from 'react';
import christalee146 from '../assets/christalee/2025-05-14-Christalee-146.jpg';

const CreativeFX = () => {
  return (
    <div className="page-container">
      <div className="page-header">
        <img src={christalee146} alt="Christalee - Creative FX" className="page-header-image" />
      </div>
      <h1 className="page-title">Creative & FX</h1>
      <p className="intro-text">With a strong background in special effects, I bring your vision to life through innovative solutions, years of hands-on experience, and a distinctive creative flair. Below is a list of services we offer—but our capabilities are not limited to these alone. If you have a unique idea that doesn't quite fit into these categories, I'd love to hear about it and explore how we can make it happen.</p>

      <section className="section-card">
        <h2 className="section-title section-title-creative">Services We Offer</h2>
        <ul className="styled-list">
          <li><strong>Theater - Live Performance</strong> - Living statues, Theater, Comedy, Street Art, etc.</li>
          <li><strong>Personal Event Makeups</strong> - Halloween, Cosplay, Conventions, etc.</li>
          <li><strong>Specialty Makeup for TV/Film</strong> - Aging, Special effects, character design, etc.</li>
          <li><strong>Body & Face Paint</strong> - Photo shoots, nightclub or sporting events, parties for kids or adults, Painted baby bumps, etc.</li>
          <li><strong>Nightclub Events</strong> - Enchant your customers by transforming your staff into something to match your theme for the night.</li>
        </ul>
      </section>

      <section className="section-card">
        <h2 className="section-title section-title-creative">Pricing Information</h2>
        <ul className="styled-list">
          <li>Face painting for parties is a 2 hour minimum booking window for $250 + potential travel fee. $75/hour after two hours.</li>
          <li>Full body paint pricing starts at $300.</li>
        </ul>
      </section>

      <section className="section-card">
        <h2 className="section-title section-title-creative">Booking & Rates</h2>
        <p className="body-text">Each project is unique and may vary in the time, materials, and expertise required to bring your vision to life. Because of this, all jobs are quoted individually, with custom rates tailored to the specific needs of your project.</p>
        <p className="body-text">For any work that involves prosthetics or specialty supplies requiring prep or painting, clients are responsible for purchasing these items in advance with artist's guidance. This ensures a smooth and timely makeup application process. We'll always provide a clear list of required products along with estimated costs before requesting your order. Please note that we do not pre-order specialty items without upfront payment.</p>
        <p className="body-text">Makeup prep time will be included in your final balance.</p>
        <p className="body-text">To secure your appointment, a retainer is required.</p>
      </section>
    </div>
  );
};

export default CreativeFX;
