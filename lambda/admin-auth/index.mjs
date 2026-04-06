/**
 * Node 20+ Lambda + Function URL (auth NONE). JWT for /verify, PUT /locations-content, PUT /about-content, PUT /media-content, PUT /bridal-content, PUT /pages-content.
 *
 * Env:
 *   ADMIN_PASSWORD, ADMIN_SESSION_SECRET (required)
 *   CMS_S3_BUCKET — e.g. wild-child-cms
 *   CMS_S3_LOCATIONS_KEY — optional, default locations-content.json
 *   CMS_S3_ABOUT_KEY — optional, default about-content.json
 *   CMS_S3_MEDIA_KEY — optional, default media-content.json
 *   CMS_S3_BRIDAL_KEY — optional, default bridal-content.json
 *   CMS_S3_PAGES_KEY — optional, default pages-content.json
 *
 * IAM: s3:PutObject on each CMS JSON key the admin can save.
 * Public reads: bucket policy grants s3:GetObject on CMS JSON keys.
 * CORS: configure only on the Lambda Function URL in AWS (not in this handler).
 */

import { createHmac, timingSafeEqual } from 'node:crypto'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'

const SESSION_HOURS = 24
const ADMIN_SUB = 'wc-cms-admin'
const MAX_REGIONS_NOTICE_LEN = 3000
const ABOUT_MAX_HEADER = 400
const ABOUT_MAX_MAIN = 6000
const ABOUT_MAX_LIST_INTRO = 2000
const ABOUT_MAX_ITEM_TITLE = 400
const ABOUT_MAX_ITEM_BODY = 6000
const ABOUT_MAX_ITEMS = 12
const MEDIA_MAX_PAGE_HEADER = 400
const MEDIA_MAX_INTRO = 6000
const MEDIA_MAX_SECTION_TITLE = 400
const MEDIA_MAX_SECTION_BODY = 8000
const MEDIA_MAX_RATES_NOTE = 500
const MEDIA_PILLAR_TITLE = 200
const MEDIA_PILLAR_BODY = 2500
const MEDIA_PILLAR_MIN = 1
const MEDIA_PILLAR_MAX = 8
const MEDIA_RATE_FIELD = 300
const MEDIA_RATE_MIN = 1
const MEDIA_RATE_MAX = 6
const MEDIA_CLIENT_TITLE = 200
const MEDIA_CLIENT_BODY = 4000
const MEDIA_CLIENT_MIN = 1
const MEDIA_CLIENT_MAX = 12
const MEDIA_SELECTED_BODY = 12000
const MEDIA_FOOTNOTE = 500
const BR_DOC_TITLE = 500
const BR_META = 2000
const BR_HEADER = 400
const BR_BUTTON = 80
const BR_SECTION_TITLE = 400
const BR_PARA = 12000
const BR_INTRO_LINK = 2000
const BR_MAX_LEAD = 30
const BR_MAX_SECTIONS = 20
const BR_MAX_PARAS = 80
const BR_PKG_TITLE = 300
const BR_PRICE = 120
const BR_BULLET = 2500
const BR_DETAIL = 2000
const BR_MAX_PKGS = 15
const BR_MAX_ITEMS_PKG = 45
const BR_MAX_ADD_BULLETS = 30
const BR_CTA_TITLE = 300
const BR_CTA_SUB = 500
const BR_CTA_BTN = 120
const PG_DOC_TITLE = 500
const PG_META = 2000
const PG_PAGE_TITLE = 400
const PG_PARA = 12000
const PG_SECTION = 400
const PG_BULLET = 2500
const PG_TABLE_ROWS = 15
const PG_SERVICE_NAME = 200
const PG_PRICE_CELL = 80
const PG_MAX_CLASS_CARDS = 8
const PG_CLASS_NAME = 200
const PG_CLASS_PRICE = 120
const PG_MAX_LIST = 30
const PG_MAX_BOOK_PARAS = 20
const PG_MAX_FAQ = 45
const PG_FAQ_Q = 500
const PG_FAQ_ANS = 20000
const PG_PATH = 200
const PG_NOTE = 2000
const PG_CTA_TITLE = 300
const PG_CTA_SUB = 500
const PG_CTA_BTN = 120

const s3 = new S3Client({})

function base64urlJson(obj) {
  return Buffer.from(JSON.stringify(obj), 'utf8').toString('base64url')
}

function signJwt(payload, secret) {
  const header = base64urlJson({ alg: 'HS256', typ: 'JWT' })
  const payloadPart = base64urlJson(payload)
  const data = `${header}.${payloadPart}`
  const sig = createHmac('sha256', secret).update(data).digest('base64url')
  return `${data}.${sig}`
}

function verifyJwt(token, secret) {
  const parts = token.split('.')
  if (parts.length !== 3) return null
  const [h, p, s] = parts
  if (!h || !p || !s) return null
  const data = `${h}.${p}`
  const expected = createHmac('sha256', secret).update(data).digest('base64url')
  const sigBuf = Buffer.from(s, 'base64url')
  const expBuf = Buffer.from(expected, 'base64url')
  if (sigBuf.length !== expBuf.length || !timingSafeEqual(sigBuf, expBuf)) return null
  try {
    const payload = JSON.parse(Buffer.from(p, 'base64url').toString('utf8'))
    if (typeof payload.exp !== 'number' || payload.exp * 1000 < Date.now()) return null
    if (payload.sub !== ADMIN_SUB) return null
    return payload
  } catch {
    return null
  }
}

function safeEqualStr(a, b) {
  try {
    const ba = Buffer.from(String(a), 'utf8')
    const bb = Buffer.from(String(b), 'utf8')
    if (ba.length !== bb.length) return false
    return timingSafeEqual(ba, bb)
  } catch {
    return false
  }
}

function getPath(event) {
  const raw = event.rawPath ?? event.requestContext?.http?.path ?? '/'
  return raw.split('?')[0] ?? '/'
}

function getMethod(event) {
  return event.requestContext?.http?.method ?? event.httpMethod ?? 'GET'
}

function headerLookup(headers, name) {
  if (!headers || typeof headers !== 'object') return undefined
  const lower = name.toLowerCase()
  for (const [k, v] of Object.entries(headers)) {
    if (k.toLowerCase() === lower && typeof v === 'string') return v
  }
  return undefined
}

function response(statusCode, bodyObj) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
    },
    body: JSON.stringify(bodyObj),
  }
}

function parseBody(event) {
  if (!event.body) return ''
  let raw = event.body
  if (event.isBase64Encoded) {
    raw = Buffer.from(raw, 'base64').toString('utf8')
  }
  return raw
}

function bearerToken(event) {
  const auth = headerLookup(event.headers, 'Authorization') ?? ''
  return auth.startsWith('Bearer ') ? auth.slice(7).trim() : ''
}

function validateLocationsDoc(body) {
  if (!body || typeof body !== 'object') return false
  if (typeof body.version !== 'number' || !Number.isFinite(body.version)) return false
  if (typeof body.regionsNotice !== 'string') return false
  if (body.regionsNotice.length > MAX_REGIONS_NOTICE_LEN) return false
  return true
}

