import defaultDoc from './defaultLocationsContent.json';

/** Public JSON in S3. Override with REACT_APP_LOCATIONS_CONTENT_URL; adjust region in URL if your bucket is not in us-east-1. */
export const DEFAULT_LOCATIONS_CONTENT_URL =
  'https://wild-child-cms.s3.us-east-1.amazonaws.com/locations-content.json';

export function createDefaultLocationsContent() {
  return JSON.parse(JSON.stringify(defaultDoc));
}

export function normalizeLocationsContent(input) {
  const def = createDefaultLocationsContent();
  if (!input || typeof input !== 'object') return def;
  const o = input;
  const version = typeof o.version === 'number' && Number.isFinite(o.version) ? o.version : def.version;
  let regionsNotice = def.regionsNotice;
  if (typeof o.regionsNotice === 'string') regionsNotice = o.regionsNotice;
  return { version, regionsNotice };
}

export function sanitizeLocationsContentForSave(input) {
  const version = Number.isFinite(input.version) ? Math.max(1, Math.floor(input.version)) : 1;
  let regionsNotice =
    typeof input.regionsNotice === 'string' ? input.regionsNotice : createDefaultLocationsContent().regionsNotice;
  regionsNotice = regionsNotice.trim();
  if (regionsNotice.length > 3000) regionsNotice = regionsNotice.slice(0, 3000);
  return { version, regionsNotice };
}

export async function loadLocationsContent() {
  const fromEnv = process.env.REACT_APP_LOCATIONS_CONTENT_URL?.trim();
  const url = fromEnv || DEFAULT_LOCATIONS_CONTENT_URL;
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) {
    throw new Error(`Failed to load locations content (${res.status})`);
  }
  return normalizeLocationsContent(await res.json());
}
