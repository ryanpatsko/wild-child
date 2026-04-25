import { getPagesContent, getLocationsContent } from '../lib/serverContent';
import Home from '../components/Home';

export async function generateMetadata() {
  const { home } = await getPagesContent();
  return {
    title: home.documentTitle,
    description: home.metaDescription,
    alternates: { canonical: 'https://wildchild-makeup.com' },
    openGraph: { url: 'https://wildchild-makeup.com' },
  };
}

export default async function Page() {
  const [{ home }, { regionsNotice }] = await Promise.all([
    getPagesContent(),
    getLocationsContent(),
  ]);
  return <Home home={home} regionsNotice={regionsNotice} />;
}
