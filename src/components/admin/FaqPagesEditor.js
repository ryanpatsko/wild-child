import React from 'react';
import { usePagesContentAdmin } from '../../context/PagesContentAdminContext';
import { PagesEditorSaveRow } from './pagesEditorShared';

export default function FaqPagesEditor() {
  const { status, loadError, draft, setDraft, saveError, saveSucceeded, saving, isDirty, onSave } =
    usePagesContentAdmin();

  if (status === 'loading') {
    return (
      <p className="admin-status" role="status">
        Loading pages content…
      </p>
    );
  }

  const { faq } = draft;

  return (
    <form className="admin-bridal-form" onSubmit={onSave}>
      <h3 className="admin-panel-title">FAQ</h3>
      <p className="admin-muted">Content for /faq.</p>
      {loadError ? (
        <p className="admin-warn" role="status">
          {loadError}
        </p>
      ) : null}

      <div className="admin-bridal-panel">
        <h4 className="admin-subheading">FAQ (/faq)</h4>
        <label className="admin-label" htmlFor="pg-q-doc">
          Browser tab title
        </label>
        <input
          id="pg-q-doc"
          className="admin-input admin-input-full"
          value={faq.documentTitle}
          onChange={(e) => setDraft((d) => ({ ...d, faq: { ...d.faq, documentTitle: e.target.value } }))}
        />
        <label className="admin-label" htmlFor="pg-q-meta">
          Meta description
        </label>
        <textarea
          id="pg-q-meta"
          className="admin-textarea"
          rows={3}
          value={faq.metaDescription}
          onChange={(e) =>
            setDraft((d) => ({ ...d, faq: { ...d.faq, metaDescription: e.target.value } }))
          }
        />
        <label className="admin-label" htmlFor="pg-q-h1">
          Page headline (H1)
        </label>
        <input
          id="pg-q-h1"
          className="admin-input admin-input-full"
          value={faq.pageTitle}
          onChange={(e) => setDraft((d) => ({ ...d, faq: { ...d.faq, pageTitle: e.target.value } }))}
        />
        <label className="admin-label" htmlFor="pg-q-intro">
          Intro
        </label>
        <textarea
          id="pg-q-intro"
          className="admin-textarea"
          rows={2}
          value={faq.introText}
          onChange={(e) => setDraft((d) => ({ ...d, faq: { ...d.faq, introText: e.target.value } }))}
        />

        {faq.items.map((item, idx) => (
          <div key={idx} className="admin-card-editor">
            <h5 className="admin-subheading">{`Question ${idx + 1}`}</h5>
            <input
              className="admin-input admin-input-full"
              placeholder="Question"
              value={item.question}
              onChange={(e) => {
                const items = faq.items.map((it, j) =>
                  j === idx ? { ...it, question: e.target.value } : it,
                );
                setDraft((d) => ({ ...d, faq: { ...d.faq, items } }));
              }}
            />
            <label className="admin-label">
              Answer (HTML allowed; use &lt;a href=&quot;/book-hair-and-makeup-artist&quot; class=&quot;faq-link&quot;&gt;)
            </label>
            <textarea
              className="admin-textarea admin-textarea-tall"
              rows={6}
              value={item.answerHtml}
              onChange={(e) => {
                const items = faq.items.map((it, j) =>
                  j === idx ? { ...it, answerHtml: e.target.value } : it,
                );
                setDraft((d) => ({ ...d, faq: { ...d.faq, items } }));
              }}
            />
            <button
              type="button"
              className="admin-secondary-btn"
              onClick={() =>
                setDraft((d) => ({
                  ...d,
                  faq: { ...d.faq, items: d.faq.items.filter((_, j) => j !== idx) },
                }))
              }
            >
              Remove Q&amp;A
            </button>
          </div>
        ))}
        <button
          type="button"
          className="admin-secondary-btn"
          onClick={() =>
            setDraft((d) => ({
              ...d,
              faq: { ...d.faq, items: [...d.faq.items, { question: '', answerHtml: '' }] },
            }))
          }
        >
          Add Q&amp;A
        </button>
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
