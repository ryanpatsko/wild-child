import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  createDefaultPagesContent,
  loadPagesContent,
  pagesContentSignature,
  sanitizePagesContentForSave,
} from '../content/pagesContent';
import { savePagesContent } from '../lib/cmsApi';
import { getStoredSessionToken } from '../lib/adminAuth';

const PagesContentAdminContext = createContext(null);

export function PagesContentAdminProvider({ children }) {
  const [status, setStatus] = useState('loading');
  const [loadError, setLoadError] = useState(null);
  const [savedVersion, setSavedVersion] = useState(1);
  const [draft, setDraft] = useState(() => createDefaultPagesContent());
  const [baselineSig, setBaselineSig] = useState(null);
  const [saveError, setSaveError] = useState(null);
  const [saveSucceeded, setSaveSucceeded] = useState(false);
  const [saving, setSaving] = useState(false);

  const currentSig = useMemo(() => pagesContentSignature(draft), [draft]);
  const isDirty = useMemo(() => baselineSig !== null && currentSig !== baselineSig, [baselineSig, currentSig]);

  useEffect(() => {
    if (isDirty) setSaveSucceeded(false);
  }, [isDirty]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const data = await loadPagesContent();
        if (cancelled) return;
        setSavedVersion(data.version);
        setDraft(data);
        setBaselineSig(pagesContentSignature(data));
        setStatus('ready');
      } catch (e) {
        if (cancelled) return;
        const def = createDefaultPagesContent();
        setSavedVersion(def.version);
        setDraft(def);
        setBaselineSig(pagesContentSignature(def));
        setLoadError(
          e instanceof Error
            ? `${e.message} Using default copy until pages-content.json is in S3 or the URL is correct.`
            : 'Could not load from S3. Using default copy.',
        );
        setStatus('ready');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const onSave = useCallback(
    async (e) => {
      e.preventDefault();
      setSaveError(null);
      setSaveSucceeded(false);
      const token = getStoredSessionToken();
      if (!token) {
        setSaveError('Not signed in.');
        return;
      }
      const nextVersion = savedVersion + 1;
      const doc = sanitizePagesContentForSave({ ...draft, version: nextVersion });
      setSaving(true);
      try {
        const result = await savePagesContent(token, doc);
        if (result.ok) {
          setSavedVersion(nextVersion);
          setDraft(doc);
          setBaselineSig(pagesContentSignature(doc));
          setSaveSucceeded(true);
        } else {
          setSaveError(result.message);
        }
      } finally {
        setSaving(false);
      }
    },
    [draft, savedVersion],
  );

  const value = useMemo(
    () => ({
      status,
      loadError,
      draft,
      setDraft,
      saveError,
      saveSucceeded,
      saving,
      isDirty,
      onSave,
    }),
    [status, loadError, draft, saveError, saveSucceeded, saving, isDirty, onSave],
  );

  return <PagesContentAdminContext.Provider value={value}>{children}</PagesContentAdminContext.Provider>;
}

export function usePagesContentAdmin() {
  const ctx = useContext(PagesContentAdminContext);
  if (!ctx) {
    throw new Error('usePagesContentAdmin must be used within PagesContentAdminProvider');
  }
  return ctx;
}

// typo useMemoL -> useMemo