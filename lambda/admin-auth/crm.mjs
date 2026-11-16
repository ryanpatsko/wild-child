/**
 * Client intake CRM (DynamoDB single-table).
 *
 * Env: CRM_TABLE_NAME — optional, default wild-child-crm
 *
 * Table keys: PK (S), SK (S). GSI "GSI1" with GSI1PK (S) / GSI1SK (S), projection ALL.
 *   CLIENT#<email>  PROFILE               client profile; GSI1PK=CLIENT, GSI1SK=lastSubmittedAt
 *   CLIENT#<email>  SUB#<iso>#<rand>      one contact-form submission
 *   CLIENT#<email>  PROPOSAL#<id>         one contract proposal
 *   CATALOG         CATALOG               service + expense price list and proposal defaults
 *   INVOICE#<id>    INVOICE               one invoice (not tied to a client); GSI1PK=INVOICE, GSI1SK=createdAt
 *   INVOICE_CATALOG INVOICE_CATALOG       invoice services & fees (separate from the proposal catalog)
 *   INVOICE_COUNTER INVOICE_COUNTER       next invoice number
 *
 * Routes (all admin routes require Bearer JWT):
 *   POST   /contact-submissions                         public
 *   GET    /crm/clients
 *   GET    /crm/clients/{email}
 *   PUT    /crm/clients/{email}                          { displayName, notes }
 *   DELETE /crm/clients/{email}
 *   GET    /crm/catalog
 *   PUT    /crm/catalog
 *   POST   /crm/clients/{email}/proposals                proposal body
 *   PUT    /crm/clients/{email}/proposals/{id}           proposal body
 *   DELETE /crm/clients/{email}/proposals/{id}
 *   PUT    /crm/clients/{email}/proposals/{id}/status    { final: boolean }
 *   POST   /crm/clients/{email}/proposals/{id}/downloads
 *   GET    /crm/invoices
 *   POST   /crm/invoices                                 invoice body (blank invoiceNumber is assigned)
 *   GET    /crm/invoices/{id}
 *   PUT    /crm/invoices/{id}                            invoice body
 *   DELETE /crm/invoices/{id}
 *   PUT    /crm/invoices/{id}/dates                      { sentAt?, paidAt? } YYYY-MM-DD or null
 *   POST   /crm/invoices/{id}/downloads                  { sentOn?: YYYY-MM-DD }
 *   GET    /crm/invoice-catalog
 *   PUT    /crm/invoice-catalog
 */

import { randomUUID } from 'node:crypto'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import {
  BatchWriteCommand,
  DeleteCommand,
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  QueryCommand,
  UpdateCommand,
} from '@aws-sdk/lib-dynamodb'

const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}), {
  marshallOptions: { removeUndefinedValues: true },
})

const EMAIL_MAX = 254
const SUB_FIELD_MAX = 300
const SUB_MESSAGE_MAX = 5000
const DISPLAY_NAME_MAX = 200
const NOTES_MAX = 20000
const NAME_MAX = 200
const DETAIL_MAX = 500
const UNIT_LABEL_MAX = 40
const MAX_SERVICES = 100
const MAX_EXPENSES = 50
const MAX_PROPOSAL_LINES = 40
const MAX_QTY = 999
const MAX_CENTS = 10_000_000
const MAX_DOWNLOADS_KEPT = 200
const TEXT_MAX = 8000
const SHORT_TEXT_MAX = 300

const SUBMISSION_FIELDS = [
  'firstName',
  'lastName',
  'email',
  'phone',
  'eventDate',
  'eventYear',
  'eventType',
  'serviceType',
  'attendees',
  'location',
  'eventVenue',
  'bestApplies',
  'brochureFollowUp',
  'bridalPricingReviewed',
  'mostImportant',
  'message',
  'howDidYouHear',
]

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function tableName() {
  return process.env.CRM_TABLE_NAME || 'wild-child-crm'
}

function json(statusCode, bodyObj) {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify(bodyObj),
  }
}

function readJson(event) {
  if (!event.body) return {}
  let raw = event.body
  if (event.isBase64Encoded) raw = Buffer.from(raw, 'base64').toString('utf8')
  return JSON.parse(raw)
}

function normalizeEmail(raw) {
  const email = String(raw ?? '').trim().toLowerCase()
  if (!email || email.length > EMAIL_MAX || !EMAIL_RE.test(email)) return null
  return email
}

function clientPk(email) {
  return `CLIENT#${email}`
}

function str(v, max) {
  return String(v ?? '').trim().slice(0, max)
}

function cents(v) {
  const n = Math.round(Number(v))
  if (!Number.isFinite(n) || n < 0 || n > MAX_CENTS) return null
  return n
}

/** Expense rates may carry a tenth of a cent (e.g. $0.725/mile is 72.5). */
function rateCents(v) {
  const n = Math.round(Number(v) * 10) / 10
  if (!Number.isFinite(n) || n < 0 || n > MAX_CENTS) return null
  return n
}

function qty(v) {
  const n = Math.floor(Number(v))
  if (!Number.isFinite(n) || n < 0 || n > MAX_QTY) return null
  return n
}

function dbErrorResponse(err) {
  console.error('DynamoDB call failed', err)
  const name = err?.name ?? ''
  if (name === 'ResourceNotFoundException') {
    return json(500, { error: `DynamoDB table not found. Check CRM_TABLE_NAME (currently ${tableName()}).` })
  }
  if (name === 'AccessDeniedException') {
    return json(500, { error: 'DynamoDB access denied. Check the Lambda execution role policy for the CRM table.' })
  }
  return json(500, { error: 'Database request failed. Open CloudWatch logs for details.' })
}

async function queryAll(params) {
  const items = []
  let ExclusiveStartKey
  do {
    const out = await ddb.send(new QueryCommand({ ...params, ExclusiveStartKey }))
    items.push(...(out.Items ?? []))
    ExclusiveStartKey = out.LastEvaluatedKey
  } while (ExclusiveStartKey)
  return items
}

/* ---------- route matching ---------- */

