import { getBridalContent } from '../../lib/serverContent';
import BridalLayout from '../../components/BridalLayout';
import BridalPittsburgh from '../../components/BridalPittsburgh';

const PATH = '/bridal-hair-makeup-pittsburgh';

export async function generateMetadata() {
  const { pittsburgh: r } = await getBridalContent();
  return {
    title: r.documentTitle,
    description: r.metaDescription,
    alternates: { canonical: `https://wildchild-makeup.com${PATH}` },
    openGraph: { url: `https://wildchild-makeup.com${PATH}` },
  };
}

export default async function Page() {
  const { pittsburgh: r } = await getBridalContent();
  return (
    <BridalLayout>
      <BridalPittsburgh r={r} />
    </BridalLayout>
  );
}
