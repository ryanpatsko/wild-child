import React from 'react';
import CmsGalleryEditor from './CmsGalleryEditor';
import {
  createDefaultGalleryHomeContent,
  galleryHomeContentSignature,
  galleryHomeImageUrl,
  loadGalleryHomeContent,
  sanitizeGalleryHomeContentForSave,
} from '../../content/galleryHomeContent';
import {
  deleteGalleryHomeImage,
  requestGalleryHomeUpload,
  saveGalleryHomeManifest,
} from '../../lib/cmsApi';

export default function HomeGalleryEditor() {
  return (
    <CmsGalleryEditor
      title="Home gallery"
      description={
        <>
          Images for the home page grid. Reorder with the arrows, then save. Uploads apply immediately.
        </>
      }
      s3Folder="gallery-home"
      inputId="home-gallery-upload"
      loadContent={loadGalleryHomeContent}
      createDefaultContent={createDefaultGalleryHomeContent}
      contentSignature={galleryHomeContentSignature}
      sanitizeForSave={sanitizeGalleryHomeContentForSave}
      imageUrl={galleryHomeImageUrl}
      saveManifest={saveGalleryHomeManifest}
      requestUpload={requestGalleryHomeUpload}
      deleteImage={deleteGalleryHomeImage}
    />
  );
}
