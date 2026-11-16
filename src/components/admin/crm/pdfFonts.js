import { Font } from '@react-pdf/renderer';

let fontsRegistered = false;

/** Shared by the proposal and invoice PDFs so font files register once per session. */
export function registerPdfFonts() {
  if (fontsRegistered) return;
  const base = `${window.location.origin}/fonts/proposal`;
  Font.register({
    family: 'Playfair',
    fonts: [
      { src: `${base}/PlayfairDisplay-Regular.ttf` },
      { src: `${base}/PlayfairDisplay-Italic.ttf`, fontStyle: 'italic' },
      { src: `${base}/PlayfairDisplay-SemiBold.ttf`, fontWeight: 600 },
    ],
  });
  Font.register({
    family: 'RedHat',
    fonts: [
      { src: `${base}/RedHatDisplay-Regular.ttf` },
      { src: `${base}/RedHatDisplay-Medium.ttf`, fontWeight: 500 },
      { src: `${base}/RedHatDisplay-Bold.ttf`, fontWeight: 700 },
    ],
  });
  Font.register({ family: 'Castoro', src: `${base}/CastoroTitling-Regular.ttf` });
  Font.registerHyphenationCallback((word) => [word]);
  fontsRegistered = true;
}