function validateAboutDoc(body) {
  if (!body || typeof body !== 'object') return false
  if (typeof body.version !== 'number' || !Number.isFinite(body.version)) return false
  if (typeof body.pageHeader !== 'string' || body.pageHeader.length > ABOUT_MAX_HEADER) return false
  if (body.pageHeader.trim().length < 1) return false
  if (typeof body.mainText !== 'string' || body.mainText.length > ABOUT_MAX_MAIN) return false
  if (body.mainText.trim().length < 1) return false
  if (typeof body.listIntro !== 'string' || body.listIntro.length > ABOUT_MAX_LIST_INTRO) return false
  if (body.listIntro.trim().length < 1) return false
  if (!Array.isArray(body.items)) return false
  if (body.items.length < 1 || body.items.length > ABOUT_MAX_ITEMS) return false
  return body.items.every((it) => {
    if (!it || typeof it !== 'object') return false
    if (typeof it.title !== 'string' || it.title.length > ABOUT_MAX_ITEM_TITLE) return false
    if (it.title.trim().length < 1) return false
    if (typeof it.body !== 'string' || it.body.length > ABOUT_MAX_ITEM_BODY) return false
    if (it.body.trim().length < 1) return false
    return true
  })
}

function validateMediaDoc(body) {
  if (!body || typeof body !== 'object') return false
  if (typeof body.version !== 'number' || !Number.isFinite(body.version)) return false

  if (typeof body.pageHeader !== 'string' || body.pageHeader.length > MEDIA_MAX_PAGE_HEADER) return false
  if (body.pageHeader.trim().length < 1) return false
  if (typeof body.introText !== 'string' || body.introText.length > MEDIA_MAX_INTRO) return false
  if (body.introText.trim().length < 1) return false

  if (typeof body.collaborativeTitle !== 'string' || body.collaborativeTitle.length > MEDIA_MAX_SECTION_TITLE)
    return false
  if (body.collaborativeTitle.trim().length < 1) return false
  if (typeof body.collaborativeBody !== 'string' || body.collaborativeBody.length > MEDIA_MAX_SECTION_BODY)
    return false
  if (body.collaborativeBody.trim().length < 1) return false

  if (typeof body.whyDifferentTitle !== 'string' || body.whyDifferentTitle.length > MEDIA_MAX_SECTION_TITLE)
    return false
  if (body.whyDifferentTitle.trim().length < 1) return false
  if (!Array.isArray(body.whyDifferentPillars)) return false
  if (body.whyDifferentPillars.length < MEDIA_PILLAR_MIN || body.whyDifferentPillars.length > MEDIA_PILLAR_MAX)
    return false
  if (
    !body.whyDifferentPillars.every((p) => {
      if (!p || typeof p !== 'object') return false
      if (typeof p.title !== 'string' || p.title.length > MEDIA_PILLAR_TITLE) return false
      if (p.title.trim().length < 1) return false
      if (typeof p.body !== 'string' || p.body.length > MEDIA_PILLAR_BODY) return false
      if (p.body.trim().length < 1) return false
      return true
    })
  )
    return false

  if (typeof body.ratesTitle !== 'string' || body.ratesTitle.length > MEDIA_MAX_SECTION_TITLE) return false
  if (body.ratesTitle.trim().length < 1) return false
  if (typeof body.ratesNote !== 'string' || body.ratesNote.length > MEDIA_MAX_RATES_NOTE) return false
  if (body.ratesNote.trim().length < 1) return false
  if (!Array.isArray(body.rates)) return false
  if (body.rates.length < MEDIA_RATE_MIN || body.rates.length > MEDIA_RATE_MAX) return false
  if (
    !body.rates.every((r) => {
      if (!r || typeof r !== 'object') return false
      if (typeof r.label !== 'string' || r.label.length > MEDIA_RATE_FIELD) return false
      if (r.label.trim().length < 1) return false
      if (typeof r.sublabel !== 'string' || r.sublabel.length > MEDIA_RATE_FIELD) return false
      if (typeof r.price !== 'string' || r.price.length > MEDIA_RATE_FIELD) return false
      if (r.price.trim().length < 1) return false
      return true
    })
  )
    return false

  if (typeof body.clientsTitle !== 'string' || body.clientsTitle.length > MEDIA_MAX_SECTION_TITLE) return false
  if (body.clientsTitle.trim().length < 1) return false
  if (!Array.isArray(body.clientGroups)) return false
  if (body.clientGroups.length < MEDIA_CLIENT_MIN || body.clientGroups.length > MEDIA_CLIENT_MAX) return false
  if (
    !body.clientGroups.every((c) => {
      if (!c || typeof c !== 'object') return false
      if (typeof c.title !== 'string' || c.title.length > MEDIA_CLIENT_TITLE) return false
      if (c.title.trim().length < 1) return false
      if (typeof c.body !== 'string' || c.body.length > MEDIA_CLIENT_BODY) return false
      if (c.body.trim().length < 1) return false
      return true
    })
  )
    return false

  if (typeof body.selectedWorkTitle !== 'string' || body.selectedWorkTitle.length > MEDIA_MAX_SECTION_TITLE)
    return false
  if (body.selectedWorkTitle.trim().length < 1) return false
  if (typeof body.selectedWorkBody !== 'string' || body.selectedWorkBody.length > MEDIA_SELECTED_BODY) return false
  if (body.selectedWorkBody.trim().length < 1) return false
  if (typeof body.selectedWorkFootnote !== 'string' || body.selectedWorkFootnote.length > MEDIA_FOOTNOTE)
    return false

  return true
}

/** @returns {string | null} null if OK, else human-readable path + reason */
function validateBridalPackageReason(p, pkgIndex, pathPrefix) {
  const pfx = `${pathPrefix}/packages[${pkgIndex}]`
  if (!p || typeof p !== 'object') return `${pfx}: must be an object`
  if (typeof p.title !== 'string' || p.title.trim().length < 1)
    return `${pfx}/title: required non-empty string`
  if (p.title.length > BR_PKG_TITLE)
    return `${pfx}/title: max ${BR_PKG_TITLE} characters (got ${p.title.length})`
  if (typeof p.price !== 'string' || p.price.trim().length < 1)
    return `${pfx}/price: required non-empty string`
  if (p.price.length > BR_PRICE) return `${pfx}/price: max ${BR_PRICE} characters (got ${p.price.length})`
  const detailRaw = typeof p.detailText === 'string' ? p.detailText.trim() : ''
  if (detailRaw.length > BR_DETAIL)
    return `${pfx}/detailText: max ${BR_DETAIL} characters (got ${detailRaw.length})`
  if (!Array.isArray(p.items)) return `${pfx}/items: must be an array`
  const items = p.items.filter((x) => typeof x === 'string' && x.trim().length > 0)
  if (items.length > BR_MAX_ITEMS_PKG)
    return `${pfx}/items: at most ${BR_MAX_ITEMS_PKG} non-empty lines (got ${items.length})`
  const badBullet = items.findIndex((x) => x.length > BR_BULLET)
  if (badBullet !== -1)
    return `${pfx}/items[${badBullet}]: max ${BR_BULLET} characters per line`
  if (items.length < 1 && detailRaw.length < 1)
    return `${pfx}: add at least one bullet in items or non-empty detailText`
  return null
}

