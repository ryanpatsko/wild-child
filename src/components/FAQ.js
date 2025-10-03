import React from 'react';
import { Link } from 'react-router-dom';
import lipsLogo from '../assets/wcf-lips-logo.png';

const FAQ = () => {
  return (
    <div className="page-container">
      <h1 className="page-title">Q & A's</h1>
      <p className="intro-text">Find answers to common questions about our services, booking process, and policies.</p>
      
      <section className="section-card">
        <div className="faq-item">
          <h3 className="feature-title-with-logo">
            <img src={lipsLogo} alt="Lips logo" className="lips-logo-bullet" />
            What are your business hours to get a hold of you?
          </h3>
          <p className="faq-answer">For client communication and admin hours, we respond via email or call Monday - Fridays from 10am - 6pm. We unfortunately cannot answer emails during weekends as we are solely focused on creating a great client experience with weddings on weekends. If you call and we do not answer, please leave a voicemail so we can get back to you.</p>
        </div>

        <div className="faq-item">
          <h3 className="feature-title-with-logo">
            <img src={lipsLogo} alt="Lips logo" className="lips-logo-bullet" />
            How should we get a hold of you?
          </h3>
          <p className="faq-answer">Email or our <Link to="/contact" className="faq-link">contact form</Link> is preferred so that way I can keep track of all your event details in one place and create a seamless beauty experience for you. Calls can be taken during our business hours of M-F 10am to 6pm. Please refrain from texting, Instagram direct messages and Facebook messaging us as it's harder for us to keep track and make sure you get a prompt and professional response.</p>
        </div>

        <div className="faq-item">
          <h3 className="feature-title-with-logo">
            <img src={lipsLogo} alt="Lips logo" className="lips-logo-bullet" />
            How is my contract sent?
          </h3>
          <p className="faq-answer">We send all of our contracts via email! The easiest way to get them back to us is to copy and paste it into a new email or word document, fill in as needed, and then send it back when you're ready! We're happy to clarify anything on the contract before it gets returned.</p>
        </div>

        <div className="faq-item">
          <h3 className="feature-title-with-logo">
            <img src={lipsLogo} alt="Lips logo" className="lips-logo-bullet" />
            How do I pay my retainer and/or booking fees?
          </h3>
          <p className="faq-answer">Those can be made via Venmo only. The username is <a href="https://account.venmo.com/u/ChristaleeHMUA" target="_blank" rel="noopener noreferrer" className="faq-link">@ChristaleeHMUA</a>. For convenience, we have a link to that on our site! Please do not send retainer/booking payments before discussion with the artist so that we can create a contract for your event date beforehand.</p>
        </div>

        <div className="faq-item">
          <h3 className="feature-title-with-logo">
            <img src={lipsLogo} alt="Lips logo" className="lips-logo-bullet" />
            Where is my appointment located?
          </h3>
          <p className="faq-answer">Unless otherwise discussed at booking, your appointment will take place at artist's in home studio space - zipcode 15221. Full location details will be released within 48 hours of your appointment in a detail confirmation email.</p>
        </div>

        <div className="faq-item">
          <h3 className="feature-title-with-logo">
            <img src={lipsLogo} alt="Lips logo" className="lips-logo-bullet" />
            How should I prep for my appointment?
          </h3>
          <p className="faq-answer">Please come with a fresh, completely makeup free face. For hair appointments, your hair must be washed and blown completely dry within 12-15 hours of your appointment. Hair should be "lived in", but not dirty. This applies to event makeups, trials, weddings, bridal parties, etc. As far as inspiration photos, please narrow down your choices to no more than 1-3 photos per service (1-3 photos for hair or 1-3 for makeup) with a model that has a similar hair/skin color to yours. We will go over these during your consultation included in your appointment time.</p>
        </div>

        <div className="faq-item">
          <h3 className="feature-title-with-logo">
            <img src={lipsLogo} alt="Lips logo" className="lips-logo-bullet" />
            Can I bring someone to my trial or appointment at your studio?
          </h3>
          <p className="faq-answer">Please bring no more than one supportive friend or family member to your appointment. We highly suggest you pick your best hype woman/friend rather than your "too honest" friend for the best experience. We want you to walk out feeling your best!</p>
        </div>

        <div className="faq-item">
          <h3 className="feature-title-with-logo">
            <img src={lipsLogo} alt="Lips logo" className="lips-logo-bullet" />
            Do you have to book us for both hair AND makeup since you offer both?
          </h3>
          <p className="faq-answer">You don't! You are absolutely welcome to book us for either just hair or just makeup - but we welcome booking both and typically have a team ready to add onto your day - with availability! We do require you fall under one of the packages for makeup - but, with hair, you're able to add on services a la carte. Hair services vary in price depending on length and need to be booked separately from the makeup package.</p>
        </div>

        <div className="faq-item">
          <h3 className="feature-title-with-logo">
            <img src={lipsLogo} alt="Lips logo" className="lips-logo-bullet" />
            Bridal party pricing - hidden fees?
          </h3>
          <p className="faq-answer">There are no hidden fees in our pricing. You will see where every dollar is being spent in your outlined contract. Our packages show base pricing which includes only the services themselves - added on to your contract will be fees specifically pertaining to travel, parking, early start time fees for your day where applicable, and an automatic included 20% gratuity.</p>
        </div>

        <div className="faq-item">
          <h3 className="feature-title-with-logo">
            <img src={lipsLogo} alt="Lips logo" className="lips-logo-bullet" />
            What about men, they/them / non-binary or transitioning client needs?
          </h3>
          <p className="faq-answer">We are always a safe space to help you bring the vision to life you see for yourself long term or just in the moment. We offer anything from slight grooming/polishing beauty services to full glam looks. Pricing will vary depending on client's specific needs and vision. We will always greet you openly and listen to your wants in a desired look.</p>
        </div>
      </section>
    </div>
  );
};

export default FAQ;
