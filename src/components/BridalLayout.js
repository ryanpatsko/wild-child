import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import sidebarBanner from '../assets/gallery-bridal/Screenshot_20241207-093319.png';

const bridalNavItems = [
  { path: '/bridal', label: 'Overview' },
  { path: '/bridal-services', label: 'Services Breakdown' },
  { path: '/bridal-gallery', label: 'Bridal Gallery' },
  {
    label: 'Packages and Pricing',
    children: [
      { path: '/bridal-pittsburgh', label: 'Pittsburgh' },
      { path: '/bridal-atlanta', label: 'Atlanta' }
    ]
  }
];

function getCurrentPageLabel(pathname) {
  for (const item of bridalNavItems) {
    if (item.path && item.path === pathname) return item.label;
    if (item.children) {
      const found = item.children.find((c) => c.path === pathname);
      if (found) return found.label;
    }
  }
  return 'Overview';
}

const BridalLayout = ({ children }) => {
  const location = useLocation();
  const currentPath = location.pathname;
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const mobileNavRef = useRef(null);

  const currentLabel = getCurrentPageLabel(currentPath);

  useEffect(() => {
    setMobileNavOpen(false);
  }, [currentPath]);

  useEffect(() => {
    if (!mobileNavOpen) return;
    const handleClickOutside = (e) => {
      if (mobileNavRef.current && !mobileNavRef.current.contains(e.target)) {
        setMobileNavOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [mobileNavOpen]);

  return (
    <div
      className="bridal-layout"
      style={{ '--bridal-fixed-bg-image': `url(${sidebarBanner})` }}
    >
      <aside className="bridal-sidebar" aria-label="Bridal section navigation">
        <div className="bridal-sidebar-sticky">
          <h2 className="bridal-sidebar-heading">Wild Child Bridal</h2>
          <div className="bridal-mobile-nav" ref={mobileNavRef}>
            <button
              type="button"
              className={`bridal-mobile-nav-trigger ${mobileNavOpen ? 'is-open' : ''}`}
              onClick={() => setMobileNavOpen((o) => !o)}
              aria-expanded={mobileNavOpen}
              aria-haspopup="true"
              aria-label="Bridal section menu"
            >
              <span className="bridal-mobile-nav-trigger-label">{currentLabel}</span>
              <span className={`bridal-mobile-nav-chevron ${mobileNavOpen ? 'is-open' : ''}`} aria-hidden="true">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                  <path d="M6 8L1 3h10z" />
                </svg>
              </span>
            </button>
            <div className={`bridal-mobile-nav-panel ${mobileNavOpen ? 'is-open' : ''}`}>
              <nav className="bridal-mobile-nav-links">
                {bridalNavItems.map((item, index) => {
                  if (item.path) {
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        className={`bridal-sidebar-link ${currentPath === item.path ? 'active' : ''}`}
                        onClick={() => setMobileNavOpen(false)}
                      >
                        {item.label}
                      </Link>
                    );
                  }
                  return (
                    <div key={index} className="bridal-sidebar-group">
                      <span className="bridal-sidebar-heading">{item.label}</span>
                      {item.children.map(({ path, label }) => (
                        <Link
                          key={path}
                          to={path}
                          className={`bridal-sidebar-link bridal-sidebar-sublink ${currentPath === path ? 'active' : ''}`}
                          onClick={() => setMobileNavOpen(false)}
                        >
                          {label}
                        </Link>
                      ))}
                    </div>
                  );
                })}
              </nav>
            </div>
          </div>
          <nav className="bridal-sidebar-nav" aria-hidden="true">
          {bridalNavItems.map((item, index) => {
            if (item.path) {
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`bridal-sidebar-link ${location.pathname === item.path ? 'active' : ''}`}
                >
                  {item.label}
                </Link>
              );
            }
            return (
              <div key={index} className="bridal-sidebar-group">
                <span className="bridal-sidebar-heading">{item.label}</span>
                {item.children.map(({ path, label }) => (
                  <Link
                    key={path}
                    to={path}
                    className={`bridal-sidebar-link bridal-sidebar-sublink ${location.pathname === path ? 'active' : ''}`}
                  >
                    {label}
                  </Link>
                ))}
              </div>
            );
          })}
          </nav>
        </div>
      </aside>
      <div className="bridal-main">
        {children}
      </div>
    </div>
  );
};

export default BridalLayout;
