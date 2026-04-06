import defaultDoc from './defaultPagesContent.json';

export const DEFAULT_PAGES_CONTENT_URL =
  'https://wild-child-cms.s3.us-east-1.amazonaws.com/pages-content.json';

const MAX_DOC_TITLE = 500;
const MAX_META = 2000;
const MAX_PAGE_TITLE = 400;
const MAX_PARA = 12000;
const MAX_SECTION = 400;
const MAX_BULLET = 2500;
const MAX_TABLE_ROWS = 15;
const MAX_SERVICE_NAME = 200;
const MAX_PRICE_CELL = 80;
const MAX_CLASS_CARDS = 8;
const MAX_CLASS_NAME = 200;
const MAX_CLASS_PRICE = 120;
const MAX_LIST_ITEMS = 30;
const MAX_BOOKING_PARAS = 20;
const MAX_FAQ_ITEMS = 45;
const MAX_FAQ_Q = 500;
const MAX_FAQ_ANSWER = 20000;
const MAX_PATH = 200;
const MAX_BUTTON = 120;
const CTA_TITLE_MAX = 300;
const CTA_SUB_MAX = 500;
const CTA_BTN_MAX = 120;
const MAX_NOTE = 2000;

export function createDefaultPagesContent() {
  return JSON.parse(JSON.stringify(defaultDoc));
}

function clampStr(s, max) {
  const t = typeof s === 'string' ? s : '';
  return t.length > max ? t.slice(0, max) : t;
}

function normStringList(raw, fallback, maxItems, maxLen) {
  if (!Array.isArray(raw) || raw.length === 0) return fallback;
  const mapped = raw
    .filter((x) => typeof x === 'string')
    .map((x) => clampStr(x.trim(), maxLen))
    .filter((x) => x.length > 0)
    .slice(0, maxItems);
  return mapped.length > 0 ? mapped : fallback;
}

function normRatesTable(raw, fallback) {
  if (!Array.isArray(raw) || raw.length === 0) return fallback;
  const mapped = raw
    .filter((r) => r && typeof r === 'object')
    .map((r) => ({
      service: clampStr(
        typeof r.service === 'string' && r.service.trim() ? r.service.trim() : '',
        MAX_SERVICE_NAME,
      ),
      price: clampStr(
        typeof r.price === 'string' && r.price.trim() ? r.price.trim() : '',
        MAX_PRICE_CELL,
      ),
    }))
    .filter((r) => r.service.length > 0 && r.price.length > 0)
    .slice(0, MAX_TABLE_ROWS);
  return mapped.length > 0 ? mapped : fallback;
}

function normCta(raw, fallback) {
  const f = fallback || { title: '', subtitle: '', buttonText: '' };
  if (!raw || typeof raw !== 'object') return { ...f };
  return {
    title: clampStr(
      typeof raw.title === 'string' && raw.title.trim() ? raw.title : f.title,
      CTA_TITLE_MAX,
    ),
    subtitle: clampStr(
      typeof raw.subtitle === 'string' && raw.subtitle.trim() ? raw.subtitle : f.subtitle,
      CTA_SUB_MAX,
    ),
    buttonText: clampStr(
      typeof raw.buttonText === 'string' && raw.buttonText.trim() ? raw.buttonText : f.buttonText,
      CTA_BTN_MAX,
    ),
  };
}

function normClassCard(raw, fallback) {
  if (!raw || typeof raw !== 'object') return fallback;
  const includedItems = Array.isArray(raw.includedItems)
    ? raw.includedItems
        .filter((x) => typeof x === 'string')
        .map((x) => clampStr(x.trim(), MAX_BULLET))
        .filter((x) => x.length > 0)
        .slice(0, MAX_LIST_ITEMS)
    : [];
  const pricingItems = Array.isArray(raw.pricingItems)
    ? raw.pricingItems
        .filter((x) => typeof x === 'string')
        .map((x) => clampStr(x.trim(), MAX_BULLET))
        .filter((x) => x.length > 0)
        .slice(0, MAX_LIST_ITEMS)
    : [];
  return {
    name: clampStr(
      typeof raw.name === 'string' && raw.name.trim() ? raw.name : fallback.name,
      MAX_CLASS_NAME,
    ),
    price: clampStr(
      typeof raw.price === 'string' && raw.price.trim() ? raw.price : fallback.price,
      MAX_CLASS_PRICE,
    ),
    perfectFor: clampStr(
      typeof raw.perfectFor === 'string' && raw.perfectFor.trim()
        ? raw.perfectFor
        : fallback.perfectFor,
      MAX_PARA,
    ),
    details: clampStr(
      typeof raw.details === 'string' ? raw.details : fallback.details ?? '',
      MAX_PARA,
    ),
    includedItems,
    pricingItems,
    additionalInfo: clampStr(
      typeof raw.additionalInfo === 'string' ? raw.additionalInfo : fallback.additionalInfo ?? '',
      MAX_NOTE,
    ),
    learnMorePath: clampStr(
      typeof raw.learnMorePath === 'string' ? raw.learnMorePath.trim() : '',
      MAX_PATH,
    ),
    learnMoreLabel: clampStr(
      typeof raw.learnMoreLabel === 'string' ? raw.learnMoreLabel.trim() : '',
      MAX_BUTTON,
    ),
  };
}

