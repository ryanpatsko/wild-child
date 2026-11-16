'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { fxPhotoSrc } from '../../content/fxBundledPhotos';
import {
  FX_GRID_MAX,
  FX_ORIGINALS,
  bundledFxRef,
  createDefaultGalleryFxContent,
  galleryFxContentSignature,
  galleryFxManifestIsPublic,
  isBundledFxRef,
  loadGalleryFxContent,
  sanitizeGalleryFxContentForSave,
} from '../../content/galleryFxContent';
import { getStoredSessionToken } from '../../lib/adminAuth';
import {
  deleteGalleryFxImage,
  requestGalleryFxUpload,
  saveGalleryFxManifest,
} from '../../lib/cmsApi';
import { PagesEditorSaveRow } from './pagesEditorShared';

const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

function moveItem(list, from, to) {
  if (to < 0 || to >= list.length) return list;
  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

function photoLabel(ref) {
  return isBundledFxRef(ref) ? 'Original photo' : ref;
}

export default function CreativeFxPhotosEditor() {
  const headerInputRef = useRef(null);
  const servicesInputRef = useRef(null);
  const bookingInputRef = useRef(null);
  const [status, setStatus] = useState('loading');
  const [loadError, setLoadError] = useState(null);
  const [savedVersion, setSavedVersion] = useState(1);
  const [header, setHeader] = useState('');
  const [afterServices, setAfterServices] = useState([]);
  const [afterBooking, setAfterBooking] = useState([]);
  const [baselineSig, setBaselineSig] = useState('');
  const [saveError, setSaveError] = useState(null);
  const [saveSucceeded, setSaveSucceeded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [actionError, setActionError] = useState(null);

  const currentSig = useMemo(
    () => galleryFxContentSignature({ version: savedVersion, header, afterServices, afterBooking }),
    [savedVersion, header, afterServices, afterBooking],
  );
  const isDirty = baselineSig !== '' && currentSig !== baselineSig;
  const busy = saving || uploading;

  useEffect(() => {
    if (isDirty) setSaveSucceeded(false);
  }, [isDirty]);

  function applyDoc(doc) {
    setSavedVersion(doc.version);
    setHeader(doc.header);
    setAfterServices(doc.afterServices);
    setAfterBooking(doc.afterBooking);
    setBaselineSig(galleryFxContentSignature(doc));
  }

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const data = await loadGalleryFxContent();
        if (cancelled) return;
        applyDoc(data);
        setStatus('ready');
      } catch (e) {
        if (cancelled) return;
        const def = createDefaultGalleryFxContent();
        applyDoc(def);
        const status = e?.status;
        const notPublishedYet = status === 403 || status === 404;
        setLoadError(
          notPublishedYet
            ? null
            : e instanceof Error
              ? `${e.message} Showing the photos that are on the page now.`
              : 'Could not load the photo list. Showing the photos that are on the page now.',
        );
        setStatus('ready');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function persist(next, nextVersion) {
    const token = getStoredSessionToken();
    if (!token) {
      setSaveError('Not signed in.');
      return false;
    }
    const doc = sanitizeGalleryFxContentForSave({ version: nextVersion, ...next });
    setSaving(true);
    setSaveError(null);
    try {
      const result = await saveGalleryFxManifest(token, doc);
      if (result.ok) {
        applyDoc(doc);
        setSaveSucceeded(true);
        if (!(await galleryFxManifestIsPublic())) {
          setActionError(
            'Saved, but the public site cannot read gallery-fx/manifest.json. The bucket policy needs public GetObject on gallery-fx/*, or the live page keeps the built-in photos.',
          );
        }
        return true;
      }
      setSaveError(result.message);
      return false;
    } finally {
      setSaving(false);
    }
  }

  async function uploadFile(file) {
    if (!file || !ALLOWED_TYPES.has(file.type)) {
      setUploadError('Choose a JPEG, PNG, or WebP image.');
      return null;
    }
    const token = getStoredSessionToken();
    if (!token) {
      setUploadError('Not signed in.');
      return null;
    }
    setUploadError(null);
    setActionError(null);
    setUploading(true);
    try {
      const req = await requestGalleryFxUpload(token, { filename: file.name, contentType: file.type });
      if (!req.ok) {
        setUploadError(req.message);
        return null;
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
        return null;
      }
      if (!putRes.ok) {
        setUploadError(`Upload to S3 failed (HTTP ${putRes.status}).`);
        return null;
      }
      return req.filename;
    } finally {
      setUploading(false);
    }
  }

  async function deleteUploaded(filename, stillUsed) {
    if (!filename || isBundledFxRef(filename) || stillUsed) return;
    const token = getStoredSessionToken();
    if (!token) return;
    const del = await deleteGalleryFxImage(token, filename);
    if (!del.ok) setActionError(`Removed from the page, but deleting the file failed: ${del.message}`);
  }

  async function onReplaceHeader(file) {
    const filename = await uploadFile(file);
    if (headerInputRef.current) headerInputRef.current.value = '';
    if (!filename) return;
    const previous = header;
    const ok = await persist({ header: filename, afterServices, afterBooking }, savedVersion + 1);
    if (!ok) {
      setActionError('Image uploaded, but saving the photo list failed. Try saving again.');
      return;
    }
    const stillUsed = [filename, ...afterServices, ...afterBooking].includes(previous);
    await deleteUploaded(previous, stillUsed);
  }

  async function onUseOriginalHeader() {
    if (isBundledFxRef(header)) return;
    const previous = header;
    const ok = await persist(
      { header: bundledFxRef(FX_ORIGINALS.header), afterServices, afterBooking },
      savedVersion + 1,
    );
    if (!ok) return;
    await deleteUploaded(previous, [...afterServices, ...afterBooking].includes(previous));
  }

  async function onAddToGrid(section, file, inputRef) {
    const list = section === 'afterServices' ? afterServices : afterBooking;
    if (list.length >= FX_GRID_MAX) {
      setUploadError(`Each photo row holds at most ${FX_GRID_MAX} images.`);
      if (inputRef.current) inputRef.current.value = '';
      return;
    }
    const filename = await uploadFile(file);
    if (inputRef.current) inputRef.current.value = '';
    if (!filename) return;
    const nextList = [...list, filename];
    const next =
      section === 'afterServices'
        ? { header, afterServices: nextList, afterBooking }
        : { header, afterServices, afterBooking: nextList };
    const ok = await persist(next, savedVersion + 1);
    if (!ok) setActionError('Image uploaded, but saving the photo list failed. Try saving again.');
  }

  async function onAddOriginal(section, filename) {
    const ref = bundledFxRef(filename);
    const list = section === 'afterServices' ? afterServices : afterBooking;
    if (list.includes(ref) || list.length >= FX_GRID_MAX) return;
    const nextList = [...list, ref];
    const next =
      section === 'afterServices'
        ? { header, afterServices: nextList, afterBooking }
        : { header, afterServices, afterBooking: nextList };
    await persist(next, savedVersion + 1);
  }

  async function onRemove(section, ref) {
    const label = photoLabel(ref);
    const warning = isBundledFxRef(ref)
      ? `Remove this ${label.toLowerCase()} from the page?`
      : `Remove this photo from the page? This deletes the file.`;
    if (!window.confirm(warning)) return;
    const list = section === 'afterServices' ? afterServices : afterBooking;
    const nextList = list.filter((item) => item !== ref);
    const next =
      section === 'afterServices'
        ? { header, afterServices: nextList, afterBooking }
        : { header, afterServices, afterBooking: nextList };
    const ok = await persist(next, savedVersion + 1);
    if (!ok) return;
    const stillUsed = [next.header, ...next.afterServices, ...next.afterBooking].includes(ref);
    await deleteUploaded(ref, stillUsed);
  }

  if (status === 'loading') {
    return (
      <p className="admin-status" role="status">
        Loading photos…
      </p>
    );
  }

  return (
    <div className="admin-bridal-form">
      <p className="admin-hint">
        The banner stays one full-width image. Each photo row sits where it does now, two across, and extra photos
        wrap onto another row. Original photos stay on the site until you replace or remove them.
      </p>
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

      <section className="fx-photo-section">
        <h3 className="admin-subheading">Banner</h3>
        <ul className="admin-gallery-list">
          <li className="admin-gallery-item">
            <img src={fxPhotoSrc(header)} alt="" className="admin-gallery-thumb" width={120} height={90} />
            <div className="admin-gallery-item-meta">
              <span className="admin-gallery-filename">{photoLabel(header)}</span>
              <span className="admin-muted">Shown across the top of the page</span>
            </div>
            {!isBundledFxRef(header) ? (
              <div className="admin-gallery-item-actions">
                <button type="button" className="admin-secondary-btn" disabled={busy} onClick={onUseOriginalHeader}>
                  Use original
                </button>
              </div>
            ) : null}
          </li>
        </ul>
        <PhotoFilePicker
          id="fx-header-upload"
          inputRef={headerInputRef}
          label="Replace banner"
          hint="JPEG, PNG, or WebP"
          disabled={busy}
          onFile={onReplaceHeader}
        />
      </section>

      <PhotoGrid
        title="Photos under Services"
        hint="Shown between the services list and the pricing section."
        inputId="fx-services-upload"
        inputRef={servicesInputRef}
        images={afterServices}
        originals={FX_ORIGINALS.afterServices}
        busy={busy}
        onUpload={(file) => onAddToGrid('afterServices', file, servicesInputRef)}
        onAddOriginal={(filename) => onAddOriginal('afterServices', filename)}
        onMove={(index, to) => setAfterServices(moveItem(afterServices, index, to))}
        onRemove={(ref) => onRemove('afterServices', ref)}
      />

      <PhotoGrid
        title="Photos under Booking"
        hint="Shown below the booking section."
        inputId="fx-booking-upload"
        inputRef={bookingInputRef}
        images={afterBooking}
        originals={FX_ORIGINALS.afterBooking}
        busy={busy}
        onUpload={(file) => onAddToGrid('afterBooking', file, bookingInputRef)}
        onAddOriginal={(filename) => onAddOriginal('afterBooking', filename)}
        onMove={(index, to) => setAfterBooking(moveItem(afterBooking, index, to))}
        onRemove={(ref) => onRemove('afterBooking', ref)}
      />

      {uploading ? <p className="admin-muted">Uploading…</p> : null}

      <form
        className="fx-photo-save"
        onSubmit={(e) => {
          e.preventDefault();
          void persist({ header, afterServices, afterBooking }, savedVersion + 1);
        }}
      >
        <PagesEditorSaveRow saveError={saveError} saveSucceeded={saveSucceeded} saving={busy} isDirty={isDirty} />
      </form>
    </div>
  );
}

function PhotoFilePicker({ id, inputRef, label, hint, disabled, onFile }) {
  return (
    <div className="fx-file-picker">
      <input
        ref={inputRef}
        id={id}
        className="fx-file-input"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        disabled={disabled}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void onFile(file);
        }}
      />
      <label htmlFor={id} className="fx-file-button">
        {label}
      </label>
      <span className="fx-file-hint">{hint}</span>
    </div>
  );
}

