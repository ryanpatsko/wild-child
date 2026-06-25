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

export async function saveGalleryHomeManifest(token, doc) {
  return saveGalleryManifest(token, 'gallery-home', doc);
}

export async function requestGalleryHomeUpload(token, payload) {
  return requestGalleryUpload(token, 'gallery-home', payload);
}

export async function deleteGalleryHomeImage(token, filename) {
  return deleteGalleryImage(token, 'gallery-home', filename);
}

export async function saveGalleryBridalManifest(token, doc) {
  return saveGalleryManifest(token, 'gallery-bridal', doc);
}

export async function requestGalleryBridalUpload(token, payload) {
  return requestGalleryUpload(token, 'gallery-bridal', payload);
}

export async function deleteGalleryBridalImage(token, filename) {
  return deleteGalleryImage(token, 'gallery-bridal', filename);
}

async function saveGalleryManifest(token, slug, doc) {
  const base = getAdminAuthBaseUrl();
  if (!base) {
    return { ok: false, message: 'Admin API is not configured.' };
  }
  let res;
  try {
    res = await fetch(`${base}/${slug}/manifest`, {
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
      message: 'Network error saving gallery. Check CORS and the Function URL.',
    };
  }
  if (!res.ok) {
    const detail = await readErrorDetail(res);
    return { ok: false, message: `Save failed (HTTP ${res.status}${detail}).` };
  }
  return { ok: true };
}

async function requestGalleryUpload(token, slug, { filename, contentType }) {
  const base = getAdminAuthBaseUrl();
  if (!base) {
    return { ok: false, message: 'Admin API is not configured.' };
  }
  let res;
  try {
    res = await fetch(`${base}/${slug}/upload`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ filename, contentType }),
    });
  } catch {
    return {
      ok: false,
      message: 'Network error requesting upload URL. Check CORS and the Function URL.',
    };
  }
  if (!res.ok) {
    const detail = await readErrorDetail(res);
    return { ok: false, message: `Upload request failed (HTTP ${res.status}${detail}).` };
  }
  try {
    const data = await res.json();
    if (typeof data.uploadUrl !== 'string' || typeof data.filename !== 'string') {
      return { ok: false, message: 'Upload request returned an invalid response.' };
    }
    return { ok: true, uploadUrl: data.uploadUrl, filename: data.filename };
  } catch {
    return { ok: false, message: 'Upload request returned an invalid response.' };
  }
}

async function deleteGalleryImage(token, slug, filename) {
  const base = getAdminAuthBaseUrl();
  if (!base) {
    return { ok: false, message: 'Admin API is not configured.' };
  }
  let res;
  try {
    res = await fetch(`${base}/${slug}/image`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ filename }),
    });
  } catch {
    return {
      ok: false,
      message: 'Network error deleting image. Check CORS and the Function URL.',
    };
  }
  if (!res.ok) {
    const detail = await readErrorDetail(res);
    return { ok: false, message: `Delete failed (HTTP ${res.status}${detail}).` };
  }
  return { ok: true };
}
