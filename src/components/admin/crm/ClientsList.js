import React, { useEffect, useMemo, useState } from 'react';
import { listClients } from '../../../lib/crmApi';
import { clientDisplayName, formatEventDateShort, formatTimestamp } from '../../../lib/proposalMath';

function StatusCell({ iso }) {
  if (!iso) return <span className="crm-status-empty">—</span>;
  return (
    <span className="crm-status-done">
      <span aria-hidden>✓</span> {formatTimestamp(iso)}
    </span>
  );
}

export default function ClientsList({ onOpenClient }) {
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);
  const [clients, setClients] = useState([]);
  const [query, setQuery] = useState('');

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const result = await listClients();
      if (cancelled) return;
      if (!result.ok) {
        setError(result.message);
        setStatus('error');
        return;
      }
      setClients(result.data.clients ?? []);
      setStatus('ready');
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return clients;
    return clients.filter((c) =>
      [clientDisplayName(c), c.email, c.latestSubmission?.eventVenue].some((v) => String(v ?? '').toLowerCase().includes(q)),
    );
  }, [clients, query]);

  if (status === 'loading') {
    return (
      <p className="admin-status" role="status">
        Loading clients…
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
      <h3 className="admin-panel-title">Clients</h3>
      <label className="visually-hidden" htmlFor="crm-client-search">
        Search clients
      </label>
      <input
        id="crm-client-search"
        className="admin-input"
        type="search"
        placeholder="Search by name, email, or venue"
        value={query}
        onChange={(ev) => setQuery(ev.target.value)}
      />
      {clients.length === 0 ? (
        <p className="admin-muted">No inquiries yet. New contact form submissions will appear here.</p>
      ) : (
        <div className="crm-table-wrap">
          <table className="crm-table crm-clients-table">
            <thead>
              <tr>
                <th>Client</th>
                <th>Inquiry received</th>
                <th>Event date</th>
                <th>Proposal finalized</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => {
                const sub = c.latestSubmission ?? {};
                return (
                  <tr key={c.email} className="crm-clickable-row" onClick={() => onOpenClient(c.email)}>
                    <td>
                      <button
                        type="button"
                        className="crm-row-link"
                        onClick={(ev) => {
                          ev.stopPropagation();
                          onOpenClient(c.email);
                        }}
                      >
                        {clientDisplayName(c)}
                      </button>
                      <div className="crm-subtext">{c.email}</div>
                    </td>
                    <td>
                      {formatTimestamp(c.lastSubmittedAt)}
                      {c.submissionCount > 1 ? <div className="crm-subtext">{c.submissionCount} inquiries</div> : null}
                    </td>
                    <td>{formatEventDateShort(sub.eventDate, sub.eventYear) || '—'}</td>
                    <td>
                      <StatusCell iso={c.latestFinalizedAt} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 ? <p className="admin-muted">No clients match that search.</p> : null}
        </div>
      )}
    </div>
  );
}
