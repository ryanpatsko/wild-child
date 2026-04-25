import React, { useCallback, useEffect, useId, useState } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import LocationsEditor from './admin/LocationsEditor';
import HomePagesEditor from './admin/HomePagesEditor';
import AboutEditor from './admin/AboutEditor';
import MediaEditor from './admin/MediaEditor';
import BridalEditor from './admin/BridalEditor';
import BeautyPagesEditor from './admin/BeautyPagesEditor';
import ClassesPagesEditor from './admin/ClassesPagesEditor';
import ContactPagesEditor from './admin/ContactPagesEditor';
import CreativeFxPagesEditor from './admin/CreativeFxPagesEditor';
import FaqPagesEditor from './admin/FaqPagesEditor';
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

const TAB_IDS = ['locations', 'home', 'about', 'media', 'bridal', 'beauty', 'classes', 'contact', 'creativeFx', 'faq'];

const TAB_LABELS = {
  locations: 'Locations',
  home: 'Home',
  about: 'About',
  media: 'On-Set & Production',
  bridal: 'Bridal',
  beauty: 'Beauty & Events',
  classes: 'Classes',
  contact: 'Contact',
  creativeFx: 'Creative & FX',
  faq: 'FAQ',
};

function AdminDashboard() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const tabParam = searchParams.get('tab');
  const activeTab = TAB_IDS.includes(tabParam) ? tabParam : 'locations';

  function selectTab(id) {
    const next = new URLSearchParams(searchParams.toString());
    next.set('tab', id);
    next.delete('pagesTab');
    router.replace(`${pathname}?${next.toString()}`);
  }

  return (
    <PagesContentAdminProvider>
      <section aria-label="Admin dashboard">
        <div className="admin-tab-shell">
          <div className="admin-tab-list" role="tablist" aria-label="Admin sections">
            {TAB_IDS.map((id) => (
              <button
                key={id}
                type="button"
                role="tab"
                id={`admin-tab-${id}`}
                aria-selected={activeTab === id}
                aria-controls={`admin-panel-${id}`}
                tabIndex={activeTab === id ? 0 : -1}
                className="admin-tab"
                onClick={() => selectTab(id)}
              >
                {TAB_LABELS[id] ?? id}
              </button>
            ))}
          </div>

          <div
            id="admin-panel-locations"
            role="tabpanel"
            aria-labelledby="admin-tab-locations"
            hidden={activeTab !== 'locations'}
            className="admin-tab-panel"
          >
            {activeTab === 'locations' ? <LocationsEditor /> : null}
          </div>

          <div
            id="admin-panel-home"
            role="tabpanel"
            aria-labelledby="admin-tab-home"
            hidden={activeTab !== 'home'}
            className="admin-tab-panel"
          >
            {activeTab === 'home' ? <HomePagesEditor /> : null}
          </div>

          <div
            id="admin-panel-about"
            role="tabpanel"
            aria-labelledby="admin-tab-about"
            hidden={activeTab !== 'about'}
            className="admin-tab-panel"
          >
            {activeTab === 'about' ? <AboutEditor /> : null}
          </div>

          <div
            id="admin-panel-media"
            role="tabpanel"
            aria-labelledby="admin-tab-media"
            hidden={activeTab !== 'media'}
            className="admin-tab-panel"
          >
            {activeTab === 'media' ? <MediaEditor /> : null}
          </div>

          <div
            id="admin-panel-bridal"
            role="tabpanel"
            aria-labelledby="admin-tab-bridal"
            hidden={activeTab !== 'bridal'}
            className="admin-tab-panel"
          >
            {activeTab === 'bridal' ? <BridalEditor /> : null}
          </div>

          <div
            id="admin-panel-beauty"
            role="tabpanel"
            aria-labelledby="admin-tab-beauty"
            hidden={activeTab !== 'beauty'}
            className="admin-tab-panel"
          >
            {activeTab === 'beauty' ? <BeautyPagesEditor /> : null}
          </div>

          <div
            id="admin-panel-classes"
            role="tabpanel"
            aria-labelledby="admin-tab-classes"
            hidden={activeTab !== 'classes'}
            className="admin-tab-panel"
          >
            {activeTab === 'classes' ? <ClassesPagesEditor /> : null}
          </div>

          <div
            id="admin-panel-contact"
            role="tabpanel"
            aria-labelledby="admin-tab-contact"
            hidden={activeTab !== 'contact'}
            className="admin-tab-panel"
          >
            {activeTab === 'contact' ? <ContactPagesEditor /> : null}
          </div>

          <div
            id="admin-panel-creativeFx"
            role="tabpanel"
            aria-labelledby="admin-tab-creativeFx"
            hidden={activeTab !== 'creativeFx'}
            className="admin-tab-panel"
          >
            {activeTab === 'creativeFx' ? <CreativeFxPagesEditor /> : null}
          </div>

          <div
            id="admin-panel-faq"
            role="tabpanel"
            aria-labelledby="admin-tab-faq"
            hidden={activeTab !== 'faq'}
            className="admin-tab-panel"
          >
            {activeTab === 'faq' ? <FaqPagesEditor /> : null}
          </div>
        </div>
      </section>
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
              src={siteLogo}
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
          <div className="admin-panel">
            <AdminDashboard />
          </div>
        )}
      </div>
    </div>
  );
}
