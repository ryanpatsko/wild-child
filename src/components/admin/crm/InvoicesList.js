import React, { useEffect, useMemo, useState } from 'react';
import AdminSelect from '../AdminSelect';
import { createInvoice, deleteInvoice, getInvoiceCatalog, listInvoices, setInvoiceDates } from '../../../lib/crmApi';
import {
  buildNewInvoice,
  computeInvoiceTotals,
  duplicateInvoiceContent,
  formatInvoiceNumber,
  formatMoney,
  invoiceStatus,
} from '../../../lib/invoiceMath';
import { formatTimestamp, toNumericDate } from '../../../lib/proposalMath';

const STATUS_LABEL = { draft: 'Draft', sent: 'Sent', paid: 'Paid' };

function statusClass(status) {
  if (status === 'paid') return 'crm-pill crm-pill-paid';
  if (status === 'sent') return 'crm-pill crm-pill-sent';
  return 'crm-pill';
}

export default function InvoicesList({ onOpenInvoice, onOpenServices }) {
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const result = await listInvoices();
      if (cancelled) return;
      if (!result.ok) {
        setError(result.message);
        setStatus('error');
        return;
      }
      setInvoices(result.data.invoices ?? []);
      setStatus('ready');
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return invoices.filter((inv) => {
      const state = invoiceStatus(inv);
      if (filter === 'open' && state === 'paid') return false;
      if (filter === 'paid' && state !== 'paid') return false;
      if (!q) return true;
      return [inv.invoiceNumber, inv.billTo, inv.attention, inv.email, inv.location, inv.jobName, inv.title].some((v) =>
        String(v ?? '').toLowerCase().includes(q),
      );
    });
  }, [invoices, query, filter]);

  async function onNew() {
    setActionError(null);
    setBusy(true);
    try {
      const catalog = await getInvoiceCatalog();
      if (!catalog.ok) {
        setActionError(catalog.message);
        return;
      }
      const result = await createInvoice(buildNewInvoice(catalog.data.catalog));
      if (!result.ok) {
        setActionError(result.message);
        return;
      }
      onOpenInvoice(result.data.invoice.id);
    } finally {
      setBusy(false);
    }
  }

  async function onDuplicate(inv) {
    setActionError(null);
    setBusy(true);
    try {
      const result = await createInvoice(duplicateInvoiceContent(inv));
      if (!result.ok) {
        setActionError(result.message);
        return;
      }
      onOpenInvoice(result.data.invoice.id);
    } finally {
      setBusy(false);
    }
  }

  async function onDelete(inv) {
    const who = inv.billTo || 'this invoice';
    if (!window.confirm(`Delete invoice ${formatInvoiceNumber(inv.invoiceNumber) || ''} for ${who}? This cannot be undone.`)) {
      return;
    }
    setActionError(null);
    setBusy(true);
    try {
      const result = await deleteInvoice(inv.id);
      if (!result.ok) {
        setActionError(result.message);
        return;
      }
      setInvoices((list) => list.filter((x) => x.id !== inv.id));
    } finally {
      setBusy(false);
    }
  }

  async function onDate(inv, patch) {
    setActionError(null);
    const previous = invoices;
    setInvoices((list) => list.map((x) => (x.id === inv.id ? { ...x, ...patch } : x)));
    const result = await setInvoiceDates(inv.id, patch);
    if (!result.ok) {
      setInvoices(previous);
      setActionError(result.message);
      return;
    }
    setInvoices((list) => list.map((x) => (x.id === inv.id ? result.data.invoice : x)));
  }

  if (status === 'loading') {
    return (
      <p className="admin-status" role="status">
        Loading invoices…
      </p>
    );
  }
  if (status === 'error') {
    return (
      <p className="admin-error" role="alert">
        {error}
      </p>
    );
  }

  return (
    <div>
      <div className="crm-list-toolbar">
        <h3 className="admin-panel-title">Invoices</h3>
        <div className="crm-list-actions">
          <button type="button" className="admin-secondary-btn" onClick={onOpenServices}>
            Common services
          </button>
          <button type="button" className="admin-submit" onClick={() => void onNew()} disabled={busy}>
            New invoice
          </button>
        </div>
      </div>
      <p className="admin-muted">
        For production companies and other work outside a wedding client. Downloading the PDF fills in the sent date
        the first time. Enter a paid date to close the invoice.
      </p>
      {actionError ? (
        <p className="admin-error" role="alert">
          {actionError}
        </p>
      ) : null}
      <div className="crm-toolbar-search">
        <label className="visually-hidden" htmlFor="crm-invoice-search">
          Search invoices
        </label>
        <input
          id="crm-invoice-search"
          className="admin-input"
          type="search"
          placeholder="Search by client, invoice number, project, or location"
          value={query}
          onChange={(ev) => setQuery(ev.target.value)}
        />
        <label className="visually-hidden" htmlFor="crm-invoice-filter">
          Filter invoices
        </label>
        <AdminSelect
          id="crm-invoice-filter"
          className="admin-input crm-filter-select"
          ariaLabel="Filter invoices"
          value={filter}
          onChange={(ev) => setFilter(ev.target.value)}
          options={[
            { value: 'all', label: 'All invoices' },
            { value: 'open', label: 'Not paid' },
            { value: 'paid', label: 'Paid' },
          ]}
        />
      </div>
      {invoices.length === 0 ? (
        <p className="admin-muted">No invoices yet.</p>
      ) : (
        <div className="crm-table-wrap">
          <table className="crm-table crm-invoices-table">
            <thead>
              <tr>
                <th>Invoice</th>
                <th>Bill to</th>
                <th>Service date</th>
                <th>Total</th>
                <th>Sent</th>
                <th>Paid</th>
                <th aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((inv) => {
                const totals = computeInvoiceTotals(inv);
                const state = invoiceStatus(inv);
                return (
                  <tr key={inv.id} className="crm-clickable-row" onClick={() => onOpenInvoice(inv.id)}>
                    <td>
                      <button
                        type="button"
                        className="crm-row-link"
                        onClick={(ev) => {
                          ev.stopPropagation();
                          onOpenInvoice(inv.id);
                        }}
                      >
                        {formatInvoiceNumber(inv.invoiceNumber) || 'Invoice'}
                        {inv.title && inv.title !== 'Invoice' ? ` · ${inv.title}` : ''}
                      </button>
                      <div className="crm-subtext">{inv.jobName || `Created ${formatTimestamp(inv.createdAt)}`}</div>
                      <span className={statusClass(state)}>{STATUS_LABEL[state]}</span>
                    </td>
                    <td>
                      {inv.billTo || '—'}
                      {inv.location ? <div className="crm-subtext">{inv.location}</div> : null}
                    </td>
                    <td>{toNumericDate(inv.serviceDate) || '—'}</td>
                    <td>
                      {formatMoney(totals.totalCents)}
                      {totals.amountPaidCents > 0 && totals.balanceCents > 0 ? (
                        <div className="crm-subtext">Due {formatMoney(totals.balanceCents)}</div>
                      ) : null}
                    </td>
                    <td>
                      <input
                        type="date"
                        className="admin-input crm-date-input"
                        aria-label={`Sent date for invoice ${inv.invoiceNumber || inv.id}`}
                        value={inv.sentAt ?? ''}
                        onClick={(ev) => ev.stopPropagation()}
                        onMouseDown={(ev) => ev.stopPropagation()}
                        onChange={(ev) => void onDate(inv, { sentAt: ev.target.value || null })}
                      />
                    </td>
                    <td>
                      <input
                        type="date"
                        className="admin-input crm-date-input"
                        aria-label={`Paid date for invoice ${inv.invoiceNumber || inv.id}`}
                        value={inv.paidAt ?? ''}
                        onClick={(ev) => ev.stopPropagation()}
                        onMouseDown={(ev) => ev.stopPropagation()}
                        onChange={(ev) => void onDate(inv, { paidAt: ev.target.value || null })}
                      />
                    </td>
                    <td className="crm-row-actions">
                      <button
                        type="button"
                        className="admin-link-btn"
                        disabled={busy}
                        onClick={(ev) => {
                          ev.stopPropagation();
                          void onDuplicate(inv);
                        }}
                      >
                        Duplicate
                      </button>
                      <button
                        type="button"
                        className="admin-text-btn"
                        disabled={busy}
                        onClick={(ev) => {
                          ev.stopPropagation();
                          void onDelete(inv);
                        }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 ? <p className="admin-muted">No invoices match that search.</p> : null}
        </div>
      )}
    </div>
  );
}
