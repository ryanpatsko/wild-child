import React from 'react';
import { usePagesContentAdmin } from '../../context/PagesContentAdminContext';
import { AdminHtmlList, AdminStringList, PagesEditorSaveRow } from './pagesEditorShared';

export default function CreativeFxPagesEditor() {
  const { status, loadError, draft, setDraft, saveError, saveSucceeded, saving, isDirty, onSave } =
    usePagesContentAdmin();

  if (status === 'loading') {
    return (
      <p className="admin-status" role="status">
        Loading pages content…
      </p>
    );
  }

  const { creativeFx } = draft;

  return (
    <form className="admin-bridal-form" onSubmit={onSave}>
      <h3 className="admin-panel-title">Creative &amp; FX</h3>
      <p className="admin-muted">Content for /creative-fx.</p>
      {loadError ? (
        <p className="admin-warn" role="status">
          {loadError}
        </p>
      ) : null}

      <div className="admin-bridal-panel">
        <h4 className="admin-subheading">Creative &amp; FX (/creative-fx)</h4>
        <label className="admin-label" htmlFor="pg-fx-doc">
          Browser tab title
        </label>
        <input
          id="pg-fx-doc"
          className="admin-input admin-input-full"
          value={creativeFx.documentTitle}
          onChange={(e) =>
            setDraft((d) => ({ ...d, creativeFx: { ...d.creativeFx, documentTitle: e.target.value } }))
          }
        />
        <label className="admin-label" htmlFor="pg-fx-meta">
          Meta description
        </label>
        <textarea
          id="pg-fx-meta"
          className="admin-textarea"
          rows={3}
          value={creativeFx.metaDescription}
          onChange={(e) =>
            setDraft((d) => ({
              ...d,
              creativeFx: { ...d.creativeFx, metaDescription: e.target.value },
            }))
          }
        />
        <label className="admin-label" htmlFor="pg-fx-h1">
          Page headline (H1)
        </label>
        <input
          id="pg-fx-h1"
          className="admin-input admin-input-full"
          value={creativeFx.pageTitle}
          onChange={(e) =>
            setDraft((d) => ({ ...d, creativeFx: { ...d.creativeFx, pageTitle: e.target.value } }))
          }
        />
        <label className="admin-label" htmlFor="pg-fx-intro">
          Intro
        </label>
        <textarea
          id="pg-fx-intro"
          className="admin-textarea"
          rows={5}
          value={creativeFx.introText}
          onChange={(e) =>
            setDraft((d) => ({ ...d, creativeFx: { ...d.creativeFx, introText: e.target.value } }))
          }
        />
        <label className="admin-label" htmlFor="pg-fx-svc-title">
          Services section title
        </label>
        <input
          id="pg-fx-svc-title"
          className="admin-input admin-input-full"
          value={creativeFx.servicesTitle}
          onChange={(e) =>
            setDraft((d) => ({
              ...d,
              creativeFx: { ...d.creativeFx, servicesTitle: e.target.value },
            }))
          }
        />
        <AdminHtmlList
          label="Service list items (HTML allowed)"
          idPrefix="pg-fx-svc"
          items={creativeFx.serviceItems}
          onChange={(items) =>
            setDraft((d) => ({ ...d, creativeFx: { ...d.creativeFx, serviceItems: items } }))
          }
        />
        <label className="admin-label" htmlFor="pg-fx-pr-title">
          Pricing section title
        </label>
        <input
          id="pg-fx-pr-title"
          className="admin-input admin-input-full"
          value={creativeFx.pricingTitle}
          onChange={(e) =>
            setDraft((d) => ({
              ...d,
              creativeFx: { ...d.creativeFx, pricingTitle: e.target.value },
            }))
          }
        />
        <AdminStringList
          label="Pricing bullets"
          idPrefix="pg-fx-pr"
          items={creativeFx.pricingItems}
          onChange={(items) =>
            setDraft((d) => ({ ...d, creativeFx: { ...d.creativeFx, pricingItems: items } }))
          }
        />
        <label className="admin-label" htmlFor="pg-fx-book-title">
          Booking section title
        </label>
        <input
          id="pg-fx-book-title"
          className="admin-input admin-input-full"
          value={creativeFx.bookingTitle}
          onChange={(e) =>
            setDraft((d) => ({
              ...d,
              creativeFx: { ...d.creativeFx, bookingTitle: e.target.value },
            }))
          }
        />
        <AdminStringList
          label="Booking paragraphs"
          idPrefix="pg_fx_book"
          items={creativeFx.bookingParagraphs}
          onChange={(items) =>
            setDraft((d) => ({ ...d, creativeFx: { ...d.creativeFx, bookingParagraphs: items } }))
          }
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
