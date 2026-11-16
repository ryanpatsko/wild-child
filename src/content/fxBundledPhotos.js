import fx1 from '../assets/gallery-fx/fx-1.jpg';
import fx3 from '../assets/gallery-fx/fx-3.jpg';
import fx4 from '../assets/gallery-fx/fx-4.jpg';
import fx5 from '../assets/gallery-fx/fx-5.jpg';
import fx6 from '../assets/gallery-fx/fx-6.jpg';
import { bundledFxName, galleryFxImageUrl, isBundledFxRef } from './galleryFxContent';

export const bundledFxSrc = {
  'fx-1.jpg': fx1.src,
  'fx-3.jpg': fx3.src,
  'fx-4.jpg': fx4.src,
  'fx-5.jpg': fx5.src,
  'fx-6.jpg': fx6.src,
};

export function fxPhotoSrc(ref) {
  if (isBundledFxRef(ref)) return bundledFxSrc[bundledFxName(ref)] ?? '';
  return galleryFxImageUrl(ref);
}
