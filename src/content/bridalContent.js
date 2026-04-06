import defaultDoc from './defaultBridalContent.json';

export const DEFAULT_BRIDAL_CONTENT_URL =
  'https://wild-child-cms.s3.us-east-1.amazonaws.com/bridal-content.json';

const MAX_HEADER = 400;
const MAX_BUTTON = 80;
const MAX_META = 2000;
const MAX_TITLE_DOC = 500;
const MAX_PARA = 12000;
const MAX_INTRO_LINK = 2000;
const MAX_SECTION_TITLE = 400;
const MAX_BULLET = 2500;
const MAX_PACKAGE_TITLE = 300;
const MAX_PRICE = 120;
const MAX_DETAIL = 2000;
const MAX_PACKAGES = 15;
const MAX_ITEMS_PER_PKG = 45;
const MAX_SECTIONS = 20;
const MAX_PARAS_PER_SECTION = 80;
const MAX_LEAD_PARAS = 30;
const MAX_ADDL_BULLETS = 30;
const CTA_TITLE_MAX = 300;
const CTA_SUB_MAX = 500;
const CTA_BTN_MAX = 120;

export function createDefaultBridalContent() {
  return JSON.parse(JSON.stringify(defaultDoc));
}

function clampStr(s, max) {
  const t = typeof s === 'string' ? s : '';
  return t.length > max ? t.slice(0, max) : t;
}

function normPackages(raw, fallback) {
  if (!Array.isArray(raw) || raw.length === 0) return fallback;
  const mapped = raw
    .filter((p) => p && typeof p === 'object')
    .map((p) => {
      const title = typeof p.title === 'string' ? p.title : '';
      const price = typeof p.price === 'string' ? p.price : '';
      const items = Array.isArray(p.items)
        ? p.items
            .filter((x) => typeof x === 'string')
            .map((x) => clampStr(x, MAX_BULLET))
            .filter((x) => x.length > 0)
        : [];
      const detailText =
        typeof p.detailText === 'string' ? clampStr(p.detailText, MAX_DETAIL) : '';
      return { title, price, items: items.slice(0, MAX_ITEMS_PER_PKG), detailText };
    })
    .slice(0, MAX_PACKAGES);
  return mapped.length > 0 ? mapped : fallback;
}

function normRegional(raw, fallback) {
  if (!raw || typeof raw !== 'object') return fallback;
  return {
    documentTitle: clampStr(
      typeof raw.documentTitle === 'string' && raw.documentTitle.trim()
        ? raw.documentTitle
        : fallback.documentTitle,
      MAX_TITLE_DOC,
    ),
    metaDescription: clampStr(
      typeof raw.metaDescription === 'string' && raw.metaDescription.trim()
        ? raw.metaDescription
        : fallback.metaDescription,
      MAX_META,
    ),
    pageHeader: clampStr(
      typeof raw.pageHeader === 'string' && raw.pageHeader.trim()
        ? raw.pageHeader
        : fallback.pageHeader,
      MAX_HEADER,
    ),
    introBeforeLink: clampStr(
      typeof raw.introBeforeLink === 'string' ? raw.introBeforeLink : fallback.introBeforeLink,
      MAX_INTRO_LINK,
    ),
    servicesLinkText: clampStr(
      typeof raw.servicesLinkText === 'string' && raw.servicesLinkText.trim()
        ? raw.servicesLinkText
        : fallback.servicesLinkText,
      MAX_HEADER,
    ),
    introAfterLink: clampStr(
      typeof raw.introAfterLink === 'string' ? raw.introAfterLink : fallback.introAfterLink,
      MAX_INTRO_LINK,
    ),
    packages: normPackages(raw.packages, fallback.packages),
    additionalSectionTitle: clampStr(
      typeof raw.additionalSectionTitle === 'string' && raw.additionalSectionTitle.trim()
        ? raw.additionalSectionTitle
        : fallback.additionalSectionTitle,
      MAX_SECTION_TITLE,
    ),
    additionalBullets: Array.isArray(raw.additionalBullets)
      ? raw.additionalBullets
          .filter((x) => typeof x === 'string')
          .map((x) => clampStr(x, MAX_BULLET))
          .filter((x) => x.length > 0)
          .slice(0, MAX_ADDL_BULLETS)
      : fallback.additionalBullets,
    cta: normCta(raw.cta, fallback.cta),
  };
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
      typeof raw.buttonText === 'string' && raw.buttonText.trim()
        ? raw.buttonText
        : f.buttonText,
      CTA_BTN_MAX,
    ),
  };
}

