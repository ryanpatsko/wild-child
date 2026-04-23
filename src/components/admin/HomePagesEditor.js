import React from 'react';
import { usePagesContentAdmin } from '../../context/PagesContentAdminContext';
import { PagesEditorSaveRow } from './pagesEditorShared';

export default function HomePagesEditor() {
  const { status, loadError, draft, setDraft, saveError, saveSucceeded, saving, isDirty, onSave } =
    usePagesContentAdmin();

  if (status === 'loading') {
    return (
      <p className="admin-status" role="status">
        Loading pages content…
      </p>
    );
  }

  const { home } = draft;

  return (
    <form className="admin-bridal-form" onSubmit={onSave}>
      <h3 className="admin-panel-title">Home</h3>
      <p className="admin-muted">Content for / (hero title and intro text).</p>
      {loadError ? (
        <p className="admin-warn" role="status">
          {loadError}
        </p>
      ) : null}

      <div className="admin-bridal-panel">
        <h4 className="admin-subheading">Home hero (/)</h4>
        <label className="admin-label" htmlFor="pg-home-title">
          Page title (H1)
        </label>
        <input
          id="pg-home-title"
          className="admin-input admin-input-full"
          value={home.pageTitle}
          onChange={(e) => setDraft((d) => ({ ...d, home: { ...d.home, pageTitle: e.target.value } }))}
        />
        <label className="admin-label" htmlFor="pg-home-intro">
          Intro text
        </label>
        <textarea
          id="pg-home-intro"
          className="admin-textarea"
          rows={4}
          value={home.introText}
          onChange={(e) => setDraft((d) => ({ ...d, home: { ...d.home, introText: e.target.value } }))}
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
