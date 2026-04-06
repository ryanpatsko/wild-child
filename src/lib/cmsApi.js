import { getAdminAuthBaseUrl } from './adminAuth';

async function readErrorDetail(res) {
  try {
    const text = await res.text();
    if (text) {
      const parsed = JSON.parse(text);
      if (typeof parsed.error === 'string') return `: ${parsed.error}`;
    }
  } catch {
    /* ignore */
  }
  return '';
}

export async function saveLocationsContent(token, doc) {
  const base = getAdminAuthBaseUrl();
  if (!base) {
    return { ok: false, message: 'Admin API is not configured.' };
  }
  let res;
  try {
    res = await fetch(`${base}/locations-content`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(doc),
    });
  } catch {
    return {
      ok: false,
      message: 'Network error saving to server. Check CORS and the Function URL.',
    };
  }
  if (!res.ok) {
    const detail = await readErrorDetail(res);
    return { ok: false, message: `Save failed (HTTP ${res.status}${detail}).` };
  }
  return { ok: true };
}

export async function saveAboutContent(token, doc) {
  const base = getAdminAuthBaseUrl();
  if (!base) {
    return { ok: false, message: 'Admin API is not configured.' };
  }
  let res;
  try {
    res = await fetch(`${base}/about-content`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(doc),
    });
  } catch {
    return {
      ok: false,
      message: 'Network error saving to server. Check CORS and the Function URL.',
    };
  }
  if (!res.ok) {
    const detail = await readErrorDetail(res);
    return { ok: false, message: `Save failed (HTTP ${res.status}${detail}).` };
  }
  return { ok: true };
}

export async function saveMediaContent(token, doc) {
  const base = getAdminAuthBaseUrl();
  if (!base) {
    return { ok: false, message: 'Admin API is not configured.' };
  }
  let res;
  try {
    res = await fetch(`${base}/media-content`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(doc),
    });
  } catch {
    return {
      ok: false,
      message: 'Network error saving to server. Check CORS and the Function URL.',
    };
  }
  if (!res.ok) {
    const detail = await readErrorDetail(res);
    return { ok: false, message: `Save failed (HTTP ${res.status}${detail}).` };
  }
  return { ok: true };
}

export async function savePagesContent(token, doc) {
  const base = getAdminAuthBaseUrl();
  if (!base) {
    return { ok: false, message: 'Admin API is not configured.' };
  }
  let res;
  try {
    res = await fetch(`${base}/pages-content`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(doc),
    });
  } catch {
    return {
      ok: false,
      message: 'Network error saving to server. Check CORS and the Function URL.',
    };
  }
  if (!res.ok) {
    const detail = await readErrorDetail(res);
    return { ok: false, message: `Save failed (HTTP ${res.status}${detail}).` };
  }
  return { ok: true };
}

export async function saveBridalContent(token, doc) {
  const base = getAdminAuthBaseUrl();
  if (!base) {
    return { ok: false, message: 'Admin API is not configured.' };
  }
  let res;
  try {
    res = await fetch(`${base}/bridal-content`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(doc),
    });
  } catch {
    return {
      ok: false,
      message: 'Network error saving to server. Check CORS and the Function URL.',
    };
  }
  if (!res.ok) {
    const detail = await readErrorDetail(res);
    return { ok: false, message: `Save failed (HTTP ${res.status}${detail}).` };
  }
  return { ok: true };
}
