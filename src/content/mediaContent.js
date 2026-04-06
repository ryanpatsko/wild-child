import defaultDoc from './defaultMediaContent.json';

export const DEFAULT_MEDIA_CONTENT_URL =
  'https://wild-child-cms.s3.us-east-1.amazonaws.com/media-content.json';

const MAX_PAGE_HEADER = 400;
const MAX_INTRO = 6000;
const MAX_SECTION_TITLE = 400;
const MAX_SECTION_BODY = 8000;
const MAX_RATES_NOTE = 500;
const PILLAR_TITLE = 200;
const PILLAR_BODY = 2500;
const MAX_PILLARS = 8;
const RATE_FIELD = 300;
const MAX_RATES = 6;
const CLIENT_TITLE = 200;
const CLIENT_BODY = 4000;
const MAX_CLIENT_GROUPS = 12;
const MAX_SELECTED_WORK = 12000;
const MAX_FOOTNOTE = 500;

export function createDefaultMediaContent() {
  return JSON.parse(JSON.stringify(defaultDoc));
}

function clampStr(s, max) {
  const t = typeof s === 'string' ? s : '';
  return t.length > max ? t.slice(0, max) : t;
}

function normStr(raw, fallback, max) {
  const s = typeof raw === 'string' && raw.trim() ? raw : fallback;
  return clampStr(s, max);
}

export function normalizeMediaContent(input) {
  const def = createDefaultMediaContent();
  if (!input || typeof input !== 'object') return def;
  const o = input;
  const version =
    typeof o.version === 'number' && Number.isFinite(o.version) ? o.version : def.version;

  let pillars = def.whyDifferentPillars;
  if (Array.isArray(o.whyDifferentPillars) && o.whyDifferentPillars.length > 0) {
    const mapped = o.whyDifferentPillars
      .filter((p) => p && typeof p === 'object')
      .map((p) => ({
        title: typeof p.title === 'string' ? p.title : '',
        body: typeof p.body === 'string' ? p.body : '',
      }))
      .slice(0, MAX_PILLARS);
    if (mapped.length > 0) pillars = mapped;
  }

  let rates = def.rates;
  if (Array.isArray(o.rates) && o.rates.length > 0) {
    const mapped = o.rates
      .filter((r) => r && typeof r === 'object')
      .map((r) => ({
        label: typeof r.label === 'string' ? r.label : '',
        sublabel: typeof r.sublabel === 'string' ? r.sublabel : '',
        price: typeof r.price === 'string' ? r.price : '',
      }))
      .slice(0, MAX_RATES);
    if (mapped.length > 0) rates = mapped;
  }

  let clientGroups = def.clientGroups;
  if (Array.isArray(o.clientGroups) && o.clientGroups.length > 0) {
    const mapped = o.clientGroups
      .filter((c) => c && typeof c === 'object')
      .map((c) => ({
        title: typeof c.title === 'string' ? c.title : '',
        body: typeof c.body === 'string' ? c.body : '',
      }))
      .slice(0, MAX_CLIENT_GROUPS);
    if (mapped.length > 0) clientGroups = mapped;
  }

  return {
    version,
    pageHeader: normStr(o.pageHeader, def.pageHeader, MAX_PAGE_HEADER),
    introText: normStr(o.introText, def.introText, MAX_INTRO),
    collaborativeTitle: normStr(o.collaborativeTitle, def.collaborativeTitle, MAX_SECTION_TITLE),
    collaborativeBody: normStr(o.collaborativeBody, def.collaborativeBody, MAX_SECTION_BODY),
    whyDifferentTitle: normStr(o.whyDifferentTitle, def.whyDifferentTitle, MAX_SECTION_TITLE),
    whyDifferentPillars: pillars.map((p) => ({
      title: clampStr(p.title, PILLAR_TITLE),
      body: clampStr(p.body, PILLAR_BODY),
    })),
    ratesTitle: normStr(o.ratesTitle, def.ratesTitle, MAX_SECTION_TITLE),
    ratesNote: normStr(o.ratesNote, def.ratesNote, MAX_RATES_NOTE),
    rates: rates.map((r) => ({
      label: clampStr(r.label, RATE_FIELD),
      sublabel: clampStr(r.sublabel, RATE_FIELD),
      price: clampStr(r.price, RATE_FIELD),
    })),
    clientsTitle: normStr(o.clientsTitle, def.clientsTitle, MAX_SECTION_TITLE),
    clientGroups: clientGroups.map((c) => ({
      title: clampStr(c.title, CLIENT_TITLE),
      body: clampStr(c.body, CLIENT_BODY),
    })),
    selectedWorkTitle: normStr(o.selectedWorkTitle, def.selectedWorkTitle, MAX_SECTION_TITLE),
    selectedWorkBody: normStr(o.selectedWorkBody, def.selectedWorkBody, MAX_SELECTED_WORK),
    selectedWorkFootnote: normStr(
      o.selectedWorkFootnote,
      def.selectedWorkFootnote,
      MAX_FOOTNOTE,
    ),
  };
}