/** @returns {string | null} */
function validateBridalCtaReason(cta, pathPrefix) {
  if (!cta || typeof cta !== 'object') return `${pathPrefix}: cta must be an object`
  if (typeof cta.title !== 'string' || cta.title.trim().length < 1)
    return `${pathPrefix}/cta/title: required non-empty string`
  if (cta.title.length > BR_CTA_TITLE)
    return `${pathPrefix}/cta/title: max ${BR_CTA_TITLE} characters (got ${cta.title.length})`
  if (typeof cta.subtitle !== 'string' || cta.subtitle.trim().length < 1)
    return `${pathPrefix}/cta/subtitle: required non-empty string`
  if (cta.subtitle.length > BR_CTA_SUB)
    return `${pathPrefix}/cta/subtitle: max ${BR_CTA_SUB} characters (got ${cta.subtitle.length})`
  if (typeof cta.buttonText !== 'string' || cta.buttonText.trim().length < 1)
    return `${pathPrefix}/cta/buttonText: required non-empty string`
  if (cta.buttonText.length > BR_CTA_BTN)
    return `${pathPrefix}/cta/buttonText: max ${BR_CTA_BTN} characters (got ${cta.buttonText.length})`
  return null
}

/** @returns {string | null} */
function validateBridalRegionalReason(r, regionKey) {
  const path = regionKey
  if (!r || typeof r !== 'object') return `${path}: must be an object`
  if (typeof r.documentTitle !== 'string' || r.documentTitle.trim().length < 1)
    return `${path}/documentTitle: required non-empty string`
  if (r.documentTitle.length > BR_DOC_TITLE)
    return `${path}/documentTitle: max ${BR_DOC_TITLE} characters (got ${r.documentTitle.length})`
  if (typeof r.metaDescription !== 'string' || r.metaDescription.trim().length < 1)
    return `${path}/metaDescription: required non-empty string`
  if (r.metaDescription.length > BR_META)
    return `${path}/metaDescription: max ${BR_META} characters (got ${r.metaDescription.length})`
  if (typeof r.pageHeader !== 'string' || r.pageHeader.trim().length < 1)
    return `${path}/pageHeader: required non-empty string`
  if (r.pageHeader.length > BR_HEADER)
    return `${path}/pageHeader: max ${BR_HEADER} characters (got ${r.pageHeader.length})`
  if (typeof r.introBeforeLink !== 'string')
    return `${path}/introBeforeLink: must be a string`
  if (r.introBeforeLink.length > BR_INTRO_LINK)
    return `${path}/introBeforeLink: max ${BR_INTRO_LINK} characters (got ${r.introBeforeLink.length})`
  if (r.introBeforeLink.trim().length < 1)
    return `${path}/introBeforeLink: required non-empty (trimmed)`
  if (typeof r.servicesLinkText !== 'string' || r.servicesLinkText.trim().length < 1)
    return `${path}/servicesLinkText: required non-empty string`
  if (r.servicesLinkText.length > BR_HEADER)
    return `${path}/servicesLinkText: max ${BR_HEADER} characters (got ${r.servicesLinkText.length})`
  if (typeof r.introAfterLink !== 'string')
    return `${path}/introAfterLink: must be a string`
  if (r.introAfterLink.length > BR_INTRO_LINK)
    return `${path}/introAfterLink: max ${BR_INTRO_LINK} characters (got ${r.introAfterLink.length})`
  if (r.introAfterLink.trim().length < 1)
    return `${path}/introAfterLink: required non-empty (trimmed)`
  if (!Array.isArray(r.packages))
    return `${path}/packages: must be an array with 1–${BR_MAX_PKGS} packages`
  if (r.packages.length < 1 || r.packages.length > BR_MAX_PKGS)
    return `${path}/packages: need 1–${BR_MAX_PKGS} packages (got ${r.packages.length})`
  for (let i = 0; i < r.packages.length; i++) {
    const err = validateBridalPackageReason(r.packages[i], i, path)
    if (err) return err
  }
  if (typeof r.additionalSectionTitle !== 'string' || r.additionalSectionTitle.trim().length < 1)
    return `${path}/additionalSectionTitle: required non-empty string`
  if (r.additionalSectionTitle.length > BR_SECTION_TITLE)
    return `${path}/additionalSectionTitle: max ${BR_SECTION_TITLE} characters (got ${r.additionalSectionTitle.length})`
  if (!Array.isArray(r.additionalBullets))
    return `${path}/additionalBullets: must be an array`
  if (r.additionalBullets.length < 1 || r.additionalBullets.length > BR_MAX_ADD_BULLETS)
    return `${path}/additionalBullets: need 1–${BR_MAX_ADD_BULLETS} items (got ${r.additionalBullets.length})`
  for (let i = 0; i < r.additionalBullets.length; i++) {
    const x = r.additionalBullets[i]
    if (typeof x !== 'string' || x.trim().length < 1)
      return `${path}/additionalBullets[${i}]: required non-empty string`
    if (x.length > BR_BULLET)
      return `${path}/additionalBullets[${i}]: max ${BR_BULLET} characters`
  }
  return validateBridalCtaReason(r.cta, path)
}

