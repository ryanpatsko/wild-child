import React from 'react';
import { Document, Font, Image, Page, StyleSheet, Text, View } from '@react-pdf/renderer';
import siteLogo from '../../../assets/wcf-lips-logo.png';
import { computeProposalTotals, formatMoney } from '../../../lib/proposalMath';

const INK = '#1f1a1c';
const MUTED = '#7a6d72';
const ACCENT = '#b23a68';
const BLUSH = '#f6e4ea';
const HAIRLINE = '#e8d6dd';
const PAPER = '#fffdfb';

let fontsRegistered = false;

function registerFonts() {
  if (fontsRegistered) return;
  const base = `${window.location.origin}/fonts/proposal`;
  Font.register({
    family: 'Playfair',
    fonts: [
      { src: `${base}/PlayfairDisplay-Regular.ttf` },
      { src: `${base}/PlayfairDisplay-Italic.ttf`, fontStyle: 'italic' },
      { src: `${base}/PlayfairDisplay-SemiBold.ttf`, fontWeight: 600 },
    ],
  });
  Font.register({
    family: 'RedHat',
    fonts: [
      { src: `${base}/RedHatDisplay-Regular.ttf` },
      { src: `${base}/RedHatDisplay-Medium.ttf`, fontWeight: 500 },
      { src: `${base}/RedHatDisplay-Bold.ttf`, fontWeight: 700 },
    ],
  });
  Font.register({ family: 'Castoro', src: `${base}/CastoroTitling-Regular.ttf` });
  Font.registerHyphenationCallback((word) => [word]);
  fontsRegistered = true;
}

const s = StyleSheet.create({
  page: {
    backgroundColor: PAPER,
    paddingTop: 32,
    paddingBottom: 54,
    paddingHorizontal: 64,
    fontFamily: 'RedHat',
    fontSize: 9.5,
    color: INK,
  },
  frame: {
    position: 'absolute',
    top: 22,
    left: 22,
    right: 22,
    bottom: 22,
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
    bottom: 26,
    left: 64,
    right: 64,
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
 * @param {{ proposal: object, preparedOn: string, footerText?: string }} props
 */
export function ProposalDocument({ proposal, preparedOn, footerText }) {
  const t = computeProposalTotals(proposal);
  const anyMayVary = t.serviceLines.some((l) => l.priceMayVary);
  const logoSrc = new URL(siteLogo.src, window.location.origin).href;
  const hasFees = t.gratuityCents > 0 || t.expenseLines.length > 0;

  return (
    <Document title={`Hair + Makeup Proposal — ${proposal.clientName || 'Client'}`} author="Wild Child Fabrications">
      <Page size="LETTER" style={s.page}>
        <View style={s.frame} fixed />

        <View style={s.header}>
          <Image src={logoSrc} style={s.logo} />
          <Text style={s.brand}>WILD CHILD FABRICATIONS</Text>
          <Text style={s.docTitle}>Hair + Makeup Proposal</Text>
          <View style={s.headerRule} />
        </View>

        <View style={s.details}>
          <Detail label="Prepared for" value={proposal.clientName} />
          <Detail label="Wedding date" value={proposal.eventDate} />
          <Detail label="Prepared on" value={preparedOn} />
          <Detail label="Location" value={proposal.venue} />
          <Detail label="Serving" value={proposal.regionLabel} />
        </View>

        {t.serviceLines.length > 0 ? (
          <View style={s.section}>
            <Text style={s.sectionTitle}>SERVICES</Text>
            <ColumnHeads first="Service" />
            {t.serviceLines.map((line, i) => (
              <View key={i} style={s.row} wrap={false}>
                <Text style={[s.colName, s.lineName]}>{line.name}</Text>
                <Text style={s.colQty}>{line.quantity}</Text>
                <Text style={s.colRate}>
                  {formatMoney(line.unitPriceCents, { compact: true })}
                  {line.priceMayVary ? '*' : ''}
                </Text>
                <Text style={s.colAmount}>{formatMoney(line.totalCents)}</Text>
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
            <Text style={s.sectionTitle}>GRATUITY, TRAVEL &amp; FEES</Text>
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
                  <Text style={s.colRate}>
                    {perUnit ? formatMoney(line.unitPriceCents, { compact: true }) : ''}
                  </Text>
                  <Text style={s.colAmount}>{line.ifApplicable ? 'TBD' : formatMoney(line.totalCents)}</Text>
                </View>
              );
            })}
          </View>
        ) : null}

        <View style={s.investment} wrap={false}>
          <View style={s.investmentRow}>
            <Text style={s.investmentLabel}>Overall Investment</Text>
            <Text style={s.investmentValue}>{formatMoney(t.overallCents)}</Text>
          </View>
          {t.depositCents > 0 ? (
            <>
              <View style={s.investmentRule} />
              <View style={s.scheduleRow}>
                <Text style={s.scheduleText}>Due at contract signing</Text>
                <Text style={s.scheduleText}>{formatMoney(t.depositCents)}</Text>
              </View>
              <View style={s.scheduleRow}>
                <Text style={s.scheduleText}>
                  Remaining balance, due {proposal.balanceDueDaysBefore} days prior to your event
                </Text>
                <Text style={s.scheduleText}>{formatMoney(t.balanceCents)}</Text>
              </View>
            </>
          ) : null}
        </View>

        <View style={s.noteBlock}>
          {anyMayVary && proposal.priceMayVaryNote ? <Text style={s.note}>* {proposal.priceMayVaryNote}</Text> : null}
          {paragraphs(proposal.notes).map((p, i) => (
            <Text key={i} style={s.note}>
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

export async function renderProposalPdfBlob(props) {
  registerFonts();
  const { pdf } = await import('@react-pdf/renderer');
  return pdf(<ProposalDocument {...props} />).toBlob();
}