function matchRoute(method, path) {
  const trimmed = path.replace(/\/+$/, '')
  if (method === 'POST' && trimmed.endsWith('/contact-submissions')) return { name: 'submit' }

  const idx = trimmed.indexOf('/crm/')
  if (idx === -1) return null
  const parts = trimmed
    .slice(idx + '/crm/'.length)
    .split('/')
    .map((p) => {
      try {
        return decodeURIComponent(p)
      } catch {
        return p
      }
    })

  if (parts[0] === 'catalog' && parts.length === 1) {
    if (method === 'GET') return { name: 'getCatalog' }
    if (method === 'PUT') return { name: 'putCatalog' }
    return null
  }
  if (parts[0] === 'invoice-catalog' && parts.length === 1) {
    if (method === 'GET') return { name: 'getInvoiceCatalog' }
    if (method === 'PUT') return { name: 'putInvoiceCatalog' }
    return null
  }
  if (parts[0] === 'invoices') {
    if (parts.length === 1 && method === 'GET') return { name: 'listInvoices' }
    if (parts.length === 1 && method === 'POST') return { name: 'createInvoice' }
    if (parts.length < 2) return null
    const invoiceId = parts[1]
    if (parts.length === 2) {
      if (method === 'GET') return { name: 'getInvoice', invoiceId }
      if (method === 'PUT') return { name: 'updateInvoice', invoiceId }
      if (method === 'DELETE') return { name: 'deleteInvoice', invoiceId }
      return null
    }
    if (parts.length === 3 && parts[2] === 'dates' && method === 'PUT') {
      return { name: 'setInvoiceDates', invoiceId }
    }
    if (parts.length === 3 && parts[2] === 'downloads' && method === 'POST') {
      return { name: 'recordInvoiceDownload', invoiceId }
    }
    return null
  }
  if (parts[0] !== 'clients') return null
  if (parts.length === 1 && method === 'GET') return { name: 'listClients' }
  const email = parts[1]
  if (parts.length === 2) {
    if (method === 'GET') return { name: 'getClient', email }
    if (method === 'PUT') return { name: 'putClient', email }
    if (method === 'DELETE') return { name: 'deleteClient', email }
    return null
  }
  if (parts[2] !== 'proposals') return null
  if (parts.length === 3 && method === 'POST') return { name: 'createProposal', email }
  const proposalId = parts[3]
  if (parts.length === 4) {
    if (method === 'PUT') return { name: 'updateProposal', email, proposalId }
    if (method === 'DELETE') return { name: 'deleteProposal', email, proposalId }
    return null
  }
  if (parts.length === 5 && parts[4] === 'status' && method === 'PUT') {
    return { name: 'setProposalStatus', email, proposalId }
  }
  if (parts.length === 5 && parts[4] === 'downloads' && method === 'POST') {
    return { name: 'recordDownload', email, proposalId }
  }
  return null
}

/* ---------- public: contact form ---------- */

async function handleSubmit(event) {
  let body
  try {
    body = readJson(event)
  } catch {
    return json(400, { error: 'Invalid JSON' })
  }
  if (typeof body.website === 'string' && body.website.trim() !== '') {
    return json(200, { ok: true })
  }
  const email = normalizeEmail(body.email)
  if (!email) return json(400, { error: 'A valid email is required.' })

  const fields = {}
  for (const key of SUBMISSION_FIELDS) {
    fields[key] = str(body[key], key === 'message' ? SUB_MESSAGE_MAX : SUB_FIELD_MAX)
  }
  fields.email = email
  if (!fields.firstName && !fields.lastName) return json(400, { error: 'Name is required.' })

  const now = new Date().toISOString()
  const submissionSk = `SUB#${now}#${randomUUID().slice(0, 8)}`
  const latest = {
    submittedAt: now,
    firstName: fields.firstName,
    lastName: fields.lastName,
    phone: fields.phone,
    eventDate: fields.eventDate,
    eventYear: fields.eventYear,
    eventType: fields.eventType,
    location: fields.location,
    eventVenue: fields.eventVenue,
  }

  try {
    await ddb.send(
      new PutCommand({
        TableName: tableName(),
        Item: { PK: clientPk(email), SK: submissionSk, type: 'submission', submittedAt: now, ...fields },
      }),
    )
    await ddb.send(
      new UpdateCommand({
        TableName: tableName(),
        Key: { PK: clientPk(email), SK: 'PROFILE' },
        UpdateExpression:
          'SET #type = :type, email = :email, lastSubmittedAt = :now, latestSubmission = :latest, ' +
          'GSI1PK = :gsiPk, GSI1SK = :now, firstSubmittedAt = if_not_exists(firstSubmittedAt, :now), ' +
          'displayName = if_not_exists(displayName, :emptyStr), notes = if_not_exists(notes, :emptyStr), ' +
          'proposalCount = if_not_exists(proposalCount, :zero) ' +
          'ADD submissionCount :one',
        ExpressionAttributeNames: { '#type': 'type' },
        ExpressionAttributeValues: {
          ':type': 'client',
          ':email': email,
          ':now': now,
          ':latest': latest,
          ':gsiPk': 'CLIENT',
          ':emptyStr': '',
          ':zero': 0,
          ':one': 1,
        },
      }),
    )
  } catch (err) {
    return dbErrorResponse(err)
  }
  return json(200, { ok: true })
}

/* ---------- clients ---------- */

function clientSummaryOut(item) {
  return {
    email: item.email,
    displayName: item.displayName ?? '',
    notes: item.notes ?? '',
    firstSubmittedAt: item.firstSubmittedAt ?? null,
    lastSubmittedAt: item.lastSubmittedAt ?? null,
    submissionCount: item.submissionCount ?? 0,
    latestSubmission: item.latestSubmission ?? null,
    proposalCount: item.proposalCount ?? 0,
    latestFinalizedAt: item.latestFinalizedAt ?? null,
    latestDownloadedAt: item.latestDownloadedAt ?? null,
  }
}

function stripKeys(item) {
  const { PK, SK, GSI1PK, GSI1SK, type, ...rest } = item
  return rest
}

async function listClients() {
  const items = await queryAll({
    TableName: tableName(),
    IndexName: 'GSI1',
    KeyConditionExpression: 'GSI1PK = :pk',
    ExpressionAttributeValues: { ':pk': 'CLIENT' },
    ScanIndexForward: false,
  })
  return json(200, { clients: items.map(clientSummaryOut) })
}