/** @returns {string | null} */
function validateBridalOverviewReason(ov) {
  const path = 'overview'
  if (!ov || typeof ov !== 'object') return `${path}: must be an object`
  if (typeof ov.documentTitle !== 'string' || ov.documentTitle.trim().length < 1)
    return `${path}/documentTitle: required non-empty string`
  if (ov.documentTitle.length > BR_DOC_TITLE)
    return `${path}/documentTitle: max ${BR_DOC_TITLE} characters (got ${ov.documentTitle.length})`
  if (typeof ov.metaDescription !== 'string' || ov.metaDescription.trim().length < 1)
    return `${path}/metaDescription: required non-empty string`
  if (ov.metaDescription.length > BR_META)
    return `${path}/metaDescription: max ${BR_META} characters (got ${ov.metaDescription.length})`
  if (typeof ov.pageHeader !== 'string' || ov.pageHeader.trim().length < 1)
    return `${path}/pageHeader: required non-empty string`
  if (ov.pageHeader.length > BR_HEADER)
    return `${path}/pageHeader: max ${BR_HEADER} characters (got ${ov.pageHeader.length})`
  if (typeof ov.pricingCtaTitle !== 'string' || ov.pricingCtaTitle.trim().length < 1)
    return `${path}/pricingCtaTitle: required non-empty string`
  if (ov.pricingCtaTitle.length > BR_SECTION_TITLE)
    return `${path}/pricingCtaTitle: max ${BR_SECTION_TITLE} characters (got ${ov.pricingCtaTitle.length})`
  if (typeof ov.pricingCtaSub !== 'string' || ov.pricingCtaSub.trim().length < 1)
    return `${path}/pricingCtaSub: required non-empty string`
  if (ov.pricingCtaSub.length > BR_PARA)
    return `${path}/pricingCtaSub: max ${BR_PARA} characters (got ${ov.pricingCtaSub.length})`
  if (typeof ov.pittsburghButtonLabel !== 'string' || ov.pittsburghButtonLabel.trim().length < 1)
    return `${path}/pittsburghButtonLabel: required non-empty string`
  if (ov.pittsburghButtonLabel.length > BR_BUTTON)
    return `${path}/pittsburghButtonLabel: max ${BR_BUTTON} characters (got ${ov.pittsburghButtonLabel.length})`
  if (typeof ov.atlantaButtonLabel !== 'string' || ov.atlantaButtonLabel.trim().length < 1)
    return `${path}/atlantaButtonLabel: required non-empty string`
  if (ov.atlantaButtonLabel.length > BR_BUTTON)
    return `${path}/atlantaButtonLabel: max ${BR_BUTTON} characters (got ${ov.atlantaButtonLabel.length})`
  if (!Array.isArray(ov.leadParagraphs))
    return `${path}/leadParagraphs: must be an array`
  if (ov.leadParagraphs.length < 1 || ov.leadParagraphs.length > BR_MAX_LEAD)
    return `${path}/leadParagraphs: need 1–${BR_MAX_LEAD} paragraphs (got ${ov.leadParagraphs.length})`
  for (let i = 0; i < ov.leadParagraphs.length; i++) {
    const x = ov.leadParagraphs[i]
    if (typeof x !== 'string' || x.trim().length < 1)
      return `${path}/leadParagraphs[${i}]: required non-empty string`
    if (x.length > BR_PARA)
      return `${path}/leadParagraphs[${i}]: max ${BR_PARA} characters (got ${x.length})`
  }
  return null
}

/** @returns {string | null} */
function validateBridalServicesReason(sv) {
  const path = 'services'
  if (!sv || typeof sv !== 'object') return `${path}: must be an object`
  if (typeof sv.pageHeader !== 'string' || sv.pageHeader.trim().length < 1)
    return `${path}/pageHeader: required non-empty string`
  if (sv.pageHeader.length > BR_HEADER)
    return `${path}/pageHeader: max ${BR_HEADER} characters (got ${sv.pageHeader.length})`
  if (typeof sv.pricingCtaTitle !== 'string' || sv.pricingCtaTitle.trim().length < 1)
    return `${path}/pricingCtaTitle: required non-empty string`
  if (sv.pricingCtaTitle.length > BR_SECTION_TITLE)
    return `${path}/pricingCtaTitle: max ${BR_SECTION_TITLE} characters (got ${sv.pricingCtaTitle.length})`
  if (typeof sv.pricingCtaSub !== 'string' || sv.pricingCtaSub.trim().length < 1)
    return `${path}/pricingCtaSub: required non-empty string`
  if (sv.pricingCtaSub.length > BR_PARA)
    return `${path}/pricingCtaSub: max ${BR_PARA} characters (got ${sv.pricingCtaSub.length})`
  if (typeof sv.pittsburghButtonLabel !== 'string' || sv.pittsburghButtonLabel.trim().length < 1)
    return `${path}/pittsburghButtonLabel: required non-empty string`
  if (sv.pittsburghButtonLabel.length > BR_BUTTON)
    return `${path}/pittsburghButtonLabel: max ${BR_BUTTON} characters (got ${sv.pittsburghButtonLabel.length})`
  if (typeof sv.atlantaButtonLabel !== 'string' || sv.atlantaButtonLabel.trim().length < 1)
    return `${path}/atlantaButtonLabel: required non-empty string`
  if (sv.atlantaButtonLabel.length > BR_BUTTON)
    return `${path}/atlantaButtonLabel: max ${BR_BUTTON} characters (got ${sv.atlantaButtonLabel.length})`
  if (typeof sv.introText !== 'string' || sv.introText.trim().length < 1)
    return `${path}/introText: required non-empty string`
  if (sv.introText.length > BR_PARA)
    return `${path}/introText: max ${BR_PARA} characters (got ${sv.introText.length})`
  if (!Array.isArray(sv.sections))
    return `${path}/sections: must be an array`
  if (sv.sections.length < 1 || sv.sections.length > BR_MAX_SECTIONS)
    return `${path}/sections: need 1–${BR_MAX_SECTIONS} sections (got ${sv.sections.length})`
  for (let si = 0; si < sv.sections.length; si++) {
    const sec = sv.sections[si]
    const sp = `${path}/sections[${si}]`
    if (!sec || typeof sec !== 'object') return `${sp}: must be an object`
    if (typeof sec.title !== 'string' || sec.title.trim().length < 1)
      return `${sp}/title: required non-empty string`
    if (sec.title.length > BR_SECTION_TITLE)
      return `${sp}/title: max ${BR_SECTION_TITLE} characters (got ${sec.title.length})`
    if (!Array.isArray(sec.paragraphs))
      return `${sp}/paragraphs: must be an array`
    if (sec.paragraphs.length < 1 || sec.paragraphs.length > BR_MAX_PARAS)
      return `${sp}/paragraphs: need 1–${BR_MAX_PARAS} paragraphs (got ${sec.paragraphs.length})`
    for (let pi = 0; pi < sec.paragraphs.length; pi++) {
      const x = sec.paragraphs[pi]
      if (typeof x !== 'string' || x.trim().length < 1)
        return `${sp}/paragraphs[${pi}]: required non-empty string`
      if (x.length > BR_PARA)
        return `${sp}/paragraphs[${pi}]: max ${BR_PARA} characters (got ${x.length})`
    }
  }
  return validateBridalCtaReason(sv.cta, path)
}

/** @returns {string | null} */
function validateBridalDocReason(body) {
  if (!body || typeof body !== 'object') return 'root: body must be a JSON object'
  if (typeof body.version !== 'number' || !Number.isFinite(body.version))
    return 'root/version: must be a finite number'
  let err = validateBridalOverviewReason(body.overview)
  if (err) return err
  err = validateBridalServicesReason(body.services)
  if (err) return err
  err = validateBridalRegionalReason(body.pittsburgh, 'pittsburgh')
  if (err) return err
  err = validateBridalRegionalReason(body.atlanta, 'atlanta')
  if (err) return err
  return null
}

function normalizeBridalOverviewOut(ov) {
  return {
    documentTitle: String(ov.documentTitle).trim(),
    metaDescription: String(ov.metaDescription).trim(),
    pageHeader: String(ov.pageHeader).trim(),
    pricingCtaTitle: String(ov.pricingCtaTitle).trim(),
    pricingCtaSub: String(ov.pricingCtaSub).trim(),
    pittsburghButtonLabel: String(ov.pittsburghButtonLabel).trim(),
    atlantaButtonLabel: String(ov.atlantaButtonLabel).trim(),
    leadParagraphs: ov.leadParagraphs.map((x) => String(x).trim()),
  }
}

