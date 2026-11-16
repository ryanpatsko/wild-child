import { fxPhotoSrc } from '../content/fxBundledPhotos';

function FxRow({ images }) {
  const photos = images.filter((ref) => fxPhotoSrc(ref));
  if (photos.length === 0) return null;
  return (
    <div className="fx-images-row">
      {photos.map((ref, i) => (
        <div key={`${ref}-${i}`} className="fx-image-container">
          <img src={fxPhotoSrc(ref)} alt={`Creative FX work ${i + 1}`} className="fx-image" />
        </div>
      ))}
    </div>
  );
}

const CreativeFX = ({ creativeFx, photos }) => {
  const headerSrc = fxPhotoSrc(photos.header);
  return (
    <div className="page-container">
      {headerSrc ? (
        <div className="page-header">
          <img src={headerSrc} alt="Page Banner - Creative & FX" className="page-header-image" />
        </div>
      ) : null}
      <h1 className="page-title">{creativeFx.pageTitle}</h1>
      <p className="intro-text">{creativeFx.introText}</p>

      <section className="section-card">
        <h2 className="section-title section-title-creative">{creativeFx.servicesTitle}</h2>
        <ul className="styled-list">
          {creativeFx.serviceItems.map((item, i) => (
            <li key={i} dangerouslySetInnerHTML={{ __html: item }} />
          ))}
        </ul>
      </section>

      <FxRow images={photos.afterServices} />

      <section className="section-card">
        <h2 className="section-title section-title-creative">{creativeFx.pricingTitle}</h2>
        <ul className="styled-list">
          {creativeFx.pricingItems.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="section-card">
        <h2 className="section-title section-title-creative">{creativeFx.bookingTitle}</h2>
        {creativeFx.bookingParagraphs.map((para, i) => (
          <p key={i} className="body-text">{para}</p>
        ))}
      </section>

      <FxRow images={photos.afterBooking} />
    </div>
  );
};

export default CreativeFX;
