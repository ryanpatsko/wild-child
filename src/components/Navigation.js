'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import siteLogo from '../assets/wcf-lips-logo.png';

const navItems = [
  { name: 'HOME', path: '/' },
  { name: 'ABOUT', path: '/about-hair-and-makeup-artist' },
  { name: 'CONTACT', path: '/book-hair-and-makeup-artist' },
  { name: 'On-Set & Production', path: '/film-tv-makeup-artist' },
  { name: 'BRIDAL', path: '/bridal' },
  { name: 'BEAUTY & EVENTS', path: '/event-hair-and-makeup' },
  { name: 'CLASSES', path: '/makeup-classes' },
  { name: 'CREATIVE & FX', path: '/creative-fx' },
  { name: 'FAQ', path: '/faq' },
];

function isNavItemActive(path, pathname) {
  if (path === '/bridal') {
    return pathname.startsWith('/bridal');
  }
  return pathname === path;
}

export default function Navigation() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNavSticky, setIsNavSticky] = useState(false);
  const headerRef = useRef(null);
  const navRef = useRef(null);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handleScroll = () => {
      if (headerRef.current && navRef.current) {
        const headerBottom = headerRef.current.getBoundingClientRect().bottom;
        setIsNavSticky(headerBottom <= 0);
      }
    };
    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <header className="main-header" ref={headerRef}>
      <div className="header-content">
        <div className="logo-section">
          <Link href="/" className="site-title-link" onClick={closeMobileMenu}>
            <h1 className="site-title">
              <span className="site-title-lead">Wild Child </span>
              <span className="site-title-brand">
                Fabrications
                <img src={siteLogo.src} alt="" className="site-logo" aria-hidden="true" />
              </span>
            </h1>
          </Link>
        </div>
      </div>

      <button
        className="hamburger-menu"
        onClick={() => setIsMobileMenuOpen((o) => !o)}
        aria-label="Toggle mobile menu"
      >
        <span className={`hamburger-line ${isMobileMenuOpen ? 'open' : ''}`}></span>
        <span className={`hamburger-line ${isMobileMenuOpen ? 'open' : ''}`}></span>
        <span className={`hamburger-line ${isMobileMenuOpen ? 'open' : ''}`}></span>
      </button>

      <nav className={`block-nav desktop-nav ${isNavSticky ? 'sticky-active' : ''}`} ref={navRef}>
        {navItems.map((item, index) => (
          <Link
            key={item.name}
            href={item.path}
            className={`block-nav-item block-nav-item-${index + 1} ${isNavItemActive(item.path, pathname) ? 'active' : ''}`}
          >
            {item.name}
          </Link>
        ))}
      </nav>

      <nav className={`mobile-nav ${isMobileMenuOpen ? 'open' : ''}`}>
        {navItems.map((item, index) => (
          <Link
            key={item.name}
            href={item.path}
            className={`mobile-nav-item block-nav-item-${index + 1} ${isNavItemActive(item.path, pathname) ? 'active' : ''}`}
            onClick={closeMobileMenu}
          >
            {item.name}
          </Link>
        ))}
      </nav>
    </header>
  );
}