function PhotoGrid({
  title,
  hint,
  inputId,
  inputRef,
  images,
  originals,
  busy,
  onUpload,
  onAddOriginal,
  onMove,
  onRemove,
}) {
  const missing = originals.filter((filename) => !images.includes(bundledFxRef(filename)));
  return (
    <section className="fx-photo-section">
      <h3 className="admin-subheading">{title}</h3>
      <p className="admin-hint">{hint}</p>
      {images.length === 0 ? (
        <p className="admin-muted">No photos in this row. The page hides it until you add one.</p>
      ) : (
        <ul className="admin-gallery-list">
          {images.map((ref, index) => (
            <li key={`${ref}-${index}`} className="admin-gallery-item">
              <img src={fxPhotoSrc(ref)} alt="" className="admin-gallery-thumb" width={120} height={90} />
              <div className="admin-gallery-item-meta">
                <span className="admin-gallery-filename">{photoLabel(ref)}</span>
                <span className="admin-muted">
                  Position {index + 1}
                  {isBundledFxRef(ref) ? ' · original photo' : ''}
                </span>
              </div>
              <div className="admin-gallery-item-actions">
                <button
                  type="button"
                  className="admin-secondary-btn"
                  disabled={index === 0 || busy}
                  onClick={() => onMove(index, index - 1)}
                  aria-label={`Move photo ${index + 1} up`}
                >
                  ↑
                </button>
                <button
                  type="button"
                  className="admin-secondary-btn"
                  disabled={index === images.length - 1 || busy}
                  onClick={() => onMove(index, index + 1)}
                  aria-label={`Move photo ${index + 1} down`}
                >
                  ↓
                </button>
                <button type="button" className="admin-secondary-btn" disabled={busy} onClick={() => onRemove(ref)}>
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
      {missing.length > 0 && images.length < FX_GRID_MAX ? (
        <div className="admin-gallery-item-actions">
          {missing.map((filename) => (
            <button
              key={filename}
              type="button"
              className="admin-secondary-btn"
              disabled={busy}
              onClick={() => onAddOriginal(filename)}
            >
              <img src={fxPhotoSrc(bundledFxRef(filename))} alt="" width={36} height={27} /> Add this photo
            </button>
          ))}
        </div>
      ) : null}
      <PhotoFilePicker
        id={inputId}
        inputRef={inputRef}
        label="Add photo"
        hint={`JPEG, PNG, or WebP. Up to ${FX_GRID_MAX} in this row.`}
        disabled={busy || images.length >= FX_GRID_MAX}
        onFile={onUpload}
      />
    </section>
  );
}
