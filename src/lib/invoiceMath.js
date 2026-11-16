import {
  centsToInput,
  expenseLineFromCatalog,
  formatDateNumeric,
  formatMoney,
} from './proposalMath';

export { centsToInput, expenseLineFromCatalog, formatDateNumeric, formatMoney };

/** "2026-11-15" in the viewer's local calendar. */
export function todayIsoDate() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** Stored YYYY-MM-DD as "11/15/26", without shifting a day across timezones. */
export function formatIsoDate(isoDate) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(isoDate ?? ''));
  if (!m) return '';
  return `${Number(m[2])}/${Number(m[3])}/${m[1].slice(2)}`;
}

/** "8.5" or "20" → number; blank is 0; anything else is null. */
export function parsePercent(input) {
  const cleaned = String(input ?? '')
    .trim()
    .replace(/%/g, '');
  if (cleaned === '') return 0;
  if (!/^\d+(?:\.\d{0,3})?$/.test(cleaned)) return null;
  const n = Number(cleaned);
  if (n < 0 || n > 100) return null;
  return n;
}

export function serviceLineFromInvoiceCatalog(service) {
  return {
    serviceId: service.id,
    name: service.name,
    unitPriceCents: service.priceCents,
    quantity: 1,
    priceMayVary: Boolean(service.priceMayVary),
  };
}

export function computeInvoiceTotals(invoice) {
  const serviceLines = (invoice.services ?? []).map((line) => ({
    ...line,
    totalCents: (Number(line.unitPriceCents) || 0) * (Number(line.quantity) || 0),
  }));
  const servicesTotalCents = serviceLines.reduce((sum, l) => sum + l.totalCents, 0);
  const serviceCount = serviceLines.reduce((sum, l) => sum + (Number(l.quantity) || 0), 0);
  const gratuityPercent = Number(invoice.gratuityPercent) || 0;
  const gratuityCents = Math.round((servicesTotalCents * gratuityPercent) / 100);

  const expenseLines = (invoice.expenses ?? []).map((line) => ({
    ...line,
    totalCents: Math.round(
      line.mode === 'perUnit'
        ? (Number(line.unitPriceCents) || 0) * (Number(line.quantity) || 0)
        : Number(line.unitPriceCents) || 0,
    ),
  }));
  const expensesTotalCents = expenseLines.filter((l) => !l.ifApplicable).reduce((sum, l) => sum + l.totalCents, 0);

  const subtotalCents = servicesTotalCents + gratuityCents + expensesTotalCents;
  const taxPercent = Number(invoice.taxPercent) || 0;
  const taxCents = Math.round((subtotalCents * taxPercent) / 100);
  const totalCents = subtotalCents + taxCents;
  const amountPaidCents = Math.max(0, Number(invoice.amountPaidCents) || 0);

  return {
    serviceLines,
    servicesTotalCents,
    serviceCount,
    gratuityPercent,
    gratuityCents,
    expenseLines,
    expensesTotalCents,
    subtotalCents,
    taxPercent,
    taxCents,
    totalCents,
    amountPaidCents,
    balanceCents: totalCents - amountPaidCents,
    paidExceedsTotal: amountPaidCents > totalCents,
  };
}

export function buildNewInvoice(catalog) {
  const d = catalog?.defaults ?? {};
  return {
    invoiceNumber: '',
    title: 'Invoice',
    documentTitle: d.documentTitle || 'Hair + Makeup Invoice',
    billTo: '',
    attention: '',
    email: '',
    serviceDate: '',
    location: '',
    jobName: '',
    poNumber: '',
    issuedOn: formatDateNumeric(new Date().toISOString()),
    services: [],
    gratuityPercent: d.gratuityPercent ?? 0,
    taxPercent: d.taxPercent ?? 0,
    expenses: (catalog?.expenses ?? []).filter((e) => e.autoAdd && !e.archived).map(expenseLineFromCatalog),
    amountPaidCents: 0,
    paymentTerms: d.paymentTerms ?? 'Due upon receipt',
    dueDate: '',
    priceMayVaryNote: d.priceMayVaryNote ?? '',
    notes: d.notes ?? '',
    paymentInstructions: d.paymentInstructions ?? '',
  };
}

/** Fields the API accepts for an invoice save. */
export function invoiceContent(p) {
  return {
    invoiceNumber: p.invoiceNumber ?? '',
    title: p.title ?? '',
    documentTitle: p.documentTitle ?? '',
    billTo: p.billTo ?? '',
    attention: p.attention ?? '',
    email: p.email ?? '',
    serviceDate: p.serviceDate ?? '',
    location: p.location ?? '',
    jobName: p.jobName ?? '',
    poNumber: p.poNumber ?? '',
    issuedOn: p.issuedOn ?? '',
    services: p.services ?? [],
    gratuityPercent: Number(p.gratuityPercent) || 0,
    taxPercent: Number(p.taxPercent) || 0,
    expenses: p.expenses ?? [],
    amountPaidCents: Number(p.amountPaidCents) || 0,
    paymentTerms: p.paymentTerms ?? '',
    dueDate: p.dueDate ?? '',
    priceMayVaryNote: p.priceMayVaryNote ?? '',
    notes: p.notes ?? '',
    paymentInstructions: p.paymentInstructions ?? '',
  };
}

export function duplicateInvoiceContent(invoice) {
  return {
    ...invoiceContent(invoice),
    invoiceNumber: '',
    title: `${invoice.title || 'Invoice'} (copy)`,
    issuedOn: formatDateNumeric(new Date().toISOString()),
    amountPaidCents: 0,
  };
}

export function formatInvoiceNumber(n) {
  const t = String(n ?? '')
    .trim()
    .replace(/^#+/, '');
  return t ? `#${t}` : '';
}

export function invoiceStatus(invoice) {
  if (invoice?.paidAt) return 'paid';
  if (invoice?.sentAt) return 'sent';
  return 'draft';
}
