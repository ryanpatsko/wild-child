'use client';

import React from 'react';
import HomePagesEditor from './HomePagesEditor';
import HomeGalleryEditor from './HomeGalleryEditor';

export default function HomeEditor({ section }) {
  return section === 'gallery' ? <HomeGalleryEditor /> : <HomePagesEditor />;
}
