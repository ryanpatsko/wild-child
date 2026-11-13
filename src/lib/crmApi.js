import { getAdminAuthBaseUrl, getStoredSessionToken } from './adminAuth';

/** Public: called by the contact form. Throws on failure so the caller can decide how to report it. */
export async function saveContactSubmission(fields) {
  const base = getAdminAuthBaseUrl();
  if (!base) throw new Error('Contact capture endpoint is not configured.');
  const res = await fetch(`${base}/contact-submissions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(fields),
  });
  if (!res.ok) throw new Error(`Saving inquiry failed (HTTP ${res.status}).`);
}

async function adminRequest(method, path, body) {
  const base = getAdminAuthBaseUrl();
  if (!base) return { ok: false, message: 'Admin API is not configured.' };
  const token = getStoredSessionToken();
  if (!token) return { ok: false, message: 'Not signed in.' };
  let res;
  try {
    res = await fetch(`${base}${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    return { ok: false, message: 'Network error reaching the server. Check CORS and the Function URL.' };
  }
  let data = null;
  try {
    data = await res.json();
  } catch {
    /* ignore */
  }
  if (!res.ok) {
    const detail = typeof data?.error === 'string' ? `: ${data.error}` : '';
    return { ok: false, status: res.status, message: `Request failed (HTTP ${res.status}${detail}).` };
  }
  return { ok: true, data };
}

const clientPath = (email) => `/crm/clients/${encodeURIComponent(email)}`;
const proposalPath = (email, id) => `${clientPath(email)}/proposals/${encodeURIComponent(id)}`;

export const listClients = () => adminRequest('GET', '/crm/clients');
export const getClient = (email) => adminRequest('GET', clientPath(email));
export const updateClient = (email, profile) => adminRequest('PUT', clientPath(email), profile);
export const deleteClient = (email) => adminRequest('DELETE', clientPath(email));

export const getCatalog = () => adminRequest('GET', '/crm/catalog');
export const saveCatalog = (catalog) => adminRequest('PUT', '/crm/catalog', catalog);

export const createProposal = (email, proposal) =>
  adminRequest('POST', `${clientPath(email)}/proposals`, proposal);
export const updateProposal = (email, id, proposal) => adminRequest('PUT', proposalPath(email, id), proposal);
export const deleteProposal = (email, id) => adminRequest('DELETE', proposalPath(email, id));
export const setProposalFinal = (email, id, final) =>
  adminRequest('PUT', `${proposalPath(email, id)}/status`, { final });
export const recordProposalDownload = (email, id) => adminRequest('POST', `${proposalPath(email, id)}/downloads`);
