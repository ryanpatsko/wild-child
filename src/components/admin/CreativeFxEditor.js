'use client';

import React from 'react';
import CreativeFxPagesEditor from './CreativeFxPagesEditor';
import CreativeFxPhotosEditor from './CreativeFxPhotosEditor';

export default function CreativeFxEditor({ section }) {
  return section === 'photos' ? <CreativeFxPhotosEditor /> : <CreativeFxPagesEditor />;
}
