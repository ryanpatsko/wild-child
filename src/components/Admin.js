import React, { useCallback, useEffect, useId, useState } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import LocationsEditor from './admin/LocationsEditor';
import HomeEditor from './admin/HomeEditor';
import AboutEditor from './admin/AboutEditor';
import MediaEditor from './admin/MediaEditor';
import BridalEditor from './admin/BridalEditor';
import BeautyPagesEditor from './admin/BeautyPagesEditor';
import ClassesPagesEditor from './admin/ClassesPagesEditor';
import ContactPagesEditor from './admin/ContactPagesEditor';
import CreativeFxPagesEditor from './admin/CreativeFxPagesEditor';
import FaqPagesEditor from './admin/FaqPagesEditor';
import ClientsSection from './admin/crm/ClientsSection';
import ServicesCatalogEditor from './admin/crm/ServicesCatalogEditor';
import { PagesContentAdminProvider } from '../context/PagesContentAdminContext';
import {
  adminLogin,
  adminVerifySession,
  clearStoredSessionToken,
  getStoredSessionToken,
  isAdminAuthConfigured,
} from '../lib/adminAuth';
import siteLogo from '../assets/wcf-lips-logo.png';
import './Admin.css';

const TAB_LABELS = {
  clients: 'Clients',
  pricing: 'Services & Pricing',
  home: 'Home',
  about: 'About',
  media: 'On-Set & Production',
  bridal: 'Bridal',
  beauty: 'Beauty & Events',
  classes: 'Classes',
  creativeFx: 'Creative & FX',
  contact: 'Contact',
  faq: 'FAQ',
  locations: 'Locations',
};

const NAV_GROUPS = [
  { id: 'portal', label: 'Client Portal', tabs: ['clients', 'pricing'] },
  {
    id: 'content',
    label: 'Website Content',
    tabs: ['home', 'about', 'media', 'bridal', 'beauty', 'classes', 'creativeFx', 'contact', 'faq', 'locations'],
  },
];

const TAB_IDS = NAV_GROUPS.flatMap((g) => g.tabs);

function pageCopyOnly(path) {
  return [{ id: 'copy', label: 'Page copy', path }];
}

function copyAndGallery(path) {
  return [
    { id: 'copy', label: 'Page copy', path },
    { id: 'gallery', label: 'Gallery', path },
  ];
}

/**
 * Sub-tab rows for Website Content tabs; first entry is the default section.
 * `path` is the live page shown in the header; `note` replaces it when the content isn't tied to one page.
 */
const CONTENT_SECTIONS = {
  home: copyAndGallery('/'),
  about: copyAndGallery('/about-hair-and-makeup-artist'),
  media: pageCopyOnly('/atlanta-film-tv-makeup-artist'),
  bridal: [
    { id: 'overview', label: 'Overview', path: '/bridal' },
    { id: 'services', label: 'Services', path: '/bridal-services' },
    { id: 'pittsburgh', label: 'Pittsburgh', path: '/pittsburgh-bridal-hair-makeup' },
    { id: 'atlanta', label: 'Atlanta', path: '/atlanta-bridal-hair-makeup' },
    { id: 'gallery', label: 'Gallery', path: '/bridal-gallery' },
  ],
  beauty: pageCopyOnly('/atlanta-special-event-hair-makeup'),
  classes: pageCopyOnly('/atlanta-makeup-classes'),
  creativeFx: pageCopyOnly('/atlanta-special-effects-makeup'),
  contact: pageCopyOnly('/book-hair-and-makeup-artist'),
  faq: pageCopyOnly('/makeup-faq'),
  locations: [
    {
      id: 'regions',
      label: 'Regions message',
      note: 'Shown in the regions box on the Home page and the Bridal overview page.',
    },
  ],
};

function renderTabContent(tab, section) {
  switch (tab) {
    case 'clients':
      return <ClientsSection />;
    case 'pricing':
      return <ServicesCatalogEditor />;
    case 'home':
      return <HomeEditor section={section} />;
    case 'about':
      return <AboutEditor section={section} />;
    case 'media':
      return <MediaEditor />;
    case 'bridal':
      return <BridalEditor section={section} />;
    case 'beauty':
      return <BeautyPagesEditor />;
    case 'classes':
      return <ClassesPagesEditor />;
    case 'creativeFx':
      return <CreativeFxPagesEditor />;
    case 'contact':
      return <ContactPagesEditor />;
    case 'faq':
      return <FaqPagesEditor />;
    case 'locations':
      return <LocationsEditor />;
    default:
      return null;
  }
}

