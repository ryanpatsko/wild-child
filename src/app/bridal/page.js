import { getBridalContent, getLocationsContent } from '../../lib/serverContent';
import BridalLayout from '../../components/BridalLayout';
import Bridal from '../../components/Bridal';

const PATH = '/bridal';

export async function generateMetadata() {
  const { overview } = await getBridalContent();
  return {
    title: overview.documentTitle,
    description: overview.metaDescription,
    alternates: { canonical: `https://wildchild-makeup.com${PATH}` },
    openGraph: { url: `https://wildchild-makeup.com${PATH}` },
  };
}

export default async function Page() {
  const [bridal, { regionsNotice }] = await Promise.all([
    getBridalContent(),
    getLocationsContent(),
  ]);
  return (
    <BridalLayout>
      <Bridal bridal={bridal} regionsNotice={regionsNotice} />
    </BridalLayout>
  );
}
