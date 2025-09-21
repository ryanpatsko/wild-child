import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import './App.css';
import siteLogo from './assets/wcf-lips-logo.png';

// Import components
import Home from './components/Home';
import AboutMe from './components/AboutMe';
import Contact from './components/Contact';
import Media from './components/Media';
import Bridal from './components/Bridal';
import BeautyEvents from './components/BeautyEvents';
import Classes from './components/Classes';
import CreativeFX from './components/CreativeFX';
import FAQ from './components/FAQ';

// Navigation component
function Navigation() {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const navItems = [
    { name: 'HOME', path: '/' },
    { name: 'ABOUT ME', path: '/about' },
    { name: 'CONTACT', path: '/contact' },
    { name: 'TV. FILM. PRINT.', path: '/media' },
    { name: 'BRIDAL', path: '/bridal' },
    { name: 'BEAUTY & EVENTS', path: '/beauty-events' },
    { name: 'CLASSES', path: '/classes' },
    { name: 'CREATIVE & FX', path: '/creative-fx' },
    { name: 'FAQ', path: '/faq' }
  ];

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="main-header">
      <div className="header-content">
        <div className="logo-section">
          <Link to="/" className="site-title-link" onClick={closeMobileMenu}>
            <h1 className="site-title">Wild Child Fabrications</h1>
            <img src={siteLogo} alt="Wild Child Fabrications - Lips Logo" className="site-logo" />
          </Link>
        </div>
        
        {/* Hamburger menu button for mobile */}
        <button 
          className="hamburger-menu" 
          onClick={toggleMobileMenu}
          aria-label="Toggle mobile menu"
        >
          <span className={`hamburger-line ${isMobileMenuOpen ? 'open' : ''}`}></span>
          <span className={`hamburger-line ${isMobileMenuOpen ? 'open' : ''}`}></span>
          <span className={`hamburger-line ${isMobileMenuOpen ? 'open' : ''}`}></span>
        </button>
      </div>
      
      {/* Desktop navigation */}
      <nav className="block-nav desktop-nav">
        {navItems.map((item, index) => (
          <Link
            key={item.name}
            to={item.path}
            className={`block-nav-item block-nav-item-${index + 1} ${location.pathname === item.path ? 'active' : ''}`}
          >
            {item.name}
          </Link>
        ))}
      </nav>

      {/* Mobile navigation menu */}
      <nav className={`mobile-nav ${isMobileMenuOpen ? 'open' : ''}`}>
        {navItems.map((item, index) => (
          <Link
            key={item.name}
            to={item.path}
            className={`mobile-nav-item block-nav-item-${index + 1} ${location.pathname === item.path ? 'active' : ''}`}
            onClick={closeMobileMenu}
          >
            {item.name}
          </Link>
        ))}
      </nav>
    </header>
  );
}

// Main app content component
function AppContent() {
  return (
    <div className="App">
      <Navigation />
      <main className="main-content">
        <div className="content-container">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<AboutMe />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/media" element={<Media />} />
            <Route path="/bridal" element={<Bridal />} />
            <Route path="/beauty-events" element={<BeautyEvents />} />
            <Route path="/classes" element={<Classes />} />
            <Route path="/creative-fx" element={<CreativeFX />} />
            <Route path="/faq" element={<FAQ />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

// Main App component with Router
function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
