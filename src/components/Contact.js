import React, { useState } from 'react';
import emailjs from '@emailjs/browser';
import christalee008 from '../assets/christalee/2025-05-14-Christalee-008.jpg';

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
      const serviceId = 'service_kigtm6a';
      const templateId = 'template_8jri10m';
      const publicKey = 'xifNOmqZT57bf9Y0I';

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
      <div className="page-header">
        <img src={christalee008} alt="Christalee - Contact" className="page-header-image" />
      </div>
      <h1 className="page-title">Get In Touch</h1>
      <p className="intro-text">Ready to create something beautiful together? Fill out the form below and we'll get back to you soon!</p>
      
      <section className="section-card">
        <form onSubmit={handleSubmit} className="contact-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="firstName">First Name *</label>
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
              <label htmlFor="lastName">Last Name *</label>
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
              <label htmlFor="email">Email *</label>
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
              <label htmlFor="phone">Phone Number *</label>
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
              <label htmlFor="eventDate">Date of Event (MM/DD) *</label>
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
              <label htmlFor="eventYear">Year *</label>
              <select
                id="eventYear"
                name="eventYear"
                value={formData.eventYear}
                onChange={handleInputChange}
                required
              >
                <option value="">Select Year</option>
                <option value="2025">2025</option>
                <option value="2026">2026</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="eventType">Event Type *</label>
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
              <label htmlFor="serviceType">Hair + Makeup? *</label>
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
              <label htmlFor="attendees">Number of Attendees *</label>
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
              <label htmlFor="location">Location of Services *</label>
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
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="eventVenue">Event Venue *</label>
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
            <label htmlFor="message">Message *</label>
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
