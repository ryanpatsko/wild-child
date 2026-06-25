import defaultDoc from './defaultGalleryBridalContent.json';
import { CMS_S3_BASE } from './galleryHomeContent';

export const GALLERY_BRIDAL_FOLDER = 'gallery-bridal';

/** Public manifest in S3. Override with REACT_APP_GALLERY_BRIDAL_MANIFEST_URL. */
export const DEFAULT_GALLERY_BRIDAL_MANIFEST_URL = `${CMS_S3_BASE}/${GALLERY_BRIDAL_FOLDER}/manifest.json`;

export function createDefaultGalleryBridalContent() {
  return JSON.parse(JSON.stringify(defaultDoc));
}

export function galleryBridalImageUrl(filename) {
  return `${CMS_S3_BASE}/${GALLERY_BRIDAL_FOLDER}/${encodeURIComponent(filename)}`;
}

export function normalizeGalleryBridalContent(input) {
  const def = createDefaultGalleryBridalContent();
  if (!input || typeof input !== 'object') return def;
  const version =
    typeof input.version === 'number' && Number.isFinite(input.version) ? input.version : def.version;
  let images = def.images;
  if (Array.isArray(input.images)) {
    images = input.images.filter((x) => typeof x === 'string' && x.trim().length > 0).map((x) => x.trim());
  }
  return { version, images };
}

export function galleryBridalContentSignature(doc) {
  return JSON.stringify({ version: doc.version, images: doc.images });
}

export function sanitizeGalleryBridalContentForSave(input) {
  const version = Number.isFinite(input.version) ? Math.max(1, Math.floor(input.version)) : 1;
  const images = (Array.isArray(input.images) ? input.images : [])
    .filter((x) => typeof x === 'string' && x.trim().length > 0)
    .map((x) => x.trim().slice(0, 120));
  return { version, images: images.slice(0, 30) };
}

export async function loadGalleryBridalContent() {
  const fromEnv = process.env.REACT_APP_GALLERY_BRIDAL_MANIFEST_URL?.trim();
  const url = fromEnv || DEFAULT_GALLERY_BRIDAL_MANIFEST_URL;
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) {
    throw new Error(`Failed to load gallery manifest (${res.status})`);
  }
  return normalizeGalleryBridalContent(await res.json());
}
