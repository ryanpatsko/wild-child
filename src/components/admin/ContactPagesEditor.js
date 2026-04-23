import React from 'react';
import { usePagesContentAdmin } from '../../context/PagesContentAdminContext';
import { PagesEditorSaveRow } from './pagesEditorShared';

export default function ContactPagesEditor() {
  const { status, loadError, draft, setDraft, saveError, saveSucceeded, saving, isDirty, onSave } =
    usePagesContentAdmin();

  if (status === 'loading') {
    return (
      <p className="admin-status" role="status">
        Loading pages content…
      </p>
    );
  }

  const { contact } = draft;

  return (
    <form className="admin-bridal-form" onSubmit={onSave}>
      <h3 className="admin-panel-title">Contact</h3>
      <p className="admin-muted">Content for /book-hair-and-makeup-artist (top section only).</p>
      {loadError ? (
        <p className="admin-warn" role="status">
          {loadError}
        </p>
      ) : null}

      <div className="admin-bridal-panel">
        <h4 className="admin-subheading">Contact top section (/book-hair-and-makeup-artist)</h4>
        <label className="admin-label" htmlFor="pg-contact-doc">
          Browser tab title
        </label>
        <input
          id="pg-contact-doc"
          className="admin-input admin-input-full"
          value={contact.documentTitle}
          onChange={(e) => setDraft((d) => ({ ...d, contact: { ...d.contact, documentTitle: e.target.value } }))}
        />
        <label className="admin-label" htmlFor="pg-contact-meta">
          Meta description
        </label>
        <textarea
          id="pg-contact-meta"
          className="admin-textarea"
          rows={3}
          value={contact.metaDescription}
          onChange={(e) => setDraft((d) => ({ ...d, contact: { ...d.contact, metaDescription: e.target.value } }))}
        />
        <label className="admin-label" htmlFor="pg-contact-h1">
          Heading (H1)
        </label>
        <input
          id="pg-contact-h1"
          className="admin-input admin-input-full"
          value={contact.pageTitle}
          onChange={(e) => setDraft((d) => ({ ...d, contact: { ...d.contact, pageTitle: e.target.value } }))}
        />
        <label className="admin-label" htmlFor="pg-contact-intro">
          Intro text
        </label>
        <textarea
          id="pg-contact-intro"
          className="admin-textarea"
          rows={3}
          value={contact.introText}
          onChange={(e) => setDraft((d) => ({ ...d, contact: { ...d.contact, introText: e.target.value } }))}
        />

        <h4 className="admin-subheading">Buttons</h4>
        <label className="admin-label" htmlFor="pg-contact-ig-label">
          Instagram button text
        </label>
        <input
          id="pg-contact-ig-label"
          className="admin-input admin-input-full"
          value={contact.instagramButtonText}
          onChange={(e) =>
            setDraft((d) => ({ ...d, contact: { ...d.contact, instagramButtonText: e.target.value } }))
          }
        />
        <label className="admin-label" htmlFor="pg-contact-ig-url">
          Instagram URL
        </label>
        <input
          id="pg-contact-ig-url"
          className="admin-input admin-input-full"
          value={contact.instagramUrl}
          onChange={(e) => setDraft((d) => ({ ...d, contact: { ...d.contact, instagramUrl: e.target.value } }))}
        />
        <label className="admin-label" htmlFor="pg-contact-venmo-label">
          Venmo button text
        </label>
        <input
          id="pg-contact-venmo-label"
          className="admin-input admin-input-full"
          value={contact.venmoButtonText}
          onChange={(e) => setDraft((d) => ({ ...d, contact: { ...d.contact, venmoButtonText: e.target.value } }))}
        />
        <label className="admin-label" htmlFor="pg-contact-venmo-url">
          Venmo URL
        </label>
        <input
          id="pg-contact-venmo-url"
          className="admin-input admin-input-full"
          value={contact.venmoUrl}
          onChange={(e) => setDraft((d) => ({ ...d, contact: { ...d.contact, venmoUrl: e.target.value } }))}
        />

        <h4 className="admin-subheading">Info banner</h4>
        <label className="admin-label" htmlFor="pg-contact-info-prefix">
          Prefix text
        </label>
        <input
          id="pg-contact-info-prefix"
          className="admin-input admin-input-full"
          value={contact.infoPrefix}
          onChange={(e) => setDraft((d) => ({ ...d, contact: { ...d.contact, infoPrefix: e.target.value } }))}
        />
        <label className="admin-label" htmlFor="pg-contact-info-link">
          Link text
        </label>
        <input
          id="pg-contact-info-link"
          className="admin-input admin-input-full"
          value={contact.infoLinkText}
          onChange={(e) => setDraft((d) => ({ ...d, contact: { ...d.contact, infoLinkText: e.target.value } }))}
        />
        <label className="admin-label" htmlFor="pg-contact-info-email">
          Email address (for mailto link)
        </label>
        <input
          id="pg-contact-info-email"
          className="admin-input admin-input-full"
          value={contact.infoEmail}
          onChange={(e) => setDraft((d) => ({ ...d, contact: { ...d.contact, infoEmail: e.target.value } }))}
        />
        <label className="admin-label" htmlFor="pg-contact-info-middle">
          Middle text
        </label>
        <input
          id="pg-contact-info-middle"
          className="admin-input admin-input-full"
          value={contact.infoMiddleText}
          onChange={(e) => setDraft((d) => ({ ...d, contact: { ...d.contact, infoMiddleText: e.target.value } }))}
        />
        <label className="admin-label" htmlFor="pg-contact-info-phone">
          Phone text
        </label>
        <input
          id="pg-contact-info-phone"
          className="admin-input admin-input-full"
          value={contact.infoPhone}
          onChange={(e) => setDraft((d) => ({ ...d, contact: { ...d.contact, infoPhone: e.target.value } }))}
        />
        <label className="admin-label" htmlFor="pg-contact-info-suffix">
          Suffix text
        </label>
        <input
          id="pg-contact-info-suffix"
          className="admin-input admin-input-full"
          value={contact.infoSuffix}
          onChange={(e) => setDraft((d) => ({ ...d, contact: { ...d.contact, infoSuffix: e.target.value } }))}
        />
      </div>

      <PagesEditorSaveRow
        saveError={saveError}
        saveSucceeded={saveSucceeded}
        saving={saving}
        isDirty={isDirty}
      />
    </form>
  );
}