async function getClient(email) {
  const items = await queryAll({
    TableName: tableName(),
    KeyConditionExpression: 'PK = :pk',
    ExpressionAttributeValues: { ':pk': clientPk(email) },
  })
  const profile = items.find((it) => it.SK === 'PROFILE')
  if (!profile) return json(404, { error: 'Client not found' })
  const submissions = items
    .filter((it) => it.SK.startsWith('SUB#'))
    .map(stripKeys)
    .sort((a, b) => String(b.submittedAt).localeCompare(String(a.submittedAt)))
  const proposals = items
    .filter((it) => it.SK.startsWith('PROPOSAL#'))
    .map(stripKeys)
    .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)))
  return json(200, { client: clientSummaryOut(profile), submissions, proposals })
}

async function putClient(event, email) {
  let body
  try {
    body = readJson(event)
  } catch {
    return json(400, { error: 'Invalid JSON' })
  }
  if (typeof body.displayName !== 'string' || body.displayName.length > DISPLAY_NAME_MAX) {
    return json(400, { error: `displayName must be a string up to ${DISPLAY_NAME_MAX} characters.` })
  }
  if (typeof body.notes !== 'string' || body.notes.length > NOTES_MAX) {
    return json(400, { error: `notes must be a string up to ${NOTES_MAX} characters.` })
  }
  try {
    await ddb.send(
      new UpdateCommand({
        TableName: tableName(),
        Key: { PK: clientPk(email), SK: 'PROFILE' },
        UpdateExpression: 'SET displayName = :d, notes = :n, profileUpdatedAt = :now',
        ConditionExpression: 'attribute_exists(PK)',
        ExpressionAttributeValues: {
          ':d': body.displayName.trim(),
          ':n': body.notes,
          ':now': new Date().toISOString(),
        },
      }),
    )
  } catch (err) {
    if (err?.name === 'ConditionalCheckFailedException') return json(404, { error: 'Client not found' })
    throw err
  }
  return json(200, { ok: true })
}

async function deleteClient(email) {
  const items = await queryAll({
    TableName: tableName(),
    KeyConditionExpression: 'PK = :pk',
    ExpressionAttributeValues: { ':pk': clientPk(email) },
    ProjectionExpression: 'PK, SK',
  })
  for (let i = 0; i < items.length; i += 25) {
    const chunk = items.slice(i, i + 25)
    let requestItems = {
      [tableName()]: chunk.map((it) => ({ DeleteRequest: { Key: { PK: it.PK, SK: it.SK } } })),
    }
    for (let attempt = 0; attempt < 5 && requestItems; attempt++) {
      const out = await ddb.send(new BatchWriteCommand({ RequestItems: requestItems }))
      const unprocessed = out.UnprocessedItems?.[tableName()]
      requestItems = unprocessed?.length ? { [tableName()]: unprocessed } : null
    }
  }
  return json(200, { ok: true })
}

/* ---------- catalog ---------- */

const DEFAULT_CATALOG = {
  version: 1,
  services: [],
  expenses: [],
  defaults: {
    gratuityPercent: 20,
    depositCents: 17500,
    balanceDueDaysBefore: 60,
    regionLabel: 'PGH / ATL / NOLA',
    priceMayVaryNote: '',
    notes: '',
    footerText: 'wildchild-makeup.com  ·  clema.fx@gmail.com  ·  724.766.6364',
  },
}

function validateCatalog(body) {
  if (!body || typeof body !== 'object') return { error: 'Catalog must be an object.' }
  if (!Array.isArray(body.services) || body.services.length > MAX_SERVICES) {
    return { error: `services must be an array of up to ${MAX_SERVICES}.` }
  }
  if (!Array.isArray(body.expenses) || body.expenses.length > MAX_EXPENSES) {
    return { error: `expenses must be an array of up to ${MAX_EXPENSES}.` }
  }
  const services = []
  for (const [i, s] of body.services.entries()) {
    const name = str(s?.name, NAME_MAX)
    const priceCents = cents(s?.priceCents)
    if (!name) return { error: `services[${i}]: name is required.` }
    if (priceCents === null) return { error: `services[${i}]: price is invalid.` }
    services.push({
      id: str(s.id, 64) || randomUUID(),
      name,
      priceCents,
      priceMayVary: s.priceMayVary === true,
      archived: s.archived === true,
    })
  }
  const expenses = []
  for (const [i, e] of body.expenses.entries()) {
    const name = str(e?.name, NAME_MAX)
    const priceCents = rateCents(e?.priceCents)
    if (!name) return { error: `expenses[${i}]: name is required.` }
    if (priceCents === null) return { error: `expenses[${i}]: price is invalid.` }
    expenses.push({
      id: str(e.id, 64) || randomUUID(),
      name,
      priceCents,
      mode: e.mode === 'perUnit' ? 'perUnit' : 'flat',
      unitLabel: str(e.unitLabel, UNIT_LABEL_MAX),
      detail: str(e.detail, DETAIL_MAX),
      ifApplicable: e.ifApplicable === true,
      autoAdd: e.autoAdd === true,
      archived: e.archived === true,
    })
  }
  const d = body.defaults ?? {}
  const gratuityPercent = Number(d.gratuityPercent)
  const depositCents = cents(d.depositCents)
  const balanceDueDaysBefore = qty(d.balanceDueDaysBefore)
  if (!Number.isFinite(gratuityPercent) || gratuityPercent < 0 || gratuityPercent > 100) {
    return { error: 'defaults.gratuityPercent must be 0–100.' }
  }
  if (depositCents === null) return { error: 'defaults.depositCents is invalid.' }
  if (balanceDueDaysBefore === null) return { error: 'defaults.balanceDueDaysBefore is invalid.' }
  return {
    doc: {
      version: Math.max(1, Math.floor(Number(body.version) || 1)),
      services,
      expenses,
      defaults: {
        gratuityPercent,
        depositCents,
        balanceDueDaysBefore,
        regionLabel: str(d.regionLabel, SHORT_TEXT_MAX),
        priceMayVaryNote: str(d.priceMayVaryNote, TEXT_MAX),
        notes: String(d.notes ?? '').slice(0, TEXT_MAX),
        footerText: str(d.footerText, SHORT_TEXT_MAX),
      },
    },
  }
}