export function normalizeBridalContent(input) {
  const def = createDefaultBridalContent();
  if (!input || typeof input !== 'object') return def;
  const o = input;
  const version =
    typeof o.version === 'number' && Number.isFinite(o.version) ? o.version : def.version;

  const overviewRaw = o.overview && typeof o.overview === 'object' ? o.overview : {};
  const leadParagraphs = Array.isArray(overviewRaw.leadParagraphs)
    ? overviewRaw.leadParagraphs
        .filter((x) => typeof x === 'string')
        .map((x) => clampStr(x, MAX_PARA))
        .slice(0, MAX_LEAD_PARAS)
    : def.overview.leadParagraphs;

  const overview = {
    documentTitle: clampStr(
      typeof overviewRaw.documentTitle === 'string' && overviewRaw.documentTitle.trim()
        ? overviewRaw.documentTitle
        : def.overview.documentTitle,
      MAX_TITLE_DOC,
    ),
    metaDescription: clampStr(
      typeof overviewRaw.metaDescription === 'string' && overviewRaw.metaDescription.trim()
        ? overviewRaw.metaDescription
        : def.overview.metaDescription,
      MAX_META,
    ),
    pageHeader: clampStr(
      typeof overviewRaw.pageHeader === 'string' && overviewRaw.pageHeader.trim()
        ? overviewRaw.pageHeader
        : def.overview.pageHeader,
      MAX_HEADER,
    ),
    pricingCtaTitle: clampStr(
      typeof overviewRaw.pricingCtaTitle === 'string' && overviewRaw.pricingCtaTitle.trim()
        ? overviewRaw.pricingCtaTitle
        : def.overview.pricingCtaTitle,
      MAX_SECTION_TITLE,
    ),
    pricingCtaSub: clampStr(
      typeof overviewRaw.pricingCtaSub === 'string' && overviewRaw.pricingCtaSub.trim()
        ? overviewRaw.pricingCtaSub
        : def.overview.pricingCtaSub,
      MAX_PARA,
    ),
    pittsburghButtonLabel: clampStr(
      typeof overviewRaw.pittsburghButtonLabel === 'string' &&
        overviewRaw.pittsburghButtonLabel.trim()
        ? overviewRaw.pittsburghButtonLabel
        : def.overview.pittsburghButtonLabel,
      MAX_BUTTON,
    ),
    atlantaButtonLabel: clampStr(
      typeof overviewRaw.atlantaButtonLabel === 'string' && overviewRaw.atlantaButtonLabel.trim()
        ? overviewRaw.atlantaButtonLabel
        : def.overview.atlantaButtonLabel,
      MAX_BUTTON,
    ),
    leadParagraphs: leadParagraphs.length > 0 ? leadParagraphs : def.overview.leadParagraphs,
  };

  const servicesRaw = o.services && typeof o.services === 'object' ? o.services : {};
  let sections = def.services.sections;
  if (Array.isArray(servicesRaw.sections) && servicesRaw.sections.length > 0) {
    const mapped = servicesRaw.sections
      .filter((s) => s && typeof s === 'object')
      .map((s) => {
        const title =
          typeof s.title === 'string' && s.title.trim() ? s.title : 'Section';
        const paragraphs = Array.isArray(s.paragraphs)
          ? s.paragraphs
              .filter((x) => typeof x === 'string')
              .map((x) => clampStr(x, MAX_PARA))
              .slice(0, MAX_PARAS_PER_SECTION)
          : [];
        return { title: clampStr(title, MAX_SECTION_TITLE), paragraphs };
      })
      .slice(0, MAX_SECTIONS);
    if (mapped.length > 0) sections = mapped;
  }

  const services = {
    pageHeader: clampStr(
      typeof servicesRaw.pageHeader === 'string' && servicesRaw.pageHeader.trim()
        ? servicesRaw.pageHeader
        : def.services.pageHeader,
      MAX_HEADER,
    ),
    pricingCtaTitle: clampStr(
      typeof servicesRaw.pricingCtaTitle === 'string' && servicesRaw.pricingCtaTitle.trim()
        ? servicesRaw.pricingCtaTitle
        : def.services.pricingCtaTitle,
      MAX_SECTION_TITLE,
    ),
    pricingCtaSub: clampStr(
      typeof servicesRaw.pricingCtaSub === 'string' && servicesRaw.pricingCtaSub.trim()
        ? servicesRaw.pricingCtaSub
        : def.services.pricingCtaSub,
      MAX_PARA,
    ),
    pittsburghButtonLabel: clampStr(
      typeof servicesRaw.pittsburghButtonLabel === 'string' &&
        servicesRaw.pittsburghButtonLabel.trim()
        ? servicesRaw.pittsburghButtonLabel
        : def.services.pittsburghButtonLabel,
      MAX_BUTTON,
    ),
    atlantaButtonLabel: clampStr(
      typeof servicesRaw.atlantaButtonLabel === 'string' &&
        servicesRaw.atlantaButtonLabel.trim()
        ? servicesRaw.atlantaButtonLabel
        : def.services.atlantaButtonLabel,
      MAX_BUTTON,
    ),
    introText: clampStr(
      typeof servicesRaw.introText === 'string' && servicesRaw.introText.trim()
        ? servicesRaw.introText
        : def.services.introText,
      MAX_PARA,
    ),
    sections,
    cta: normCta(servicesRaw.cta, def.services.cta),
  };

  const pittsburgh = normRegional(o.pittsburgh, def.pittsburgh);
  const atlanta = normRegional(o.atlanta, def.atlanta);

  return {
    version,
    overview,
    services,
    pittsburgh,
    atlanta,
  };
}

