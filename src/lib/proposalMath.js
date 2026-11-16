const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

/**
 * "$1,925.00"; with `compact`, whole-dollar amounts drop the cents ("$225").
 * Fractional cents (per-unit rates like 72.5¢) show a third decimal ("$0.725").
 */
export function formatMoney(cents, { compact = false } = {}) {
  const n = Number(cents) || 0;
  const value = n / 100;
  const whole = Number.isInteger(value);
  return value.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: compact && whole ? 0 : 2,
    maximumFractionDigits: Number.isInteger(n) ? 2 : 3,
  });
}

/**
 * Parses "225", "$1,925.50", ".75" into cents; returns null for anything unparseable.
 * `maxDecimals: 3` allows rates like "0.725", returned as fractional cents (72.5).
 */
export function parseMoneyToCents(input, { maxDecimals = 2 } = {}) {
  const cleaned = String(input ?? '').replace(/[$,\s]/g, '');
  if (cleaned === '') return 0;
  const pattern = new RegExp(`^(?:\\d+(?:\\.\\d{0,${maxDecimals}})?|\\.\\d{1,${maxDecimals}})$`);
  if (!pattern.test(cleaned)) return null;
  const scale = 10 ** Math.max(0, maxDecimals - 2);
  return Math.round(Number(cleaned) * 100 * scale) / scale;
}

export function centsToInput(cents) {
  const n = Number(cents) || 0;
  const value = n / 100;
  if (Number.isInteger(value)) return String(value);
  return value.toFixed(Number.isInteger(n) ? 2 : 3);
}

const pad2 = (n) => String(n).padStart(2, '0');

/**
 * Normalizes a free-text date ("August 28th, 2027", "Sat, Aug 28 2027", "8/28/27") to "08/28/2027".
 * Without a year it's "08/28"; text that doesn't look like a date comes back unchanged.
 */
export function toNumericDate(text) {
  const raw = String(text ?? '').trim();
  const numeric = /^(\d{1,2})\s*[/.-]\s*(\d{1,2})(?:\s*[/.-]\s*(\d{4}|\d{2}))?$/.exec(raw);
  const named = /^(?:[a-z]+\.?,?\s+)?([a-z]{3,})\.?\s+(\d{1,2})(?:st|nd|rd|th)?(?:,?\s+(\d{4}))?$/i.exec(raw);
  let month;
  let day;
  let year;
  if (numeric) {
    [, month, day, year] = numeric;
    month = Number(month);
  } else if (named) {
    const idx = MONTHS.findIndex((m) => m.toLowerCase().startsWith(named[1].slice(0, 3).toLowerCase()));
    if (idx === -1) return raw;
    month = idx + 1;
    [, , day, year] = named;
  } else {
    return raw;
  }
  day = Number(day);
  if (month < 1 || month > 12 || day < 1 || day > 31) return raw;
  if (year && year.length === 2) year = `20${year}`;
  return `${pad2(month)}/${pad2(day)}${year ? `/${year}` : ''}`;
}

/** ISO timestamp as "11/15/2026". */
export function formatDateNumeric(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return `${pad2(d.getMonth() + 1)}/${pad2(d.getDate())}/${d.getFullYear()}`;
}

function ordinal(n) {
  const mod100 = n % 100;
  if (mod100 >= 11 && mod100 <= 13) return `${n}th`;
  return `${n}${{ 1: 'st', 2: 'nd', 3: 'rd' }[n % 10] ?? 'th'}`;
}

/** Contact form stores "MM/DD" plus a year; turn that into "August 28th, 2027" when it parses cleanly. */
export function formatEventDate(mmdd, year) {
  const m = /^\s*(\d{1,2})\s*[/.-]\s*(\d{1,2})\s*$/.exec(String(mmdd ?? ''));
  if (!m) return [mmdd, year].filter(Boolean).join(' ');
  const month = Number(m[1]);
  const day = Number(m[2]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return [mmdd, year].filter(Boolean).join(' ');
  return `${MONTHS[month - 1]} ${ordinal(day)}${year ? `, ${year}` : ''}`;
}

export function formatTimestamp(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const weekday = d.toLocaleDateString('en-US', { weekday: 'short' });
  const date = d.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: '2-digit' });
  const time = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  return `${weekday} ${date} ${time}`;
}

/**
 * Event date as "Sat 6/5/27". Without a 4-digit year the weekday is unknowable, so it's just "6/5";
 * falls back to the raw text when it isn't a parseable date.
 */