async function getCatalog() {
  const out = await ddb.send(new GetCommand({ TableName: tableName(), Key: { PK: 'CATALOG', SK: 'CATALOG' } }))
  if (!out.Item) return json(200, { catalog: DEFAULT_CATALOG })
  return json(200, { catalog: stripKeys(out.Item) })
}

async function putCatalog(event) {
  let body
  try {
    body = readJson(event)
  } catch {
    return json(400, { error: 'Invalid JSON' })
  }
  const { doc, error } = validateCatalog(body)
  if (error) return json(400, { error })
  await ddb.send(
    new PutCommand({
      TableName: tableName(),
      Item: { PK: 'CATALOG', SK: 'CATALOG', type: 'catalog', ...doc, updatedAt: new Date().toISOString() },
    }),
  )
  return json(200, { catalog: doc })
}

/* ---------- proposals ---------- */

function validateProposal(body) {
  if (!body || typeof body !== 'object') return { error: 'Proposal must be an object.' }
  if (!Array.isArray(body.services) || body.services.length > MAX_PROPOSAL_LINES) {
    return { error: `services must be an array of up to ${MAX_PROPOSAL_LINES}.` }
  }
  if (!Array.isArray(body.expenses) || body.expenses.length > MAX_PROPOSAL_LINES) {
    return { error: `expenses must be an array of up to ${MAX_PROPOSAL_LINES}.` }
  }
  const services = []
  for (const [i, s] of body.services.entries()) {
    const name = str(s?.name, NAME_MAX)
    const unitPriceCents = cents(s?.unitPriceCents)
    const quantity = qty(s?.quantity)
    if (!name) return { error: `Service line ${i + 1}: name is required.` }
    if (unitPriceCents === null) return { error: `Service line ${i + 1}: price is invalid.` }
    if (quantity === null) return { error: `Service line ${i + 1}: quantity is invalid.` }
    services.push({
      serviceId: str(s.serviceId, 64),
      name,
      unitPriceCents,
      quantity,
      priceMayVary: s.priceMayVary === true,
    })
  }
  const expenses = []
  for (const [i, e] of body.expenses.entries()) {
    const name = str(e?.name, NAME_MAX)
    const unitPriceCents = rateCents(e?.unitPriceCents)
    const quantity = qty(e?.quantity)
    if (!name) return { error: `Expense line ${i + 1}: name is required.` }
    if (unitPriceCents === null) return { error: `Expense line ${i + 1}: price is invalid.` }
    if (quantity === null) return { error: `Expense line ${i + 1}: quantity is invalid.` }
    expenses.push({
      expenseId: str(e.expenseId, 64),
      name,
      unitPriceCents,
      quantity,
      mode: e.mode === 'perUnit' ? 'perUnit' : 'flat',
      unitLabel: str(e.unitLabel, UNIT_LABEL_MAX),
      detail: str(e.detail, DETAIL_MAX),
      ifApplicable: e.ifApplicable === true,
    })
  }
  const gratuityPercent = Number(body.gratuityPercent)
  if (!Number.isFinite(gratuityPercent) || gratuityPercent < 0 || gratuityPercent > 100) {
    return { error: 'Gratuity percent must be 0–100.' }
  }
  const depositCents = cents(body.depositCents)
  if (depositCents === null) return { error: 'Deposit amount is invalid.' }
  const balanceDueDaysBefore = qty(body.balanceDueDaysBefore)
  if (balanceDueDaysBefore === null) return { error: 'Balance due days is invalid.' }
  return {
    content: {
      title: str(body.title, NAME_MAX),
      clientName: str(body.clientName, NAME_MAX),
      eventDate: str(body.eventDate, SHORT_TEXT_MAX),
      regionLabel: str(body.regionLabel, SHORT_TEXT_MAX),
      venue: str(body.venue, SHORT_TEXT_MAX),
      services,
      gratuityPercent,
      expenses,
      depositCents,
      balanceDueDaysBefore,
      priceMayVaryNote: str(body.priceMayVaryNote, TEXT_MAX),
      notes: String(body.notes ?? '').slice(0, TEXT_MAX),
    },
  }
}

const PROPOSAL_CONTENT_KEYS = [
  'title',
  'clientName',
  'eventDate',
  'regionLabel',
  'venue',
  'services',
  'gratuityPercent',
  'expenses',
  'depositCents',
  'balanceDueDaysBefore',
  'priceMayVaryNote',
  'notes',
]

/** Keeps the grid's "finalized" / "downloaded" columns in sync with the client's proposals. */
async function refreshClientProposalSummary(email) {
  const proposals = await queryAll({
    TableName: tableName(),
    KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
    ExpressionAttributeValues: { ':pk': clientPk(email), ':sk': 'PROPOSAL#' },
    ProjectionExpression: 'finalizedAt, downloads',
  })
  let latestFinalizedAt = null
  let latestDownloadedAt = null
  for (const p of proposals) {
    if (p.finalizedAt && (!latestFinalizedAt || p.finalizedAt > latestFinalizedAt)) latestFinalizedAt = p.finalizedAt
    for (const d of p.downloads ?? []) {
      if (!latestDownloadedAt || d > latestDownloadedAt) latestDownloadedAt = d
    }
  }
  await ddb.send(
    new UpdateCommand({
      TableName: tableName(),
      Key: { PK: clientPk(email), SK: 'PROFILE' },
      UpdateExpression: 'SET proposalCount = :c, latestFinalizedAt = :f, latestDownloadedAt = :d',
      ConditionExpression: 'attribute_exists(PK)',
      ExpressionAttributeValues: {
        ':c': proposals.length,
        ':f': latestFinalizedAt,
        ':d': latestDownloadedAt,
      },
    }),
  )
}