function normClassCards(raw, fallback) {
  if (!Array.isArray(raw) || raw.length === 0) return fallback;
  const fbLast = fallback[fallback.length - 1];
  const mapped = raw
    .map((c, i) =>
      normClassCard(c, fallback[Math.min(i, fallback.length - 1)] ?? fbLast),
    )
    .slice(0, MAX_CLASS_CARDS);
  return mapped.length > 0 ? mapped : fallback;
}

function normBeauty(raw, fallback) {
  if (!raw || typeof raw !== 'object') return fallback;
  return {
    documentTitle: clampStr(
      typeof raw.documentTitle === 'string' && raw.documentTitle.trim()
        ? raw.documentTitle
        : fallback.documentTitle,
      MAX_DOC_TITLE,
    ),
    metaDescription: clampStr(
      typeof raw.metaDescription === 'string' && raw.metaDescription.trim()
        ? raw.metaDescription
        : fallback.metaDescription,
      MAX_META,
    ),
    pageTitle: clampStr(
      typeof raw.pageTitle === 'string' && raw.pageTitle.trim()
        ? raw.pageTitle
        : fallback.pageTitle,
      MAX_PAGE_TITLE,
    ),
    introText: clampStr(
      typeof raw.introText === 'string' && raw.introText.trim()
        ? raw.introText
        : fallback.introText,
      MAX_PARA,
    ),
    hairSectionTitle: clampStr(
      typeof raw.hairSectionTitle === 'string' && raw.hairSectionTitle.trim()
        ? raw.hairSectionTitle
        : fallback.hairSectionTitle,
      MAX_SECTION,
    ),
    hairItems: normStringList(raw.hairItems, fallback.hairItems, MAX_LIST_ITEMS, MAX_BULLET),
    locationSectionTitle: clampStr(
      typeof raw.locationSectionTitle === 'string' && raw.locationSectionTitle.trim()
        ? raw.locationSectionTitle
        : fallback.locationSectionTitle,
      MAX_SECTION,
    ),
    locationItems: normStringList(
      raw.locationItems,
      fallback.locationItems,
      MAX_LIST_ITEMS,
      MAX_BULLET,
    ),
    ratesSectionTitle: clampStr(
      typeof raw.ratesSectionTitle === 'string' && raw.ratesSectionTitle.trim()
        ? raw.ratesSectionTitle
        : fallback.ratesSectionTitle,
      MAX_SECTION,
    ),
    ratesTable: normRatesTable(raw.ratesTable, fallback.ratesTable),
    ratesNotes: normStringList(raw.ratesNotes, fallback.ratesNotes, MAX_LIST_ITEMS, MAX_PARA),
    cta: normCta(raw.cta, fallback.cta),
  };
}

function normClasses(raw, fallback) {
  if (!raw || typeof raw !== 'object') return fallback;
  return {
    documentTitle: clampStr(
      typeof raw.documentTitle === 'string' && raw.documentTitle.trim()
        ? raw.documentTitle
        : fallback.documentTitle,
      MAX_DOC_TITLE,
    ),
    metaDescription: clampStr(
      typeof raw.metaDescription === 'string' && raw.metaDescription.trim()
        ? raw.metaDescription
        : fallback.metaDescription,
      MAX_META,
    ),
    pageTitle: clampStr(
      typeof raw.pageTitle === 'string' && raw.pageTitle.trim()
        ? raw.pageTitle
        : fallback.pageTitle,
      MAX_PAGE_TITLE,
    ),
    introText: clampStr(
      typeof raw.introText === 'string' && raw.introText.trim()
        ? raw.introText
        : fallback.introText,
      MAX_PARA,
    ),
    cards: normClassCards(raw.cards, fallback.cards),
    hourlyAddOnNote: clampStr(
      typeof raw.hourlyAddOnNote === 'string' && raw.hourlyAddOnNote.trim()
        ? raw.hourlyAddOnNote
        : fallback.hourlyAddOnNote,
      MAX_PARA,
    ),
    logisticsTitle: clampStr(
      typeof raw.logisticsTitle === 'string' && raw.logisticsTitle.trim()
        ? raw.logisticsTitle
        : fallback.logisticsTitle,
      MAX_SECTION,
    ),
    logisticsItems: normStringList(
      raw.logisticsItems,
      fallback.logisticsItems,
      MAX_LIST_ITEMS,
      MAX_BULLET,
    ),
    cta: normCta(raw.cta, fallback.cta),
  };
}