function AdminDashboard() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const tabParam = searchParams.get('tab');
  const activeTab = TAB_IDS.includes(tabParam) ? tabParam : 'clients';
  const sections = CONTENT_SECTIONS[activeTab] ?? null;
  const sectionParam = searchParams.get('section');
  const activeSectionInfo = sections ? (sections.find((s) => s.id === sectionParam) ?? sections[0]) : null;
  const activeSection = activeSectionInfo?.id ?? null;

  function selectTab(id) {
    const next = new URLSearchParams();
    next.set('tab', id);
    router.replace(`${pathname}?${next.toString()}`);
  }

  function selectSection(id) {
    const next = new URLSearchParams();
    next.set('tab', activeTab);
    next.set('section', id);
    router.replace(`${pathname}?${next.toString()}`);
  }

  return (
    <PagesContentAdminProvider>
      <div className="admin-dashboard">
        <nav className="admin-sidebar" aria-label="Admin sections">
          {NAV_GROUPS.map((group) => (
            <div key={group.id} className="admin-sidebar-group">
              <h2 className="admin-sidebar-heading" id={`admin-nav-${group.id}`}>
                {group.label}
              </h2>
              <ul className="admin-sidebar-list" aria-labelledby={`admin-nav-${group.id}`}>
                {group.tabs.map((id) => (
                  <li key={id}>
                    <button
                      type="button"
                      className={`admin-sidebar-link ${activeTab === id ? 'admin-sidebar-link-active' : ''}`}
                      aria-current={activeTab === id ? 'page' : undefined}
                      onClick={() => selectTab(id)}
                    >
                      {TAB_LABELS[id]}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        <section className="admin-panel admin-main" aria-label={TAB_LABELS[activeTab]}>
          {sections ? (
            <header className="admin-content-header">
              <div className="admin-content-heading">
                <h2 className="admin-content-title">{TAB_LABELS[activeTab]}</h2>
                {activeSectionInfo.path ? (
                  <a
                    className="admin-content-slug"
                    href={activeSectionInfo.path}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Open live page in a new tab"
                  >
                    {activeSectionInfo.path}
                  </a>
                ) : null}
                {activeSectionInfo.note ? <span className="admin-content-note">{activeSectionInfo.note}</span> : null}
              </div>
              <div className="admin-bridal-subtabs" role="tablist" aria-label={`${TAB_LABELS[activeTab]} sections`}>
                {sections.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    role="tab"
                    aria-selected={activeSection === s.id}
                    className={`admin-bridal-subtab ${activeSection === s.id ? 'admin-bridal-subtab-active' : ''}`}
                    onClick={() => selectSection(s.id)}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </header>
          ) : null}
          {renderTabContent(activeTab, activeSection)}
        </section>
      </div>
    </PagesContentAdminProvider>
  );
}

export default function Admin() {
  const passwordFieldId = useId();
  const [gate, setGate] = useState('checking');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const configured = isAdminAuthConfigured();

  const verifyStored = useCallback(async () => {
    if (!configured) {
      setGate('locked');
      return;
    }
    const token = getStoredSessionToken();
    if (!token) {
      setGate('locked');
      return;
    }
    const ok = await adminVerifySession(token);
    if (ok) setGate('unlocked');
    else {
      clearStoredSessionToken();
      setGate('locked');
    }
  }, [configured]);

  useEffect(() => {
    void verifyStored();
  }, [verifyStored]);

  async function onSubmit(e) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const result = await adminLogin(password);
      if (result.ok) {
        setPassword('');
        setGate('unlocked');
      } else {
        setError(result.message);
      }
    } finally {
      setBusy(false);
    }
  }

  function onSignOut() {
    clearStoredSessionToken();
    setGate('locked');
    setPassword('');
    setError(null);
  }

  return (
    <div className="admin-page">
      <div className="admin-shell">
        <header className="admin-header">
          <div className="admin-header-brand">
            <img
              src={siteLogo.src}
              alt=""
              className="admin-header-logo"
              width={40}
              height={40}
              decoding="async"
            />
            <div>
              <p className="admin-kicker">Wild Child Fabrications</p>
              <h1 className="admin-title">Admin Dashboard</h1>
            </div>
          </div>
          <nav className="admin-nav" aria-label="Admin actions">
            {gate === 'unlocked' ? (
              <button type="button" className="admin-link-btn" onClick={onSignOut}>
                Sign out
              </button>
            ) : null}
            <Link className="admin-external-link" href="/">
              Back to site
            </Link>
          </nav>
        </header>

        {gate === 'checking' ? (
          <p className="admin-muted" role="status">
            Checking session…
          </p>
        ) : gate === 'locked' ? (
          <section className="admin-panel" aria-labelledby="admin-sign-in-heading">
            <h2 id="admin-sign-in-heading" className="admin-panel-title">
              Sign in
            </h2>
            {!configured ? (
              <p className="admin-warn">
                Set <code>NEXT_PUBLIC_ADMIN_AUTH_URL</code> to your Lambda Function URL origin (no trailing slash) in your
                hosting provider&apos;s build environment variables and in <code>.env.local</code> for{' '}
                <code>npm run dev</code>. Optionally set <code>NEXT_PUBLIC_LOCATIONS_CONTENT_URL</code> to the public HTTPS
                URL of <code>locations-content.json</code> if it differs from the default.
              </p>
            ) : (
              <p className="admin-muted">Session lasts 24 hours on this device.</p>
            )}
            <form className="admin-form" onSubmit={onSubmit}>
              <label className="admin-label" htmlFor={passwordFieldId}>
                Password
              </label>
              <input
                id={passwordFieldId}
                className="admin-input"
                type="password"
                name="password"
                autoComplete="current-password"
                value={password}
                onChange={(ev) => setPassword(ev.target.value)}
                disabled={!configured || busy}
                required
              />
              {error ? (
                <p className="admin-error" role="alert">
                  {error}
                </p>
              ) : null}
              <button className="admin-submit" type="submit" disabled={!configured || busy}>
                {busy ? 'Signing in…' : 'Sign in'}
              </button>
            </form>
          </section>
        ) : (
          <AdminDashboard />
        )}
      </div>
    </div>
  );
}
