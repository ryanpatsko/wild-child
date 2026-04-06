import { useEffect, useState } from 'react';
import { createDefaultBridalContent, loadBridalContent } from '../content/bridalContent';

export function useBridalContent() {
  const [doc, setDoc] = useState(() => createDefaultBridalContent());

  useEffect(() => {
    let cancelled = false;
    void loadBridalContent()
      .then((loaded) => {
        if (!cancelled) setDoc(loaded);
      })
      .catch(() => {
        /* keep bundled default */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return doc;
}
