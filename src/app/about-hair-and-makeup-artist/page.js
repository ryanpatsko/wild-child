import { getAboutContent } from '../../lib/serverContent';
import AboutMe from '../../components/AboutMe';

const PATH = '/about-hair-and-makeup-artist';

export async function generateMetadata() {
  const content = await getAboutContent();
  return {
    title: content.documentTitle,
    description: content.metaDescription,
    alternates: { canonical: `https://wildchild-makeup.com${PATH}` },
    openGraph: { url: `https://wildchild-makeup.com${PATH}` },
  };
}

export default async function Page() {
  const content = await getAboutContent();
  return <AboutMe content={content} />;
}
