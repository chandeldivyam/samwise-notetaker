'use client';

import { NotesProvider } from '@/contexts/NotesContext';

export default function NotesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <NotesProvider>{children}</NotesProvider>;
} 