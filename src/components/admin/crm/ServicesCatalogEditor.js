import React, { useEffect, useMemo, useState } from 'react';
import { getCatalog, saveCatalog } from '../../../lib/crmApi';
import { centsToInput, parseMoneyToCents } from '../../../lib/proposalMath';

const STARTER_CATALOG = {
  services: [
    { name: 'Bridal Hair Styling', priceCents: 22500, priceMayVary: true },
    { name: 'Bridal Makeup', priceCents: 22500, priceMayVary: false },
    { name: "Bridal Party / MOB's Makeup", priceCents: 17500, priceMayVary: false },
    { name: "Bridal Party / MOB's Hair Styling", priceCents: 17500, priceMayVary: true },
  ],
  expenses: [
    { name: 'Travel / Mileage', priceCents: 7500, mode: 'perUnit', unitLabel: 'artist', detail: '', ifApplicable: false, autoAdd: true },
    { name: 'Booking fee', priceCents: 7500, mode: 'flat', unitLabel: '', detail: '', ifApplicable: false, autoAdd: true },
    {
      name: 'Early start time fee',
      priceCents: 10000,
      mode: 'flat',
      unitLabel: '',
      detail: 'Before 7:30am',
      ifApplicable: true,
      autoAdd: true,
    },
    {
      name: 'Additional assistant fee',
      priceCents: 10000,
      mode: 'perUnit',
      unitLabel: 'assistant',
      detail: 'One main hair & one main makeup artist included',
      ifApplicable: false,
      autoAdd: false,
    },
  ],
  priceMayVaryNote:
    'Hair rate may change — we adjust rate for hair that is shorter or longer than our mid-back base length.',
  notes:
    'Bridal Preview rate is not included in the above quote, but is available as an add-on! We price and schedule those as a separate appointment. Investment for those is due when the appointment is booked. They are $200 per service for secured clients ($400/person for hair & makeup).',
};

let rowSeq = 0;
const rowKey = () => `row-${++rowSeq}`;

function serviceToRow(s) {
  return { key: rowKey(), id: s.id ?? '', name: s.name ?? '', price: centsToInput(s.priceCents), priceMayVary: Boolean(s.priceMayVary) };
}

function expenseToRow(e) {
  return {
    key: rowKey(),
    id: e.id ?? '',
    name: e.name ?? '',
    price: centsToInput(e.priceCents),
    mode: e.mode === 'perUnit' ? 'perUnit' : 'flat',
    unitLabel: e.unitLabel ?? '',
    detail: e.detail ?? '',
    ifApplicable: Boolean(e.ifApplicable),
    autoAdd: Boolean(e.autoAdd),
  };
}

function catalogToForm(c) {
  const d = c.defaults ?? {};
  return {
    version: c.version ?? 1,
    services: (c.services ?? []).filter((s) => !s.archived).map(serviceToRow),
    expenses: (c.expenses ?? []).filter((e) => !e.archived).map(expenseToRow),
    gratuityPercent: String(d.gratuityPercent ?? 20),
    deposit: centsToInput(d.depositCents ?? 0),
    balanceDueDaysBefore: String(d.balanceDueDaysBefore ?? 60),
    regionLabel: d.regionLabel ?? '',
    priceMayVaryNote: d.priceMayVaryNote ?? '',
    notes: d.notes ?? '',
    footerText: d.footerText ?? '',
  };
}

