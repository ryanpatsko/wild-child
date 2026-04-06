import { useEffect, useState } from 'react';
import { createDefaultAboutContent, loadAboutContent } from '../content/aboutContent';

export function useAboutContent() {
  const [doc, setDoc] = useState(() => createDefaultAboutContent());

  useEffect(() => {
    let cancelled = false;
    void loadAboutContent()
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