function normalizeBridalServicesOut(sv) {
  return {
    pageHeader: String(sv.pageHeader).trim(),
    pricingCtaTitle: String(sv.pricingCtaTitle).trim(),
    pricingCtaSub: String(sv.pricingCtaSub).trim(),
    pittsburghButtonLabel: String(sv.pittsburghButtonLabel).trim(),
    atlantaButtonLabel: String(sv.atlantaButtonLabel).trim(),
    introText: String(sv.introText).trim(),
    sections: sv.sections.map((sec) => ({
      title: String(sec.title).trim(),
      paragraphs: sec.paragraphs.map((x) => String(x).trim()),
    })),
    cta: {
      title: String(sv.cta.title).trim(),
      subtitle: String(sv.cta.subtitle).trim(),
      buttonText: String(sv.cta.buttonText).trim(),
    },
  }
}

function normalizeBridalRegionalOut(r) {
  return {
    documentTitle: String(r.documentTitle).trim(),
    metaDescription: String(r.metaDescription).trim(),
    pageHeader: String(r.pageHeader).trim(),
    introBeforeLink: String(r.introBeforeLink).trim(),
    servicesLinkText: String(r.servicesLinkText).trim(),
    introAfterLink: String(r.introAfterLink).trim(),
    packages: r.packages.map((p) => ({
      title: String(p.title).trim(),
      price: String(p.price).trim(),
      items: (Array.isArray(p.items) ? p.items : [])
        .filter((x) => typeof x === 'string' && x.trim().length > 0)
        .map((x) => x.trim()),
      detailText: String(p.detailText ?? '').trim(),
    })),
    additionalSectionTitle: String(r.additionalSectionTitle).trim(),
    additionalBullets: r.additionalBullets.map((x) => String(x).trim()),
    cta: {
      title: String(r.cta.title).trim(),
      subtitle: String(r.cta.subtitle).trim(),
      buttonText: String(r.cta.buttonText).trim(),
    },
  }
}

function validatePagesCta(cta) {
  if (!cta || typeof cta !== 'object') return false
  if (
    typeof cta.title !== 'string' ||
    cta.title.trim().length < 1 ||
    cta.title.length > PG_CTA_TITLE
  )
    return false
  if (
    typeof cta.subtitle !== 'string' ||
    cta.subtitle.trim().length < 1 ||
    cta.subtitle.length > PG_CTA_SUB
  )
    return false
  if (
    typeof cta.buttonText !== 'string' ||
    cta.buttonText.trim().length < 1 ||
    cta.buttonText.length > PG_CTA_BTN
  )
    return false
  return true
}

function validatePagesBeauty(b) {
  if (!b || typeof b !== 'object') return false
  if (
    typeof b.documentTitle !== 'string' ||
    b.documentTitle.trim().length < 1 ||
    b.documentTitle.length > PG_DOC_TITLE
  )
    return false
  if (
    typeof b.metaDescription !== 'string' ||
    b.metaDescription.trim().length < 1 ||
    b.metaDescription.length > PG_META
  )
    return false
  if (
    typeof b.pageTitle !== 'string' ||
    b.pageTitle.trim().length < 1 ||
    b.pageTitle.length > PG_PAGE_TITLE
  )
    return false
  if (typeof b.introText !== 'string' || b.introText.trim().length < 1 || b.introText.length > PG_PARA)
    return false
  if (
    typeof b.hairSectionTitle !== 'string' ||
    b.hairSectionTitle.trim().length < 1 ||
    b.hairSectionTitle.length > PG_SECTION
  )
    return false
  if (!Array.isArray(b.hairItems) || b.hairItems.length < 1 || b.hairItems.length > PG_MAX_LIST)
    return false
  if (
    !b.hairItems.every(
      (x) => typeof x === 'string' && x.trim().length > 0 && x.length <= PG_BULLET,
    )
  )
    return false
  if (
    typeof b.locationSectionTitle !== 'string' ||
    b.locationSectionTitle.trim().length < 1 ||
    b.locationSectionTitle.length > PG_SECTION
  )
    return false
  if (!Array.isArray(b.locationItems) || b.locationItems.length < 1 || b.locationItems.length > PG_MAX_LIST)
    return false
  if (
    !b.locationItems.every(
      (x) => typeof x === 'string' && x.trim().length > 0 && x.length <= PG_BULLET,
    )
  )
    return false
  if (
    typeof b.ratesSectionTitle !== 'string' ||
    b.ratesSectionTitle.trim().length < 1 ||
    b.ratesSectionTitle.length > PG_SECTION
  )
    return false
  if (!Array.isArray(b.ratesTable) || b.ratesTable.length < 1 || b.ratesTable.length > PG_TABLE_ROWS)
    return false
  if (
    !b.ratesTable.every((row) => {
      if (!row || typeof row !== 'object') return false
      if (
        typeof row.service !== 'string' ||
        row.service.trim().length < 1 ||
        row.service.length > PG_SERVICE_NAME
      )
        return false
      if (
        typeof row.price !== 'string' ||
        row.price.trim().length < 1 ||
        row.price.length > PG_PRICE_CELL
      )
        return false
      return true
    })
  )
    return false
  if (!Array.isArray(b.ratesNotes) || b.ratesNotes.length < 1 || b.ratesNotes.length > PG_MAX_LIST)
    return false
  if (!b.ratesNotes.every((x) => typeof x === 'string' && x.trim().length > 0 && x.length <= PG_PARA))
    return false
  return validatePagesCta(b.cta)
}

function validatePagesClassCard(c) {
  if (!c || typeof c !== 'object') return false
  if (typeof c.name !== 'string' || c.name.trim().length < 1 || c.name.length > PG_CLASS_NAME)
    return false
  if (typeof c.price !== 'string' || c.price.trim().length < 1 || c.price.length > PG_CLASS_PRICE)
    return false
  if (
    typeof c.perfectFor !== 'string' ||
    c.perfectFor.trim().length < 1 ||
    c.perfectFor.length > PG_PARA
  )
    return false
  const included = Array.isArray(c.includedItems)
    ? c.includedItems.filter((x) => typeof x === 'string' && x.trim().length > 0)
    : []
  const pricing = Array.isArray(c.pricingItems)
    ? c.pricingItems.filter((x) => typeof x === 'string' && x.trim().length > 0)
    : []
  const hasExtended = included.length > 0 || pricing.length > 0
  if (hasExtended) {
    if (included.length < 1 || included.length > PG_MAX_LIST) return false
    if (pricing.length < 1 || pricing.length > PG_MAX_LIST) return false
    if (!included.every((x) => x.length <= PG_BULLET)) return false
    if (!pricing.every((x) => x.length <= PG_BULLET)) return false
    if (typeof c.details === 'string' && c.details.length > PG_PARA) return false
    const addl = typeof c.additionalInfo === 'string' ? c.additionalInfo : ''
    if (addl.length > PG_NOTE) return false
    const pathRaw = typeof c.learnMorePath === 'string' ? c.learnMorePath.trim() : ''
    const labelRaw = typeof c.learnMoreLabel === 'string' ? c.learnMoreLabel.trim() : ''
    if (pathRaw.length > PG_PATH || labelRaw.length > PG_CTA_BTN) return false
    if ((pathRaw && !labelRaw) || (!pathRaw && labelRaw)) return false
  } else {
    if (typeof c.details !== 'string' || c.details.trim().length < 1 || c.details.length > PG_PARA)
      return false
  }
  return true
}

