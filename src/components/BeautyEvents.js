import React from 'react';
import christalee146 from '../assets/christalee/2025-05-14-Christalee-146.jpg';

const BeautyEvents = () => {
  return (
    <div className="page-container">
      <div className="page-header">
        <img src={christalee146} alt="Christalee - Beauty Events" className="page-header-image" />
      </div>
      <h1 className="page-title">Beauty & Events</h1>
      <p className="intro-text">
        Whether you're prepping for family portraits, a date night, headshots, a class reunion, a bachelorette celebration—or you simply want fresh tips tailored to your skin—we have a service designed for you.
      </p>

      <section className="section-card">
        <h2 className="section-title section-title-beauty">Hair Styling + Makeup Appointments</h2>
        <ul className="styled-list">
          <li>Customized skin prep</li>
          <li>High-end makeup application</li>
          <li>Custom-fit event lashes</li>
          <li>Professional-grade setting sprays & powders</li>
          <li>Mini touch-up lipstick kit to-go</li>
          <li>Hair styling from simple waves to intricate up-dos</li>
          <li>For hair past mid-back, add $25–$50 depending on length.</li>
        </ul>
      </section>

      <section className="section-card">
        <h2 className="section-title section-title-beauty">Location & Travel</h2>
        <ul className="styled-list">
          <li>Sessions take place at our studio (ZIP 15221) unless otherwise arranged.</li>
          <li>On-location service is available when our schedule allows.</li>
          <li>Travel is billed at $0.70 / mile round-trip plus any parking fees.</li>
          <li>Please tell us your hair length and desired style when you book so we can schedule adequate time.</li>
        </ul>
      </section>

      <section className="section-card">
        <h2 className="section-title section-title-beauty">Rates & Booking</h2>
        <table className="styled-table">
          <thead>
            <tr>
              <th>Service</th>
              <th>Price</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Hair & Makeup</td>
              <td>$250</td>
            </tr>
            <tr>
              <td>Makeup or Hair Only</td>
              <td>$125</td>
            </tr>
          </tbody>
        </table>
        <ul className="styled-list">
          <li><strong>Retainer:</strong> A $75 non-refundable retainer per service (paid via Venmo) secures your date and is credited to your balance at the appointment.</li>
          <li><strong>Travel:</strong> Quoted at booking.</li>
        </ul>
      </section>

      <div className="cta-section">
        <p className="body-text">Ready to look—and feel—your best? <strong>Contact us to reserve your date.</strong></p>
      </div>
    </div>
  );
};

export default BeautyEvents;
