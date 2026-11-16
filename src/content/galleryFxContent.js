import defaultDoc from './defaultGalleryFxContent.json';

export const CMS_S3_BASE = 'https://wild-child-cms.s3.us-east-1.amazonaws.com';
export const GALLERY_FX_FOLDER = 'gallery-fx';
export const FX_GRID_MAX = 12;
export const FX_BUNDLED_PREFIX = 'bundled:';

/** Photos shipped with the site, used until a custom file replaces them. */
export const FX_ORIGINALS = {
  header: 'fx-1.jpg',
  afterServices: ['fx-4.jpg', 'fx-5.jpg'],
  afterBooking: ['fx-6.jpg', 'fx-3.jpg'],
};

const FILE_RE = /^[a-zA-Z0-9._-]+\.(jpg|jpeg|png|webp)$/i;

/** Public manifest in S3. Override with REACT_APP_GALLERY_FX_MANIFEST_URL. */
export const DEFAULT_GALLERY_FX_MANIFEST_URL = `${CMS_S3_BASE}/${GALLERY_FX_FOLDER}/manifest.json`;

export function createDefaultGalleryFxContent() {
  return JSON.parse(JSON.stringify(defaultDoc));
}

export function galleryFxImageUrl(filename) {
  return `${CMS_S3_BASE}/${GALLERY_FX_FOLDER}/${encodeURIComponent(filename)}`;
}

export function bundledFxRef(filename) {
  return `${FX_BUNDLED_PREFIX}${filename}`;
}

export function isBundledFxRef(ref) {
  return typeof ref === 'string' && ref.startsWith(FX_BUNDLED_PREFIX);
}

export function bundledFxName(ref) {
  return String(ref).slice(FX_BUNDLED_PREFIX.length);
}

export function isValidFxRef(ref) {
  const value = String(ref ?? '').trim();
  if (value.startsWith(FX_BUNDLED_PREFIX)) return FILE_RE.test(value.slice(FX_BUNDLED_PREFIX.length));
  return FILE_RE.test(value);
}

function cleanList(input, fallback) {
  if (!Array.isArray(input)) return [...fallback];
  return input
    .map((item) => String(item).trim())
    .filter(isValidFxRef)
    .slice(0, FX_GRID_MAX);
}

export function normalizeGalleryFxContent(input) {
  const def = createDefaultGalleryFxContent();
  if (!input || typeof input !== 'object') return def;
  const version =
    typeof input.version === 'number' && Number.isFinite(input.version) ? input.version : def.version;
  const header = isValidFxRef(input.header) ? String(input.header).trim() : def.header;
  return {
    version,
    header,
    afterServices: cleanList(input.afterServices, def.afterServices),
    afterBooking: cleanList(input.afterBooking, def.afterBooking),
  };
}

export function galleryFxContentSignature(doc) {
  return JSON.stringify({
    version: doc.version,
    header: doc.header,
    afterServices: doc.afterServices,
    afterBooking: doc.afterBooking,
  });
}

export function sanitizeGalleryFxContentForSave(input) {
  const normalized = normalizeGalleryFxContent(input);
  const version = Number.isFinite(input?.version) ? Math.max(1, Math.floor(input.version)) : 1;
  return { ...normalized, version };
}

function galleryFxManifestUrl() {
  return process.env.REACT_APP_GALLERY_FX_MANIFEST_URL?.trim() || DEFAULT_GALLERY_FX_MANIFEST_URL;
}

export async function loadGalleryFxContent() {
  const res = await fetch(galleryFxManifestUrl(), { cache: 'no-store' });
  if (!res.ok) {
    const error = new Error(`Failed to load Creative FX photo list (${res.status})`);
    error.status = res.status;
    throw error;
  }
  return normalizeGalleryFxContent(await res.json());
}

/** True once gallery-fx/manifest.json exists and the bucket allows public reads. A missing key is 403, not 404. */
export async function galleryFxManifestIsPublic() {
  try {
    const res = await fetch(galleryFxManifestUrl(), { cache: 'no-store' });
    return res.ok;
  } catch {
    return false;
  }
}
