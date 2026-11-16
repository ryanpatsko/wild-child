import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { AdminIconButton, AdminToggle } from '../AdminControls';
import AdminSelect from '../AdminSelect';
import {
  deleteInvoice,
  getInvoice,
  getInvoiceCatalog,
  recordInvoiceDownload,
  setInvoiceDates,
  updateInvoice,
} from '../../../lib/crmApi';
import {
  centsToInput,
  computeInvoiceTotals,
  expenseLineFromCatalog,
  formatInvoiceNumber,
  formatIsoDate,
  formatMoney,
  invoiceContent,
  invoiceStatus,
  parsePercent,
  serviceLineFromInvoiceCatalog,
  todayIsoDate,
} from '../../../lib/invoiceMath';
import { formatTimestamp, parseMoneyToCents } from '../../../lib/proposalMath';

let keySeq = 0;
const nextKey = () => `inv-line-${++keySeq}`;

function toForm(p) {
  const c = invoiceContent(p);
  return {
    ...c,
    services: c.services.map((l) => ({ ...l, key: nextKey(), priceInput: centsToInput(l.unitPriceCents) })),
    expenses: c.expenses.map((l) => ({ ...l, key: nextKey(), priceInput: centsToInput(l.unitPriceCents) })),
    gratuityInput: String(c.gratuityPercent),
    taxInput: String(c.taxPercent),
    paidInput: centsToInput(c.amountPaidCents),
  };
}

function toContent(form) {
  const errors = [];
  const lineOut = (kind, maxDecimals) => (l, i) => {
    const cents = parseMoneyToCents(l.priceInput, { maxDecimals });
    if (!l.name.trim()) errors.push(`${kind} line ${i + 1} needs a name.`);
    if (cents === null) errors.push(`${kind} line ${i + 1} has an invalid price.`);
    const quantity = Math.max(0, Math.floor(Number(l.quantity) || 0));
    const { key, priceInput, ...rest } = l;
    return { ...rest, name: l.name.trim(), unitPriceCents: cents ?? 0, quantity };
  };
  const gratuityPercent = parsePercent(form.gratuityInput);
  if (gratuityPercent === null) errors.push('Gratuity must be a percent from 0 to 100.');
  const taxPercent = parsePercent(form.taxInput);
  if (taxPercent === null) errors.push('Tax must be a percent from 0 to 100.');
  const amountPaidCents = parseMoneyToCents(form.paidInput);
  if (amountPaidCents === null) errors.push('Amount already paid is invalid.');
  if (!String(form.invoiceNumber ?? '').trim()) errors.push('Invoice number is required.');
  const content = invoiceContent({
    ...form,
    services: form.services.map(lineOut('Service')),
    expenses: form.expenses.map(lineOut('Fee', 3)),
    gratuityPercent: gratuityPercent ?? 0,
    taxPercent: taxPercent ?? 0,
    amountPaidCents: amountPaidCents ?? 0,
  });
  if (computeInvoiceTotals(content).paidExceedsTotal) {
    errors.push('Amount already paid is more than the invoice total.');
  }
  return { errors, content };
}

