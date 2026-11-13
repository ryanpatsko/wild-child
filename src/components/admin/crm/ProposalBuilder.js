import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  getCatalog,
  getClient,
  recordProposalDownload,
  setProposalFinal,
  updateProposal,
} from '../../../lib/crmApi';
import {
  centsToInput,
  clientDisplayName,
  computeProposalTotals,
  expenseLineFromCatalog,
  formatDateOnly,
  formatMoney,
  formatTimestamp,
  parseMoneyToCents,
  proposalContent,
  serviceLineFromCatalog,
} from '../../../lib/proposalMath';

let keySeq = 0;
const nextKey = () => `line-${++keySeq}`;

function toForm(p) {
  const c = proposalContent(p);
  return {
    ...c,
    services: c.services.map((l) => ({ ...l, key: nextKey(), priceInput: centsToInput(l.unitPriceCents) })),
    expenses: c.expenses.map((l) => ({ ...l, key: nextKey(), priceInput: centsToInput(l.unitPriceCents) })),
    gratuityInput: String(c.gratuityPercent),
    depositInput: centsToInput(c.depositCents),
    daysInput: String(c.balanceDueDaysBefore),
  };
}

function toContent(form) {
  const errors = [];
  const lineOut = (kind) => (l, i) => {
    const cents = parseMoneyToCents(l.priceInput);
    if (!l.name.trim()) errors.push(`${kind} line ${i + 1} needs a name.`);
    if (cents === null) errors.push(`${kind} line ${i + 1} has an invalid price.`);
    const quantity = Math.max(0, Math.floor(Number(l.quantity) || 0));
    const { key, priceInput, ...rest } = l;
    return { ...rest, name: l.name.trim(), unitPriceCents: cents ?? 0, quantity };
  };
  const gratuityPercent = Number(form.gratuityInput);
  if (!Number.isFinite(gratuityPercent) || gratuityPercent < 0 || gratuityPercent > 100) {
    errors.push('Gratuity must be a percent from 0 to 100.');
  }
  const depositCents = parseMoneyToCents(form.depositInput);
  if (depositCents === null) errors.push('Due-at-contract amount is invalid.');
  const days = Number(form.daysInput);
  if (!Number.isInteger(days) || days < 0) errors.push('Balance due days must be a whole number.');
  return {
    errors,
    content: proposalContent({
      ...form,
      services: form.services.map(lineOut('Service')),
      expenses: form.expenses.map(lineOut('Expense')),
      gratuityPercent: Number.isFinite(gratuityPercent) ? gratuityPercent : 0,
      depositCents: depositCents ?? 0,
      balanceDueDaysBefore: Number.isInteger(days) ? days : 0,
    }),
  };
}

