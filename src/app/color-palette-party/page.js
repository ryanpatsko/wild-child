import ColorPaletteParty from '../../components/ColorPaletteParty';

const PATH = '/color-palette-party';

export const metadata = {
  title: 'Color Palette Party | Wild Child Fabrications',
  description: 'Discover your personal color palette with Wild Child Fabrications.',
  alternates: { canonical: `https://wildchild-makeup.com${PATH}` },
  openGraph: { url: `https://wildchild-makeup.com${PATH}` },
};

export default function Page() {
  return <ColorPaletteParty />;
}
