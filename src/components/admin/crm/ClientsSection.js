import React from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import ClientsList from './ClientsList';
import ClientProfile from './ClientProfile';
import ProposalBuilder from './ProposalBuilder';

export default function ClientsSection() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const client = searchParams.get('client');
  const proposal = searchParams.get('proposal');

  function go(params) {
    const next = new URLSearchParams(searchParams.toString());
    for (const [k, v] of Object.entries(params)) {
      if (v) next.set(k, v);
      else next.delete(k);
    }
    router.push(`${pathname}?${next.toString()}`);
  }

  return (
    <div className="admin-crm-wide">
      {client && proposal ? (
        <ProposalBuilder
          key={`${client}/${proposal}`}
          email={client}
          proposalId={proposal}
          onBack={() => go({ proposal: null })}
        />
      ) : client ? (
        <ClientProfile
          key={client}
          email={client}
          onBack={() => go({ client: null, proposal: null })}
          onOpenProposal={(id) => go({ proposal: id })}
        />
      ) : (
        <ClientsList onOpenClient={(email) => go({ client: email })} />
      )}
    </div>
  );
}