function formToCatalog(form) {
  const errors = [];
  const services = form.services.map((r, i) => {
    const priceCents = parseMoneyToCents(r.price);
    if (!r.name.trim()) errors.push(`Service ${i + 1} needs a name.`);
    if (priceCents === null) errors.push(`Service ${i + 1} has an invalid price.`);
    return { id: r.id || undefined, name: r.name.trim(), priceCents: priceCents ?? 0, priceMayVary: r.priceMayVary };
  });
  const expenses = form.expenses.map((r, i) => {
    const priceCents = parseMoneyToCents(r.price);
    if (!r.name.trim()) errors.push(`Expense ${i + 1} needs a name.`);
    if (priceCents === null) errors.push(`Expense ${i + 1} has an invalid price.`);
    return {
      id: r.id || undefined,
      name: r.name.trim(),
      priceCents: priceCents ?? 0,
      mode: r.mode,
      unitLabel: r.unitLabel.trim(),
      detail: r.detail.trim(),
      ifApplicable: r.ifApplicable,
      autoAdd: r.autoAdd,
    };
  });
  const gratuityPercent = Number(form.gratuityPercent);
  if (!Number.isFinite(gratuityPercent) || gratuityPercent < 0 || gratuityPercent > 100) {
    errors.push('Gratuity must be a percent from 0 to 100.');
  }
  const depositCents = parseMoneyToCents(form.deposit);
  if (depositCents === null) errors.push('Deposit amount is invalid.');
  const days = Number(form.balanceDueDaysBefore);
  if (!Number.isInteger(days) || days < 0) errors.push('Balance due days must be a whole number.');
  return {
    errors,
    doc: {
      version: form.version + 1,
      services,
      expenses,
      defaults: {
        gratuityPercent,
        depositCents: depositCents ?? 0,
        balanceDueDaysBefore: days,
        regionLabel: form.regionLabel.trim(),
        priceMayVaryNote: form.priceMayVaryNote.trim(),
        notes: form.notes,
        footerText: form.footerText.trim(),
      },
    },
  };
}

function moveItem(list, index, delta) {
  const next = [...list];
  const target = index + delta;
  if (target < 0 || target >= next.length) return list;
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}

