import React from 'react';
import { usePagesContentAdmin } from '../../context/PagesContentAdminContext';
import { AdminHtmlList, AdminStringList, PagesEditorSaveRow } from './pagesEditorShared';

export default function BeautyPagesEditor() {
  const { status, loadError, draft, setDraft, saveError, saveSucceeded, saving, isDirty, onSave } =
    usePagesContentAdmin();

  if (status === 'loading') {
    return (
      <p className="admin-status" role="status">
        Loading pages content…
      </p>
    );
  }

  const { beauty } = draft;

  return (
    <form className="admin-bridal-form" onSubmit={onSave}>
      <h3 className="admin-panel-title">Beauty & Events</h3>
      <p className="admin-muted">Content for /event-hair-and-makeup.</p>
      {loadError ? (
        <p className="admin-warn" role="status">
          {loadError}
        </p>
      ) : null}

      <div className="admin-bridal-panel">
        <h4 className="admin-subheading">Beauty & Events (/event-hair-and-makeup)</h4>
        <label className="admin-label" htmlFor="pg-b-doc">
          Browser tab title
        </label>
        <input
          id="pg-b-doc"
          className="admin-input admin-input-full"
          value={beauty.documentTitle}
          onChange={(e) =>
            setDraft((d) => ({ ...d, beauty: { ...d.beauty, documentTitle: e.target.value } }))
          }
        />
        <label className="admin-label" htmlFor="pg-b-meta">
          Meta description
        </label>
        <textarea
          id="pg-b-meta"
          className="admin-textarea"
          rows={3}
          value={beauty.metaDescription}
          onChange={(e) =>
            setDraft((d) => ({ ...d, beauty: { ...d.beauty, metaDescription: e.target.value } }))
          }
        />
        <label className="admin-label" htmlFor="pg-b-h1">
          Page headline (H1)
        </label>
        <input
          id="pg-b-h1"
          className="admin-input admin-input-full"
          value={beauty.pageTitle}
          onChange={(e) => setDraft((d) => ({ ...d, beauty: { ...d.beauty, pageTitle: e.target.value } }))}
        />
        <label className="admin-label" htmlFor="pg-b-intro">
          Intro
        </label>
        <textarea
          id="pg-b-intro"
          className="admin-textarea"
          rows={4}
          value={beauty.introText}
          onChange={(e) => setDraft((d) => ({ ...d, beauty: { ...d.beauty, introText: e.target.value } }))}
        />
        <label className="admin-label" htmlFor="pg-b-hair-title">
          Hair / makeup section title
        </label>
        <input
          id="pg-b-hair-title"
          className="admin-input admin-input-full"
          value={beauty.hairSectionTitle}
          onChange={(e) =>
            setDraft((d) => ({ ...d, beauty: { ...d.beauty, hairSectionTitle: e.target.value } }))
          }
        />
        <AdminStringList
          label="Hair / makeup bullets"
          idPrefix="pg-b-hair"
          items={beauty.hairItems}
          inlineRemove
          onChange={(items) => setDraft((d) => ({ ...d, beauty: { ...d.beauty, hairItems: items } }))}
        />
        <label className="admin-label" htmlFor="pg-b-loc-title">
          Location section title
        </label>
        <input
          id="pg-b-loc-title"
          className="admin-input admin-input-full"
          value={beauty.locationSectionTitle}
          onChange={(e) =>
            setDraft((d) => ({ ...d, beauty: { ...d.beauty, locationSectionTitle: e.target.value } }))
          }
        />
        <AdminStringList
          label="Location bullets"
          idPrefix="pg-b-loc"
          items={beauty.locationItems}
          inlineRemove
          onChange={(items) => setDraft((d) => ({ ...d, beauty: { ...d.beauty, locationItems: items } }))}
        />
        <label className="admin-label" htmlFor="pg-b-rates-title">
          Rates section title
        </label>
        <input
          id="pg-b-rates-title"
          className="admin-input admin-input-full"
          value={beauty.ratesSectionTitle}
          onChange={(e) =>
            setDraft((d) => ({ ...d, beauty: { ...d.beauty, ratesSectionTitle: e.target.value } }))
          }
        />
        <span className="admin-label">Rates table</span>
        {beauty.ratesTable.map((row, i) => (
          <div key={i} className="admin-row-gap admin-inline-pair">
            <input
              className="admin-input"
              placeholder="Service"
              value={row.service}
              onChange={(e) => {
                const next = [...beauty.ratesTable];
                next[i] = { ...next[i], service: e.target.value };
                setDraft((d) => ({ ...d, beauty: { ...d.beauty, ratesTable: next } }));
              }}
            />
            <input
              className="admin-input"
              placeholder="Price"
              value={row.price}
              onChange={(e) => {
                const next = [...beauty.ratesTable];
                next[i] = { ...next[i], price: e.target.value };
                setDraft((d) => ({ ...d, beauty: { ...d.beauty, ratesTable: next } }));
              }}
            />
            <button
              type="button"
              className="admin-secondary-btn"
              onClick={() =>
                setDraft((d) => ({
                  ...d,
                  beauty: {
                    ...d.beauty,
                    ratesTable: d.beauty.ratesTable.filter((_, j) => j !== i),
                  },
                }))
              }
            >
              Remove row
            </button>
          </div>
        ))}
        <button
          type="button"
          className="admin-secondary-btn"
          onClick={() =>
            setDraft((d) => ({
              ...d,
              beauty: { ...d.beauty, ratesTable: [...d.beauty.ratesTable, { service: '', price: '' }] },
            }))
          }
        >
          Add table row
        </button>
        <AdminHtmlList
          label="Notes under table (HTML allowed)"
          hint="Rendered as list items; use &lt;strong&gt; for labels."
          idPrefix="pg-b-notes"
          items={beauty.ratesNotes}
          onChange={(items) => setDraft((d) => ({ ...d, beauty: { ...d.beauty, ratesNotes: items } }))}
        />
        <span className="admin-label">Footer CTA</span>
        <input
          className="admin-input admin-input-full"
          placeholder="Title"
          value={beauty.cta.title}
          onChange={(e) =>
            setDraft((d) => ({
              ...d,
              beauty: { ...d.beauty, cta: { ...d.beauty.cta, title: e.target.value } },
            }))
          }
        />
        <input
          className="admin-input admin-input-full"
          placeholder="Subtitle"
          value={beauty.cta.subtitle}
          onChange={(e) =>
            setDraft((d) => ({
              ...d,
              beauty: { ...d.beauty, cta: { ...d.beauty.cta, subtitle: e.target.value } },
            }))
          }
        />
        <input
          className="admin-input admin-input-full"
          placeholder="Button"
          value={beauty.cta.buttonText}
          onChange={(e) =>
            setDraft((d) => ({
              ...d,
              beauty: { ...d.beauty, cta: { ...d.beauty.cta, buttonText: e.target.value } },
            }))
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
