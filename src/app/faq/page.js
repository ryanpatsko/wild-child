import { getPagesContent } from '../../lib/serverContent';
import FAQ from '../../components/FAQ';

const PATH = '/faq';

export async function generateMetadata() {
  const { faq } = await getPagesContent();
  return {
    title: faq.documentTitle,
    description: faq.metaDescription,
    alternates: { canonical: `https://wildchild-makeup.com${PATH}` },
    openGraph: { url: `https://wildchild-makeup.com${PATH}` },
  };
}

export default async function Page() {
  const { faq } = await getPagesContent();
  return <FAQ faq={faq} />;
}