export default function ServicesCatalogEditor() {
  const [status, setStatus] = useState('loading');
  const [loadError, setLoadError] = useState(null);
  const [form, setForm] = useState(null);
  const [baseline, setBaseline] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const result = await getCatalog();
      if (cancelled) return;
      if (!result.ok) {
        setLoadError(result.message);
        setStatus('error');
        return;
      }
      const f = catalogToForm(result.data.catalog);
      setForm(f);
      setBaseline(JSON.stringify(f));
      setStatus('ready');
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const isDirty = useMemo(() => form !== null && JSON.stringify(form) !== baseline, [form, baseline]);

  useEffect(() => {
    if (isDirty) setSaved(false);
  }, [isDirty]);

  function update(patch) {
    setForm((f) => ({ ...f, ...patch }));
  }

  function updateRow(listKey, index, patch) {
    setForm((f) => ({ ...f, [listKey]: f[listKey].map((r, i) => (i === index ? { ...r, ...patch } : r)) }));
  }

  function loadStarter() {
    setForm((f) => ({
      ...f,
      services: STARTER_CATALOG.services.map(serviceToRow),
      expenses: STARTER_CATALOG.expenses.map(expenseToRow),
      priceMayVaryNote: f.priceMayVaryNote || STARTER_CATALOG.priceMayVaryNote,
      notes: f.notes || STARTER_CATALOG.notes,
    }));
  }

  async function onSave(e) {
    e.preventDefault();
    setSaveError(null);
    const { errors, doc } = formToCatalog(form);
    if (errors.length) {
      setSaveError(errors.join(' '));
      return;
    }
    setSaving(true);
    try {
      const result = await saveCatalog(doc);
      if (!result.ok) {
        setSaveError(result.message);
        return;
      }
      const f = catalogToForm(result.data.catalog);
      setForm(f);
      setBaseline(JSON.stringify(f));
      setSaved(true);
    } finally {
      setSaving(false);
    }
  }

  if (status === 'loading') {
    return (
      <p className="admin-status" role="status">
        Loading services &amp; pricing…
      </p>
    );
  }
  if (status === 'error') {
    return (
      <p className="admin-error" role="alert">
        {loadError}
      </p>
    );
  }

  const isEmpty = form.services.length === 0 && form.expenses.length === 0;

  return (
    <form onSubmit={onSave} className="crm-catalog">
      <h3 className="admin-panel-title">Services &amp; Pricing</h3>
      <p className="admin-muted">
        These are the choices offered in the proposal builder. Changing a price here only affects new lines — proposals
        you&apos;ve already built keep the price they were created with.
      </p>

      {isEmpty ? (
        <div className="admin-warn">
          No services yet.{' '}
          <button type="button" className="admin-link-btn" onClick={loadStarter}>
            Start from the standard bridal price list
          </button>{' '}
          and adjust from there.
        </div>
      ) : null}

      <h4 className="admin-subheading">Services</h4>
      <p className="admin-hint">
        Tick &quot;Rate may vary&quot; to mark a service with an asterisk on the proposal (uses the note below).
      </p>
      <div className="crm-table-wrap">
        <table className="crm-table crm-edit-table">
          <thead>
            <tr>
              <th>Service name</th>
              <th className="crm-col-money">Price ($)</th>
              <th>Rate may vary *</th>
              <th aria-label="Actions" />
            </tr>
          </thead>
          <tbody>
            {form.services.map((row, i) => (
              <tr key={row.key}>
                <td>
                  <input
                    className="admin-input crm-cell-input"
                    aria-label={`Service ${i + 1} name`}
                    value={row.name}
                    maxLength={200}
                    onChange={(ev) => updateRow('services', i, { name: ev.target.value })}
                  />
                </td>
                <td>
                  <input
                    className="admin-input crm-cell-input crm-money-input"
                    aria-label={`Service ${i + 1} price`}
                    inputMode="decimal"
                    value={row.price}
                    onChange={(ev) => updateRow('services', i, { price: ev.target.value })}
                  />
                </td>
                <td className="crm-center">
                  <input
                    type="checkbox"
                    aria-label={`Service ${i + 1} rate may vary`}
                    checked={row.priceMayVary}
                    onChange={(ev) => updateRow('services', i, { priceMayVary: ev.target.checked })}
                  />
                </td>
                <td className="crm-row-actions">
                  <button type="button" className="admin-link-btn" onClick={() => update({ services: moveItem(form.services, i, -1) })} disabled={i === 0}>
                    Up
                  </button>
                  <button
                    type="button"
                    className="admin-link-btn"
                    onClick={() => update({ services: moveItem(form.services, i, 1) })}
                    disabled={i === form.services.length - 1}
                  >
                    Down
                  </button>
                  <button type="button" className="admin-text-btn" onClick={() => update({ services: form.services.filter((_, j) => j !== i) })}>
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button
        type="button"
        className="admin-secondary-btn"
        onClick={() => update({ services: [...form.services, serviceToRow({ name: '', priceCents: 0 })] })}
      >
        Add service
      </button>

      <h4 className="admin-subheading">Other expenses &amp; fees</h4>
      <p className="admin-hint">
        &quot;Per unit&quot; multiplies by a count (e.g. $75 per artist). &quot;If applicable&quot; lines show on the
        proposal but aren&apos;t added to the total. &quot;Auto-add&quot; puts the line on every new proposal.
      </p>
      {form.expenses.map((row, i) => (
        <div key={row.key} className="admin-card-editor crm-expense-card">
          <div className="crm-field-grid">
            <label className="crm-field crm-field-wide">
              <span className="admin-label">Name</span>
              <input
                className="admin-input admin-input-full"
                value={row.name}
                maxLength={200}
                onChange={(ev) => updateRow('expenses', i, { name: ev.target.value })}
              />
            </label>
            <label className="crm-field">
              <span className="admin-label">Price ($)</span>
              <input
                className="admin-input admin-input-full"
                inputMode="decimal"
                value={row.price}
                onChange={(ev) => updateRow('expenses', i, { price: ev.target.value })}
              />
            </label>
            <label className="crm-field">
              <span className="admin-label">Charged</span>
              <select
                className="admin-input admin-input-full"
                value={row.mode}
                onChange={(ev) => updateRow('expenses', i, { mode: ev.target.value })}
              >
                <option value="flat">Flat fee</option>
                <option value="perUnit">Per unit</option>
              </select>
            </label>
            {row.mode === 'perUnit' ? (
              <label className="crm-field">
                <span className="admin-label">Unit (e.g. artist)</span>
                <input
                  className="admin-input admin-input-full"
                  value={row.unitLabel}
                  maxLength={40}
                  onChange={(ev) => updateRow('expenses', i, { unitLabel: ev.target.value })}
                />
              </label>
            ) : null}
            <label className="crm-field crm-field-wide">
              <span className="admin-label">Detail shown on proposal (optional)</span>
              <input
                className="admin-input admin-input-full"
                value={row.detail}
                maxLength={500}
                onChange={(ev) => updateRow('expenses', i, { detail: ev.target.value })}
              />
            </label>
          </div>
          <div className="crm-checkbox-row">
            <label>
              <input
                type="checkbox"
                checked={row.ifApplicable}
                onChange={(ev) => updateRow('expenses', i, { ifApplicable: ev.target.checked })}
              />{' '}
              If applicable (not in total)
            </label>
            <label>
              <input
                type="checkbox"
                checked={row.autoAdd}
                onChange={(ev) => updateRow('expenses', i, { autoAdd: ev.target.checked })}
              />{' '}
              Auto-add to new proposals
            </label>
            <span className="crm-row-actions">
              <button type="button" className="admin-link-btn" onClick={() => update({ expenses: moveItem(form.expenses, i, -1) })} disabled={i === 0}>
                Up
              </button>
              <button
                type="button"
                className="admin-link-btn"
                onClick={() => update({ expenses: moveItem(form.expenses, i, 1) })}
                disabled={i === form.expenses.length - 1}
              >
                Down
              </button>
              <button type="button" className="admin-text-btn" onClick={() => update({ expenses: form.expenses.filter((_, j) => j !== i) })}>
                Remove
              </button>
            </span>
          </div>
        </div>
      ))}
      <button
        type="button"
        className="admin-secondary-btn"
        onClick={() => update({ expenses: [...form.expenses, expenseToRow({ name: '', priceCents: 0, mode: 'flat' })] })}
      >
        Add expense
      </button>

      <h4 className="admin-subheading">Proposal defaults</h4>
      <p className="admin-hint">New proposals start with these values; each proposal can override them.</p>
      <div className="crm-field-grid">
        <label className="crm-field">
          <span className="admin-label">Included gratuity (%)</span>
          <input
            className="admin-input admin-input-full"
            inputMode="decimal"
            value={form.gratuityPercent}
            onChange={(ev) => update({ gratuityPercent: ev.target.value })}
          />
        </label>
        <label className="crm-field">
          <span className="admin-label">Due at contract ($)</span>
          <input
            className="admin-input admin-input-full"
            inputMode="decimal"
            value={form.deposit}
            onChange={(ev) => update({ deposit: ev.target.value })}
          />
        </label>
        <label className="crm-field">
          <span className="admin-label">Balance due (days before event)</span>
          <input
            className="admin-input admin-input-full"
            inputMode="numeric"
            value={form.balanceDueDaysBefore}
            onChange={(ev) => update({ balanceDueDaysBefore: ev.target.value })}
          />
        </label>
        <label className="crm-field crm-field-wide">
          <span className="admin-label">Service regions line</span>
          <input
            className="admin-input admin-input-full"
            value={form.regionLabel}
            maxLength={300}
            placeholder="PGH / ATL / NOLA"
            onChange={(ev) => update({ regionLabel: ev.target.value })}
          />
        </label>
      </div>
      <label className="admin-label" htmlFor="crm-price-may-vary-note">
        Asterisk note (for &quot;rate may vary&quot; services)
      </label>
      <textarea
        id="crm-price-may-vary-note"
        className="admin-textarea"
        rows={2}
        value={form.priceMayVaryNote}
        onChange={(ev) => update({ priceMayVaryNote: ev.target.value })}
      />
      <label className="admin-label" htmlFor="crm-default-notes">
        Closing notes (fine print)
      </label>
      <textarea
        id="crm-default-notes"
        className="admin-textarea"
        rows={5}
        value={form.notes}
        onChange={(ev) => update({ notes: ev.target.value })}
      />
      <p className="admin-hint">Separate paragraphs with a blank line.</p>
      <label className="admin-label" htmlFor="crm-footer-text">
        PDF footer contact line
      </label>
      <input
        id="crm-footer-text"
        className="admin-input admin-input-full"
        value={form.footerText}
        maxLength={300}
        onChange={(ev) => update({ footerText: ev.target.value })}
      />

      {saveError ? (
        <p className="admin-error" role="alert">
          {saveError}
        </p>
      ) : null}
      <div className="admin-save-row">
        <button className="admin-submit" type="submit" disabled={saving || !isDirty}>
          {saving ? 'Saving…' : 'Save services & pricing'}
        </button>
        {saved ? (
          <span className="admin-save-feedback" role="status">
            Saved
          </span>
        ) : null}
      </div>
    </form>
  );
}
