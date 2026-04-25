import { getBridalContent } from '../../lib/serverContent';
import BridalLayout from '../../components/BridalLayout';
import BridalServices from '../../components/BridalServices';

const PATH = '/bridal-services';

export async function generateMetadata() {
  const { services: s } = await getBridalContent();
  return {
    title: s.documentTitle,
    description: s.metaDescription,
    alternates: { canonical: `https://wildchild-makeup.com${PATH}` },
    openGraph: { url: `https://wildchild-makeup.com${PATH}` },
  };
}

export default async function Page() {
  const { services: s } = await getBridalContent();
  return (
    <BridalLayout>
      <BridalServices s={s} />
    </BridalLayout>
  );
}
