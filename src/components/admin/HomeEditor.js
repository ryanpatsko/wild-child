'use client';

import React from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import HomePagesEditor from './HomePagesEditor';
import HomeGalleryEditor from './HomeGalleryEditor';

const HOME_SECTIONS = ['copy', 'gallery'];

const SECTION_LABELS = {
  copy: 'Page copy',
  gallery: 'Gallery',
};

function SubTabs({ active, onSelect }) {
  return (
    <div className="admin-bridal-subtabs" role="tablist" aria-label="Home CMS sections">
      {HOME_SECTIONS.map((id) => (
        <button
          key={id}
          type="button"
          role="tab"
          aria-selected={active === id}
          className={`admin-bridal-subtab ${active === id ? 'admin-bridal-subtab-active' : ''}`}
          onClick={() => onSelect(id)}
        >
          {SECTION_LABELS[id]}
        </button>
      ))}
    </div>
  );
}

export default function HomeEditor() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const sectionRaw = searchParams.get('homeSection');
  const section = HOME_SECTIONS.includes(sectionRaw) ? sectionRaw : 'copy';

  function selectSection(id) {
    const next = new URLSearchParams(searchParams.toString());
    next.set('tab', 'home');
    next.set('homeSection', id);
    router.replace(`${pathname}?${next.toString()}`);
  }

  return (
    <>
      <SubTabs active={section} onSelect={selectSection} />
      {section === 'copy' ? <HomePagesEditor /> : <HomeGalleryEditor />}
    </>
  );
}