function validatePagesClasses(s) {
  if (!s || typeof s !== 'object') return false
  if (
    typeof s.documentTitle !== 'string' ||
    s.documentTitle.trim().length < 1 ||
    s.documentTitle.length > PG_DOC_TITLE
  )
    return false
  if (
    typeof s.metaDescription !== 'string' ||
    s.metaDescription.trim().length < 1 ||
    s.metaDescription.length > PG_META
  )
    return false
  if (
    typeof s.pageTitle !== 'string' ||
    s.pageTitle.trim().length < 1 ||
    s.pageTitle.length > PG_PAGE_TITLE
  )
    return false
  if (typeof s.introText !== 'string' || s.introText.trim().length < 1 || s.introText.length > PG_PARA)
    return false
  if (!Array.isArray(s.cards) || s.cards.length < 1 || s.cards.length > PG_MAX_CLASS_CARDS) return false
  if (!s.cards.every(validatePagesClassCard)) return false
  if (
    typeof s.hourlyAddOnNote !== 'string' ||
    s.hourlyAddOnNote.trim().length < 1 ||
    s.hourlyAddOnNote.length > PG_PARA
  )
    return false
  if (
    typeof s.logisticsTitle !== 'string' ||
    s.logisticsTitle.trim().length < 1 ||
    s.logisticsTitle.length > PG_SECTION
  )
    return false
  if (
    !Array.isArray(s.logisticsItems) ||
    s.logisticsItems.length < 1 ||
    s.logisticsItems.length > PG_MAX_LIST
  )
    return false
  if (
    !s.logisticsItems.every(
      (x) => typeof x === 'string' && x.trim().length > 0 && x.length <= PG_BULLET,
    )
  )
    return false
  return validatePagesCta(s.cta)
}

function validatePagesCreativeFx(x) {
  if (!x || typeof x !== 'object') return false
  if (
    typeof x.documentTitle !== 'string' ||
    x.documentTitle.trim().length < 1 ||
    x.documentTitle.length > PG_DOC_TITLE
  )
    return false
  if (
    typeof x.metaDescription !== 'string' ||
    x.metaDescription.trim().length < 1 ||
    x.metaDescription.length > PG_META
  )
    return false
  if (
    typeof x.pageTitle !== 'string' ||
    x.pageTitle.trim().length < 1 ||
    x.pageTitle.length > PG_PAGE_TITLE
  )
    return false
  if (typeof x.introText !== 'string' || x.introText.trim().length < 1 || x.introText.length > PG_PARA)
    return false
  if (
    typeof x.servicesTitle !== 'string' ||
    x.servicesTitle.trim().length < 1 ||
    x.servicesTitle.length > PG_SECTION
  )
    return false
  if (
    !Array.isArray(x.serviceItems) ||
    x.serviceItems.length < 1 ||
    x.serviceItems.length > PG_MAX_LIST
  )
    return false
  if (
    !x.serviceItems.every(
      (s) => typeof s === 'string' && s.trim().length > 0 && s.length <= PG_BULLET,
    )
  )
    return false
  if (
    typeof x.pricingTitle !== 'string' ||
    x.pricingTitle.trim().length < 1 ||
    x.pricingTitle.length > PG_SECTION
  )
    return false
  if (
    !Array.isArray(x.pricingItems) ||
    x.pricingItems.length < 1 ||
    x.pricingItems.length > PG_MAX_LIST
  )
    return false
  if (
    !x.pricingItems.every(
      (s) => typeof s === 'string' && s.trim().length > 0 && s.length <= PG_BULLET,
    )
  )
    return false
  if (
    typeof x.bookingTitle !== 'string' ||
    x.bookingTitle.trim().length < 1 ||
    x.bookingTitle.length > PG_SECTION
  )
    return false
  if (
    !Array.isArray(x.bookingParagraphs) ||
    x.bookingParagraphs.length < 1 ||
    x.bookingParagraphs.length > PG_MAX_BOOK_PARAS
  )
    return false
  return x.bookingParagraphs.every(
    (p) => typeof p === 'string' && p.trim().length > 0 && p.length <= PG_PARA,
  )
}

function validatePagesFaqItem(it) {
  if (!it || typeof it !== 'object') return false
  if (
    typeof it.question !== 'string' ||
    it.question.trim().length < 1 ||
    it.question.length > PG_FAQ_Q
  )
    return false
  if (
    typeof it.answerHtml !== 'string' ||
    it.answerHtml.trim().length < 1 ||
    it.answerHtml.length > PG_FAQ_ANS
  )
    return false
  return true
}

function validatePagesFaq(f) {
  if (!f || typeof f !== 'object') return false
  if (
    typeof f.documentTitle !== 'string' ||
    f.documentTitle.trim().length < 1 ||
    f.documentTitle.length > PG_DOC_TITLE
  )
    return false
  if (
    typeof f.metaDescription !== 'string' ||
    f.metaDescription.trim().length < 1 ||
    f.metaDescription.length > PG_META
  )
    return false
  if (
    typeof f.pageTitle !== 'string' ||
    f.pageTitle.trim().length < 1 ||
    f.pageTitle.length > PG_PAGE_TITLE
  )
    return false
  if (typeof f.introText !== 'string' || f.introText.trim().length < 1 || f.introText.length > PG_PARA)
    return false
  if (!Array.isArray(f.items) || f.items.length < 1 || f.items.length > PG_MAX_FAQ) return false
  return f.items.every(validatePagesFaqItem)
}

function validatePagesDoc(body) {
  if (!body || typeof body !== 'object') return false
  if (typeof body.version !== 'number' || !Number.isFinite(body.version)) return false
  if (!validatePagesBeauty(body.beauty)) return false
  if (!validatePagesClasses(body.classes)) return false
  if (!validatePagesCreativeFx(body.creativeFx)) return false
  if (!validatePagesFaq(body.faq)) return false
  return true
}

function normalizePagesBeautyOut(b) {
  return {
    documentTitle: String(b.documentTitle).trim(),
    metaDescription: String(b.metaDescription).trim(),
    pageTitle: String(b.pageTitle).trim(),
    introText: String(b.introText).trim(),
    hairSectionTitle: String(b.hairSectionTitle).trim(),
    hairItems: b.hairItems.map((x) => String(x).trim()),
    locationSectionTitle: String(b.locationSectionTitle).trim(),
    locationItems: b.locationItems.map((x) => String(x).trim()),
    ratesSectionTitle: String(b.ratesSectionTitle).trim(),
    ratesTable: b.ratesTable.map((row) => ({
      service: String(row.service).trim(),
      price: String(row.price).trim(),
    })),
    ratesNotes: b.ratesNotes.map((x) => String(x).trim()),
    cta: {
      title: String(b.cta.title).trim(),
      subtitle: String(b.cta.subtitle).trim(),
      buttonText: String(b.cta.buttonText).trim(),
    },
  }
}