function safeFilePart(s) {
  return String(s ?? '')
    .replace(/[^a-z0-9]+/gi, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

export default function ProposalBuilder({ email, proposalId, onBack }) {
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);
  const [client, setClient] = useState(null);
  const [catalog, setCatalog] = useState(null);
  const [record, setRecord] = useState(null);
  const [form, setForm] = useState(null);
  const [baseline, setBaseline] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [pdfBusy, setPdfBusy] = useState(false);
  const [addServiceId, setAddServiceId] = useState('');
  const [addServiceQty, setAddServiceQty] = useState('1');
  const [addExpenseId, setAddExpenseId] = useState('');

  const applyRecord = useCallback((p) => {
    setRecord(p);
    const f = toForm(p);
    setForm(f);
    setBaseline(JSON.stringify(toContent(f).content));
  }, []);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const [clientRes, catalogRes] = await Promise.all([getClient(email), getCatalog()]);
      if (cancelled) return;
      if (!clientRes.ok) {
        setError(clientRes.message);
        setStatus('error');
        return;
      }
      const p = clientRes.data.proposals.find((x) => x.id === proposalId);
      if (!p) {
        setError('This proposal was not found.');
        setStatus('error');
        return;
      }
      setClient(clientRes.data.client);
      setCatalog(catalogRes.ok ? catalogRes.data.catalog : null);
      if (!catalogRes.ok) setMessage({ ok: false, text: `Could not load services & pricing: ${catalogRes.message}` });
      applyRecord(p);
      setStatus('ready');
    })();
    return () => {
      cancelled = true;
    };
  }, [email, proposalId, applyRecord]);

  const derived = useMemo(() => (form ? toContent(form) : null), [form]);
  const totals = useMemo(() => (derived ? computeProposalTotals(derived.content) : null), [derived]);
  const isDirty = derived !== null && JSON.stringify(derived.content) !== baseline;

  useEffect(() => {
    if (!isDirty) return undefined;
    const warn = (e) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [isDirty]);

  function patch(p) {
    setForm((f) => ({ ...f, ...p }));
  }

  function patchLine(listKey, index, p) {
    setForm((f) => ({ ...f, [listKey]: f[listKey].map((l, i) => (i === index ? { ...l, ...p } : l)) }));
  }

  function removeLine(listKey, index) {
    setForm((f) => ({ ...f, [listKey]: f[listKey].filter((_, i) => i !== index) }));
  }

  function moveLine(listKey, index, delta) {
    setForm((f) => {
      const list = [...f[listKey]];
      const target = index + delta;
      if (target < 0 || target >= list.length) return f;
      [list[index], list[target]] = [list[target], list[index]];
      return { ...f, [listKey]: list };
    });
  }

  function addService() {
    const quantity = Math.max(1, Math.floor(Number(addServiceQty) || 1));
    let line;
    if (addServiceId === '__custom') {
      line = { serviceId: '', name: '', unitPriceCents: 0, quantity, priceMayVary: false };
    } else {
      const svc = catalog?.services?.find((x) => x.id === addServiceId);
      if (!svc) return;
      line = { ...serviceLineFromCatalog(svc), quantity };
    }
    setForm((f) => ({
      ...f,
      services: [...f.services, { ...line, key: nextKey(), priceInput: centsToInput(line.unitPriceCents) }],
    }));
    setAddServiceId('');
    setAddServiceQty('1');
  }

  function addExpense() {
    let line;
    if (addExpenseId === '__custom') {
      line = { expenseId: '', name: '', unitPriceCents: 0, quantity: 1, mode: 'flat', unitLabel: '', detail: '', ifApplicable: false };
    } else {
      const exp = catalog?.expenses?.find((x) => x.id === addExpenseId);
      if (!exp) return;
      line = expenseLineFromCatalog(exp);
    }
    setForm((f) => ({
      ...f,
      expenses: [...f.expenses, { ...line, key: nextKey(), priceInput: centsToInput(line.unitPriceCents) }],
    }));
    setAddExpenseId('');
  }

  async function save() {
    setMessage(null);
    if (derived.errors.length) {
      setMessage({ ok: false, text: derived.errors.join(' ') });
      return false;
    }
    setSaving(true);
    try {
      const result = await updateProposal(email, proposalId, derived.content);
      if (!result.ok) {
        setMessage({ ok: false, text: result.message });
        return false;
      }
      applyRecord(result.data.proposal);
      setMessage({ ok: true, text: 'Saved' });
      return true;
    } finally {
      setSaving(false);
    }
  }

  async function onToggleFinal() {
    const makeFinal = !record.finalizedAt;
    if (makeFinal && isDirty && !(await save())) return;
    setMessage(null);
    const result = await setProposalFinal(email, proposalId, makeFinal);
    if (!result.ok) {
      setMessage({ ok: false, text: result.message });
      return;
    }
    setRecord(result.data.proposal);
    setMessage({ ok: true, text: makeFinal ? 'Marked as final' : 'Moved back to draft' });
  }

  async function buildPdf() {
    const { renderProposalPdfBlob } = await import('./ProposalPdf');
    return renderProposalPdfBlob({
      proposal: derived.content,
      preparedOn: formatDateOnly(record.finalizedAt || new Date().toISOString()),
      footerText: catalog?.defaults?.footerText ?? '',
    });
  }

  async function onPreview() {
    setMessage(null);
    const preview = window.open('', '_blank');
    setPdfBusy(true);
    try {
      const blob = await buildPdf();
      const url = URL.createObjectURL(blob);
      if (preview) preview.location.href = url;
      else window.location.assign(url);
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch (err) {
      preview?.close();
      console.error(err);
      setMessage({ ok: false, text: 'Could not build the PDF preview.' });
    } finally {
      setPdfBusy(false);
    }
  }

  async function onDownload() {
    setMessage(null);
    setPdfBusy(true);
    try {
      const blob = await buildPdf();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Wild-Child-Proposal-${safeFilePart(derived.content.clientName) || 'Client'}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 10_000);
      const result = await recordProposalDownload(email, proposalId);
      if (result.ok) {
        setRecord(result.data.proposal);
      } else {
        setMessage({ ok: false, text: `PDF downloaded, but the download time was not recorded: ${result.message}` });
      }
    } catch (err) {
      console.error(err);
      setMessage({ ok: false, text: 'Could not build the PDF.' });
    } finally {
      setPdfBusy(false);
    }
  }

  function onBackClick() {
    if (isDirty && !window.confirm('You have unsaved changes. Leave without saving?')) return;
    onBack();
  }

  if (status === 'loading') {
    return (
      <p className="admin-status" role="status">
        Loading proposal…
      </p>
    );
  }
  if (status === 'error') {
    return (
      <div>
        <button type="button" className="admin-link-btn crm-back" onClick={onBack}>
          ← Back to client
        </button>
        <p className="admin-error" role="alert">
          {error}
        </p>
      </div>
    );
  }

  const downloads = record.downloads ?? [];
  const editedAfterFinal = record.finalizedAt && record.updatedAt > record.finalizedAt;
  const catalogServices = catalog?.services?.filter((x) => !x.archived) ?? [];
  const catalogExpenses = catalog?.expenses?.filter((x) => !x.archived) ?? [];

  return (
    <div className="crm-builder">
      <button type="button" className="admin-link-btn crm-back" onClick={onBackClick}>
        ← {clientDisplayName(client)}
      </button>

      <div className="crm-builder-status">
        <span className={record.finalizedAt ? 'crm-pill crm-pill-final' : 'crm-pill'}>
          {record.finalizedAt ? 'Final' : 'Draft'}
        </span>
        <span className="crm-subtext">
          Created {formatTimestamp(record.createdAt)} · Last saved {formatTimestamp(record.updatedAt)}
          {record.finalizedAt ? ` · Finalized ${formatTimestamp(record.finalizedAt)}` : ''}
          {downloads.length
            ? ` · Downloaded ${downloads.length}× (last ${formatTimestamp(downloads[downloads.length - 1])})`
            : ''}
        </span>
      </div>
      {editedAfterFinal ? (
        <p className="admin-warn">This proposal was edited after it was marked final.</p>
      ) : null}

      <div className="crm-builder-layout">
        <div className="crm-builder-main">
          <label className="admin-label" htmlFor="crm-p-title">
            Proposal label <span className="crm-subtext">(internal only, not on the PDF)</span>
          </label>
          <input
            id="crm-p-title"
            className="admin-input"
            value={form.title}
            maxLength={200}
            onChange={(ev) => patch({ title: ev.target.value })}
          />

          <h4 className="admin-subheading">Details</h4>
          <div className="crm-field-grid">
            <label className="crm-field crm-field-wide">
              <span className="admin-label">Bride / Couple</span>
              <input
                className="admin-input admin-input-full"
                value={form.clientName}
                maxLength={200}
                onChange={(ev) => patch({ clientName: ev.target.value })}
              />
            </label>
            <label className="crm-field">
              <span className="admin-label">Wedding date</span>
              <input
                className="admin-input admin-input-full"
                value={form.eventDate}
                maxLength={300}
                onChange={(ev) => patch({ eventDate: ev.target.value })}
              />
            </label>
            <label className="crm-field">
              <span className="admin-label">Serving</span>
              <input
                className="admin-input admin-input-full"
                value={form.regionLabel}
                maxLength={300}
                onChange={(ev) => patch({ regionLabel: ev.target.value })}
              />
            </label>
            <label className="crm-field crm-field-wide">
              <span className="admin-label">Location</span>
              <input
                className="admin-input admin-input-full"
                value={form.venue}
                maxLength={300}
                onChange={(ev) => patch({ venue: ev.target.value })}
              />
            </label>
          </div>

          <h4 className="admin-subheading">Services</h4>
          {form.services.length ? (
            <div className="crm-table-wrap">
              <table className="crm-table crm-edit-table">
                <thead>
                  <tr>
                    <th>Service</th>
                    <th className="crm-col-money">Rate ($)</th>
                    <th className="crm-col-qty">Qty</th>
                    <th title="Rate may vary — adds an asterisk">*</th>
                    <th className="crm-col-money">Total</th>
                    <th aria-label="Actions" />
                  </tr>
                </thead>
                <tbody>
                  {form.services.map((l, i) => (
                    <tr key={l.key}>
                      <td>
                        <input
                          className="admin-input crm-cell-input"
                          aria-label={`Service line ${i + 1} name`}
                          value={l.name}
                          maxLength={200}
                          onChange={(ev) => patchLine('services', i, { name: ev.target.value })}
                        />
                      </td>
                      <td>
                        <input
                          className="admin-input crm-cell-input crm-money-input"
                          aria-label={`Service line ${i + 1} rate`}
                          inputMode="decimal"
                          value={l.priceInput}
                          onChange={(ev) => patchLine('services', i, { priceInput: ev.target.value })}
                        />
                      </td>
                      <td>
                        <input
                          className="admin-input crm-cell-input crm-qty-input"
                          aria-label={`Service line ${i + 1} quantity`}
                          type="number"
                          min={0}
                          max={999}
                          value={l.quantity}
                          onChange={(ev) => patchLine('services', i, { quantity: ev.target.value })}
                        />
                      </td>
                      <td className="crm-center">
                        <input
                          type="checkbox"
                          aria-label={`Service line ${i + 1} rate may vary`}
                          checked={l.priceMayVary}
                          onChange={(ev) => patchLine('services', i, { priceMayVary: ev.target.checked })}
                        />
                      </td>
                      <td className="crm-money">{formatMoney(totals.serviceLines[i]?.totalCents ?? 0)}</td>
                      <td className="crm-row-actions">
                        <button type="button" className="admin-link-btn" onClick={() => moveLine('services', i, -1)} disabled={i === 0}>
                          ↑
                        </button>
                        <button
                          type="button"
                          className="admin-link-btn"
                          onClick={() => moveLine('services', i, 1)}
                          disabled={i === form.services.length - 1}
                        >
                          ↓
                        </button>
                        <button type="button" className="admin-text-btn" onClick={() => removeLine('services', i)}>
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="admin-muted">No services added yet.</p>
          )}
          <div className="crm-add-row">
            <select
              className="admin-input"
              aria-label="Service to add"
              value={addServiceId}
              onChange={(ev) => setAddServiceId(ev.target.value)}
            >
              <option value="">Choose a service…</option>
              {catalogServices.map((svc) => (
                <option key={svc.id} value={svc.id}>
                  {svc.name} — {formatMoney(svc.priceCents, { compact: true })}
                  {svc.priceMayVary ? '*' : ''}
                </option>
              ))}
              <option value="__custom">Custom line…</option>
            </select>
            <input
              className="admin-input crm-qty-input"
              aria-label="Quantity"
              type="number"
              min={1}
              max={999}
              value={addServiceQty}
              onChange={(ev) => setAddServiceQty(ev.target.value)}
            />
            <button type="button" className="admin-secondary-btn" onClick={addService} disabled={!addServiceId}>
              Add
            </button>
          </div>
          {catalogServices.length === 0 ? (
            <p className="admin-hint">Add services under the Services &amp; Pricing tab to pick from a list here.</p>
          ) : null}

          <h4 className="admin-subheading">Gratuity, travel &amp; fees</h4>
          <label className="crm-inline-field">
            <span className="admin-label">Included gratuity (%)</span>
            <input
              className="admin-input crm-qty-input"
              inputMode="decimal"
              value={form.gratuityInput}
              onChange={(ev) => patch({ gratuityInput: ev.target.value })}
            />
            <span className="crm-subtext">= {formatMoney(totals.gratuityCents)}</span>
          </label>

          {form.expenses.map((l, i) => (
            <div key={l.key} className="admin-card-editor crm-expense-card">
              <div className="crm-field-grid">
                <label className="crm-field crm-field-wide">
                  <span className="admin-label">Name</span>
                  <input
                    className="admin-input admin-input-full"
                    value={l.name}
                    maxLength={200}
                    onChange={(ev) => patchLine('expenses', i, { name: ev.target.value })}
                  />
                </label>
                <label className="crm-field">
                  <span className="admin-label">Charged</span>
                  <select
                    className="admin-input admin-input-full"
                    value={l.mode}
                    onChange={(ev) => patchLine('expenses', i, { mode: ev.target.value })}
                  >
                    <option value="flat">Flat fee</option>
                    <option value="perUnit">Per unit</option>
                  </select>
                </label>
                <label className="crm-field">
                  <span className="admin-label">{l.mode === 'perUnit' ? 'Rate per unit ($)' : 'Amount ($)'}</span>
                  <input
                    className="admin-input admin-input-full"
                    inputMode="decimal"
                    value={l.priceInput}
                    onChange={(ev) => patchLine('expenses', i, { priceInput: ev.target.value })}
                  />
                </label>
                {l.mode === 'perUnit' ? (
                  <>
                    <label className="crm-field">
                      <span className="admin-label">Count</span>
                      <input
                        className="admin-input admin-input-full"
                        type="number"
                        min={0}
                        max={999}
                        value={l.quantity}
                        onChange={(ev) => patchLine('expenses', i, { quantity: ev.target.value })}
                      />
                    </label>
                    <label className="crm-field">
                      <span className="admin-label">Unit (e.g. artist)</span>
                      <input
                        className="admin-input admin-input-full"
                        value={l.unitLabel}
                        maxLength={40}
                        onChange={(ev) => patchLine('expenses', i, { unitLabel: ev.target.value })}
                      />
                    </label>
                  </>
                ) : null}
                <label className="crm-field crm-field-wide">
                  <span className="admin-label">Detail (optional)</span>
                  <input
                    className="admin-input admin-input-full"
                    value={l.detail}
                    maxLength={500}
                    onChange={(ev) => patchLine('expenses', i, { detail: ev.target.value })}
                  />
                </label>
              </div>
              <div className="crm-checkbox-row">
                <label>
                  <input
                    type="checkbox"
                    checked={l.ifApplicable}
                    onChange={(ev) => patchLine('expenses', i, { ifApplicable: ev.target.checked })}
                  />{' '}
                  If applicable (shown as TBD, not in total)
                </label>
                <span className="crm-money">
                  {l.ifApplicable ? 'TBD' : formatMoney(totals.expenseLines[i]?.totalCents ?? 0)}
                </span>
                <span className="crm-row-actions">
                  <button type="button" className="admin-link-btn" onClick={() => moveLine('expenses', i, -1)} disabled={i === 0}>
                    ↑
                  </button>
                  <button
                    type="button"
                    className="admin-link-btn"
                    onClick={() => moveLine('expenses', i, 1)}
                    disabled={i === form.expenses.length - 1}
                  >
                    ↓
                  </button>
                  <button type="button" className="admin-text-btn" onClick={() => removeLine('expenses', i)}>
                    Remove
                  </button>
                </span>
              </div>
            </div>
          ))}
          <div className="crm-add-row">
            <select
              className="admin-input"
              aria-label="Expense to add"
              value={addExpenseId}
              onChange={(ev) => setAddExpenseId(ev.target.value)}
            >
              <option value="">Choose an expense or fee…</option>
              {catalogExpenses.map((exp) => (
                <option key={exp.id} value={exp.id}>
                  {exp.name} — {formatMoney(exp.priceCents, { compact: true })}
                  {exp.mode === 'perUnit' && exp.unitLabel ? ` per ${exp.unitLabel}` : ''}
                </option>
              ))}
              <option value="__custom">Custom line…</option>
            </select>
            <button type="button" className="admin-secondary-btn" onClick={addExpense} disabled={!addExpenseId}>
              Add
            </button>
          </div>

          <h4 className="admin-subheading">Payment schedule</h4>
          <div className="crm-field-grid">
            <label className="crm-field">
              <span className="admin-label">Due at contract ($)</span>
              <input
                className="admin-input admin-input-full"
                inputMode="decimal"
                value={form.depositInput}
                onChange={(ev) => patch({ depositInput: ev.target.value })}
              />
            </label>
            <label className="crm-field">
              <span className="admin-label">Balance due (days before)</span>
              <input
                className="admin-input admin-input-full"
                inputMode="numeric"
                value={form.daysInput}
                onChange={(ev) => patch({ daysInput: ev.target.value })}
              />
            </label>
          </div>

          <h4 className="admin-subheading">Notes</h4>
          <label className="admin-label" htmlFor="crm-p-asterisk">
            Asterisk note <span className="crm-subtext">(printed when any service is marked *)</span>
          </label>
          <textarea
            id="crm-p-asterisk"
            className="admin-textarea"
            rows={2}
            value={form.priceMayVaryNote}
            onChange={(ev) => patch({ priceMayVaryNote: ev.target.value })}
          />
          <label className="admin-label" htmlFor="crm-p-notes">
            Closing notes <span className="crm-subtext">(blank line between paragraphs)</span>
          </label>
          <textarea
            id="crm-p-notes"
            className="admin-textarea"
            rows={6}
            value={form.notes}
            onChange={(ev) => patch({ notes: ev.target.value })}
          />
        </div>

        <aside className="crm-builder-summary" aria-label="Proposal totals">
          <h4 className="crm-summary-title">Summary</h4>
          <dl className="crm-summary-dl">
            <dt>Services ({totals.serviceCount})</dt>
            <dd>{formatMoney(totals.servicesTotalCents)}</dd>
            <dt>Gratuity ({totals.gratuityPercent}%)</dt>
            <dd>{formatMoney(totals.gratuityCents)}</dd>
            <dt>Travel &amp; fees</dt>
            <dd>{formatMoney(totals.expensesTotalCents)}</dd>
          </dl>
          <div className="crm-summary-total">
            <span>Overall investment</span>
            <strong>{formatMoney(totals.overallCents)}</strong>
          </div>
          <dl className="crm-summary-dl">
            <dt>Due at contract</dt>
            <dd>{formatMoney(totals.depositCents)}</dd>
            <dt>Remaining balance</dt>
            <dd>{formatMoney(totals.balanceCents)}</dd>
          </dl>

          <div className="crm-summary-actions">
            <button type="button" className="admin-submit" onClick={() => void save()} disabled={saving || !isDirty}>
              {saving ? 'Saving…' : isDirty ? 'Save changes' : 'Saved'}
            </button>
            <button type="button" className="admin-secondary-btn" onClick={onPreview} disabled={pdfBusy}>
              Preview PDF
            </button>
            <button type="button" className="admin-secondary-btn" onClick={onToggleFinal} disabled={saving}>
              {record.finalizedAt ? 'Move back to draft' : 'Mark as final'}
            </button>
            <button
              type="button"
              className="admin-submit"
              onClick={onDownload}
              disabled={pdfBusy || !record.finalizedAt || isDirty}
              title={!record.finalizedAt ? 'Mark the proposal final to download' : isDirty ? 'Save changes first' : ''}
            >
              {pdfBusy ? 'Building PDF…' : 'Download PDF'}
            </button>
            {!record.finalizedAt ? (
              <p className="admin-hint">Mark as final to enable the download.</p>
            ) : isDirty ? (
              <p className="admin-hint">Save changes to enable the download.</p>
            ) : null}
          </div>
          {message ? (
            <p className={message.ok ? 'admin-save-feedback' : 'admin-error'} role="status">
              {message.text}
            </p>
          ) : null}
        </aside>
      </div>
    </div>
  );
}
