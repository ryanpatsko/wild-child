import { useEffect, useState } from 'react';
import {
  createDefaultLocationsContent,
  loadLocationsContent,
} from '../content/locationsContent';

export function useLocationsContent() {
  const [doc, setDoc] = useState(() => createDefaultLocationsContent());

  useEffect(() => {
    let cancelled = false;
    void loadLocationsContent()
      .then((loaded) => {
        if (!cancelled) setDoc(loaded);
      })
      .catch(() => {
        /* keep bundled default if S3 missing or network error */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { regionsNotice: doc.regionsNotice };
}