export function sanitizeMediaContentForSave(input) {
  const version = Number.isFinite(input.version) ? Math.max(1, Math.floor(input.version)) : 1;
  const doc = {
    version,
    pageHeader: clampStr(String(input.pageHeader ?? '').trim(), MAX_PAGE_HEADER),
    introText: clampStr(String(input.introText ?? '').trim(), MAX_INTRO),
    collaborativeTitle: clampStr(String(input.collaborativeTitle ?? '').trim(), MAX_SECTION_TITLE),
    collaborativeBody: clampStr(String(input.collaborativeBody ?? '').trim(), MAX_SECTION_BODY),
    whyDifferentTitle: clampStr(String(input.whyDifferentTitle ?? '').trim(), MAX_SECTION_TITLE),
    whyDifferentPillars: (Array.isArray(input.whyDifferentPillars) ? input.whyDifferentPillars : [])
      .filter((p) => p && typeof p === 'object')
      .map((p) => ({
        title: clampStr(String(p.title ?? '').trim(), PILLAR_TITLE),
        body: clampStr(String(p.body ?? '').trim(), PILLAR_BODY),
      }))
      .slice(0, MAX_PILLARS),
    ratesTitle: clampStr(String(input.ratesTitle ?? '').trim(), MAX_SECTION_TITLE),
    ratesNote: clampStr(String(input.ratesNote ?? '').trim(), MAX_RATES_NOTE),
    rates: (Array.isArray(input.rates) ? input.rates : [])
      .filter((r) => r && typeof r === 'object')
      .map((r) => ({
        label: clampStr(String(r.label ?? '').trim(), RATE_FIELD),
        sublabel: clampStr(String(r.sublabel ?? '').trim(), RATE_FIELD),
        price: clampStr(String(r.price ?? '').trim(), RATE_FIELD),
      }))
      .slice(0, MAX_RATES),
    clientsTitle: clampStr(String(input.clientsTitle ?? '').trim(), MAX_SECTION_TITLE),
    clientGroups: (Array.isArray(input.clientGroups) ? input.clientGroups : [])
      .filter((c) => c && typeof c === 'object')
      .map((c) => ({
        title: clampStr(String(c.title ?? '').trim(), CLIENT_TITLE),
        body: clampStr(String(c.body ?? '').trim(), CLIENT_BODY),
      }))
      .slice(0, MAX_CLIENT_GROUPS),
    selectedWorkTitle: clampStr(String(input.selectedWorkTitle ?? '').trim(), MAX_SECTION_TITLE),
    selectedWorkBody: clampStr(String(input.selectedWorkBody ?? '').trim(), MAX_SELECTED_WORK),
    selectedWorkFootnote: clampStr(String(input.selectedWorkFootnote ?? '').trim(), MAX_FOOTNOTE),
  };
  return doc;
}

export function mediaContentSignature(doc) {
  return JSON.stringify({
    pageHeader: doc.pageHeader,
    introText: doc.introText,
    collaborativeTitle: doc.collaborativeTitle,
    collaborativeBody: doc.collaborativeBody,
    whyDifferentTitle: doc.whyDifferentTitle,
    whyDifferentPillars: doc.whyDifferentPillars,
    ratesTitle: doc.ratesTitle,
    ratesNote: doc.ratesNote,
    rates: doc.rates,
    clientsTitle: doc.clientsTitle,
    clientGroups: doc.clientGroups,
    selectedWorkTitle: doc.selectedWorkTitle,
    selectedWorkBody: doc.selectedWorkBody,
    selectedWorkFootnote: doc.selectedWorkFootnote,
  });
}

export async function loadMediaContent() {
  const fromEnv = process.env.REACT_APP_MEDIA_CONTENT_URL?.trim();
  const url = fromEnv || DEFAULT_MEDIA_CONTENT_URL;
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) {
    throw new Error(`Failed to load media content (${res.status})`);
  }
  return normalizeMediaContent(await res.json());
}
