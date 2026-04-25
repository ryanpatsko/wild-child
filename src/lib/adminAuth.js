const STORAGE_KEY = 'wc-admin-session-token';

/** Lambda Function URL origin only (no trailing slash). Set REACT_APP_ADMIN_AUTH_URL in Amplify and .env.local. */
export function getAdminAuthBaseUrl() {
  const fromEnv = process.env.NEXT_PUBLIC_ADMIN_AUTH_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/$/, '');
  return '';
}

export function isAdminAuthConfigured() {
  return getAdminAuthBaseUrl().length > 0;
}

export function getStoredSessionToken() {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export function setStoredSessionToken(token) {
  try {
    localStorage.setItem(STORAGE_KEY, token);
  } catch {
    /* ignore */
  }
}

export function clearStoredSessionToken() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

export async function adminLogin(password) {
  const base = getAdminAuthBaseUrl();
  if (!base) {
    return { ok: false, message: 'Admin sign-in is not configured for this environment.' };
  }
  let res;
  try {
    res = await fetch(`${base}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
  } catch {
    return {
      ok: false,
      message:
        'Network error (request never reached the server). Check the Function URL, CORS, and that auth is NONE—not AWS_IAM.',
    };
  }
  if (!res.ok) {
    if (res.status === 401) {
      return { ok: false, message: 'Incorrect password.' };
    }
    let detail = '';
    try {
      const text = await res.text();
      if (text) {
        const parsed = JSON.parse(text);
        if (typeof parsed.error === 'string') detail = `: ${parsed.error}`;
      }
    } catch {
      /* ignore */
    }
    return {
      ok: false,
      message: `Could not sign in (HTTP ${res.status}${detail}). Check Lambda logs and Function URL settings.`,
    };
  }
  let data;
  try {
    data = await res.json();
  } catch {
    return { ok: false, message: 'Unexpected response from server (not JSON).' };
  }
  if (!data.token) {
    return { ok: false, message: 'Unexpected response from server.' };
  }
  setStoredSessionToken(data.token);
  return { ok: true };
}

export async function adminVerifySession(token) {
  const base = getAdminAuthBaseUrl();
  if (!base) return false;
  try {
    const res = await fetch(`${base}/verify`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.ok;
  } catch {
    return false;
  }
}