function safeFilePart(s) {
  return String(s ?? '')
    .replace(/[^a-z0-9]+/gi, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

const STATUS_LABEL = { draft: 'Draft', sent: 'Sent', paid: 'Paid' };

function statusClass(status) {
  if (status === 'paid') return 'crm-pill crm-pill-paid';
  if (status === 'sent') return 'crm-pill crm-pill-sent';
  return 'crm-pill';
}

export default function InvoiceBuilder({ invoiceId, onBack, onOpenServices }) {
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);
  const [catalog, setCatalog] = useState(null);
  const [record, setRecord] = useState(null);
  const [form, setForm] = useState(null);
  const [baseline, setBaseline] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [pdfBusy, setPdfBusy] = useState(false);
  const [dateBusy, setDateBusy] = useState(false);
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
      const [invoiceRes, catalogRes] = await Promise.all([getInvoice(invoiceId), getInvoiceCatalog()]);
      if (cancelled) return;
      if (!invoiceRes.ok) {
        setError(invoiceRes.message);
        setStatus('error');
        return;
      }
      setCatalog(catalogRes.ok ? catalogRes.data.catalog : null);
      applyRecord(invoiceRes.data.invoice);
      if (!catalogRes.ok) setMessage({ ok: false, text: `Could not load invoice services: ${catalogRes.message}` });
      setStatus('ready');
    })();
    return () => {
      cancelled = true;
    };
  }, [invoiceId, applyRecord]);

  const derived = useMemo(() => (form ? toContent(form) : null), [form]);
  const totals = useMemo(() => (derived ? computeInvoiceTotals(derived.content) : null), [derived]);
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
      line = { ...serviceLineFromInvoiceCatalog(svc), quantity };
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
      line = {
        expenseId: '',
        name: '',
        unitPriceCents: 0,
        quantity: 1,
        mode: 'flat',
        unitLabel: '',
        detail: '',
        ifApplicable: false,
      };
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

  function confirmLeave() {
    if (isDirty && !window.confirm('You have unsaved changes. Leave without saving?')) return false;
    return true;
  }

  async function save() {
    setMessage(null);
    if (derived.errors.length) {
      setMessage({ ok: false, text: derived.errors.join(' ') });
      return false;
    }
    setSaving(true);
    try {
      const result = await updateInvoice(invoiceId, derived.content);
      if (!result.ok) {
        setMessage({ ok: false, text: result.message });
        return false;
      }
      applyRecord(result.data.invoice);
      setMessage({ ok: true, text: 'Saved' });
      return true;
    } finally {
      setSaving(false);
    }
  }

  async function onDate(patch) {
    setMessage(null);
    setDateBusy(true);
    try {
      const result = await setInvoiceDates(invoiceId, patch);
      if (!result.ok) {
        setMessage({ ok: false, text: result.message });
        return;
      }
      setRecord(result.data.invoice);
    } finally {
      setDateBusy(false);
    }
  }

  async function buildPdf() {
    const { renderInvoicePdfBlob } = await import('./InvoicePdf');
    return renderInvoicePdfBlob({
      invoice: derived.content,
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
      const number = safeFilePart(derived.content.invoiceNumber);
      const who = safeFilePart(derived.content.billTo);
      a.href = url;
      a.download = `Wild-Child-Invoice-${number || 'draft'}${who ? `-${who}` : ''}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 10_000);
      const result = await recordInvoiceDownload(invoiceId, { sentOn: todayIsoDate() });
      if (result.ok) {
        setRecord(result.data.invoice);
        if (!record.sentAt && result.data.invoice.sentAt) {
          setMessage({ ok: true, text: `PDF downloaded. Sent date set to ${formatIsoDate(result.data.invoice.sentAt)}.` });
        }
      } else {
        setMessage({ ok: false, text: `PDF downloaded, but the sent date was not recorded: ${result.message}` });
      }
    } catch (err) {
      console.error(err);
      setMessage({ ok: false, text: 'Could not build the PDF.' });
    } finally {
      setPdfBusy(false);
    }
  }

  async function onDelete() {
    const who = form.billTo || 'this invoice';
    if (!window.confirm(`Delete invoice ${formatInvoiceNumber(form.invoiceNumber) || ''} for ${who}? This cannot be undone.`)) {
      return;
    }
    setSaving(true);
    try {
      const result = await deleteInvoice(invoiceId);
      if (!result.ok) {
        setMessage({ ok: false, text: result.message });
        return;
      }
      onBack();
    } finally {
      setSaving(false);
    }
  }

  if (status === 'loading') {
    return (
      <p className="admin-status" role="status">
        Loading invoice…
      </p>
    );
  }
  if (status === 'error') {
    return (
      <div>
        <button type="button" className="admin-link-btn crm-back" onClick={onBack}>
          ← All invoices
        </button>
        <p className="admin-error" role="alert">
          {error}
        </p>
      </div>
    );
  }

  const state = invoiceStatus(record);
  const downloads = record.downloads ?? [];
  const catalogServices = catalog?.services?.filter((x) => !x.archived) ?? [];
  const catalogExpenses = catalog?.expenses?.filter((x) => !x.archived) ?? [];

  return (
    <div className="crm-builder">
      <button type="button" className="admin-link-btn crm-back" onClick={() => confirmLeave() && onBack()}>
        ← All invoices
      </button>

      <div className="crm-builder-status">
        <span className={statusClass(state)}>{STATUS_LABEL[state]}</span>
        <span className="crm-subtext">
          Created {formatTimestamp(record.createdAt)} · Last saved {formatTimestamp(record.updatedAt)}
          {record.sentAt ? ` · Sent ${formatIsoDate(record.sentAt)}` : ''}
          {record.paidAt ? ` · Paid ${formatIsoDate(record.paidAt)}` : ''}
          {downloads.length ? ` · Downloaded ${downloads.length}× (last ${formatTimestamp(downloads[downloads.length - 1])})` : ''}
        </span>
      </div>

      <div className="crm-builder-layout">
        <div className="crm-builder-main">
          <label className="admin-label" htmlFor="inv-title">
            Invoice label <span className="crm-subtext">(internal only, not on the PDF)</span>
          </label>
          <input
            id="inv-title"
            className="admin-input"
            value={form.title}
            maxLength={200}
            onChange={(ev) => patch({ title: ev.target.value })}
          />

          <h4 className="admin-subheading">Details</h4>
          <div className="crm-field-grid">
            <label className="crm-field">
              <span className="admin-label">Invoice number</span>
              <input
                className="admin-input admin-input-full"
                value={form.invoiceNumber}
                maxLength={40}
                onChange={(ev) => patch({ invoiceNumber: ev.target.value })}
              />
            </label>
            <label className="crm-field">
              <span className="admin-label">Invoice date</span>
              <input
                className="admin-input admin-input-full"
                value={form.issuedOn}
                maxLength={300}
                onChange={(ev) => patch({ issuedOn: ev.target.value })}
              />
            </label>
            <label className="crm-field crm-field-wide">
              <span className="admin-label">PDF heading</span>
              <input
                className="admin-input admin-input-full"
                value={form.documentTitle}
                maxLength={200}
                onChange={(ev) => patch({ documentTitle: ev.target.value })}
              />
            </label>
            <label className="crm-field crm-field-wide">
              <span className="admin-label">Bill to</span>
              <input
                className="admin-input admin-input-full"
                value={form.billTo}
                maxLength={200}
                placeholder="Production company or client"
                onChange={(ev) => patch({ billTo: ev.target.value })}
              />
            </label>
            <label className="crm-field">
              <span className="admin-label">Attention</span>
              <input
                className="admin-input admin-input-full"
                value={form.attention}
                maxLength={200}
                onChange={(ev) => patch({ attention: ev.target.value })}
              />
            </label>
            <label className="crm-field">
              <span className="admin-label">Email</span>
              <input
                className="admin-input admin-input-full"
                type="email"
                value={form.email}
                maxLength={254}
                onChange={(ev) => patch({ email: ev.target.value })}
              />
            </label>
            <label className="crm-field">
              <span className="admin-label">Date of service</span>
              <input
                className="admin-input admin-input-full"
                value={form.serviceDate}
                maxLength={300}
                onChange={(ev) => patch({ serviceDate: ev.target.value })}
              />
            </label>
            <label className="crm-field">
              <span className="admin-label">Location</span>
              <input
                className="admin-input admin-input-full"
                value={form.location}
                maxLength={300}
                onChange={(ev) => patch({ location: ev.target.value })}
              />
            </label>
            <label className="crm-field">
              <span className="admin-label">Project</span>
              <input
                className="admin-input admin-input-full"
                value={form.jobName}
                maxLength={300}
                placeholder="Production or job name"
                onChange={(ev) => patch({ jobName: ev.target.value })}
              />
            </label>
            <label className="crm-field">
              <span className="admin-label">PO number</span>
              <input
                className="admin-input admin-input-full"
                value={form.poNumber}
                maxLength={300}
                onChange={(ev) => patch({ poNumber: ev.target.value })}
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
                        <AdminToggle
                          ariaLabel={`Service line ${i + 1} rate may vary`}
                          checked={l.priceMayVary}
                          onChange={(ev) => patchLine('services', i, { priceMayVary: ev.target.checked })}
                        />
                      </td>
                      <td className="crm-money">{formatMoney(totals.serviceLines[i]?.totalCents ?? 0)}</td>
                      <td className="crm-row-actions">
                        <AdminIconButton
                          icon="up"
                          label={`Move service line ${i + 1} up`}
                          disabled={i === 0}
                          onClick={() => moveLine('services', i, -1)}
                        />
                        <AdminIconButton
                          icon="down"
                          label={`Move service line ${i + 1} down`}
                          disabled={i === form.services.length - 1}
                          onClick={() => moveLine('services', i, 1)}
                        />
                        <AdminIconButton icon="remove" label={`Remove service line ${i + 1}`} onClick={() => removeLine('services', i)} />
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
            <AdminSelect
              className="admin-input"
              ariaLabel="Service to add"
              value={addServiceId}
              onChange={(ev) => setAddServiceId(ev.target.value)}
              options={[
                { value: '', label: 'Choose a service…' },
                ...catalogServices.map((svc) => ({
                  value: svc.id,
                  label: `${svc.name} — ${formatMoney(svc.priceCents, { compact: true })}${svc.priceMayVary ? '*' : ''}`,
                })),
                { value: '__custom', label: 'Custom line…' },
              ]}
            />
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
            <p className="admin-hint">
              Add reusable services under{' '}
              <button type="button" className="admin-link-btn" onClick={() => confirmLeave() && onOpenServices()}>
                Common services
              </button>
              . Custom lines still work without that list.
            </p>
          ) : null}

          <h4 className="admin-subheading">Gratuity, travel &amp; fees</h4>
          <div className="crm-field-grid">
            <label className="crm-field">
              <span className="admin-label">Included gratuity (%)</span>
              <input
                className="admin-input admin-input-full"
                inputMode="decimal"
                value={form.gratuityInput}
                onChange={(ev) => patch({ gratuityInput: ev.target.value })}
              />
              <span className="crm-subtext">= {formatMoney(totals.gratuityCents)}. Leave at 0 to hide it.</span>
            </label>
            <label className="crm-field">
              <span className="admin-label">Sales tax (%)</span>
              <input
                className="admin-input admin-input-full"
                inputMode="decimal"
                value={form.taxInput}
                onChange={(ev) => patch({ taxInput: ev.target.value })}
              />
              <span className="crm-subtext">= {formatMoney(totals.taxCents)}. Applies to services, gratuity, and fees.</span>
            </label>
          </div>

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
                  <AdminSelect
                    className="admin-input admin-input-full"
                    value={l.mode}
                    onChange={(ev) => patchLine('expenses', i, { mode: ev.target.value })}
                    options={[
                      { value: 'flat', label: 'Flat fee' },
                      { value: 'perUnit', label: 'Per unit' },
                    ]}
                  />
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
                      <span className="admin-label">Unit (e.g. mile)</span>
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
                <AdminToggle
                  checked={l.ifApplicable}
                  label="If applicable (shown as TBD, not in total)"
                  onChange={(ev) => patchLine('expenses', i, { ifApplicable: ev.target.checked })}
                />
                <span className="crm-money">{l.ifApplicable ? 'TBD' : formatMoney(totals.expenseLines[i]?.totalCents ?? 0)}</span>
                <span className="crm-row-actions">
                  <AdminIconButton
                    icon="up"
                    label={`Move expense ${i + 1} up`}
                    disabled={i === 0}
                    onClick={() => moveLine('expenses', i, -1)}
                  />
                  <AdminIconButton
                    icon="down"
                    label={`Move expense ${i + 1} down`}
                    disabled={i === form.expenses.length - 1}
                    onClick={() => moveLine('expenses', i, 1)}
                  />
                  <AdminIconButton icon="remove" label={`Remove expense ${i + 1}`} onClick={() => removeLine('expenses', i)} />
                </span>
              </div>
            </div>
          ))}
          <div className="crm-add-row">
            <AdminSelect
              className="admin-input"
              ariaLabel="Fee to add"
              value={addExpenseId}
              onChange={(ev) => setAddExpenseId(ev.target.value)}
              options={[
                { value: '', label: 'Choose a fee…' },
                ...catalogExpenses.map((exp) => ({
                  value: exp.id,
                  label: `${exp.name} — ${formatMoney(exp.priceCents, { compact: true })}${
                    exp.mode === 'perUnit' && exp.unitLabel ? ` per ${exp.unitLabel}` : ''
                  }`,
                })),
                { value: '__custom', label: 'Custom line…' },
              ]}
            />
            <button type="button" className="admin-secondary-btn" onClick={addExpense} disabled={!addExpenseId}>
              Add
            </button>
          </div>

          <h4 className="admin-subheading">Payment</h4>
          <div className="crm-field-grid">
            <label className="crm-field">
              <span className="admin-label">Amount already paid ($)</span>
              <input
                className="admin-input admin-input-full"
                inputMode="decimal"
                value={form.paidInput}
                onChange={(ev) => patch({ paidInput: ev.target.value })}
              />
            </label>
            <label className="crm-field">
              <span className="admin-label">Payment terms</span>
              <input
                className="admin-input admin-input-full"
                value={form.paymentTerms}
                maxLength={300}
                onChange={(ev) => patch({ paymentTerms: ev.target.value })}
              />
            </label>
            <label className="crm-field">
              <span className="admin-label">Due date</span>
              <input
                className="admin-input admin-input-full"
                value={form.dueDate}
                maxLength={300}
                onChange={(ev) => patch({ dueDate: ev.target.value })}
              />
            </label>
          </div>
          {totals.paidExceedsTotal ? (
            <p className="admin-error" role="alert">
              Amount already paid is more than the invoice total.
            </p>
          ) : null}

          <h4 className="admin-subheading">Notes</h4>
          <label className="admin-label" htmlFor="inv-asterisk">
            Asterisk note <span className="crm-subtext">(printed when any service is marked *)</span>
          </label>
          <textarea
            id="inv-asterisk"
            className="admin-textarea"
            rows={2}
            value={form.priceMayVaryNote}
            onChange={(ev) => patch({ priceMayVaryNote: ev.target.value })}
          />
          <label className="admin-label" htmlFor="inv-pay-notes">
            Payment instructions <span className="crm-subtext">(blank line between paragraphs)</span>
          </label>
          <textarea
            id="inv-pay-notes"
            className="admin-textarea"
            rows={3}
            value={form.paymentInstructions}
            onChange={(ev) => patch({ paymentInstructions: ev.target.value })}
          />
          <label className="admin-label" htmlFor="inv-notes">
            Closing notes
          </label>
          <textarea
            id="inv-notes"
            className="admin-textarea"
            rows={5}
            value={form.notes}
            onChange={(ev) => patch({ notes: ev.target.value })}
          />

          <div className="crm-danger-zone">
            <button type="button" className="admin-text-btn" onClick={() => void onDelete()} disabled={saving}>
              Delete this invoice
            </button>
          </div>
        </div>

        <aside className="crm-builder-summary" aria-label="Invoice totals">
          <h4 className="crm-summary-title">Summary</h4>
          <dl className="crm-summary-dl">
            <dt>Services ({totals.serviceCount})</dt>
            <dd>{formatMoney(totals.servicesTotalCents)}</dd>
            <dt>Gratuity ({totals.gratuityPercent}%)</dt>
            <dd>{formatMoney(totals.gratuityCents)}</dd>
            <dt>Travel &amp; fees</dt>
            <dd>{formatMoney(totals.expensesTotalCents)}</dd>
            <dt>Tax ({totals.taxPercent}%)</dt>
            <dd>{formatMoney(totals.taxCents)}</dd>
          </dl>
          <div className="crm-summary-total">
            <span>Amount due</span>
            <strong>{formatMoney(totals.balanceCents)}</strong>
          </div>
          <dl className="crm-summary-dl">
            <dt>Invoice total</dt>
            <dd>{formatMoney(totals.totalCents)}</dd>
            <dt>Already paid</dt>
            <dd>{formatMoney(totals.amountPaidCents)}</dd>
          </dl>

          <div className="crm-field-grid crm-summary-dates">
            <label className="crm-field">
              <span className="admin-label">Sent</span>
              <input
                type="date"
                className="admin-input admin-input-full crm-date-input"
                value={record.sentAt ?? ''}
                disabled={dateBusy}
                onChange={(ev) => void onDate({ sentAt: ev.target.value || null })}
              />
            </label>
            <label className="crm-field">
              <span className="admin-label">Paid</span>
              <input
                type="date"
                className="admin-input admin-input-full crm-date-input"
                value={record.paidAt ?? ''}
                disabled={dateBusy}
                onChange={(ev) => void onDate({ paidAt: ev.target.value || null })}
              />
            </label>
          </div>
          <p className="admin-hint">A paid date closes the invoice. You can clear either date.</p>

          <div className="crm-summary-actions">
            <button type="button" className="admin-submit" onClick={() => void save()} disabled={saving || !isDirty}>
              {saving ? 'Saving…' : isDirty ? 'Save changes' : 'Saved'}
            </button>
            <button type="button" className="admin-secondary-btn" onClick={() => void onPreview()} disabled={pdfBusy}>
              Preview PDF
            </button>
            <button
              type="button"
              className="admin-submit"
              onClick={() => void onDownload()}
              disabled={pdfBusy || isDirty || derived.errors.length > 0}
              title={isDirty ? 'Save changes first' : ''}
            >
              {pdfBusy ? 'Building PDF…' : 'Download PDF'}
            </button>
            {isDirty ? <p className="admin-hint">Save changes to enable the download.</p> : null}
            <p className="admin-hint">
              The first download sets the sent date to today
              {record.sentAt ? ` (already ${formatIsoDate(record.sentAt)}).` : '.'} Clear it if you were only checking
              the file.
            </p>
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
