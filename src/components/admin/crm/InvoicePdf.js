import React from 'react';
import { Document, Image, Page, StyleSheet, Text, View } from '@react-pdf/renderer';
import siteLogo from '../../../assets/wcf-lips-logo.png';
import {
  computeInvoiceTotals,
  formatInvoiceNumber,
  formatMoney,
} from '../../../lib/invoiceMath';
import { toNumericDate } from '../../../lib/proposalMath';
import { registerPdfFonts } from './pdfFonts';

const INK = '#1f1a1c';
const MUTED = '#7a6d72';
const ACCENT = '#b23a68';
const BLUSH = '#f6e4ea';
const HAIRLINE = '#e8d6dd';
const PAPER = '#fffdfb';

const s = StyleSheet.create({
  page: {
    backgroundColor: PAPER,
    paddingTop: 26,
    paddingBottom: 46,
    paddingHorizontal: 52,
    fontFamily: 'RedHat',
    fontSize: 9.5,
    color: INK,
  },
  frame: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
    bottom: 16,
    borderWidth: 0.75,
    borderColor: HAIRLINE,
  },
  header: { alignItems: 'center', marginBottom: 14 },
  logo: { width: 34, height: 34, objectFit: 'contain', marginBottom: 8 },
  brand: { fontFamily: 'Castoro', fontSize: 19, letterSpacing: 3.5, textAlign: 'center' },
  docTitle: { fontFamily: 'Playfair', fontStyle: 'italic', fontSize: 13, color: ACCENT, marginTop: 5 },
  headerRule: { width: 56, borderBottomWidth: 0.75, borderBottomColor: ACCENT, marginTop: 8 },

  details: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 8 },
  detail: { width: '33.33%', marginBottom: 8, paddingRight: 12 },
  label: { fontSize: 7, letterSpacing: 1.6, color: MUTED, textTransform: 'uppercase', marginBottom: 3 },
  detailValue: { fontFamily: 'Playfair', fontSize: 12.5 },

  sectionTitle: {
    fontFamily: 'Castoro',
    fontSize: 9.5,
    letterSpacing: 2.2,
    color: ACCENT,
    paddingBottom: 5,
    borderBottomWidth: 0.75,
    borderBottomColor: ACCENT,
    marginBottom: 2,
  },
  section: { marginBottom: 10 },
  colHeadRow: { flexDirection: 'row', paddingVertical: 4 },
  colHead: { fontSize: 6.8, letterSpacing: 1.4, color: MUTED, textTransform: 'uppercase' },
  row: { flexDirection: 'row', paddingVertical: 4, borderBottomWidth: 0.5, borderBottomColor: HAIRLINE },
  colName: { flex: 1, paddingRight: 10 },
  colQty: { width: 70, textAlign: 'center' },
  colRate: { width: 70, textAlign: 'right' },
  colAmount: { width: 82, textAlign: 'right' },
  lineName: { fontSize: 10 },
  included: { fontFamily: 'Playfair', fontStyle: 'italic', fontSize: 8, color: ACCENT },
  lineDetail: { fontFamily: 'Playfair', fontStyle: 'italic', fontSize: 8.5, color: MUTED, marginTop: 2 },
  subtotalRow: { flexDirection: 'row', paddingTop: 6 },
  subtotalLabel: { flex: 1, textAlign: 'right', paddingRight: 12, fontSize: 9, color: MUTED },
  subtotalValue: { width: 82, textAlign: 'right', fontWeight: 500 },

  investment: {
    backgroundColor: BLUSH,
    paddingVertical: 11,
    paddingHorizontal: 20,
    marginTop: 2,
    marginBottom: 10,
  },
  investmentRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
  investmentLabel: { fontFamily: 'Playfair', fontSize: 15 },
  investmentValue: { fontFamily: 'Playfair', fontWeight: 600, fontSize: 19, color: ACCENT },
  investmentRule: { borderBottomWidth: 0.5, borderBottomColor: '#e2c3cf', marginVertical: 8 },
  scheduleRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 3 },
  scheduleText: { fontSize: 9, color: INK },

  noteBlock: { marginTop: 2 },
  note: { fontFamily: 'Playfair', fontStyle: 'italic', fontSize: 8.5, color: MUTED, lineHeight: 1.4, marginBottom: 5 },

  footer: {
    position: 'absolute',
    bottom: 22,
    left: 52,
    right: 52,
    alignItems: 'center',
  },
  footerRule: { width: 28, borderBottomWidth: 0.5, borderBottomColor: ACCENT, marginBottom: 6 },
  footerText: { fontSize: 7, letterSpacing: 1.4, color: MUTED, textAlign: 'center' },
  pageNumber: { fontSize: 6.5, color: MUTED, marginTop: 3 },
});

