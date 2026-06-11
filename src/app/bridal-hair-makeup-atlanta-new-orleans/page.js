import { getBridalContent } from '../../lib/serverContent';
import BridalLayout from '../../components/BridalLayout';
import BridalAtlanta from '../../components/BridalAtlanta';

const PATH = '/bridal-hair-makeup-atlanta-new-orleans';

export async function generateMetadata() {
  const { atlanta: r } = await getBridalContent();
  return {
    title: r.documentTitle,
    description: r.metaDescription,
    alternates: { canonical: `https://wildchild-makeup.com${PATH}` },
    openGraph: { url: `https://wildchild-makeup.com${PATH}` },
  };
}

export default async function Page() {
  const { atlanta: r } = await getBridalContent();
  return (
    <BridalLayout>
      <BridalAtlanta r={r} />
    </BridalLayout>
  );
}
