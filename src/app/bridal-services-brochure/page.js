import BridalServicesBrochure from '../../components/BridalServicesBrochure';

const PATH = '/bridal-services-brochure';

export const metadata = {
  title: '2026 Hair & Makeup Packages | Wild Child Fabrications',
  description: 'Wild Child Fabrications bridal hair and makeup pricing, packages, and booking information for 2026.',
  alternates: { canonical: `https://wildchild-makeup.com${PATH}` },
  openGraph: { url: `https://wildchild-makeup.com${PATH}` },
};

export default function Page() {
  return <BridalServicesBrochure />;
}
