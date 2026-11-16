import { getGalleryFxContent, getPagesContent } from '../../lib/serverContent';
import CreativeFX from '../../components/CreativeFX';

const PATH = '/atlanta-special-effects-makeup';

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
  const [{ creativeFx }, photos] = await Promise.all([getPagesContent(), getGalleryFxContent()]);
  return <CreativeFX creativeFx={creativeFx} photos={photos} />;
}
