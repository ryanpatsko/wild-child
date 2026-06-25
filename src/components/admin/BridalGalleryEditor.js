import React from 'react';
import CmsGalleryEditor from './CmsGalleryEditor';
import {
  createDefaultGalleryBridalContent,
  galleryBridalContentSignature,
  galleryBridalImageUrl,
  loadGalleryBridalContent,
  sanitizeGalleryBridalContentForSave,
} from '../../content/galleryBridalContent';
import {
  deleteGalleryBridalImage,
  requestGalleryBridalUpload,
  saveGalleryBridalManifest,
} from '../../lib/cmsApi';

export default function BridalGalleryEditor() {
  return (
    <CmsGalleryEditor
      title="Bridal gallery"
      description={
        <>
          Images for the /bridal-gallery page. Reorder with the arrows, then save. Uploads apply immediately.
        </>
      }
      s3Folder="gallery-bridal"
      inputId="bridal-gallery-upload"
      loadContent={loadGalleryBridalContent}
      createDefaultContent={createDefaultGalleryBridalContent}
      contentSignature={galleryBridalContentSignature}
      sanitizeForSave={sanitizeGalleryBridalContentForSave}
      imageUrl={galleryBridalImageUrl}
      saveManifest={saveGalleryBridalManifest}
      requestUpload={requestGalleryBridalUpload}
      deleteImage={deleteGalleryBridalImage}
    />
  );
}
