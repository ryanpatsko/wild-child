import React from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import InvoiceBuilder from './InvoiceBuilder';
import InvoiceCatalogEditor from './InvoiceCatalogEditor';
import InvoicesList from './InvoicesList';

export default function InvoicesSection() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const invoice = searchParams.get('invoice');
  const view = searchParams.get('invoiceView');

  function go(params) {
    const next = new URLSearchParams(searchParams.toString());
    next.set('tab', 'invoices');
    for (const [k, v] of Object.entries(params)) {
      if (v) next.set(k, v);
      else next.delete(k);
    }
    router.push(`${pathname}?${next.toString()}`);
  }

  if (invoice) {
    return (
      <InvoiceBuilder
        key={invoice}
        invoiceId={invoice}
        onBack={() => go({ invoice: null })}
        onOpenServices={() => go({ invoice: null, invoiceView: 'services' })}
      />
    );
  }
  if (view === 'services') {
    return <InvoiceCatalogEditor onBack={() => go({ invoiceView: null })} />;
  }
  return (
    <InvoicesList onOpenInvoice={(id) => go({ invoice: id })} onOpenServices={() => go({ invoiceView: 'services' })} />
  );
}
