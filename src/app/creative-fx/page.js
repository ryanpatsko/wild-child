import { getPagesContent } from '../../lib/serverContent';
import CreativeFX from '../../components/CreativeFX';

const PATH = '/creative-fx';

export async function generateMetadata() {
  const { creativeFx } = await getPagesContent();
  return {
    title: creativeFx.documentTitle,
    description: creativeFx.metaDescription,
    alternates: { canonical: `https://wildchild-makeup.com${PATH}` },
    openGraph: { url: `https://wildchild-makeup.com${PATH}` },
  };
}

export default async function Page() {
  const { creativeFx } = await getPagesContent();
  return <CreativeFX creativeFx={creativeFx} />;
}
