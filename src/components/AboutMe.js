import pinkHairspray from '../assets/pink-brand-hairspray.png';
import lipsLogo from '../assets/wcf-lips-logo.png';

const AboutMe = ({ content }) => {
  const { pageHeader, mainText, listIntro, items } = content;

  return (
    <div className="page-container">
      <h1 className="page-title">{pageHeader}</h1>
      <p className="intro-text">{mainText}</p>
      <p className="intro-text" style={{ marginTop: '1rem' }}>{listIntro}</p>

      <div className="about-layout">
        <div className="about-image-container">
          <img
            src={pinkHairspray.src}
            alt="ChristaLee Lema - Professional Hair and Makeup Artist"
            className="about-image"
          />
        </div>
        <section className="section-card">
          {items.map((item, index) => (
            <div key={index} className="faq-item">
              <h3 className="feature-title-with-logo">
                <img src={lipsLogo.src} alt="" className="lips-logo-bullet" />
                {item.title}
              </h3>
              <p className="body-text">{item.body}</p>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
};

export default AboutMe;
