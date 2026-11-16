import React from 'react';
import { AdminIconButton } from './AdminControls';

export function SaveFeedback() {
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

export function AdminStringList({ label, items, onChange, idPrefix }) {
  return (
    <div className="admin-field-block">
      <span className="admin-label">{label}</span>
      {items.map((item, i) => (
        <div key={`${idPrefix}-${i}`} className="admin-string-list-row">
          <input
            id={`${idPrefix}-${i}`}
            className="admin-input"
            value={item}
            onChange={(e) => {
              const next = [...items];
              next[i] = e.target.value;
              onChange(next);
            }}
          />
          <AdminIconButton icon="remove" label={`Remove ${label} line ${i + 1}`} onClick={() => onChange(items.filter((_, j) => j !== i))} />
        </div>
      ))}
      <button type="button" className="admin-secondary-btn" onClick={() => onChange([...items, ''])}>
        Add line
      </button>
    </div>
  );
}

export function AdminHtmlList({ label, items, onChange, idPrefix, hint }) {
  return (
    <div className="admin-field-block">
      <span className="admin-label">{label}</span>
      {hint ? <p className="admin-hint admin-muted">{hint}</p> : null}
      {items.map((item, i) => (
        <div key={`${idPrefix}-${i}`} className="admin-row-gap admin-html-list-row">
          <textarea
            id={`${idPrefix}-${i}`}
            className="admin-textarea admin-textarea-tall"
            rows={3}
            value={item}
            onChange={(e) => {
              const next = [...items];
              next[i] = e.target.value;
              onChange(next);
            }}
          />
          <AdminIconButton icon="remove" label={`Remove ${label} line ${i + 1}`} onClick={() => onChange(items.filter((_, j) => j !== i))} />
        </div>
      ))}
      <button type="button" className="admin-secondary-btn" onClick={() => onChange([...items, ''])}>
        Add line
      </button>
    </div>
  );
}

export function patchClasses(d, patch) {
  return { ...d, classes: { ...d.classes, ...patch } };
}

export function patchClassCard(d, index, patch) {
  const cards = d.classes.cards.map((c, i) => (i === index ? { ...c, ...patch } : c));
  return patchClasses(d, { cards });
}

export function emptyClassCard() {
  return {
    name: '',
    price: '',
    perfectFor: '',
    details: '',
    includedItems: [],
    pricingItems: [],
    additionalInfo: '',
    learnMorePath: '',
    learnMoreLabel: '',
  };
}

export function PagesEditorSaveRow({ saveError, saveSucceeded, saving, isDirty }) {
  return (
    <>
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
    </>
  );
}
