import { getPagesContent } from '../../lib/serverContent';
import BeautyEvents from '../../components/BeautyEvents';

const PATH = '/event-hair-and-makeup';

export async function generateMetadata() {
  const { beauty } = await getPagesContent();
  return {
    title: beauty.documentTitle,
    description: beauty.metaDescription,
    alternates: { canonical: `https://wildchild-makeup.com${PATH}` },
    openGraph: { url: `https://wildchild-makeup.com${PATH}` },
  };
}

export default async function Page() {
  const { beauty } = await getPagesContent();
  return <BeautyEvents beauty={beauty} />;
}