function normalizePagesClassCardOut(c) {
  return {
    name: String(c.name).trim(),
    price: String(c.price).trim(),
    perfectFor: String(c.perfectFor).trim(),
    details: String(c.details ?? '').trim(),
    includedItems: (Array.isArray(c.includedItems) ? c.includedItems : [])
      .filter((x) => typeof x === 'string' && x.trim().length > 0)
      .map((x) => x.trim()),
    pricingItems: (Array.isArray(c.pricingItems) ? c.pricingItems : [])
      .filter((x) => typeof x === 'string' && x.trim().length > 0)
      .map((x) => x.trim()),
    additionalInfo: String(c.additionalInfo ?? '').trim(),
    learnMorePath: String(c.learnMorePath ?? '').trim(),
    learnMoreLabel: String(c.learnMoreLabel ?? '').trim(),
  }
}

function normalizePagesClassesOut(s) {
  return {
    documentTitle: String(s.documentTitle).trim(),
    metaDescription: String(s.metaDescription).trim(),
    pageTitle: String(s.pageTitle).trim(),
    introText: String(s.introText).trim(),
    cards: s.cards.map(normalizePagesClassCardOut),
    hourlyAddOnNote: String(s.hourlyAddOnNote).trim(),
    logisticsTitle: String(s.logisticsTitle).trim(),
    logisticsItems: s.logisticsItems.map((x) => String(x).trim()),
    cta: {
      title: String(s.cta.title).trim(),
      subtitle: String(s.cta.subtitle).trim(),
      buttonText: String(s.cta.buttonText).trim(),
    },
  }
}

function normalizePagesCreativeFxOut(x) {
  return {
    documentTitle: String(x.documentTitle).trim(),
    metaDescription: String(x.metaDescription).trim(),
    pageTitle: String(x.pageTitle).trim(),
    introText: String(x.introText).trim(),
    servicesTitle: String(x.servicesTitle).trim(),
    serviceItems: x.serviceItems.map((s) => String(s).trim()),
    pricingTitle: String(x.pricingTitle).trim(),
    pricingItems: x.pricingItems.map((s) => String(s).trim()),
    bookingTitle: String(x.bookingTitle).trim(),
    bookingParagraphs: x.bookingParagraphs.map((p) => String(p).trim()),
  }
}

function normalizePagesFaqOut(f) {
  return {
    documentTitle: String(f.documentTitle).trim(),
    metaDescription: String(f.metaDescription).trim(),
    pageTitle: String(f.pageTitle).trim(),
    introText: String(f.introText).trim(),
    items: f.items.map((it) => ({
      question: String(it.question).trim(),
      answerHtml: String(it.answerHtml).trim(),
    })),
  }
}

function s3PutErrorResponse(err) {
  console.error('PutObject failed', err)
  const name = err?.name ?? err?.Code ?? ''
  const msg = String(err?.message ?? '')
  if (name === 'AccessDenied' || msg.includes('Access Denied')) {
    return response(500, {
      error:
        'S3 PutObject denied. On the Lambda execution role, allow s3:PutObject on the CMS locations JSON key in CMS_S3_BUCKET.',
    })
  }
  if (name === 'NoSuchBucket' || msg.includes('NoSuchBucket')) {
    return response(500, {
      error: 'S3 bucket not found. Check the CMS_S3_BUCKET environment variable.',
    })
  }
  return response(500, {
    error: 'S3 upload failed. Open CloudWatch logs for this function for details.',
  })
}

