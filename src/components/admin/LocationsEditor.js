import React, { useEffect, useMemo, useState } from 'react';
import {
  createDefaultLocationsContent,
  loadLocationsContent,
  sanitizeLocationsContentForSave,
} from '../../content/locationsContent';
import { saveLocationsContent } from '../../lib/cmsApi';
import { getStoredSessionToken } from '../../lib/adminAuth';

export default function LocationsEditor() {
  const [status, setStatus] = useState('loading');
  const [loadError, setLoadError] = useState(null);
  const [savedVersion, setSavedVersion] = useState(1);
  const [regionsNotice, setRegionsNotice] = useState('');
  const [baseline, setBaseline] = useState(null);
  const [saveError, setSaveError] = useState(null);
  const [saveSucceeded, setSaveSucceeded] = useState(false);
  const [saving, setSaving] = useState(false);

  const isDirty = useMemo(() => {
    if (baseline === null) return false;
    return regionsNotice !== baseline;
  }, [regionsNotice, baseline]);

  useEffect(() => {
    if (isDirty) setSaveSucceeded(false);
  }, [isDirty]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const data = await loadLocationsContent();
        if (cancelled) return;
        setSavedVersion(data.version);
        setRegionsNotice(data.regionsNotice);
        setBaseline(data.regionsNotice);
        setStatus('ready');
      } catch (e) {
        if (cancelled) return;
        const def = createDefaultLocationsContent();
        setSavedVersion(def.version);
        setRegionsNotice(def.regionsNotice);
        setBaseline(def.regionsNotice);
        setLoadError(
          e instanceof Error
            ? `${e.message} Using default copy until the JSON file is in S3 or the URL is correct.`
            : 'Could not load from S3. Using default copy.',
        );
        setStatus('ready');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function onSave(e) {
    e.preventDefault();
    setSaveError(null);
    setSaveSucceeded(false);
    const token = getStoredSessionToken();
    if (!token) {
      setSaveError('Not signed in.');
      return;
    }
    const nextVersion = savedVersion + 1;
    const doc = sanitizeLocationsContentForSave({ version: nextVersion, regionsNotice });
    setSaving(true);
    try {
      const result = await saveLocationsContent(token, doc);
      if (result.ok) {
        setSavedVersion(nextVersion);
        setBaseline(doc.regionsNotice);
        setRegionsNotice(doc.regionsNotice);
        setSaveSucceeded(true);
      } else {
        setSaveError(result.message);
      }
    } finally {
      setSaving(false);
    }
  }

  if (status === 'loading') {
    return (
      <p className="admin-status" role="status">
        Loading locations content…
      </p>
    );
  }

  return (
    <form className="admin-locations-form" onSubmit={onSave}>
      <h3 className="admin-panel-title">Locations</h3>
      <p className="admin-muted">
        This text appears in the yellow regions box on the Home page and in the &quot;Proudly serving the following
        regions&quot; section on the Bridal overview page.
      </p>
      {loadError ? (
        <p className="admin-warn" role="status">
          {loadError}
        </p>
      ) : null}
      <label className="admin-label" htmlFor="wc-regions-notice">
        Regions message
      </label>
      <textarea
        id="wc-regions-notice"
        className="admin-textarea"
        rows={5}
        value={regionsNotice}
        onChange={(ev) => setRegionsNotice(ev.target.value)}
        maxLength={3000}
      />
      <p className="admin-hint">{regionsNotice.length} / 3000 characters</p>
      {saveError ? (
        <p className="admin-error" role="alert">
          {saveError}
        </p>
      ) : null}
      <div className="admin-save-row">
        <button className="admin-submit" type="submit" disabled={saving || !isDirty}>
          {saving ? 'Saving…' : 'Save'}
        </button>
        {saveSucceeded ? (
          <span className="admin-save-feedback" role="status" aria-live="polite">
            <svg
              className="admin-save-check"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden
            >
              <path
                d="M20 6L9 17l-5-5"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Saved
          </span>
        ) : null}
      </div>
    </form>
  );
}