export function formatEventDateShort(mmdd, year) {
  const m = /^\s*(\d{1,2})\s*[/.-]\s*(\d{1,2})\s*$/.exec(String(mmdd ?? ''));
  if (!m) return [mmdd, year].filter(Boolean).join(' ');
  const month = Number(m[1]);
  const day = Number(m[2]);
  const yearText = String(year ?? '').trim();
  if (!/^\d{4}$/.test(yearText)) return `${month}/${day}`;
  const d = new Date(Number(yearText), month - 1, day);
  const weekday = d.getMonth() === month - 1 ? `${d.toLocaleDateString('en-US', { weekday: 'short' })} ` : '';
  return `${weekday}${month}/${day}/${yearText.slice(-2)}`;
}

export function expenseLineTotalCents(line) {
  const unit = Number(line.unitPriceCents) || 0;
  return Math.round(line.mode === 'perUnit' ? unit * (Number(line.quantity) || 0) : unit);
}

export function computeProposalTotals(proposal) {
  const serviceLines = (proposal.services ?? []).map((line) => ({
    ...line,
    totalCents: (Number(line.unitPriceCents) || 0) * (Number(line.quantity) || 0),
  }));
  const servicesTotalCents = serviceLines.reduce((sum, l) => sum + l.totalCents, 0);
  const serviceCount = serviceLines.reduce((sum, l) => sum + (Number(l.quantity) || 0), 0);
  const gratuityPercent = Number(proposal.gratuityPercent) || 0;
  const gratuityCents = Math.round((servicesTotalCents * gratuityPercent) / 100);

  const expenseLines = (proposal.expenses ?? []).map((line) => ({
    ...line,
    totalCents: expenseLineTotalCents(line),
  }));
  const expensesTotalCents = expenseLines
    .filter((l) => !l.ifApplicable)
    .reduce((sum, l) => sum + l.totalCents, 0);

  const overallCents = servicesTotalCents + gratuityCents + expensesTotalCents;
  const depositCents = Math.min(Number(proposal.depositCents) || 0, overallCents);
  return {
    serviceLines,
    servicesTotalCents,
    serviceCount,
    gratuityPercent,
    gratuityCents,
    expenseLines,
    expensesTotalCents,
    overallCents,
    depositCents,
    balanceCents: overallCents - depositCents,
  };
}

export function clientDisplayName(client) {
  if (client?.displayName) return client.displayName;
  const s = client?.latestSubmission;
  const name = [s?.firstName, s?.lastName].filter(Boolean).join(' ');
  return name || client?.email || '';
}

export function expenseLineFromCatalog(expense) {
  return {
    expenseId: expense.id,
    name: expense.name,
    unitPriceCents: expense.priceCents,
    quantity: 1,
    mode: expense.mode,
    unitLabel: expense.unitLabel ?? '',
    detail: expense.detail ?? '',
    ifApplicable: Boolean(expense.ifApplicable),
  };
}

export function serviceLineFromCatalog(service) {
  return {
    serviceId: service.id,
    name: service.name,
    unitPriceCents: service.priceCents,
    quantity: 1,
    priceMayVary: Boolean(service.priceMayVary),
  };
}

export function buildNewProposal(catalog, client) {
  const d = catalog?.defaults ?? {};
  const s = client?.latestSubmission ?? {};
  return {
    title: 'Proposal',
    clientName: clientDisplayName(client),
    eventDate: toNumericDate(formatEventDate(s.eventDate, s.eventYear)),
    regionLabel: d.regionLabel ?? '',
    venue: s.eventVenue ?? '',
    services: [],
    gratuityPercent: d.gratuityPercent ?? 20,
    expenses: (catalog?.expenses ?? []).filter((e) => e.autoAdd && !e.archived).map(expenseLineFromCatalog),
    depositCents: d.depositCents ?? 0,
    balanceDueDaysBefore: d.balanceDueDaysBefore ?? 60,
    priceMayVaryNote: d.priceMayVaryNote ?? '',
    notes: d.notes ?? '',
  };
}

/** Fields the API accepts for a proposal save; drops timestamps and ids. */
export function proposalContent(p) {
  return {
    title: p.title ?? '',
    clientName: p.clientName ?? '',
    eventDate: p.eventDate ?? '',
    regionLabel: p.regionLabel ?? '',
    venue: p.venue ?? '',
    services: p.services ?? [],
    gratuityPercent: Number(p.gratuityPercent) || 0,
    expenses: p.expenses ?? [],
    depositCents: Number(p.depositCents) || 0,
    balanceDueDaysBefore: Number(p.balanceDueDaysBefore) || 0,
    priceMayVaryNote: p.priceMayVaryNote ?? '',
    notes: p.notes ?? '',
  };
}