async function createProposal(event, email) {
  let body
  try {
    body = readJson(event)
  } catch {
    return json(400, { error: 'Invalid JSON' })
  }
  const { content, error } = validateProposal(body)
  if (error) return json(400, { error })
  const profile = await ddb.send(
    new GetCommand({ TableName: tableName(), Key: { PK: clientPk(email), SK: 'PROFILE' } }),
  )
  if (!profile.Item) return json(404, { error: 'Client not found' })
  const now = new Date().toISOString()
  const id = `${Date.now().toString(36)}-${randomUUID().slice(0, 8)}`
  const proposal = { id, ...content, createdAt: now, updatedAt: now, finalizedAt: null, downloads: [] }
  await ddb.send(
    new PutCommand({
      TableName: tableName(),
      Item: { PK: clientPk(email), SK: `PROPOSAL#${id}`, type: 'proposal', ...proposal },
    }),
  )
  await refreshClientProposalSummary(email)
  return json(200, { proposal })
}

async function updateProposal(event, email, proposalId) {
  let body
  try {
    body = readJson(event)
  } catch {
    return json(400, { error: 'Invalid JSON' })
  }
  const { content, error } = validateProposal(body)
  if (error) return json(400, { error })
  const names = {}
  const values = { ':now': new Date().toISOString() }
  const sets = ['updatedAt = :now']
  for (const key of PROPOSAL_CONTENT_KEYS) {
    names[`#${key}`] = key
    values[`:${key}`] = content[key]
    sets.push(`#${key} = :${key}`)
  }
  try {
    const out = await ddb.send(
      new UpdateCommand({
        TableName: tableName(),
        Key: { PK: clientPk(email), SK: `PROPOSAL#${proposalId}` },
        UpdateExpression: `SET ${sets.join(', ')}`,
        ConditionExpression: 'attribute_exists(PK)',
        ExpressionAttributeNames: names,
        ExpressionAttributeValues: values,
        ReturnValues: 'ALL_NEW',
      }),
    )
    return json(200, { proposal: stripKeys(out.Attributes) })
  } catch (err) {
    if (err?.name === 'ConditionalCheckFailedException') return json(404, { error: 'Proposal not found' })
    throw err
  }
}

async function deleteProposal(email, proposalId) {
  await ddb.send(
    new DeleteCommand({ TableName: tableName(), Key: { PK: clientPk(email), SK: `PROPOSAL#${proposalId}` } }),
  )
  await refreshClientProposalSummary(email)
  return json(200, { ok: true })
}

async function setProposalStatus(event, email, proposalId) {
  let body
  try {
    body = readJson(event)
  } catch {
    return json(400, { error: 'Invalid JSON' })
  }
  if (typeof body.final !== 'boolean') return json(400, { error: 'final must be a boolean.' })
  try {
    const out = await ddb.send(
      new UpdateCommand({
        TableName: tableName(),
        Key: { PK: clientPk(email), SK: `PROPOSAL#${proposalId}` },
        UpdateExpression: 'SET finalizedAt = :f',
        ConditionExpression: 'attribute_exists(PK)',
        ExpressionAttributeValues: { ':f': body.final ? new Date().toISOString() : null },
        ReturnValues: 'ALL_NEW',
      }),
    )
    await refreshClientProposalSummary(email)
    return json(200, { proposal: stripKeys(out.Attributes) })
  } catch (err) {
    if (err?.name === 'ConditionalCheckFailedException') return json(404, { error: 'Proposal not found' })
    throw err
  }
}

async function recordDownload(email, proposalId) {
  const key = { PK: clientPk(email), SK: `PROPOSAL#${proposalId}` }
  try {
    const out = await ddb.send(
      new UpdateCommand({
        TableName: tableName(),
        Key: key,
        UpdateExpression: 'SET downloads = list_append(if_not_exists(downloads, :empty), :d)',
        ConditionExpression: 'attribute_exists(PK)',
        ExpressionAttributeValues: { ':empty': [], ':d': [new Date().toISOString()] },
        ReturnValues: 'ALL_NEW',
      }),
    )
    let proposal = stripKeys(out.Attributes)
    if (proposal.downloads.length > MAX_DOWNLOADS_KEPT) {
      const trimmed = await ddb.send(
        new UpdateCommand({
          TableName: tableName(),
          Key: key,
          UpdateExpression: 'SET downloads = :d',
          ExpressionAttributeValues: { ':d': proposal.downloads.slice(-MAX_DOWNLOADS_KEPT) },
          ReturnValues: 'ALL_NEW',
        }),
      )
      proposal = stripKeys(trimmed.Attributes)
    }
    await refreshClientProposalSummary(email)
    return json(200, { proposal })
  } catch (err) {
    if (err?.name === 'ConditionalCheckFailedException') return json(404, { error: 'Proposal not found' })
    throw err
  }
}

/* ---------- invoices ---------- */

const INVOICE_NUMBER_MAX = 40

const DEFAULT_INVOICE_CATALOG = {
  version: 1,
  services: [],
  expenses: [],
  defaults: {
    gratuityPercent: 0,
    taxPercent: 0,
    paymentTerms: 'Due upon receipt',
    documentTitle: 'Hair + Makeup Invoice',
    priceMayVaryNote: '',
    notes: '',
    paymentInstructions: 'Please include the invoice number with your payment.',
    footerText: 'wildchild-makeup.com  ·  clema.fx@gmail.com  ·  724.766.6364',
  },
}

function invoiceKey(id) {
  return { PK: `INVOICE#${id}`, SK: 'INVOICE' }
}

function badInvoiceId(id) {
  if (!/^[A-Za-z0-9_-]{1,80}$/.test(String(id ?? ''))) return json(400, { error: 'Invalid invoice id.' })
  return null
}

function percentValue(v) {
  const n = Math.round(Number(v) * 1000) / 1000
  if (!Number.isFinite(n) || n < 0 || n > 100) return null
  return n
}

/** YYYY-MM-DD, empty, or null. `error` is a message; `value` is the stored date or null. */
function isoDateOrNull(v) {
  if (v === null || v === '') return { value: null }
  if (typeof v !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(v)) return { error: 'Use a YYYY-MM-DD date.' }
  const y = Number(v.slice(0, 4))
  const m = Number(v.slice(5, 7))
  const d = Number(v.slice(8, 10))
  const dt = new Date(Date.UTC(y, m - 1, d))
  if (dt.getUTCFullYear() !== y || dt.getUTCMonth() !== m - 1 || dt.getUTCDate() !== d) {
    return { error: 'That date is not a real calendar day.' }
  }
  return { value: v }
}

