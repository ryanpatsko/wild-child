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
    { name: 'ABOUT', path: '/about' },
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
      
      <footer className="site-footer">
        <div className="footer-content">
          <div className="footer-left">
            Wild Child Fabrications {new Date().getFullYear()}
          </div>
          <div className="footer-right">
            <a 
              href="https://www.instagram.com/wildchildfabrications/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="footer-instagram-link"
            >
              <svg className="footer-instagram-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
              Instagram
            </a>
          </div>
        </div>
      </footer>
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
