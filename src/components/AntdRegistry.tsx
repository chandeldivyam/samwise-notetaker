'use client';

import React from 'react';
import { createCache, extractStyle, StyleProvider } from '@ant-design/cssinjs';
import type Entity from '@ant-design/cssinjs/es/Cache';
import { useServerInsertedHTML } from 'next/navigation';

export default function AntdRegistry({ children }: { children: React.ReactNode }) {
  const cache = React.useMemo<Entity>(() => createCache(), []);
  
  useServerInsertedHTML(() => {
    // Extract styles from Ant Design's cache
    const styleText = extractStyle(cache);
    
    // Return the styles wrapped in a style tag
    return (
      <style 
        id="antd-styles" 
        dangerouslySetInnerHTML={{ __html: styleText }} 
      />
    );
  });
  
  return <StyleProvider cache={cache}>{children}</StyleProvider>;
} 