function expenseLineTotalCents(line) {
  const unit = Number(line.unitPriceCents) || 0
  const raw = line.mode === 'perUnit' ? unit * (Number(line.quantity) || 0) : unit
  return Math.round(raw)
}

function invoiceTotalCents(content) {
  const servicesTotal = content.services.reduce((sum, l) => sum + l.unitPriceCents * l.quantity, 0)
  const gratuity = Math.round((servicesTotal * content.gratuityPercent) / 100)
  const expenses = content.expenses
    .filter((l) => !l.ifApplicable)
    .reduce((sum, l) => sum + expenseLineTotalCents(l), 0)
  const subtotal = servicesTotal + gratuity + expenses
  return subtotal + Math.round((subtotal * content.taxPercent) / 100)
}

function validateInvoice(body, { requireNumber = false } = {}) {
  if (!body || typeof body !== 'object') return { error: 'Invoice must be an object.' }
  if (!Array.isArray(body.services) || body.services.length > MAX_PROPOSAL_LINES) {
    return { error: `services must be an array of up to ${MAX_PROPOSAL_LINES}.` }
  }
  if (!Array.isArray(body.expenses) || body.expenses.length > MAX_PROPOSAL_LINES) {
    return { error: `expenses must be an array of up to ${MAX_PROPOSAL_LINES}.` }
  }
  const services = []
  for (const [i, s] of body.services.entries()) {
    const name = str(s?.name, NAME_MAX)
    const unitPriceCents = cents(s?.unitPriceCents)
    const quantity = qty(s?.quantity)
    if (!name) return { error: `Service line ${i + 1}: name is required.` }
    if (unitPriceCents === null) return { error: `Service line ${i + 1}: price is invalid.` }
    if (quantity === null) return { error: `Service line ${i + 1}: quantity is invalid.` }
    services.push({
      serviceId: str(s.serviceId, 64),
      name,
      unitPriceCents,
      quantity,
      priceMayVary: s.priceMayVary === true,
    })
  }
  const expenses = []
  for (const [i, e] of body.expenses.entries()) {
    const name = str(e?.name, NAME_MAX)
    const unitPriceCents = rateCents(e?.unitPriceCents)
    const quantity = qty(e?.quantity)
    if (!name) return { error: `Expense line ${i + 1}: name is required.` }
    if (unitPriceCents === null) return { error: `Expense line ${i + 1}: price is invalid.` }
    if (quantity === null) return { error: `Expense line ${i + 1}: quantity is invalid.` }
    expenses.push({
      expenseId: str(e.expenseId, 64),
      name,
      unitPriceCents,
      quantity,
      mode: e.mode === 'perUnit' ? 'perUnit' : 'flat',
      unitLabel: str(e.unitLabel, UNIT_LABEL_MAX),
      detail: str(e.detail, DETAIL_MAX),
      ifApplicable: e.ifApplicable === true,
    })
  }
  const gratuityPercent = percentValue(body.gratuityPercent)
  if (gratuityPercent === null) return { error: 'Gratuity percent must be 0–100.' }
  const taxPercent = percentValue(body.taxPercent)
  if (taxPercent === null) return { error: 'Tax percent must be 0–100.' }
  const amountPaidCents = cents(body.amountPaidCents)
  if (amountPaidCents === null) return { error: 'Amount paid is invalid.' }
  const invoiceNumber = str(body.invoiceNumber, INVOICE_NUMBER_MAX)
  if (requireNumber && !invoiceNumber) return { error: 'Invoice number is required.' }
  const content = {
    invoiceNumber,
    title: str(body.title, NAME_MAX),
    documentTitle: str(body.documentTitle, NAME_MAX),
    billTo: str(body.billTo, NAME_MAX),
    attention: str(body.attention, NAME_MAX),
    email: str(body.email, EMAIL_MAX),
    serviceDate: str(body.serviceDate, SHORT_TEXT_MAX),
    location: str(body.location, SHORT_TEXT_MAX),
    jobName: str(body.jobName, SHORT_TEXT_MAX),
    poNumber: str(body.poNumber, SHORT_TEXT_MAX),
    issuedOn: str(body.issuedOn, SHORT_TEXT_MAX),
    services,
    gratuityPercent,
    taxPercent,
    expenses,
    amountPaidCents,
    paymentTerms: str(body.paymentTerms, SHORT_TEXT_MAX),
    dueDate: str(body.dueDate, SHORT_TEXT_MAX),
    priceMayVaryNote: str(body.priceMayVaryNote, TEXT_MAX),
    notes: String(body.notes ?? '').slice(0, TEXT_MAX),
    paymentInstructions: String(body.paymentInstructions ?? '').slice(0, TEXT_MAX),
  }
  if (amountPaidCents > invoiceTotalCents(content)) {
    return { error: 'Amount paid cannot be more than the invoice total.' }
  }
  return { content }
}

const INVOICE_CONTENT_KEYS = [
  'invoiceNumber',
  'title',
  'documentTitle',
  'billTo',
  'attention',
  'email',
  'serviceDate',
  'location',
  'jobName',
  'poNumber',
  'issuedOn',
  'services',
  'gratuityPercent',
  'taxPercent',
  'expenses',
  'amountPaidCents',
  'paymentTerms',
  'dueDate',
  'priceMayVaryNote',
  'notes',
  'paymentInstructions',
]

