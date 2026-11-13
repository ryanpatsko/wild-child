import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  createProposal,
  deleteClient,
  deleteProposal,
  getCatalog,
  getClient,
  updateClient,
} from '../../../lib/crmApi';
import {
  buildNewProposal,
  clientDisplayName,
  computeProposalTotals,
  formatEventDate,
  formatMoney,
  formatTimestamp,
  proposalContent,
} from '../../../lib/proposalMath';

const SUBMISSION_LABELS = [
  ['firstName', 'First name'],
  ['lastName', 'Last name'],
  ['phone', 'Phone'],
  ['eventType', 'Event type'],
  ['serviceType', 'Hair + makeup?'],
  ['attendees', 'Attendees'],
  ['location', 'Location of services'],
  ['eventVenue', 'Venue'],
  ['bestApplies', 'Best applies'],
  ['brochureFollowUp', 'Follow-up preference'],
  ['bridalPricingReviewed', 'Reviewed bridal pricing'],
  ['mostImportant', 'Most important'],
  ['howDidYouHear', 'How they heard'],
];

function prettify(value) {
  const v = String(value ?? '').trim();
  if (!v || v === 'N/A') return '';
  if (/[A-Z ]/.test(v)) return v;
  const spaced = v.replace(/-/g, ' ');
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

function Submission({ sub, defaultOpen }) {
  return (
    <details className="crm-submission" open={defaultOpen}>
      <summary>
        Inquiry · {formatTimestamp(sub.submittedAt)}
        {sub.eventDate ? ` · event ${formatEventDate(sub.eventDate, sub.eventYear)}` : ''}
      </summary>
      <dl className="crm-dl">
        {SUBMISSION_LABELS.map(([key, label]) => {
          const value = prettify(sub[key]);
          if (!value) return null;
          return (
            <React.Fragment key={key}>
              <dt>{label}</dt>
              <dd>{value}</dd>
            </React.Fragment>
          );
        })}
        {sub.message ? (
          <>
            <dt>Message</dt>
            <dd className="crm-pre">{sub.message}</dd>
          </>
        ) : null}
      </dl>
    </details>
  );
}

export default function ClientProfile({ email, onBack, onOpenProposal }) {
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [displayName, setDisplayName] = useState('');
  const [notes, setNotes] = useState('');
  const [baseline, setBaseline] = useState({ displayName: '', notes: '' });
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const result = await getClient(email);
    if (!result.ok) {
      setError(result.status === 404 ? 'This client was not found.' : result.message);
      setStatus('error');
      return;
    }
    setData(result.data);
    setDisplayName(result.data.client.displayName ?? '');
    setNotes(result.data.client.notes ?? '');
    setBaseline({ displayName: result.data.client.displayName ?? '', notes: result.data.client.notes ?? '' });
    setStatus('ready');
  }, [email]);

  useEffect(() => {
    void load();
  }, [load]);

  const isDirty = displayName !== baseline.displayName || notes !== baseline.notes;

  async function onSaveProfile(e) {
    e.preventDefault();
    setSaving(true);
    setSaveMsg(null);
    try {
      const result = await updateClient(email, { displayName: displayName.trim(), notes });
      if (result.ok) {
        setBaseline({ displayName: displayName.trim(), notes });
        setDisplayName(displayName.trim());
        setSaveMsg({ ok: true, text: 'Saved' });
      } else {
        setSaveMsg({ ok: false, text: result.message });
      }
    } finally {
      setSaving(false);
    }
  }

  async function onNewProposal() {
    setActionError(null);
    setBusy(true);
    try {
      const catalog = await getCatalog();
      if (!catalog.ok) {
        setActionError(catalog.message);
        return;
      }
      const client = { ...data.client, displayName: displayName.trim() || data.client.displayName };
      const result = await createProposal(email, buildNewProposal(catalog.data.catalog, client));
      if (!result.ok) {
        setActionError(result.message);
        return;
      }
      onOpenProposal(result.data.proposal.id);
    } finally {
      setBusy(false);
    }
  }

  async function onDuplicate(p) {
    setActionError(null);
    setBusy(true);
    try {
      const result = await createProposal(email, { ...proposalContent(p), title: `${p.title || 'Proposal'} (copy)` });
      if (!result.ok) {
        setActionError(result.message);
        return;
      }
      onOpenProposal(result.data.proposal.id);
    } finally {
      setBusy(false);
    }
  }

  async function onDeleteProposal(p) {
    if (!window.confirm(`Delete "${p.title || 'Proposal'}"? This cannot be undone.`)) return;
    setActionError(null);
    setBusy(true);
    try {
      const result = await deleteProposal(email, p.id);
      if (!result.ok) setActionError(result.message);
      await load();
    } finally {
      setBusy(false);
    }
  }

  async function onDeleteClient() {
    if (
      !window.confirm(
        `Delete ${clientDisplayName(data.client)} (${email}) along with all inquiries, notes, and proposals? This cannot be undone.`,
      )
    )
      return;
    setBusy(true);
    try {
      const result = await deleteClient(email);
      if (!result.ok) {
        setActionError(result.message);
        return;
      }
      onBack();
    } finally {
      setBusy(false);
    }
  }

  const proposals = useMemo(() => data?.proposals ?? [], [data]);

  if (status === 'loading') {
    return (
      <p className="admin-status" role="status">
        Loading client…
      </p>
    );
  }
  if (status === 'error') {
    return (
      <div>
        <button type="button" className="admin-link-btn crm-back" onClick={onBack}>
          ← All clients
        </button>
        <p className="admin-error" role="alert">
          {error}
        </p>
      </div>
    );
  }

  const { client, submissions } = data;
  const latest = client.latestSubmission ?? {};

  return (
    <div className="crm-profile">
      <button type="button" className="admin-link-btn crm-back" onClick={onBack}>
        ← All clients
      </button>
      <h3 className="admin-panel-title crm-profile-title">{clientDisplayName({ ...client, displayName })}</h3>
      <p className="admin-muted">
        <a className="admin-external-link" href={`mailto:${client.email}`}>
          {client.email}
        </a>
        {latest.phone ? ` · ${latest.phone}` : ''}
        {latest.eventDate ? ` · Event ${formatEventDate(latest.eventDate, latest.eventYear)}` : ''}
        {latest.eventVenue ? ` · ${latest.eventVenue}` : ''}
      </p>

      <form className="admin-card-editor" onSubmit={onSaveProfile}>
        <label className="admin-label" htmlFor="crm-display-name">
          Client display name
        </label>
        <input
          id="crm-display-name"
          className="admin-input"
          value={displayName}
          maxLength={200}
          placeholder={[latest.firstName, latest.lastName].filter(Boolean).join(' ') || 'e.g. Ashley & Olivia'}
          onChange={(ev) => setDisplayName(ev.target.value)}
        />
        <p className="admin-hint crm-hint-tight">Shown in the client list and used as &quot;Prepared for&quot; on new proposals.</p>
        <label className="admin-label" htmlFor="crm-notes">
          Notes
        </label>
        <textarea
          id="crm-notes"
          className="admin-textarea"
          rows={6}
          value={notes}
          maxLength={20000}
          placeholder="Anything to remember about this client or their wedding"
          onChange={(ev) => setNotes(ev.target.value)}
        />
        <div className="admin-save-row">
          <button type="submit" className="admin-submit" disabled={saving || !isDirty}>
            {saving ? 'Saving…' : 'Save client'}
          </button>
          {saveMsg && !isDirty ? (
            <span className={saveMsg.ok ? 'admin-save-feedback' : 'admin-error'} role="status">
              {saveMsg.text}
            </span>
          ) : null}
        </div>
      </form>

      <div className="crm-section-head">
        <h4 className="admin-subheading">Proposals</h4>
        <button type="button" className="admin-submit" onClick={onNewProposal} disabled={busy}>
          New proposal
        </button>
      </div>
      {actionError ? (
        <p className="admin-error" role="alert">
          {actionError}
        </p>
      ) : null}
      {proposals.length === 0 ? (
        <p className="admin-muted">No proposals yet.</p>
      ) : (
        <div className="crm-table-wrap">
          <table className="crm-table">
            <thead>
              <tr>
                <th>Proposal</th>
                <th>Total</th>
                <th>Last edited</th>
                <th>Finalized</th>
                <th>Downloaded</th>
                <th aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {proposals.map((p) => {
                const downloads = p.downloads ?? [];
                return (
                  <tr key={p.id}>
                    <td>
                      <button type="button" className="crm-row-link" onClick={() => onOpenProposal(p.id)}>
                        {p.title || 'Proposal'}
                      </button>
                      <div className="crm-subtext">Created {formatTimestamp(p.createdAt)}</div>
                    </td>
                    <td>{formatMoney(computeProposalTotals(p).overallCents)}</td>
                    <td>{formatTimestamp(p.updatedAt)}</td>
                    <td>{p.finalizedAt ? <span className="crm-status-done">✓ {formatTimestamp(p.finalizedAt)}</span> : 'Draft'}</td>
                    <td>
                      {downloads.length ? (
                        <span className="crm-status-done">
                          ✓ {formatTimestamp(downloads[downloads.length - 1])}
                          {downloads.length > 1 ? <span className="crm-subtext"> ({downloads.length}×)</span> : null}
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="crm-row-actions">
                      <button type="button" className="admin-link-btn" onClick={() => onDuplicate(p)} disabled={busy}>
                        Duplicate
                      </button>
                      <button type="button" className="admin-text-btn" onClick={() => onDeleteProposal(p)} disabled={busy}>
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <h4 className="admin-subheading">Contact form inquiries ({submissions.length})</h4>
      {submissions.map((sub, i) => (
        <Submission key={sub.submittedAt + i} sub={sub} defaultOpen={i === 0} />
      ))}

      <div className="crm-danger-zone">
        <button type="button" className="admin-text-btn" onClick={onDeleteClient} disabled={busy}>
          Delete this client and all their records
        </button>
        <span className="admin-hint"> (for spam or duplicate inquiries)</span>
      </div>
    </div>
  );
}
