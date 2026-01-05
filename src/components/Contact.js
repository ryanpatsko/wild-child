import React, { useState } from 'react';
import emailjs from '@emailjs/browser';

const Contact = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    eventDate: '',
    eventYear: '',
    eventType: '',
    serviceType: '',
    attendees: '',
    location: '',
    eventVenue: '',
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null); // 'success', 'error', or null
  const [honeypot, setHoneypot] = useState(''); // Hidden field for bot detection
  const [lastSubmission, setLastSubmission] = useState(null); // Rate limiting

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    // Bot protection checks
    if (honeypot !== '') {
      console.log('Bot detected - honeypot field filled');
      setSubmitStatus('error');
      setIsSubmitting(false);
      return;
    }

    // Rate limiting - prevent multiple submissions within 30 seconds
    const now = Date.now();
    if (lastSubmission && (now - lastSubmission) < 30000) {
      setSubmitStatus('error');
      setIsSubmitting(false);
      return;
    }

    // Basic validation
    if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.email.trim() || 
        !formData.phone.trim() || !formData.eventDate.trim() || !formData.eventYear.trim() ||
        !formData.eventType.trim() || !formData.serviceType.trim() || !formData.attendees.trim() ||
        !formData.location.trim() || !formData.eventVenue.trim() || !formData.message.trim()) {
      setSubmitStatus('error');
      setIsSubmitting(false);
      return;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setSubmitStatus('error');
      setIsSubmitting(false);
      return;
    }

    try {
      // EmailJS configuration
      const serviceId = 'service_f6qb15f';
      const templateId = 'template_6q48dyb';
      const publicKey = '-tASGUanoru3Lf-FF';

      // Prepare template parameters
      const templateParams = {
        from_name: `${formData.firstName} ${formData.lastName}`,
        from_email: formData.email,
        phone: formData.phone,
        event_date: formData.eventDate,
        event_year: formData.eventYear,
        event_type: formData.eventType,
        service_type: formData.serviceType,
        attendees: formData.attendees,
        location: formData.location,
        event_venue: formData.eventVenue,
        message: formData.message,
        to_name: 'Wild Child Fabrications'
      };

      // Send email
      await emailjs.send(serviceId, templateId, templateParams, publicKey);
      
      setSubmitStatus('success');
      setLastSubmission(now);
      
      // Reset form
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        eventDate: '',
        eventYear: '',
        eventType: '',
        serviceType: '',
        attendees: '',
        location: '',
        eventVenue: '',
        message: ''
      });

    } catch (error) {
      console.error('Error sending email:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page-container">
      <h1 className="page-title">Get In Touch</h1>
      <p className="intro-text">Ready to create something beautiful together? Fill out the form below and we'll get back to you soon!</p>
      
      <div className="contact-buttons">
        <a href="https://www.instagram.com/wildchildfabrications/" target="_blank" rel="noopener noreferrer" className="contact-btn instagram-btn">
          <svg className="btn-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
          </svg>
          <span className="btn-text">Follow on Instagram</span>
        </a>
        <a href="https://account.venmo.com/u/ChristaleeHMUA" target="_blank" rel="noopener noreferrer" className="contact-btn venmo-btn">
          <svg className="btn-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/>
          </svg>
          <span className="btn-text">Pay with Venmo</span>
        </a>
      </div>
      
      <div className="contact-info-banner">
        <p className="contact-info-text">
          You can also <a href="mailto:clema.fx@gmail.com" className="contact-info-link">email us</a>, or call us at <strong>724 766 6364</strong> (no texts please)
        </p>
      </div>
      
      <section className="section-card">
        <h2 className="section-title section-title-contact">Contact Us</h2>
        <form onSubmit={handleSubmit} className="contact-form">
          <p className="form-note">All fields are required</p>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="firstName">First Name</label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="lastName">Last Name</label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="phone">Phone Number</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="eventDate">Date of Event (MM/DD)</label>
              <input
                type="text"
                id="eventDate"
                name="eventDate"
                placeholder="MM/DD"
                value={formData.eventDate}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="eventYear">Year</label>
              <select
                id="eventYear"
                name="eventYear"
                value={formData.eventYear}
                onChange={handleInputChange}
                required
              >
                <option value="">Select Year</option>
                <option value="2026">2026</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="eventType">Event Type</label>
              <select
                id="eventType"
                name="eventType"
                value={formData.eventType}
                onChange={handleInputChange}
                required
              >
                <option value="">Select Event Type</option>
                <option value="wedding">Wedding</option>
                <option value="event-makeup">Event Makeup</option>
                <option value="media-shoot">Media Shoot</option>
                <option value="specialty-makeup">Specialty Makeup</option>
                <option value="makeup-class">Makeup Class</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="serviceType">Hair + Makeup?</label>
              <select
                id="serviceType"
                name="serviceType"
                value={formData.serviceType}
                onChange={handleInputChange}
                required
              >
                <option value="">Select Service</option>
                <option value="hair-only">Hair Only</option>
                <option value="makeup-only">Makeup Only</option>
                <option value="both">Both</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="attendees">Number of Attendees</label>
              <select
                id="attendees"
                name="attendees"
                value={formData.attendees}
                onChange={handleInputChange}
                required
              >
                <option value="">Select Number</option>
                <option value="1-4">1-4</option>
                <option value="5-8">5-8</option>
                <option value="8-10+">8-10+</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="location">Location of Services</label>
              <select
                id="location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                required
              >
                <option value="">Select Location</option>
                <option value="pittsburgh">Pittsburgh & Surrounding</option>
                <option value="dc-virginia">D.C / Virginia</option>
                <option value="ohio">Ohio</option>
                <option value="west-virginia">West Virginia</option>
                <option value="atlanta">Atlanta</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="eventVenue">Event Venue</label>
            <input
              type="text"
              id="eventVenue"
              name="eventVenue"
              placeholder="Enter venue name or address"
              value={formData.eventVenue}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="message">Message</label>
            <textarea
              id="message"
              name="message"
              rows="5"
              placeholder="Tell us more about your event, special requests, or any questions you have..."
              value={formData.message}
              onChange={handleInputChange}
              required
            />
          </div>

          {/* Honeypot field - hidden from users but visible to bots */}
          <div style={{ display: 'none' }}>
            <label htmlFor="website">Website (leave blank)</label>
            <input
              type="text"
              id="website"
              name="website"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
              tabIndex="-1"
              autoComplete="off"
            />
          </div>

          {/* Status Messages */}
          {submitStatus === 'success' && (
            <div className="form-status success">
              <p>✅ Thank you for your inquiry! We'll get back to you soon.</p>
            </div>
          )}
          
          {submitStatus === 'error' && (
            <div className="form-status error">
              <p>❌ Sorry, there was an error sending your message. Please check your information and try again, or contact us directly.</p>
            </div>
          )}

          <div className="form-submit">
            <button 
              type="submit" 
              className="submit-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Sending...' : 'Send Message'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
};

export default Contact;