export async function handler(event) {
  const method = getMethod(event)
  const path = getPath(event)

  const adminPassword = process.env.ADMIN_PASSWORD ?? ''
  const sessionSecret = process.env.ADMIN_SESSION_SECRET ?? ''

  if (!adminPassword || !sessionSecret) {
    return response(500, { error: 'Server misconfigured' })
  }

  const isLogin = method === 'POST' && (path === '/login' || path.endsWith('/login'))
  const isVerify = method === 'GET' && (path === '/verify' || path.endsWith('/verify'))
  const isSaveLocations =
    method === 'PUT' && (path === '/locations-content' || path.endsWith('/locations-content'))
  const isSaveAbout =
    method === 'PUT' && (path === '/about-content' || path.endsWith('/about-content'))
  const isSaveMedia =
    method === 'PUT' && (path === '/media-content' || path.endsWith('/media-content'))
  const isSaveBridal =
    method === 'PUT' && (path === '/bridal-content' || path.endsWith('/bridal-content'))
  const isSavePages =
    method === 'PUT' && (path === '/pages-content' || path.endsWith('/pages-content'))

  if (isLogin) {
    let password = ''
    try {
      const parsed = JSON.parse(parseBody(event))
      password = parsed.password ?? ''
    } catch {
      return response(400, { error: 'Invalid JSON' })
    }
    if (!safeEqualStr(password, adminPassword)) {
      return response(401, { error: 'Unauthorized' })
    }
    const now = Math.floor(Date.now() / 1000)
    const exp = now + SESSION_HOURS * 3600
    const token = signJwt({ sub: ADMIN_SUB, iat: now, exp }, sessionSecret)
    return response(200, { token })
  }

  if (isVerify) {
    const token = bearerToken(event)
    if (!token || !verifyJwt(token, sessionSecret)) {
      return response(401, { error: 'Unauthorized' })
    }
    return response(200, { ok: true })
  }

  if (isSaveLocations) {
    const token = bearerToken(event)
    if (!token || !verifyJwt(token, sessionSecret)) {
      return response(401, { error: 'Unauthorized' })
    }
    let body
    try {
      body = JSON.parse(parseBody(event))
    } catch {
      return response(400, { error: 'Invalid JSON' })
    }
    if (!validateLocationsDoc(body)) {
      return response(400, {
        error: `Invalid document (expect version number and regionsNotice string, max ${MAX_REGIONS_NOTICE_LEN} chars).`,
      })
    }
    const bucket = process.env.CMS_S3_BUCKET ?? ''
    const key = process.env.CMS_S3_LOCATIONS_KEY || 'locations-content.json'
    if (!bucket) {
      return response(500, { error: 'CMS_S3_BUCKET not set' })
    }
    const version = Math.max(1, Math.floor(body.version))
    const regionsNotice = String(body.regionsNotice)
    const payload = JSON.stringify({ version, regionsNotice }, null, 2)
    try {
      await s3.send(
        new PutObjectCommand({
          Bucket: bucket,
          Key: key,
          Body: payload,
          ContentType: 'application/json; charset=utf-8',
          CacheControl: 'max-age=30',
        }),
      )
    } catch (err) {
      return s3PutErrorResponse(err)
    }
    return response(200, { ok: true })
  }

  if (isSaveAbout) {
    const token = bearerToken(event)
    if (!token || !verifyJwt(token, sessionSecret)) {
      return response(401, { error: 'Unauthorized' })
    }
    let body
    try {
      body = JSON.parse(parseBody(event))
    } catch {
      return response(400, { error: 'Invalid JSON' })
    }
    if (!validateAboutDoc(body)) {
      return response(400, {
        error:
          'Invalid about content (header, main text, list intro, and 1–12 items with non-empty title and body; see length limits).',
      })
    }
    const bucket = process.env.CMS_S3_BUCKET ?? ''
    const key = process.env.CMS_S3_ABOUT_KEY || 'about-content.json'
    if (!bucket) {
      return response(500, { error: 'CMS_S3_BUCKET not set' })
    }
    const version = Math.max(1, Math.floor(body.version))
    const pageHeader = String(body.pageHeader).trim()
    const mainText = String(body.mainText).trim()
    const listIntro = String(body.listIntro).trim()
    const items = body.items.map((it) => ({
      title: String(it.title).trim(),
      body: String(it.body).trim(),
    }))
    const payload = JSON.stringify({ version, pageHeader, mainText, listIntro, items }, null, 2)
    try {
      await s3.send(
        new PutObjectCommand({
          Bucket: bucket,
          Key: key,
          Body: payload,
          ContentType: 'application/json; charset=utf-8',
          CacheControl: 'max-age=30',
        }),
      )
    } catch (err) {
      return s3PutErrorResponse(err)
    }
    return response(200, { ok: true })
  }

  if (isSaveMedia) {
    const token = bearerToken(event)
    if (!token || !verifyJwt(token, sessionSecret)) {
      return response(401, { error: 'Unauthorized' })
    }
    let body
    try {
      body = JSON.parse(parseBody(event))
    } catch {
      return response(400, { error: 'Invalid JSON' })
    }
    if (!validateMediaDoc(body)) {
      return response(400, {
        error:
          'Invalid media content (see length limits; all text fields trimmed non-empty except rate sublabels may be blank).',
      })
    }
    const bucket = process.env.CMS_S3_BUCKET ?? ''
    const key = process.env.CMS_S3_MEDIA_KEY || 'media-content.json'
    if (!bucket) {
      return response(500, { error: 'CMS_S3_BUCKET not set' })
    }
    const version = Math.max(1, Math.floor(body.version))
    const pageHeader = String(body.pageHeader).trim()
    const introText = String(body.introText).trim()
    const collaborativeTitle = String(body.collaborativeTitle).trim()
    const collaborativeBody = String(body.collaborativeBody).trim()
    const whyDifferentTitle = String(body.whyDifferentTitle).trim()
    const whyDifferentPillars = body.whyDifferentPillars.map((p) => ({
      title: String(p.title).trim(),
      body: String(p.body).trim(),
    }))
    const ratesTitle = String(body.ratesTitle).trim()
    const ratesNote = String(body.ratesNote).trim()
    const rates = body.rates.map((r) => ({
      label: String(r.label).trim(),
      sublabel: String(r.sublabel ?? '').trim(),
      price: String(r.price).trim(),
    }))
    const clientsTitle = String(body.clientsTitle).trim()
    const clientGroups = body.clientGroups.map((c) => ({
      title: String(c.title).trim(),
      body: String(c.body).trim(),
    }))
    const selectedWorkTitle = String(body.selectedWorkTitle).trim()
    const selectedWorkBody = String(body.selectedWorkBody).trim()
    const selectedWorkFootnote = String(body.selectedWorkFootnote ?? '').trim()
    const payload = JSON.stringify(
      {
        version,
        pageHeader,
        introText,
        collaborativeTitle,
        collaborativeBody,
        whyDifferentTitle,
        whyDifferentPillars,
        ratesTitle,
        ratesNote,
        rates,
        clientsTitle,
        clientGroups,
        selectedWorkTitle,
        selectedWorkBody,
        selectedWorkFootnote,
      },
      null,
      2,
    )
    try {
      await s3.send(
        new PutObjectCommand({
          Bucket: bucket,
          Key: key,
          Body: payload,
          ContentType: 'application/json; charset=utf-8',
          CacheControl: 'max-age=30',
        }),
      )
    } catch (err) {
      return s3PutErrorResponse(err)
    }
    return response(200, { ok: true })
  }

  if (isSaveBridal) {
    const token = bearerToken(event)
    if (!token || !verifyJwt(token, sessionSecret)) {
      return response(401, { error: 'Unauthorized' })
    }
    let body
    try {
      body = JSON.parse(parseBody(event))
    } catch {
      return response(400, { error: 'Invalid JSON' })
    }
    const bridalErr = validateBridalDocReason(body)
    if (bridalErr) {
      return response(400, { error: `Invalid bridal content: ${bridalErr}` })
    }
    const bucket = process.env.CMS_S3_BUCKET ?? ''
    const key = process.env.CMS_S3_BRIDAL_KEY || 'bridal-content.json'
    if (!bucket) {
      return response(500, { error: 'CMS_S3_BUCKET not set' })
    }
    const version = Math.max(1, Math.floor(body.version))
    const payload = JSON.stringify(
      {
        version,
        overview: normalizeBridalOverviewOut(body.overview),
        services: normalizeBridalServicesOut(body.services),
        pittsburgh: normalizeBridalRegionalOut(body.pittsburgh),
        atlanta: normalizeBridalRegionalOut(body.atlanta),
      },
      null,
      2,
    )
    try {
      await s3.send(
        new PutObjectCommand({
          Bucket: bucket,
          Key: key,
          Body: payload,
          ContentType: 'application/json; charset=utf-8',
          CacheControl: 'max-age=30',
        }),
      )
    } catch (err) {
      return s3PutErrorResponse(err)
    }
    return response(200, { ok: true })
  }

  if (isSavePages) {
    const token = bearerToken(event)
    if (!token || !verifyJwt(token, sessionSecret)) {
      return response(401, { error: 'Unauthorized' })
    }
    let body
    try {
      body = JSON.parse(parseBody(event))
    } catch {
      return response(400, { error: 'Invalid JSON' })
    }
    if (!validatePagesDoc(body)) {
      return response(400, {
        error:
          'Invalid pages content (beauty, classes, creativeFx, faq; see length limits on the server).',
      })
    }
    const bucket = process.env.CMS_S3_BUCKET ?? ''
    const key = process.env.CMS_S3_PAGES_KEY || 'pages-content.json'
    if (!bucket) {
      return response(500, { error: 'CMS_S3_BUCKET not set' })
    }
    const version = Math.max(1, Math.floor(body.version))
    const payload = JSON.stringify(
      {
        version,
        beauty: normalizePagesBeautyOut(body.beauty),
        classes: normalizePagesClassesOut(body.classes),
        creativeFx: normalizePagesCreativeFxOut(body.creativeFx),
        faq: normalizePagesFaqOut(body.faq),
      },
      null,
      2,
    )
    try {
      await s3.send(
        new PutObjectCommand({
          Bucket: bucket,
          Key: key,
          Body: payload,
          ContentType: 'application/json; charset=utf-8',
          CacheControl: 'max-age=30',
        }),
      )
    } catch (err) {
      return s3PutErrorResponse(err)
    }
    return response(200, { ok: true })
  }

  return response(404, { error: 'Not found' })
}
