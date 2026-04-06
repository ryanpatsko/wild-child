import React, { useEffect, useMemo, useState } from 'react';
import {
  aboutContentSignature,
  createDefaultAboutContent,
  loadAboutContent,
  sanitizeAboutContentForSave,
} from '../../content/aboutContent';
import { saveAboutContent } from '../../lib/cmsApi';
import { getStoredSessionToken } from '../../lib/adminAuth';

function SaveFeedback() {
  return (
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
  );
}

export default function AboutEditor() {
  const [status, setStatus] = useState('loading');
  const [loadError, setLoadError] = useState(null);
  const [savedVersion, setSavedVersion] = useState(1);
  const [pageHeader, setPageHeader] = useState('');
  const [mainText, setMainText] = useState('');
  const [listIntro, setListIntro] = useState('');
  const [items, setItems] = useState([]);
  const [baselineSig, setBaselineSig] = useState(null);
  const [saveError, setSaveError] = useState(null);
  const [saveSucceeded, setSaveSucceeded] = useState(false);
  const [saving, setSaving] = useState(false);

  const currentSig = useMemo(
    () =>
      aboutContentSignature({
        pageHeader,
        mainText,
        listIntro,
        items,
      }),
    [pageHeader, mainText, listIntro, items],
  );

  const isDirty = useMemo(() => {
    if (baselineSig === null) return false;
    return currentSig !== baselineSig;
  }, [currentSig, baselineSig]);

  useEffect(() => {
    if (isDirty) setSaveSucceeded(false);
  }, [isDirty]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const data = await loadAboutContent();
        if (cancelled) return;
        setSavedVersion(data.version);
        setPageHeader(data.pageHeader);
        setMainText(data.mainText);
        setListIntro(data.listIntro);
        setItems(data.items.map((i) => ({ title: i.title, body: i.body })));
        setBaselineSig(
          aboutContentSignature({
            pageHeader: data.pageHeader,
            mainText: data.mainText,
            listIntro: data.listIntro,
            items: data.items,
          }),
        );
        setStatus('ready');
      } catch (e) {
        if (cancelled) return;
        const def = createDefaultAboutContent();
        setSavedVersion(def.version);
        setPageHeader(def.pageHeader);
        setMainText(def.mainText);
        setListIntro(def.listIntro);
        setItems(def.items.map((i) => ({ title: i.title, body: i.body })));
        setBaselineSig(
          aboutContentSignature({
            pageHeader: def.pageHeader,
            mainText: def.mainText,
            listIntro: def.listIntro,
            items: def.items,
          }),
        );
        setLoadError(
          e instanceof Error
            ? `${e.message} Using default copy until about-content.json is in S3 or the URL is correct.`
            : 'Could not load from S3. Using default copy.',
        );
        setStatus('ready');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  function updateItem(index, field, value) {
    setItems((prev) => {
      const next = prev.map((row, i) => (i === index ? { ...row, [field]: value } : row));
      return next;
    });
  }

  function addItem() {
    setItems((prev) => {
      if (prev.length >= 12) return prev;
      return [...prev, { title: '', body: '' }];
    });
  }

  function removeItem(index) {
    setItems((prev) => {
      if (prev.length <= 1) return prev;
      return prev.filter((_, i) => i !== index);
    });
  }

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
    const doc = sanitizeAboutContentForSave({
      version: nextVersion,
      pageHeader,
      mainText,
      listIntro,
      items,
    });
    setSaving(true);
    try {
      const result = await saveAboutContent(token, doc);
      if (result.ok) {
        setSavedVersion(nextVersion);
        setPageHeader(doc.pageHeader);
        setMainText(doc.mainText);
        setListIntro(doc.listIntro);
        setItems(doc.items.map((i) => ({ title: i.title, body: i.body })));
        setBaselineSig(
          aboutContentSignature({
            pageHeader: doc.pageHeader,
            mainText: doc.mainText,
            listIntro: doc.listIntro,
            items: doc.items,
          }),
        );
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
        Loading About page content…
      </p>
    );
  }

  return (
    <form className="admin-about-form" onSubmit={onSave}>
      <h3 className="admin-panel-title">About</h3>
      <p className="admin-muted">
        Edits the <strong>/about</strong> page: title, intro paragraphs, and each feature block (title + description).
      </p>
      {loadError ? (
        <p className="admin-warn" role="status">
          {loadError}
        </p>
      ) : null}

      <label className="admin-label" htmlFor="wc-about-header">
        Page header
      </label>
      <input
        id="wc-about-header"
        className="admin-input admin-input-full"
        type="text"
        value={pageHeader}
        onChange={(ev) => setPageHeader(ev.target.value)}
        maxLength={400}
      />

      <label className="admin-label" htmlFor="wc-about-main">
        Main text
      </label>
      <textarea
        id="wc-about-main"
        className="admin-textarea"
        rows={4}
        value={mainText}
        onChange={(ev) => setMainText(ev.target.value)}
        maxLength={6000}
      />
      <p className="admin-hint">{mainText.length} / 6000</p>

      <label className="admin-label" htmlFor="wc-about-list-intro">
        Text above the feature list
      </label>
      <textarea
        id="wc-about-list-intro"
        className="admin-textarea"
        rows={2}
        value={listIntro}
        onChange={(ev) => setListIntro(ev.target.value)}
        maxLength={2000}
      />
      <p className="admin-hint">{listIntro.length} / 2000</p>

      <h4 className="admin-subheading">Feature list</h4>
      <p className="admin-muted admin-muted-tight">Each entry shows a title with the lips icon and a paragraph below it.</p>

      {items.map((row, index) => (
        <div key={index} className="admin-about-item">
          <div className="admin-about-item-head">
            <span className="admin-about-item-label">Item {index + 1}</span>
            {items.length > 1 ? (
              <button
                type="button"
                className="admin-text-btn"
                onClick={() => removeItem(index)}
              >
                Remove
              </button>
            ) : null}
          </div>
          <label className="admin-label visually-hidden" htmlFor={`wc-about-item-title-${index}`}>
            Item {index + 1} title
          </label>
          <input
            id={`wc-about-item-title-${index}`}
            className="admin-input admin-input-full"
            type="text"
            placeholder="Title"
            value={row.title}
            onChange={(ev) => updateItem(index, 'title', ev.target.value)}
            maxLength={400}
          />
          <label className="admin-label visually-hidden" htmlFor={`wc-about-item-body-${index}`}>
            Item {index + 1} description
          </label>
          <textarea
            id={`wc-about-item-body-${index}`}
            className="admin-textarea"
            rows={4}
            placeholder="Description"
            value={row.body}
            onChange={(ev) => updateItem(index, 'body', ev.target.value)}
            maxLength={6000}
          />
        </div>
      ))}

      {items.length < 12 ? (
        <button type="button" className="admin-secondary-btn" onClick={addItem}>
          Add item
        </button>
      ) : null}

      {saveError ? (
        <p className="admin-error" role="alert">
          {saveError}
        </p>
      ) : null}
      <div className="admin-save-row">
        <button className="admin-submit" type="submit" disabled={saving || !isDirty}>
          {saving ? 'Saving…' : 'Save'}
        </button>
        {saveSucceeded ? <SaveFeedback /> : null}
      </div>
    </form>
  );
}
