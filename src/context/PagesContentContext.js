import React, { createContext, useContext, useEffect, useState } from 'react';
import { createDefaultPagesContent, loadPagesContent } from '../content/pagesContent';

const PagesContentContext = createContext(createDefaultPagesContent());

export function PagesContentProvider({ children }) {
  const [doc, setDoc] = useState(() => createDefaultPagesContent());

  useEffect(() => {
    let cancelled = false;
    void loadPagesContent()
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

  return <PagesContentContext.Provider value={doc}>{children}</PagesContentContext.Provider>;
}

export function usePagesContent() {
  return useContext(PagesContentContext);
}
