import defaultDoc from './defaultAboutContent.json';

export const DEFAULT_ABOUT_CONTENT_URL =
  'https://wild-child-cms.s3.us-east-1.amazonaws.com/about-content.json';

const MAX_PAGE_HEADER = 400;
const MAX_DOC_TITLE = 500;
const MAX_META = 2000;
const MAX_MAIN_TEXT = 6000;
const MAX_LIST_INTRO = 2000;
const MAX_ITEM_TITLE = 400;
const MAX_ITEM_BODY = 6000;
const MAX_ITEMS = 12;

export function createDefaultAboutContent() {
  return JSON.parse(JSON.stringify(defaultDoc));
}

function clampStr(s, max) {
  const t = typeof s === 'string' ? s : '';
  return t.length > max ? t.slice(0, max) : t;
}

export function normalizeAboutContent(input) {
  const def = createDefaultAboutContent();
  if (!input || typeof input !== 'object') return def;
  const o = input;
  const version =
    typeof o.version === 'number' && Number.isFinite(o.version) ? o.version : def.version;
  const pageHeader =
    typeof o.pageHeader === 'string' && o.pageHeader.trim() ? o.pageHeader : def.pageHeader;
  const mainText =
    typeof o.mainText === 'string' && o.mainText.trim() ? o.mainText : def.mainText;
  const listIntro =
    typeof o.listIntro === 'string' && o.listIntro.trim() ? o.listIntro : def.listIntro;

  let items = def.items;
  if (Array.isArray(o.items) && o.items.length > 0) {
    const mapped = o.items
      .filter((i) => i && typeof i === 'object')
      .map((i) => ({
        title: typeof i.title === 'string' ? i.title : '',
        body: typeof i.body === 'string' ? i.body : '',
      }))
      .slice(0, MAX_ITEMS);
    if (mapped.length > 0) items = mapped;
  }

  return {
    version,
    documentTitle: clampStr(
      typeof o.documentTitle === 'string' && o.documentTitle.trim() ? o.documentTitle : def.documentTitle,
      MAX_DOC_TITLE,
    ),
    metaDescription: clampStr(
      typeof o.metaDescription === 'string' && o.metaDescription.trim() ? o.metaDescription : def.metaDescription,
      MAX_META,
    ),
    pageHeader: clampStr(pageHeader, MAX_PAGE_HEADER),
    mainText: clampStr(mainText, MAX_MAIN_TEXT),
    listIntro: clampStr(listIntro, MAX_LIST_INTRO),
    items: items.map((it) => ({
      title: clampStr(it.title, MAX_ITEM_TITLE),
      body: clampStr(it.body, MAX_ITEM_BODY),
    })),
  };
}

export function sanitizeAboutContentForSave(input) {
  const version = Number.isFinite(input.version) ? Math.max(1, Math.floor(input.version)) : 1;
  const documentTitle = clampStr(String(input.documentTitle ?? '').trim(), MAX_DOC_TITLE);
  const metaDescription = clampStr(String(input.metaDescription ?? '').trim(), MAX_META);
  const pageHeader = clampStr(String(input.pageHeader ?? '').trim(), MAX_PAGE_HEADER);
  const mainText = clampStr(String(input.mainText ?? '').trim(), MAX_MAIN_TEXT);
  const listIntro = clampStr(String(input.listIntro ?? '').trim(), MAX_LIST_INTRO);
  const rawItems = Array.isArray(input.items) ? input.items : [];
  const items = rawItems
    .filter((i) => i && typeof i === 'object')
    .map((i) => ({
      title: clampStr(String(i.title ?? '').trim(), MAX_ITEM_TITLE),
      body: clampStr(String(i.body ?? '').trim(), MAX_ITEM_BODY),
    }))
    .slice(0, MAX_ITEMS);

  return { version, documentTitle, metaDescription, pageHeader, mainText, listIntro, items };
}

export function aboutContentSignature(doc) {
  return JSON.stringify({
    documentTitle: doc.documentTitle,
    metaDescription: doc.metaDescription,
    pageHeader: doc.pageHeader,
    mainText: doc.mainText,
    listIntro: doc.listIntro,
    items: doc.items,
  });
}

export async function loadAboutContent() {
  const fromEnv = process.env.REACT_APP_ABOUT_CONTENT_URL?.trim();
  const url = fromEnv || DEFAULT_ABOUT_CONTENT_URL;
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) {
    throw new Error(`Failed to load about content (${res.status})`);
  }
  return normalizeAboutContent(await res.json());
}
