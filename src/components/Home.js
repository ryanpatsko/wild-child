import Gallery from './Gallery';
import RegionsNotice from './RegionsNotice';

const Home = ({ home, regionsNotice }) => {
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
