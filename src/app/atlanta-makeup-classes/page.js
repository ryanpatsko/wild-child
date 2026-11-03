import { getPagesContent } from '../../lib/serverContent';
import Classes from '../../components/Classes';

const PATH = '/atlanta-makeup-classes';

export async function generateMetadata() {
  const { classes: classesContent } = await getPagesContent();
  return {
    title: classesContent.documentTitle,
    description: classesContent.metaDescription,
    alternates: { canonical: `https://wildchild-makeup.com${PATH}` },
    openGraph: { url: `https://wildchild-makeup.com${PATH}` },
  };
}

export default async function Page() {
  const { classes: classesContent } = await getPagesContent();
  return <Classes classes={classesContent} />;
}
