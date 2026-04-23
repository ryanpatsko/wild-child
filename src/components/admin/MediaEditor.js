import React, { useEffect, useMemo, useState } from 'react';
import {
  createDefaultMediaContent,
  loadMediaContent,
  mediaContentSignature,
  sanitizeMediaContentForSave,
} from '../../content/mediaContent';
import { saveMediaContent } from '../../lib/cmsApi';
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

function buildDraftDoc(state) {
  const {
    documentTitle,
    metaDescription,
    pageHeader,
    introText,
    collaborativeTitle,
    collaborativeBody,
    whyDifferentTitle,
    pillars,
    ratesTitle,
    ratesNote,
    rates,
    clientsTitle,
    clientGroups,
    selectedWorkTitle,
    selectedWorkBody,
    selectedWorkFootnote,
  } = state;
  return {
    documentTitle,
    metaDescription,
    pageHeader,
    introText,
    collaborativeTitle,
    collaborativeBody,
    whyDifferentTitle,
    whyDifferentPillars: pillars,
    ratesTitle,
    ratesNote,
    rates,
    clientsTitle,
    clientGroups,
    selectedWorkTitle,
    selectedWorkBody,
    selectedWorkFootnote,
  };
}

export default function MediaEditor() {
  const [status, setStatus] = useState('loading');
  const [loadError, setLoadError] = useState(null);
  const [savedVersion, setSavedVersion] = useState(1);

  const [documentTitle, setDocumentTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [pageHeader, setPageHeader] = useState('');
  const [introText, setIntroText] = useState('');
  const [collaborativeTitle, setCollaborativeTitle] = useState('');
  const [collaborativeBody, setCollaborativeBody] = useState('');
  const [whyDifferentTitle, setWhyDifferentTitle] = useState('');
  const [pillars, setPillars] = useState([]);
  const [ratesTitle, setRatesTitle] = useState('');
  const [ratesNote, setRatesNote] = useState('');
  const [rates, setRates] = useState([]);
  const [clientsTitle, setClientsTitle] = useState('');
  const [clientGroups, setClientGroups] = useState([]);
  const [selectedWorkTitle, setSelectedWorkTitle] = useState('');
  const [selectedWorkBody, setSelectedWorkBody] = useState('');
  const [selectedWorkFootnote, setSelectedWorkFootnote] = useState('');

  const [baselineSig, setBaselineSig] = useState(null);
  const [saveError, setSaveError] = useState(null);
  const [saveSucceeded, setSaveSucceeded] = useState(false);
  const [saving, setSaving] = useState(false);

  const currentSig = useMemo(
    () =>
      mediaContentSignature(
        buildDraftDoc({
          pageHeader,
          documentTitle,
          metaDescription,
          introText,
          collaborativeTitle,
          collaborativeBody,
          whyDifferentTitle,
          pillars,
          ratesTitle,
          ratesNote,
          rates,
          clientsTitle,
          clientGroups,
          selectedWorkTitle,
          selectedWorkBody,
          selectedWorkFootnote,
        }),
      ),
    [
      pageHeader,
      documentTitle,
      metaDescription,
      introText,
      collaborativeTitle,
      collaborativeBody,
      whyDifferentTitle,
      pillars,
      ratesTitle,
      ratesNote,
      rates,
      clientsTitle,
      clientGroups,
      selectedWorkTitle,
      selectedWorkBody,
      selectedWorkFootnote,
    ],
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
    function apply(loaded) {
      setSavedVersion(loaded.version);
      setDocumentTitle(loaded.documentTitle);
      setMetaDescription(loaded.metaDescription);
      setPageHeader(loaded.pageHeader);
      setIntroText(loaded.introText);
      setCollaborativeTitle(loaded.collaborativeTitle);
      setCollaborativeBody(loaded.collaborativeBody);
      setWhyDifferentTitle(loaded.whyDifferentTitle);
      setPillars(loaded.whyDifferentPillars.map((p) => ({ title: p.title, body: p.body })));
      setRatesTitle(loaded.ratesTitle);
      setRatesNote(loaded.ratesNote);
      setRates(loaded.rates.map((r) => ({ label: r.label, sublabel: r.sublabel, price: r.price })));
      setClientsTitle(loaded.clientsTitle);
      setClientGroups(loaded.clientGroups.map((c) => ({ title: c.title, body: c.body })));
      setSelectedWorkTitle(loaded.selectedWorkTitle);
      setSelectedWorkBody(loaded.selectedWorkBody);
      setSelectedWorkFootnote(loaded.selectedWorkFootnote);
      setBaselineSig(mediaContentSignature(loaded));
    }
    void (async () => {
      try {
        const data = await loadMediaContent();
        if (cancelled) return;
        apply(data);
        setStatus('ready');
      } catch (e) {
        if (cancelled) return;
        const def = createDefaultMediaContent();
        apply(def);
        setLoadError(
          e instanceof Error
            ? `${e.message} Using default copy until media-content.json is in S3 or the URL is correct.`
            : 'Could not load from S3. Using default copy.',
        );
        setStatus('ready');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  function updatePillar(index, field, value) {
    setPillars((prev) => prev.map((row, i) => (i === index ? { ...row, [field]: value } : row)));
  }

  function addPillar() {
    setPillars((prev) => (prev.length >= 8 ? prev : [...prev, { title: '', body: '' }]));
  }

  function removePillar(index) {
    setPillars((prev) => (prev.length <= 1 ? prev : prev.filter((_, i) => i !== index)));
  }

  function updateRate(index, field, value) {
    setRates((prev) => prev.map((row, i) => (i === index ? { ...row, [field]: value } : row)));
  }

  function addRate() {
    setRates((prev) => (prev.length >= 6 ? prev : [...prev, { label: '', sublabel: '', price: '' }]));
  }

  function removeRate(index) {
    setRates((prev) => (prev.length <= 1 ? prev : prev.filter((_, i) => i !== index)));
  }

  function updateClient(index, field, value) {
    setClientGroups((prev) =>
      prev.map((row, i) => (i === index ? { ...row, [field]: value } : row)),
    );
  }

  function addClient() {
    setClientGroups((prev) =>
      prev.length >= 12 ? prev : [...prev, { title: '', body: '' }],
    );
  }

  function removeClient(index) {
    setClientGroups((prev) => (prev.length <= 1 ? prev : prev.filter((_, i) => i !== index)));
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
    const doc = sanitizeMediaContentForSave({
      version: nextVersion,
      documentTitle,
      metaDescription,
      pageHeader,
      introText,
      collaborativeTitle,
      collaborativeBody,
      whyDifferentTitle,
      whyDifferentPillars: pillars,
      ratesTitle,
      ratesNote,
      rates,
      clientsTitle,
      clientGroups,
      selectedWorkTitle,
      selectedWorkBody,
      selectedWorkFootnote,
    });
    setSaving(true);
    try {
      const result = await saveMediaContent(token, doc);
      if (result.ok) {
        setSavedVersion(nextVersion);
        setDocumentTitle(doc.documentTitle);
        setMetaDescription(doc.metaDescription);
        setPageHeader(doc.pageHeader);
        setIntroText(doc.introText);
        setCollaborativeTitle(doc.collaborativeTitle);
        setCollaborativeBody(doc.collaborativeBody);
        setWhyDifferentTitle(doc.whyDifferentTitle);
        setPillars(doc.whyDifferentPillars.map((p) => ({ title: p.title, body: p.body })));
        setRatesTitle(doc.ratesTitle);
        setRatesNote(doc.ratesNote);
        setRates(doc.rates.map((r) => ({ label: r.label, sublabel: r.sublabel, price: r.price })));
        setClientsTitle(doc.clientsTitle);
        setClientGroups(doc.clientGroups.map((c) => ({ title: c.title, body: c.body })));
        setSelectedWorkTitle(doc.selectedWorkTitle);
        setSelectedWorkBody(doc.selectedWorkBody);
        setSelectedWorkFootnote(doc.selectedWorkFootnote);
        setBaselineSig(mediaContentSignature(doc));
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
        Loading TV / Media page content…
      </p>
    );
  }

  return (
    <form className="admin-media-form" onSubmit={onSave}>
      <h3 className="admin-panel-title">On-Set &amp; Production</h3>
      <p className="admin-muted">
        Edits the <strong>/film-tv-makeup-artist</strong> page (banner image stays in the codebase). Match the main site nav label:
        On-Set &amp; Production.
      </p>
      {loadError ? (
        <p className="admin-warn" role="status">
          {loadError}
        </p>
      ) : null}

      <h4 className="admin-subheading">Page intro</h4>
      <label className="admin-label" htmlFor="wc-media-doc">
        Browser tab title
      </label>
      <input
        id="wc-media-doc"
        className="admin-input admin-input-full"
        type="text"
        value={documentTitle}
        onChange={(ev) => setDocumentTitle(ev.target.value)}
        maxLength={500}
      />
      <label className="admin-label" htmlFor="wc-media-meta">
        Meta description
      </label>
      <textarea
        id="wc-media-meta"
        className="admin-textarea"
        rows={3}
        value={metaDescription}
        onChange={(ev) => setMetaDescription(ev.target.value)}
        maxLength={2000}
      />
      <label className="admin-label" htmlFor="wc-media-header">
        Page title (H1)
      </label>
      <input
        id="wc-media-header"
        className="admin-input admin-input-full"
        type="text"
        value={pageHeader}
        onChange={(ev) => setPageHeader(ev.target.value)}
        maxLength={400}
      />
      <label className="admin-label" htmlFor="wc-media-intro">
        Intro paragraph
      </label>
      <textarea
        id="wc-media-intro"
        className="admin-textarea"
        rows={4}
        value={introText}
        onChange={(ev) => setIntroText(ev.target.value)}
        maxLength={6000}
      />
      <p className="admin-hint">{introText.length} / 6000</p>

      <h4 className="admin-subheading">Our collaborative process</h4>
      <label className="admin-label" htmlFor="wc-media-collab-title">
        Section title
      </label>
      <input
        id="wc-media-collab-title"
        className="admin-input admin-input-full"
        type="text"
        value={collaborativeTitle}
        onChange={(ev) => setCollaborativeTitle(ev.target.value)}
        maxLength={400}
      />
      <label className="admin-label" htmlFor="wc-media-collab-body">
        Body
      </label>
      <textarea
        id="wc-media-collab-body"
        className="admin-textarea"
        rows={5}
        value={collaborativeBody}
        onChange={(ev) => setCollaborativeBody(ev.target.value)}
        maxLength={8000}
      />

      <h4 className="admin-subheading">Why we&apos;re different</h4>
      <label className="admin-label" htmlFor="wc-media-why-title">
        Section title
      </label>
      <input
        id="wc-media-why-title"
        className="admin-input admin-input-full"
        type="text"
        value={whyDifferentTitle}
        onChange={(ev) => setWhyDifferentTitle(ev.target.value)}
        maxLength={400}
      />
      <p className="admin-muted admin-muted-tight">Cards in the grid (1–8).</p>
      {pillars.map((row, index) => (
        <div key={index} className="admin-about-item">
          <div className="admin-about-item-head">
            <span className="admin-about-item-label">Highlight {index + 1}</span>
            {pillars.length > 1 ? (
              <button type="button" className="admin-text-btn" onClick={() => removePillar(index)}>
                Remove
              </button>
            ) : null}
          </div>
          <input
            className="admin-input admin-input-full"
            type="text"
            placeholder="Card title"
            value={row.title}
            onChange={(ev) => updatePillar(index, 'title', ev.target.value)}
            maxLength={200}
          />
          <textarea
            className="admin-textarea"
            rows={3}
            placeholder="Card body"
            value={row.body}
            onChange={(ev) => updatePillar(index, 'body', ev.target.value)}
            maxLength={2500}
          />
        </div>
      ))}
      {pillars.length < 8 ? (
        <button type="button" className="admin-secondary-btn" onClick={addPillar}>
          Add highlight
        </button>
      ) : null}

      <h4 className="admin-subheading">Rates</h4>
      <label className="admin-label" htmlFor="wc-media-rates-title">
        Section title
      </label>
      <input
        id="wc-media-rates-title"
        className="admin-input admin-input-full"
        type="text"
        value={ratesTitle}
        onChange={(ev) => setRatesTitle(ev.target.value)}
        maxLength={400}
      />
      <label className="admin-label" htmlFor="wc-media-rates-note">
        Note under title (e.g. kit / travel)
      </label>
      <textarea
        id="wc-media-rates-note"
        className="admin-textarea"
        rows={2}
        value={ratesNote}
        onChange={(ev) => setRatesNote(ev.target.value)}
        maxLength={500}
      />
      <p className="admin-muted admin-muted-tight">Rate cards (1–6).</p>
      {rates.map((row, index) => (
        <div key={index} className="admin-about-item">
          <div className="admin-about-item-head">
            <span className="admin-about-item-label">Rate {index + 1}</span>
            {rates.length > 1 ? (
              <button type="button" className="admin-text-btn" onClick={() => removeRate(index)}>
                Remove
              </button>
            ) : null}
          </div>
          <input
            className="admin-input admin-input-full"
            type="text"
            placeholder="Label (e.g. Full day)"
            value={row.label}
            onChange={(ev) => updateRate(index, 'label', ev.target.value)}
            maxLength={300}
          />
          <input
            className="admin-input admin-input-full"
            type="text"
            placeholder="Sublabel (optional, e.g. up to 10 hrs)"
            value={row.sublabel}
            onChange={(ev) => updateRate(index, 'sublabel', ev.target.value)}
            maxLength={300}
          />
          <input
            className="admin-input admin-input-full"
            type="text"
            placeholder="Price line"
            value={row.price}
            onChange={(ev) => updateRate(index, 'price', ev.target.value)}
            maxLength={300}
          />
        </div>
      ))}
      {rates.length < 6 ? (
        <button type="button" className="admin-secondary-btn" onClick={addRate}>
          Add rate
        </button>
      ) : null}

      <h4 className="admin-subheading">Notable talent &amp; clients</h4>
      <label className="admin-label" htmlFor="wc-media-clients-title">
        Section title
      </label>
      <input
        id="wc-media-clients-title"
        className="admin-input admin-input-full"
        type="text"
        value={clientsTitle}
        onChange={(ev) => setClientsTitle(ev.target.value)}
        maxLength={400}
      />
      <p className="admin-muted admin-muted-tight">Client cards (1–12).</p>
      {clientGroups.map((row, index) => (
        <div key={index} className="admin-about-item">
          <div className="admin-about-item-head">
            <span className="admin-about-item-label">Group {index + 1}</span>
            {clientGroups.length > 1 ? (
              <button type="button" className="admin-text-btn" onClick={() => removeClient(index)}>
                Remove
              </button>
            ) : null}
          </div>
          <input
            className="admin-input admin-input-full"
            type="text"
            placeholder="Group title"
            value={row.title}
            onChange={(ev) => updateClient(index, 'title', ev.target.value)}
            maxLength={200}
          />
          <textarea
            className="admin-textarea"
            rows={3}
            placeholder="Names / description"
            value={row.body}
            onChange={(ev) => updateClient(index, 'body', ev.target.value)}
            maxLength={4000}
          />
        </div>
      ))}
      {clientGroups.length < 12 ? (
        <button type="button" className="admin-secondary-btn" onClick={addClient}>
          Add client group
        </button>
      ) : null}

      <h4 className="admin-subheading">Selected work</h4>
      <label className="admin-label" htmlFor="wc-media-sw-title">
        Section title
      </label>
      <input
        id="wc-media-sw-title"
        className="admin-input admin-input-full"
        type="text"
        value={selectedWorkTitle}
        onChange={(ev) => setSelectedWorkTitle(ev.target.value)}
        maxLength={400}
      />
      <label className="admin-label" htmlFor="wc-media-sw-body">
        Credits / list body
      </label>
      <textarea
        id="wc-media-sw-body"
        className="admin-textarea"
        rows={5}
        value={selectedWorkBody}
        onChange={(ev) => setSelectedWorkBody(ev.target.value)}
        maxLength={12000}
      />
      <label className="admin-label" htmlFor="wc-media-sw-foot">
        Footnote (muted line below)
      </label>
      <input
        id="wc-media-sw-foot"
        className="admin-input admin-input-full"
        type="text"
        value={selectedWorkFootnote}
        onChange={(ev) => setSelectedWorkFootnote(ev.target.value)}
        maxLength={500}
      />

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
