import BridalLayout from '../../components/BridalLayout';
import BridalGalleryPage from '../../components/BridalGalleryPage';

const PATH = '/bridal-gallery';

export const metadata = {
  title: 'Bridal Gallery | Wild Child Fabrications',
  description: 'View our bridal hair and makeup gallery — real weddings, real brides.',
  alternates: { canonical: `https://wildchild-makeup.com${PATH}` },
  openGraph: { url: `https://wildchild-makeup.com${PATH}` },
};

export default function Page() {
  return (
    <BridalLayout>
      <BridalGalleryPage />
    </BridalLayout>
  );
}
