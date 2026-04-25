import { getPagesContent } from '../../lib/serverContent';
import Contact from '../../components/Contact';

const PATH = '/book-hair-and-makeup-artist';

export async function generateMetadata() {
  const { contact } = await getPagesContent();
  return {
    title: contact.documentTitle,
    description: contact.metaDescription,
    alternates: { canonical: `https://wildchild-makeup.com${PATH}` },
    openGraph: { url: `https://wildchild-makeup.com${PATH}` },
  };
}

export default async function Page() {
  const { contact } = await getPagesContent();
  return <Contact contact={contact} />;
}
