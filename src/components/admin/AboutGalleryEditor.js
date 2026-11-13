import React from 'react';
import CmsGalleryEditor from './CmsGalleryEditor';
import {
  createDefaultGalleryAboutContent,
  galleryAboutContentSignature,
  galleryAboutImageUrl,
  loadGalleryAboutContent,
  sanitizeGalleryAboutContentForSave,
} from '../../content/galleryAboutContent';
import {
  deleteGalleryAboutImage,
  requestGalleryAboutUpload,
  saveGalleryAboutManifest,
} from '../../lib/cmsApi';

export default function AboutGalleryEditor() {
  return (
    <CmsGalleryEditor
      description="Photos stack beside the About copy in the order set here. Uploads apply immediately."
      s3Folder="gallery-about"
      inputId="about-gallery-upload"
      loadContent={loadGalleryAboutContent}
      createDefaultContent={createDefaultGalleryAboutContent}
      contentSignature={galleryAboutContentSignature}
      sanitizeForSave={sanitizeGalleryAboutContentForSave}
      imageUrl={galleryAboutImageUrl}
      saveManifest={saveGalleryAboutManifest}
      requestUpload={requestGalleryAboutUpload}
      deleteImage={deleteGalleryAboutImage}
    />
  );
}
