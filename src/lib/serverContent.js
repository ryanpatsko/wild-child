/**
 * Server-only content fetchers for Next.js Server Components.
 * Uses ISR (Incremental Static Regeneration) — pages are cached and
 * revalidated at most once per minute, so CMS updates appear within ~60s
 * with no client-side flash.
 */

import {
  DEFAULT_PAGES_CONTENT_URL,
  normalizePagesContent,
  createDefaultPagesContent,
} from '../content/pagesContent';
import {
  DEFAULT_BRIDAL_CONTENT_URL,
  normalizeBridalContent,
  createDefaultBridalContent,
} from '../content/bridalContent';
import {
  DEFAULT_ABOUT_CONTENT_URL,
  normalizeAboutContent,
  createDefaultAboutContent,
} from '../content/aboutContent';
import {
  DEFAULT_MEDIA_CONTENT_URL,
  normalizeMediaContent,
  createDefaultMediaContent,
} from '../content/mediaContent';
import {
  DEFAULT_LOCATIONS_CONTENT_URL,
  normalizeLocationsContent,
  createDefaultLocationsContent,
} from '../content/locationsContent';

const REVALIDATE = 60;

async function fetchContent(url, normalize, createDefault) {
  try {
    const res = await fetch(url, { next: { revalidate: REVALIDATE } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return normalize(await res.json());
  } catch {
    return createDefault();
  }
}

export function getPagesContent() {
  const url = process.env.PAGES_CONTENT_URL?.trim() || DEFAULT_PAGES_CONTENT_URL;
  return fetchContent(url, normalizePagesContent, createDefaultPagesContent);
}

export function getBridalContent() {
  const url = process.env.BRIDAL_CONTENT_URL?.trim() || DEFAULT_BRIDAL_CONTENT_URL;
  return fetchContent(url, normalizeBridalContent, createDefaultBridalContent);
}

export function getAboutContent() {
  const url = process.env.ABOUT_CONTENT_URL?.trim() || DEFAULT_ABOUT_CONTENT_URL;
  return fetchContent(url, normalizeAboutContent, createDefaultAboutContent);
}

export function getMediaContent() {
  const url = process.env.MEDIA_CONTENT_URL?.trim() || DEFAULT_MEDIA_CONTENT_URL;
  return fetchContent(url, normalizeMediaContent, createDefaultMediaContent);
}

export function getLocationsContent() {
  const url = process.env.LOCATIONS_CONTENT_URL?.trim() || DEFAULT_LOCATIONS_CONTENT_URL;
  return fetchContent(url, normalizeLocationsContent, createDefaultLocationsContent);
}
