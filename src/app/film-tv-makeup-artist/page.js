import { getMediaContent } from '../../lib/serverContent';
import Media from '../../components/Media';

const PATH = '/film-tv-makeup-artist';

export async function generateMetadata() {
  const m = await getMediaContent();
  return {
    title: m.documentTitle,
    description: m.metaDescription,
    alternates: { canonical: `https://wildchild-makeup.com${PATH}` },
    openGraph: { url: `https://wildchild-makeup.com${PATH}` },
  };
}

export default async function Page() {
  const m = await getMediaContent();
  return <Media m={m} />;
}