function normCreativeFx(raw, fallback) {
  if (!raw || typeof raw !== 'object') return fallback;
  const bookingParagraphs = Array.isArray(raw.bookingParagraphs)
    ? raw.bookingParagraphs
        .filter((x) => typeof x === 'string')
        .map((x) => clampStr(x.trim(), MAX_PARA))
        .filter((x) => x.length > 0)
        .slice(0, MAX_BOOKING_PARAS)
    : fallback.bookingParagraphs;
  return {
    documentTitle: clampStr(
      typeof raw.documentTitle === 'string' && raw.documentTitle.trim()
        ? raw.documentTitle
        : fallback.documentTitle,
      MAX_DOC_TITLE,
    ),
    metaDescription: clampStr(
      typeof raw.metaDescription === 'string' && raw.metaDescription.trim()
        ? raw.metaDescription
        : fallback.metaDescription,
      MAX_META,
    ),
    pageTitle: clampStr(
      typeof raw.pageTitle === 'string' && raw.pageTitle.trim()
        ? raw.pageTitle
        : fallback.pageTitle,
      MAX_PAGE_TITLE,
    ),
    introText: clampStr(
      typeof raw.introText === 'string' && raw.introText.trim()
        ? raw.introText
        : fallback.introText,
      MAX_PARA,
    ),
    servicesTitle: clampStr(
      typeof raw.servicesTitle === 'string' && raw.servicesTitle.trim()
        ? raw.servicesTitle
        : fallback.servicesTitle,
      MAX_SECTION,
    ),
    serviceItems: normStringList(
      raw.serviceItems,
      fallback.serviceItems,
      MAX_LIST_ITEMS,
      MAX_BULLET,
    ),
    pricingTitle: clampStr(
      typeof raw.pricingTitle === 'string' && raw.pricingTitle.trim()
        ? raw.pricingTitle
        : fallback.pricingTitle,
      MAX_SECTION,
    ),
    pricingItems: normStringList(
      raw.pricingItems,
      fallback.pricingItems,
      MAX_LIST_ITEMS,
      MAX_BULLET,
    ),
    bookingTitle: clampStr(
      typeof raw.bookingTitle === 'string' && raw.bookingTitle.trim()
        ? raw.bookingTitle
        : fallback.bookingTitle,
      MAX_SECTION,
    ),
    bookingParagraphs:
      bookingParagraphs.length > 0 ? bookingParagraphs : fallback.bookingParagraphs,
  };
}

function normFaq(raw, fallback) {
  if (!raw || typeof raw !== 'object') return fallback;
  let items = fallback.items;
  if (Array.isArray(raw.items) && raw.items.length > 0) {
    const mapped = raw.items
      .filter((it) => it && typeof it === 'object')
      .map((it) => ({
        question: clampStr(
          typeof it.question === 'string' && it.question.trim() ? it.question.trim() : '',
          MAX_FAQ_Q,
        ),
        answerHtml: clampStr(
          typeof it.answerHtml === 'string' && it.answerHtml.trim() ? it.answerHtml.trim() : '',
          MAX_FAQ_ANSWER,
        ),
      }))
      .filter((it) => it.question.length > 0 && it.answerHtml.length > 0)
      .slice(0, MAX_FAQ_ITEMS);
    if (mapped.length > 0) items = mapped;
  }
  return {
    documentTitle: clampStr(
      typeof raw.documentTitle === 'string' && raw.documentTitle.trim()
        ? raw.documentTitle
        : fallback.documentTitle,
      MAX_DOC_TITLE,
    ),
    metaDescription: clampStr(
      typeof raw.metaDescription === 'string' && raw.metaDescription.trim()
        ? raw.metaDescription
        : fallback.metaDescription,
      MAX_META,
    ),
    pageTitle: clampStr(
      typeof raw.pageTitle === 'string' && raw.pageTitle.trim()
        ? raw.pageTitle
        : fallback.pageTitle,
      MAX_PAGE_TITLE,
    ),
    introText: clampStr(
      typeof raw.introText === 'string' && raw.introText.trim()
        ? raw.introText
        : fallback.introText,
      MAX_PARA,
    ),
    items,
  };
}

export function normalizePagesContent(input) {
  const def = createDefaultPagesContent();
  if (!input || typeof input !== 'object') return def;
  const version =
    typeof input.version === 'number' && Number.isFinite(input.version) ? input.version : def.version;
  return {
    version,
    beauty: normBeauty(input.beauty, def.beauty),
    classes: normClasses(input.classes, def.classes),
    creativeFx: normCreativeFx(input.creativeFx, def.creativeFx),
    faq: normFaq(input.faq, def.faq),
  };
}

export function pagesContentSignature(d) {
  return JSON.stringify({
    beauty: d.beauty,
    classes: d.classes,
    creativeFx: d.creativeFx,
    faq: d.faq,
  });
}

export function sanitizePagesContentForSave(input) {
  const version = Number.isFinite(input.version) ? Math.max(1, Math.floor(input.version)) : 1;
  const normalized = normalizePagesContent({
    ...input,
    version,
  });
  return { ...normalized, version };
}

export async function loadPagesContent() {
  const fromEnv = process.env.REACT_APP_PAGES_CONTENT_URL?.trim();
  const url = fromEnv || DEFAULT_PAGES_CONTENT_URL;
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) {
    throw new Error(`Failed to load pages content (${res.status})`);
  }
  return normalizePagesContent(await res.json());
}