function plural(n, word) {
  if (!word) return '';
  return n === 1 ? word : `${word}s`;
}

function Detail({ label, value }) {
  if (!value) return null;
  return (
    <View style={s.detail}>
      <Text style={s.label}>{label}</Text>
      <Text style={s.detailValue}>{value}</Text>
    </View>
  );
}

function ColumnHeads({ first }) {
  return (
    <View style={s.colHeadRow}>
      <Text style={[s.colHead, s.colName]}>{first}</Text>
      <Text style={[s.colHead, s.colQty]}>Qty</Text>
      <Text style={[s.colHead, s.colRate]}>Rate</Text>
      <Text style={[s.colHead, s.colAmount]}>Amount</Text>
    </View>
  );
}

function paragraphs(text) {
  return String(text ?? '')
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}

/**
 * @param {{ invoice: object, footerText?: string }} props
 */
export function InvoiceDocument({ invoice, footerText }) {
  const t = computeInvoiceTotals(invoice);
  const anyMayVary = t.serviceLines.some((l) => l.priceMayVary);
  const logoSrc = new URL(siteLogo.src, window.location.origin).href;
  const hasFees = t.gratuityCents > 0 || t.expenseLines.length > 0;
  const showBalance = t.taxCents > 0 || t.amountPaidCents > 0;
  const heading = invoice.documentTitle?.trim() || 'Hair + Makeup Invoice';

  return (
    <Document title={`${heading} — ${invoice.billTo || invoice.invoiceNumber || 'Invoice'}`} author="Wild Child Fabrications">
      <Page size="LETTER" style={s.page}>
        <View style={s.frame} fixed />

        <View style={s.header}>
          <Image src={logoSrc} style={s.logo} />
          <Text style={s.brand}>WILD CHILD FABRICATIONS</Text>
          <Text style={s.docTitle}>{heading}</Text>
          <View style={s.headerRule} />
        </View>

        <View style={s.details}>
          <Detail label="Invoice" value={formatInvoiceNumber(invoice.invoiceNumber)} />
          <Detail label="Invoice date" value={toNumericDate(invoice.issuedOn)} />
          <Detail label="Date of service" value={toNumericDate(invoice.serviceDate)} />
          <Detail label="Bill to" value={invoice.billTo} />
          <Detail label="Attention" value={invoice.attention} />
          <Detail label="Email" value={invoice.email} />
          <Detail label="Location" value={invoice.location} />
          <Detail label="Project" value={invoice.jobName} />
          <Detail label="PO number" value={invoice.poNumber} />
          <Detail label="Terms" value={invoice.paymentTerms} />
          <Detail label="Due" value={toNumericDate(invoice.dueDate)} />
        </View>

        {t.serviceLines.length > 0 ? (
          <View style={s.section}>
            <Text style={s.sectionTitle}>SERVICES</Text>
            <ColumnHeads first="Service" />
            {t.serviceLines.map((line, i) => (
              <View key={i} style={s.row} wrap={false}>
                <Text style={[s.colName, s.lineName]}>{line.name}</Text>
                <Text style={s.colQty}>{line.quantity}</Text>
                <Text style={line.unitPriceCents > 0 ? s.colRate : [s.colRate, s.included]}>
                  {line.unitPriceCents > 0
                    ? `${formatMoney(line.unitPriceCents, { compact: true })}${line.priceMayVary ? '*' : ''}`
                    : 'Included'}
                </Text>
                <Text style={s.colAmount}>{line.unitPriceCents > 0 ? formatMoney(line.totalCents) : ''}</Text>
              </View>
            ))}
            <View style={s.subtotalRow}>
              <Text style={s.subtotalLabel}>
                Services total ({t.serviceCount} {plural(t.serviceCount, 'service')})
              </Text>
              <Text style={s.subtotalValue}>{formatMoney(t.servicesTotalCents)}</Text>
            </View>
          </View>
        ) : null}

        {hasFees ? (
          <View style={s.section}>
            <Text style={s.sectionTitle}>{t.gratuityCents > 0 ? 'GRATUITY, TRAVEL & FEES' : 'TRAVEL & FEES'}</Text>
            <ColumnHeads first="Item" />
            {t.gratuityCents > 0 ? (
              <View style={s.row} wrap={false}>
                <Text style={[s.colName, s.lineName]}>Included gratuity ({t.gratuityPercent}%)</Text>
                <Text style={s.colQty} />
                <Text style={s.colRate} />
                <Text style={s.colAmount}>{formatMoney(t.gratuityCents)}</Text>
              </View>
            ) : null}
            {t.expenseLines.map((line, i) => {
              const perUnit = line.mode === 'perUnit';
              const detail = [line.detail, line.ifApplicable ? `${formatMoney(line.totalCents, { compact: true })} if applicable` : '']
                .filter(Boolean)
                .join(' — ');
              return (
                <View key={i} style={s.row} wrap={false}>
                  <View style={s.colName}>
                    <Text style={s.lineName}>{line.name}</Text>
                    {detail ? <Text style={s.lineDetail}>{detail}</Text> : null}
                  </View>
                  <Text style={s.colQty}>
                    {perUnit ? `${line.quantity}${line.unitLabel ? ` ${plural(line.quantity, line.unitLabel)}` : ''}` : ''}
                  </Text>
                  <Text style={s.colRate}>{perUnit ? formatMoney(line.unitPriceCents, { compact: true }) : ''}</Text>
                  <Text style={s.colAmount}>{line.ifApplicable ? 'TBD' : formatMoney(line.totalCents)}</Text>
                </View>
              );
            })}
          </View>
        ) : null}

        <View style={s.investment} wrap={false}>
          {t.taxCents > 0 ? (
            <>
              <View style={s.scheduleRow}>
                <Text style={s.scheduleText}>Subtotal</Text>
                <Text style={s.scheduleText}>{formatMoney(t.subtotalCents)}</Text>
              </View>
              <View style={s.scheduleRow}>
                <Text style={s.scheduleText}>Tax ({t.taxPercent}%)</Text>
                <Text style={s.scheduleText}>{formatMoney(t.taxCents)}</Text>
              </View>
              <View style={s.investmentRule} />
            </>
          ) : null}
          <View style={s.investmentRow}>
            <Text style={s.investmentLabel}>{showBalance && t.amountPaidCents > 0 ? 'Invoice total' : 'Amount due'}</Text>
            <Text style={s.investmentValue}>{formatMoney(t.totalCents)}</Text>
          </View>
          {t.amountPaidCents > 0 ? (
            <>
              <View style={s.investmentRule} />
              <View style={s.scheduleRow}>
                <Text style={s.scheduleText}>Payments received</Text>
                <Text style={s.scheduleText}>{formatMoney(t.amountPaidCents)}</Text>
              </View>
              <View style={s.scheduleRow}>
                <Text style={s.scheduleText}>Balance due</Text>
                <Text style={s.scheduleText}>{formatMoney(t.balanceCents)}</Text>
              </View>
            </>
          ) : null}
        </View>

        <View style={s.noteBlock}>
          {anyMayVary && invoice.priceMayVaryNote ? <Text style={s.note}>* {invoice.priceMayVaryNote}</Text> : null}
          {paragraphs(invoice.paymentInstructions).map((p, i) => (
            <Text key={`pay-${i}`} style={s.note}>
              {p}
            </Text>
          ))}
          {paragraphs(invoice.notes).map((p, i) => (
            <Text key={`note-${i}`} style={s.note}>
              {p}
            </Text>
          ))}
        </View>

        <View style={s.footer} fixed>
          <View style={s.footerRule} />
          {footerText ? <Text style={s.footerText}>{footerText}</Text> : null}
          <Text
            style={s.pageNumber}
            render={({ pageNumber, totalPages }) => (totalPages > 1 ? `${pageNumber} / ${totalPages}` : '')}
          />
        </View>
      </Page>
    </Document>
  );
}

export async function renderInvoicePdfBlob(props) {
  registerPdfFonts();
  const { pdf } = await import('@react-pdf/renderer');
  return pdf(<InvoiceDocument {...props} />).toBlob();
}