function validateInvoiceCatalog(body) {
  if (!body || typeof body !== 'object') return { error: 'Catalog must be an object.' }
  if (!Array.isArray(body.services) || body.services.length > MAX_SERVICES) {
    return { error: `services must be an array of up to ${MAX_SERVICES}.` }
  }
  if (!Array.isArray(body.expenses) || body.expenses.length > MAX_EXPENSES) {
    return { error: `expenses must be an array of up to ${MAX_EXPENSES}.` }
  }
  const services = []
  for (const [i, s] of body.services.entries()) {
    const name = str(s?.name, NAME_MAX)
    const priceCents = cents(s?.priceCents)
    if (!name) return { error: `services[${i}]: name is required.` }
    if (priceCents === null) return { error: `services[${i}]: price is invalid.` }
    services.push({
      id: str(s.id, 64) || randomUUID(),
      name,
      priceCents,
      priceMayVary: s.priceMayVary === true,
      archived: s.archived === true,
    })
  }
  const expenses = []
  for (const [i, e] of body.expenses.entries()) {
    const name = str(e?.name, NAME_MAX)
    const priceCents = rateCents(e?.priceCents)
    if (!name) return { error: `expenses[${i}]: name is required.` }
    if (priceCents === null) return { error: `expenses[${i}]: price is invalid.` }
    expenses.push({
      id: str(e.id, 64) || randomUUID(),
      name,
      priceCents,
      mode: e.mode === 'perUnit' ? 'perUnit' : 'flat',
      unitLabel: str(e.unitLabel, UNIT_LABEL_MAX),
      detail: str(e.detail, DETAIL_MAX),
      ifApplicable: e.ifApplicable === true,
      autoAdd: e.autoAdd === true,
      archived: e.archived === true,
    })
  }
  const d = body.defaults ?? {}
  const gratuityPercent = percentValue(d.gratuityPercent)
  const taxPercent = percentValue(d.taxPercent)
  if (gratuityPercent === null) return { error: 'defaults.gratuityPercent must be 0–100.' }
  if (taxPercent === null) return { error: 'defaults.taxPercent must be 0–100.' }
  return {
    doc: {
      version: Math.max(1, Math.floor(Number(body.version) || 1)),
      services,
      expenses,
      defaults: {
        gratuityPercent,
        taxPercent,
        paymentTerms: str(d.paymentTerms, SHORT_TEXT_MAX),
        documentTitle: str(d.documentTitle, NAME_MAX),
        priceMayVaryNote: str(d.priceMayVaryNote, TEXT_MAX),
        notes: String(d.notes ?? '').slice(0, TEXT_MAX),
        paymentInstructions: String(d.paymentInstructions ?? '').slice(0, TEXT_MAX),
        footerText: str(d.footerText, SHORT_TEXT_MAX),
      },
    },
  }
}

async function getInvoiceCatalog() {
  const out = await ddb.send(
    new GetCommand({ TableName: tableName(), Key: { PK: 'INVOICE_CATALOG', SK: 'INVOICE_CATALOG' } }),
  )
  if (!out.Item) return json(200, { catalog: DEFAULT_INVOICE_CATALOG })
  return json(200, { catalog: stripKeys(out.Item) })
}

async function putInvoiceCatalog(event) {
  let body
  try {
    body = readJson(event)
  } catch {
    return json(400, { error: 'Invalid JSON' })
  }
  const { doc, error } = validateInvoiceCatalog(body)
  if (error) return json(400, { error })
  await ddb.send(
    new PutCommand({
      TableName: tableName(),
      Item: {
        PK: 'INVOICE_CATALOG',
        SK: 'INVOICE_CATALOG',
        type: 'invoiceCatalog',
        ...doc,
        updatedAt: new Date().toISOString(),
      },
    }),
  )
  return json(200, { catalog: doc })
}

async function nextInvoiceNumber() {
  const out = await ddb.send(
    new UpdateCommand({
      TableName: tableName(),
      Key: { PK: 'INVOICE_COUNTER', SK: 'INVOICE_COUNTER' },
      UpdateExpression: 'SET #seq = if_not_exists(#seq, :start) + :one, #type = :type',
      ExpressionAttributeNames: { '#seq': 'seq', '#type': 'type' },
      ExpressionAttributeValues: { ':start': 1000, ':one': 1, ':type': 'invoiceCounter' },
      ReturnValues: 'UPDATED_NEW',
    }),
  )
  return String(out.Attributes.seq)
}

async function listInvoices() {
  const items = await queryAll({
    TableName: tableName(),
    IndexName: 'GSI1',
    KeyConditionExpression: 'GSI1PK = :pk',
    ExpressionAttributeValues: { ':pk': 'INVOICE' },
    ScanIndexForward: false,
  })
  return json(200, { invoices: items.map(stripKeys) })
}

async function getInvoice(invoiceId) {
  const bad = badInvoiceId(invoiceId)
  if (bad) return bad
  const out = await ddb.send(new GetCommand({ TableName: tableName(), Key: invoiceKey(invoiceId) }))
  if (!out.Item) return json(404, { error: 'Invoice not found' })
  return json(200, { invoice: stripKeys(out.Item) })
}

async function createInvoice(event) {
  let body
  try {
    body = readJson(event)
  } catch {
    return json(400, { error: 'Invalid JSON' })
  }
  const { content, error } = validateInvoice(body)
  if (error) return json(400, { error })
  if (!content.invoiceNumber) content.invoiceNumber = await nextInvoiceNumber()
  const now = new Date().toISOString()
  const id = `${Date.now().toString(36)}-${randomUUID().slice(0, 8)}`
  const invoice = {
    id,
    ...content,
    createdAt: now,
    updatedAt: now,
    sentAt: null,
    paidAt: null,
    downloads: [],
  }
  await ddb.send(
    new PutCommand({
      TableName: tableName(),
      Item: {
        ...invoiceKey(id),
        type: 'invoice',
        GSI1PK: 'INVOICE',
        GSI1SK: now,
        ...invoice,
      },
    }),
  )
  return json(200, { invoice })
}

async function updateInvoice(event, invoiceId) {
  const bad = badInvoiceId(invoiceId)
  if (bad) return bad
  let body
  try {
    body = readJson(event)
  } catch {
    return json(400, { error: 'Invalid JSON' })
  }
  const { content, error } = validateInvoice(body, { requireNumber: true })
  if (error) return json(400, { error })
  const names = {}
  const values = { ':now': new Date().toISOString() }
  const sets = ['updatedAt = :now']
  for (const key of INVOICE_CONTENT_KEYS) {
    names[`#${key}`] = key
    values[`:${key}`] = content[key]
    sets.push(`#${key} = :${key}`)
  }
  try {
    const out = await ddb.send(
      new UpdateCommand({
        TableName: tableName(),
        Key: invoiceKey(invoiceId),
        UpdateExpression: `SET ${sets.join(', ')}`,
        ConditionExpression: 'attribute_exists(PK)',
        ExpressionAttributeNames: names,
        ExpressionAttributeValues: values,
        ReturnValues: 'ALL_NEW',
      }),
    )
    return json(200, { invoice: stripKeys(out.Attributes) })
  } catch (err) {
    if (err?.name === 'ConditionalCheckFailedException') return json(404, { error: 'Invoice not found' })
    throw err
  }
}

