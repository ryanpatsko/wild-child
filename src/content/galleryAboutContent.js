import defaultDoc from './defaultGalleryAboutContent.json';

export const CMS_S3_BASE = 'https://wild-child-cms.s3.us-east-1.amazonaws.com';
export const GALLERY_ABOUT_FOLDER = 'gallery-about';

/** Public manifest in S3. Override with REACT_APP_GALLERY_ABOUT_MANIFEST_URL. */
export const DEFAULT_GALLERY_ABOUT_MANIFEST_URL = `${CMS_S3_BASE}/${GALLERY_ABOUT_FOLDER}/manifest.json`;

export function createDefaultGalleryAboutContent() {
  return JSON.parse(JSON.stringify(defaultDoc));
}

export function galleryAboutImageUrl(filename) {
  return `${CMS_S3_BASE}/${GALLERY_ABOUT_FOLDER}/${encodeURIComponent(filename)}`;
}

export function normalizeGalleryAboutContent(input) {
  const def = createDefaultGalleryAboutContent();
  if (!input || typeof input !== 'object') return def;
  const version =
    typeof input.version === 'number' && Number.isFinite(input.version) ? input.version : def.version;
  let images = def.images;
  if (Array.isArray(input.images)) {
    images = input.images.filter((x) => typeof x === 'string' && x.trim().length > 0).map((x) => x.trim());
  }
  return { version, images };
}

export function galleryAboutContentSignature(doc) {
  return JSON.stringify({ version: doc.version, images: doc.images });
}

export function sanitizeGalleryAboutContentForSave(input) {
  const version = Number.isFinite(input.version) ? Math.max(1, Math.floor(input.version)) : 1;
  const images = (Array.isArray(input.images) ? input.images : [])
    .filter((x) => typeof x === 'string' && x.trim().length > 0)
    .map((x) => x.trim().slice(0, 120));
  return { version, images: images.slice(0, 30) };
}

export async function loadGalleryAboutContent() {
  const fromEnv = process.env.REACT_APP_GALLERY_ABOUT_MANIFEST_URL?.trim();
  const url = fromEnv || DEFAULT_GALLERY_ABOUT_MANIFEST_URL;
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) {
    throw new Error(`Failed to load gallery manifest (${res.status})`);
  }
  return normalizeGalleryAboutContent(await res.json());
}
