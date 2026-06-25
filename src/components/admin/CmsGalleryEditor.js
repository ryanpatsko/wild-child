import React, { useEffect, useMemo, useRef, useState } from 'react';
import { getStoredSessionToken } from '../../lib/adminAuth';
import { PagesEditorSaveRow } from './pagesEditorShared';

const MAX_IMAGES = 30;
const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

function moveItem(list, from, to) {
  if (to < 0 || to >= list.length) return list;
  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

export default function CmsGalleryEditor({
  title,
  description,
  s3Folder,
  inputId,
  loadContent,
  createDefaultContent,
  contentSignature,
  sanitizeForSave,
  imageUrl,
  saveManifest,
  requestUpload,
  deleteImage,
}) {
  const fileInputRef = useRef(null);
  const [status, setStatus] = useState('loading');
  const [loadError, setLoadError] = useState(null);
  const [savedVersion, setSavedVersion] = useState(1);
  const [images, setImages] = useState([]);
  const [baselineSig, setBaselineSig] = useState('');
  const [saveError, setSaveError] = useState(null);
  const [saveSucceeded, setSaveSucceeded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [actionError, setActionError] = useState(null);

  const currentSig = useMemo(
    () => contentSignature({ version: savedVersion, images }),
    [contentSignature, savedVersion, images],
  );
  const isDirty = baselineSig !== '' && currentSig !== baselineSig;

  useEffect(() => {
    if (isDirty) setSaveSucceeded(false);
  }, [isDirty]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const data = await loadContent();
        if (cancelled) return;
        setSavedVersion(data.version);
        setImages(data.images);
        setBaselineSig(contentSignature(data));
        setStatus('ready');
      } catch (e) {
        if (cancelled) return;
        const def = createDefaultContent();
        setSavedVersion(def.version);
        setImages(def.images);
        setBaselineSig(contentSignature(def));
        setLoadError(
          e instanceof Error
            ? `${e.message} Using default image list until the manifest is in S3. Upload images to populate the gallery.`
            : 'Could not load gallery manifest from S3.',
        );
        setStatus('ready');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [loadContent, createDefaultContent, contentSignature]);

  async function persistManifest(nextImages, nextVersion) {
    const token = getStoredSessionToken();
    if (!token) {
      setSaveError('Not signed in.');
      return false;
    }
    const doc = sanitizeForSave({ version: nextVersion, images: nextImages });
    setSaving(true);
    setSaveError(null);
    try {
      const result = await saveManifest(token, doc);
      if (result.ok) {
        setSavedVersion(doc.version);
        setImages(doc.images);
        setBaselineSig(contentSignature(doc));
        setSaveSucceeded(true);
        return true;
      }
      setSaveError(result.message);
      return false;
    } finally {
      setSaving(false);
    }
  }

  async function onSaveOrder(e) {
    e.preventDefault();
    await persistManifest(images, savedVersion + 1);
  }

  async function onUpload(file) {
    if (!file || !ALLOWED_TYPES.has(file.type)) {
      setUploadError('Choose a JPEG, PNG, or WebP image.');
      return;
    }
    if (images.length >= MAX_IMAGES) {
      setUploadError(`Gallery supports at most ${MAX_IMAGES} images.`);
      return;
    }
    const token = getStoredSessionToken();
    if (!token) {
      setUploadError('Not signed in.');
      return;
    }
    setUploadError(null);
    setActionError(null);
    setUploading(true);
    try {
      const req = await requestUpload(token, {
        filename: file.name,
        contentType: file.type,
      });
      if (!req.ok) {
        setUploadError(req.message);
        return;
      }
      let putRes;
      try {
        putRes = await fetch(req.uploadUrl, {
          method: 'PUT',
          headers: { 'Content-Type': file.type },
          body: file,
        });
      } catch {
        setUploadError('Network error uploading to S3. Check bucket CORS allows PUT from this origin.');
        return;
      }
      if (!putRes.ok) {
        setUploadError(`Upload to S3 failed (HTTP ${putRes.status}).`);
        return;
      }
      const nextImages = [...images, req.filename];
      const ok = await persistManifest(nextImages, savedVersion + 1);
      if (!ok) {
        setActionError('Image uploaded but saving the manifest failed. Try saving again or remove the new file.');
      }
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  async function onDelete(filename) {
    if (!window.confirm(`Remove "${filename}" from the gallery? This deletes the file from S3.`)) return;
    const token = getStoredSessionToken();
    if (!token) {
      setActionError('Not signed in.');
      return;
    }
    setActionError(null);
    const nextImages = images.filter((x) => x !== filename);
    const ok = await persistManifest(nextImages, savedVersion + 1);
    if (!ok) return;
    const del = await deleteImage(token, filename);
    if (!del.ok) {
      setActionError(`Removed from gallery list but S3 delete failed: ${del.message}`);
    }
  }

  if (status === 'loading') {
    return (
      <p className="admin-status" role="status">
        Loading gallery…
      </p>
    );
  }

  return (
    <div className="admin-bridal-form">
      <h3 className="admin-panel-title">{title}</h3>
      <p className="admin-muted">{description}</p>
      {loadError ? (
        <p className="admin-warn" role="status">
          {loadError}
        </p>
      ) : null}
      {uploadError ? (
        <p className="admin-error" role="alert">
          {uploadError}
        </p>
      ) : null}
      {actionError ? (
        <p className="admin-warn" role="status">
          {actionError}
        </p>
      ) : null}

      <div className="admin-gallery-upload">
        <label className="admin-label" htmlFor={inputId}>
          Add image
        </label>
        <input
          ref={fileInputRef}
          id={inputId}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          disabled={uploading || images.length >= MAX_IMAGES}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void onUpload(file);
          }}
        />
        <p className="admin-hint admin-muted">
          JPEG, PNG, or WebP. Stored in S3 under <code>{s3Folder}/</code>. Up to {MAX_IMAGES} images.
        </p>
        {uploading ? <p className="admin-muted">Uploading…</p> : null}
      </div>

      {images.length === 0 ? (
        <p className="admin-muted">No images yet. Upload one to get started.</p>
      ) : (
        <ul className="admin-gallery-list">
          {images.map((filename, index) => (
            <li key={filename} className="admin-gallery-item">
              <img
                src={imageUrl(filename)}
                alt=""
                className="admin-gallery-thumb"
                width={120}
                height={90}
                loading="lazy"
              />
              <div className="admin-gallery-item-meta">
                <span className="admin-gallery-filename">{filename}</span>
                <span className="admin-muted">Position {index + 1}</span>
              </div>
              <div className="admin-gallery-item-actions">
                <button
                  type="button"
                  className="admin-secondary-btn"
                  disabled={index === 0 || saving || uploading}
                  onClick={() => setImages(moveItem(images, index, index - 1))}
                  aria-label={`Move ${filename} up`}
                >
                  ↑
                </button>
                <button
                  type="button"
                  className="admin-secondary-btn"
                  disabled={index === images.length - 1 || saving || uploading}
                  onClick={() => setImages(moveItem(images, index, index + 1))}
                  aria-label={`Move ${filename} down`}
                >
                  ↓
                </button>
                <button
                  type="button"
                  className="admin-secondary-btn"
                  disabled={saving || uploading}
                  onClick={() => void onDelete(filename)}
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={onSaveOrder}>
        <PagesEditorSaveRow
          saveError={saveError}
          saveSucceeded={saveSucceeded}
          saving={saving}
          isDirty={isDirty}
        />
      </form>
    </div>
  );
}
