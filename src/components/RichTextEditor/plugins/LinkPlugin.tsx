// src/components/RichTextEditor/plugins/LinkPlugin.tsx
'use client';

import React from 'react';
import { LinkPlugin as LexicalLinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import { validateUrl } from '../utils';

export default function MyLinkPlugin(): JSX.Element {
  return (
    <LexicalLinkPlugin
      validateUrl={validateUrl}
      // this is the critical part for opening a new tab
      // and preventing security issues
      attributes={{
        target: '_blank',
        rel: 'noopener noreferrer',
      }}
    />
  );
}