'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import siteLogo from '../assets/wcf-lips-logo.png';

const navItems = [
  { name: 'HOME', path: '/' },
  { name: 'ABOUT', path: '/about-hair-and-makeup-artist' },
  { name: 'CONTACT', path: '/book-hair-and-makeup-artist' },
  { name: 'On-Set & Production', path: '/atlanta-film-tv-makeup-artist' },
  { name: 'BRIDAL', path: '/bridal' },
  { name: 'BEAUTY & EVENTS', path: '/atlanta-special-event-hair-makeup' },
  { name: 'CLASSES', path: '/atlanta-makeup-classes' },
  { name: 'CREATIVE & FX', path: '/atlanta-special-effects-makeup' },
  { name: 'FAQ', path: '/makeup-faq' },
];

function isNavItemActive(path, pathname) {
  if (path === '/bridal') {
    return (
      pathname.startsWith('/bridal') ||
      pathname === '/atlanta-bridal-hair-makeup' ||
      pathname === '/pittsburgh-bridal-hair-makeup'
    );
  }
  return pathname === path;
}

export default function Navigation() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNavSticky, setIsNavSticky] = useState(false);
  const headerRef = useRef(null);
  const navRef = useRef(null);
  const menuButtonRef = useRef(null);

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

  useEffect(() => {
    const button = menuButtonRef.current;
    const header = headerRef.current;
    if (!button || !header) return;

    const alignMenu = () => {
      if (getComputedStyle(button).display === 'none') {
        button.style.top = '';
        return;
      }
      const title = header.querySelector('.site-title');
      if (!title) return;
      const range = document.createRange();
      range.selectNodeContents(title);
      const line = range.getClientRects()[0];
      if (!line) return;
      const headerTop = header.getBoundingClientRect().top;
      const top = line.top - headerTop + (line.height - button.offsetHeight) / 2;
      button.style.top = `${Math.max(0, top)}px`;
    };

    alignMenu();
    window.addEventListener('resize', alignMenu);
    document.fonts?.ready.then(alignMenu);
    return () => window.removeEventListener('resize', alignMenu);
  }, []);

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <header className="main-header" ref={headerRef}>
      <div className="header-content">
        <div className="logo-section">
          <Link href="/" className="site-title-link" onClick={closeMobileMenu}>
            <h1 className="site-title">
              <span className="site-title-lead">Wild Child </span>
              <span className="site-title-brand">Fabrications</span>
            </h1>
            <p className="site-byline">Hair & Makeup Artistry</p>
            <img src={siteLogo.src} alt="" className="site-logo" aria-hidden="true" />
          </Link>
        </div>
      </div>

      <button
        ref={menuButtonRef}
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