export function bridalContentSignature(d) {
  return JSON.stringify({
    overview: d.overview,
    services: d.services,
    pittsburgh: d.pittsburgh,
    atlanta: d.atlanta,
  });
}

export function sanitizeBridalContentForSave(input) {
  const version = Number.isFinite(input.version) ? Math.max(1, Math.floor(input.version)) : 1;
  const o = input.overview && typeof input.overview === 'object' ? input.overview : {};
  const s = input.services && typeof input.services === 'object' ? input.services : {};
  const p = input.pittsburgh && typeof input.pittsburgh === 'object' ? input.pittsburgh : {};
  const a = input.atlanta && typeof input.atlanta === 'object' ? input.atlanta : {};

  const overview = {
    documentTitle: clampStr(String(o.documentTitle ?? '').trim(), MAX_TITLE_DOC),
    metaDescription: clampStr(String(o.metaDescription ?? '').trim(), MAX_META),
    pageHeader: clampStr(String(o.pageHeader ?? '').trim(), MAX_HEADER),
    pricingCtaTitle: clampStr(String(o.pricingCtaTitle ?? '').trim(), MAX_SECTION_TITLE),
    pricingCtaSub: clampStr(String(o.pricingCtaSub ?? '').trim(), MAX_PARA),
    pittsburghButtonLabel: clampStr(String(o.pittsburghButtonLabel ?? '').trim(), MAX_BUTTON),
    atlantaButtonLabel: clampStr(String(o.atlantaButtonLabel ?? '').trim(), MAX_BUTTON),
    leadParagraphs: (Array.isArray(o.leadParagraphs) ? o.leadParagraphs : [])
      .filter((x) => typeof x === 'string')
      .map((x) => clampStr(x.trim(), MAX_PARA))
      .slice(0, MAX_LEAD_PARAS),
  };

  const sections = (Array.isArray(s.sections) ? s.sections : [])
    .filter((sec) => sec && typeof sec === 'object')
    .map((sec) => ({
      title: clampStr(String(sec.title ?? '').trim(), MAX_SECTION_TITLE),
      paragraphs: (Array.isArray(sec.paragraphs) ? sec.paragraphs : [])
        .filter((x) => typeof x === 'string')
        .map((x) => clampStr(x.trim(), MAX_PARA))
        .slice(0, MAX_PARAS_PER_SECTION),
    }))
    .slice(0, MAX_SECTIONS);

  const servicesOut = {
    pageHeader: clampStr(String(s.pageHeader ?? '').trim(), MAX_HEADER),
    pricingCtaTitle: clampStr(String(s.pricingCtaTitle ?? '').trim(), MAX_SECTION_TITLE),
    pricingCtaSub: clampStr(String(s.pricingCtaSub ?? '').trim(), MAX_PARA),
    pittsburghButtonLabel: clampStr(String(s.pittsburghButtonLabel ?? '').trim(), MAX_BUTTON),
    atlantaButtonLabel: clampStr(String(s.atlantaButtonLabel ?? '').trim(), MAX_BUTTON),
    introText: clampStr(String(s.introText ?? '').trim(), MAX_PARA),
    sections,
    cta: {
      title: clampStr(String(s.cta?.title ?? '').trim(), CTA_TITLE_MAX),
      subtitle: clampStr(String(s.cta?.subtitle ?? '').trim(), CTA_SUB_MAX),
      buttonText: clampStr(String(s.cta?.buttonText ?? '').trim(), CTA_BTN_MAX),
    },
  };

  function sanitizeRegional(reg) {
    const pkgs = (Array.isArray(reg.packages) ? reg.packages : [])
      .filter((x) => x && typeof x === 'object')
      .map((pkg) => ({
        title: clampStr(String(pkg.title ?? '').trim(), MAX_PACKAGE_TITLE),
        price: clampStr(String(pkg.price ?? '').trim(), MAX_PRICE),
        items: (Array.isArray(pkg.items) ? pkg.items : [])
          .filter((x) => typeof x === 'string')
          .map((x) => clampStr(x.trim(), MAX_BULLET))
          .filter((x) => x.length > 0)
          .slice(0, MAX_ITEMS_PER_PKG),
        detailText: clampStr(String(pkg.detailText ?? '').trim(), MAX_DETAIL),
      }))
      .slice(0, MAX_PACKAGES);
    return {
      documentTitle: clampStr(String(reg.documentTitle ?? '').trim(), MAX_TITLE_DOC),
      metaDescription: clampStr(String(reg.metaDescription ?? '').trim(), MAX_META),
      pageHeader: clampStr(String(reg.pageHeader ?? '').trim(), MAX_HEADER),
      introBeforeLink: clampStr(String(reg.introBeforeLink ?? '').trim(), MAX_INTRO_LINK),
      servicesLinkText: clampStr(String(reg.servicesLinkText ?? '').trim(), MAX_HEADER),
      introAfterLink: clampStr(String(reg.introAfterLink ?? '').trim(), MAX_INTRO_LINK),
      packages: pkgs,
      additionalSectionTitle: clampStr(
        String(reg.additionalSectionTitle ?? '').trim(),
        MAX_SECTION_TITLE,
      ),
      additionalBullets: (Array.isArray(reg.additionalBullets) ? reg.additionalBullets : [])
        .filter((x) => typeof x === 'string')
        .map((x) => clampStr(x.trim(), MAX_BULLET))
        .filter((x) => x.length > 0)
        .slice(0, MAX_ADDL_BULLETS),
      cta: {
        title: clampStr(String(reg.cta?.title ?? '').trim(), CTA_TITLE_MAX),
        subtitle: clampStr(String(reg.cta?.subtitle ?? '').trim(), CTA_SUB_MAX),
        buttonText: clampStr(String(reg.cta?.buttonText ?? '').trim(), CTA_BTN_MAX),
      },
    };
  }

  return {
    version,
    overview,
    services: servicesOut,
    pittsburgh: sanitizeRegional(p),
    atlanta: sanitizeRegional(a),
  };
}

export async function loadBridalContent() {
  const fromEnv = process.env.REACT_APP_BRIDAL_CONTENT_URL?.trim();
  const url = fromEnv || DEFAULT_BRIDAL_CONTENT_URL;
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) {
    throw new Error(`Failed to load bridal content (${res.status})`);
  }
  return normalizeBridalContent(await res.json());
}