async function deleteInvoice(invoiceId) {
  const bad = badInvoiceId(invoiceId)
  if (bad) return bad
  await ddb.send(new DeleteCommand({ TableName: tableName(), Key: invoiceKey(invoiceId) }))
  return json(200, { ok: true })
}

async function setInvoiceDates(event, invoiceId) {
  const bad = badInvoiceId(invoiceId)
  if (bad) return bad
  let body
  try {
    body = readJson(event)
  } catch {
    return json(400, { error: 'Invalid JSON' })
  }
  const sets = []
  const values = {}
  if ('sentAt' in body) {
    const sent = isoDateOrNull(body.sentAt)
    if (sent.error) return json(400, { error: `Sent date: ${sent.error}` })
    sets.push('sentAt = :sentAt')
    values[':sentAt'] = sent.value
  }
  if ('paidAt' in body) {
    const paid = isoDateOrNull(body.paidAt)
    if (paid.error) return json(400, { error: `Paid date: ${paid.error}` })
    sets.push('paidAt = :paidAt')
    values[':paidAt'] = paid.value
  }
  if (!sets.length) return json(400, { error: 'Provide a sent date, a paid date, or both.' })
  try {
    const out = await ddb.send(
      new UpdateCommand({
        TableName: tableName(),
        Key: invoiceKey(invoiceId),
        UpdateExpression: `SET ${sets.join(', ')}`,
        ConditionExpression: 'attribute_exists(PK)',
        ExpressionAttributeValues: values,
        ReturnValues: 'ALL_NEW',
      }),
    )
    return json(200, { invoice: stripKeys(out.Attributes) })
  } catch (err) {
    if (err?.name === 'ConditionalCheckFailedException') return json(404, { error: 'Invoice not found' })
    throw err
  }
}

async function recordInvoiceDownload(event, invoiceId) {
  const bad = badInvoiceId(invoiceId)
  if (bad) return bad
  let body = {}
  try {
    body = readJson(event)
  } catch {
    return json(400, { error: 'Invalid JSON' })
  }
  const sentOn = body.sentOn ?? new Date().toISOString().slice(0, 10)
  const sent = isoDateOrNull(sentOn)
  if (sent.error || !sent.value) return json(400, { error: 'sentOn must be a YYYY-MM-DD date.' })

  const key = invoiceKey(invoiceId)
  try {
    const out = await ddb.send(
      new UpdateCommand({
        TableName: tableName(),
        Key: key,
        UpdateExpression: 'SET downloads = list_append(if_not_exists(downloads, :empty), :d)',
        ConditionExpression: 'attribute_exists(PK)',
        ExpressionAttributeValues: { ':empty': [], ':d': [new Date().toISOString()] },
        ReturnValues: 'ALL_NEW',
      }),
    )
    let invoice = stripKeys(out.Attributes)
    if ((invoice.downloads?.length ?? 0) > MAX_DOWNLOADS_KEPT) {
      const trimmed = await ddb.send(
        new UpdateCommand({
          TableName: tableName(),
          Key: key,
          UpdateExpression: 'SET downloads = :d',
          ExpressionAttributeValues: { ':d': invoice.downloads.slice(-MAX_DOWNLOADS_KEPT) },
          ReturnValues: 'ALL_NEW',
        }),
      )
      invoice = stripKeys(trimmed.Attributes)
    }
    if (!invoice.sentAt) {
      const stamped = await ddb.send(
        new UpdateCommand({
          TableName: tableName(),
          Key: key,
          UpdateExpression: 'SET sentAt = :sent',
          ExpressionAttributeValues: { ':sent': sent.value },
          ReturnValues: 'ALL_NEW',
        }),
      )
      invoice = stripKeys(stamped.Attributes)
    }
    return json(200, { invoice })
  } catch (err) {
    if (err?.name === 'ConditionalCheckFailedException') return json(404, { error: 'Invoice not found' })
    throw err
  }
}

/* ---------- entry ---------- */

/**
 * @param {object} event Lambda Function URL event
 * @param {{ method: string, path: string, isAuthorized: () => boolean }} ctx
 * @returns {Promise<object | null>} a response, or null when the route is not a CRM route
 */
export async function handleCrmRoute(event, { method, path, isAuthorized }) {
  const route = matchRoute(method, path)
  if (!route) return null

  if (route.name === 'submit') return handleSubmit(event)

  if (!isAuthorized()) return json(401, { error: 'Unauthorized' })

  let email = null
  if (route.email !== undefined) {
    email = normalizeEmail(route.email)
    if (!email) return json(400, { error: 'Invalid client email in path.' })
  }

  try {
    switch (route.name) {
      case 'listClients':
        return await listClients()
      case 'getClient':
        return await getClient(email)
      case 'putClient':
        return await putClient(event, email)
      case 'deleteClient':
        return await deleteClient(email)
      case 'getCatalog':
        return await getCatalog()
      case 'putCatalog':
        return await putCatalog(event)
      case 'createProposal':
        return await createProposal(event, email)
      case 'updateProposal':
        return await updateProposal(event, email, route.proposalId)
      case 'deleteProposal':
        return await deleteProposal(email, route.proposalId)
      case 'setProposalStatus':
        return await setProposalStatus(event, email, route.proposalId)
      case 'recordDownload':
        return await recordDownload(email, route.proposalId)
      case 'getInvoiceCatalog':
        return await getInvoiceCatalog()
      case 'putInvoiceCatalog':
        return await putInvoiceCatalog(event)
      case 'listInvoices':
        return await listInvoices()
      case 'createInvoice':
        return await createInvoice(event)
      case 'getInvoice':
        return await getInvoice(route.invoiceId)
      case 'updateInvoice':
        return await updateInvoice(event, route.invoiceId)
      case 'deleteInvoice':
        return await deleteInvoice(route.invoiceId)
      case 'setInvoiceDates':
        return await setInvoiceDates(event, route.invoiceId)
      case 'recordInvoiceDownload':
        return await recordInvoiceDownload(event, route.invoiceId)
      default:
        return null
    }
  } catch (err) {
    return dbErrorResponse(err)
  }
}
