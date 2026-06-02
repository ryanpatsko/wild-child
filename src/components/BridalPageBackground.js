import bridalPageBackground from '../assets/gallery-bridal/bridal-page-background.jpg';

export default function BridalPageBackground() {
  return (
    <div
      className="bridal-page-background"
      style={{ backgroundImage: `url(${bridalPageBackground.src})` }}
      aria-hidden="true"
    />
  );
}
