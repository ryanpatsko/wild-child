import { useEffect } from 'react';

export function useDocumentMeta(documentTitle, metaDescription) {
  useEffect(() => {
    document.title = documentTitle;
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'description');
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', metaDescription);
  }, [documentTitle, metaDescription]);
}
