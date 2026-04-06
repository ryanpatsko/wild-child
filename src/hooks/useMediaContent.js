import { useEffect, useState } from 'react';
import { createDefaultMediaContent, loadMediaContent } from '../content/mediaContent';

export function useMediaContent() {
  const [doc, setDoc] = useState(() => createDefaultMediaContent());

  useEffect(() => {
    let cancelled = false;
    void loadMediaContent()
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
