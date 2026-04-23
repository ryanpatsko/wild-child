import React from 'react';
import { usePagesContentAdmin } from '../../context/PagesContentAdminContext';
import {
  AdminHtmlList,
  AdminStringList,
  emptyClassCard,
  PagesEditorSaveRow,
  patchClassCard,
  patchClasses,
} from './pagesEditorShared';

export default function ClassesPagesEditor() {
  const { status, loadError, draft, setDraft, saveError, saveSucceeded, saving, isDirty, onSave } =
    usePagesContentAdmin();

  if (status === 'loading') {
    return (
      <p className="admin-status" role="status">
        Loading pages content…
      </p>
    );
  }

  const classesContent = draft.classes;

  return (
    <form className="admin-bridal-form" onSubmit={onSave}>
      <h3 className="admin-panel-title">Classes</h3>
      <p className="admin-muted">Content for /makeup-classes.</p>
      {loadError ? (
        <p className="admin-warn" role="status">
          {loadError}
        </p>
      ) : null}

      <div className="admin-bridal-panel">
        <h4 className="admin-subheading">Classes (/makeup-classes)</h4>
        <label className="admin-label" htmlFor="pg-c-doc">
          Browser tab title
        </label>
        <input
          id="pg-c-doc"
          className="admin-input admin-input-full"
          value={classesContent.documentTitle}
          onChange={(e) => setDraft((d) => patchClasses(d, { documentTitle: e.target.value }))}
        />
        <label className="admin-label" htmlFor="pg-c-meta">
          Meta description
        </label>
        <textarea
          id="pg-c-meta"
          className="admin-textarea"
          rows={3}
          value={classesContent.metaDescription}
          onChange={(e) => setDraft((d) => patchClasses(d, { metaDescription: e.target.value }))}
        />
        <label className="admin-label" htmlFor="pg-c-h1">
          Page headline (H1)
        </label>
        <input
          id="pg-c-h1"
          className="admin-input admin-input-full"
          value={classesContent.pageTitle}
          onChange={(e) => setDraft((d) => patchClasses(d, { pageTitle: e.target.value }))}
        />
        <label className="admin-label" htmlFor="pg-c-intro">
          Intro
        </label>
        <textarea
          id="pg-c-intro"
          className="admin-textarea"
          rows={3}
          value={classesContent.introText}
          onChange={(e) => setDraft((d) => patchClasses(d, { introText: e.target.value }))}
        />

        {classesContent.cards.map((card, idx) => (
          <div key={idx} className="admin-card-editor">
            <h5 className="admin-subheading">{`Class ${idx + 1}`}</h5>
            <input
              className="admin-input admin-input-full"
              placeholder="Name"
              value={card.name}
              onChange={(e) => setDraft((d) => patchClassCard(d, idx, { name: e.target.value }))}
            />
            <input
              className="admin-input admin-input-full"
              placeholder="Price line"
              value={card.price}
              onChange={(e) => setDraft((d) => patchClassCard(d, idx, { price: e.target.value }))}
            />
            <label className="admin-label">Perfect for</label>
            <textarea
              className="admin-textarea"
              rows={2}
              value={card.perfectFor}
              onChange={(e) => setDraft((d) => patchClassCard(d, idx, { perfectFor: e.target.value }))}
            />
            <label className="admin-label">
              Details (simple cards). Leave blank if you use the lists below (palette-style card).
            </label>
            <textarea
              className="admin-textarea"
              rows={4}
              value={card.details}
              onChange={(e) => setDraft((d) => patchClassCard(d, idx, { details: e.target.value }))}
            />
            <AdminStringList
              label="What's included (optional — triggers palette layout with Pricing list)"
              idPrefix={`pg-c-inc-${idx}`}
              items={card.includedItems}
              onChange={(items) => setDraft((d) => patchClassCard(d, idx, { includedItems: items }))}
            />
            <AdminStringList
              label="Pricing lines (optional — pair with What's included)"
              idPrefix={`pg-c-pr-${idx}`}
              items={card.pricingItems}
              onChange={(items) => setDraft((d) => patchClassCard(d, idx, { pricingItems: items }))}
            />
            <label className="admin-label">Additional info (italic block)</label>
            <textarea
              className="admin-textarea"
              rows={2}
              value={card.additionalInfo}
              onChange={(e) => setDraft((d) => patchClassCard(d, idx, { additionalInfo: e.target.value }))}
            />
            <input
              className="admin-input admin-input-full"
              placeholder="Learn more path (e.g. /color-palette-party)"
              value={card.learnMorePath}
              onChange={(e) => setDraft((d) => patchClassCard(d, idx, { learnMorePath: e.target.value }))}
            />
            <input
              className="admin-input admin-input-full"
              placeholder="Learn more button label"
              value={card.learnMoreLabel}
              onChange={(e) => setDraft((d) => patchClassCard(d, idx, { learnMoreLabel: e.target.value }))}
            />
            <button
              type="button"
              className="admin-secondary-btn"
              onClick={() =>
                setDraft((d) => ({
                  ...d,
                  classes: {
                    ...d.classes,
                    cards: d.classes.cards.filter((_, j) => j !== idx),
                  },
                }))
              }
            >
              Remove this class
            </button>
          </div>
        ))}
        <button
          type="button"
          className="admin-secondary-btn"
          onClick={() =>
            setDraft((d) => ({
              ...d,
              classes: { ...d.classes, cards: [...d.classes.cards, emptyClassCard()] },
            }))
          }
        >
          Add class card
        </button>

        <label className="admin-label" htmlFor="pg-c-hourly">
          Hourly add-on note (centered)
        </label>
        <input
          id="pg-c-hourly"
          className="admin-input admin-input-full"
          value={classesContent.hourlyAddOnNote}
          onChange={(e) => setDraft((d) => patchClasses(d, { hourlyAddOnNote: e.target.value }))}
        />
        <label className="admin-label" htmlFor="pg-c-log-title">
          Logistics section title
        </label>
        <input
          id="pg-c-log-title"
          className="admin-input admin-input-full"
          value={classesContent.logisticsTitle}
          onChange={(e) => setDraft((d) => patchClasses(d, { logisticsTitle: e.target.value }))}
        />
        <AdminHtmlList
          label="Logistics bullets (HTML allowed)"
          idPrefix="pg-c-log"
          items={classesContent.logisticsItems}
          onChange={(items) => setDraft((d) => patchClasses(d, { logisticsItems: items }))}
        />
        <span className="admin-label">Footer CTA</span>
        <input
          className="admin-input admin-input-full"
          placeholder="Title"
          value={classesContent.cta.title}
          onChange={(e) =>
            setDraft((d) => ({
              ...d,
              classes: { ...d.classes, cta: { ...d.classes.cta, title: e.target.value } },
            }))
          }
        />
        <input
          className="admin-input admin-input-full"
          placeholder="Subtitle"
          value={classesContent.cta.subtitle}
          onChange={(e) =>
            setDraft((d) => ({
              ...d,
              classes: { ...d.classes, cta: { ...d.classes.cta, subtitle: e.target.value } },
            }))
          }
        />
        <input
          className="admin-input admin-input-full"
          placeholder="Button"
          value={classesContent.cta.buttonText}
          onChange={(e) =>
            setDraft((d) => ({
              ...d,
              classes: { ...d.classes, cta: { ...d.classes.cta, buttonText: e.target.value } },
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
