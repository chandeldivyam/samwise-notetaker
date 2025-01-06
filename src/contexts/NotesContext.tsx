'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { getNotes } from '@/lib/actions/notes';
import { Note } from '@/types/note';
import { message } from 'antd';

interface NotesContextType {
  notes: Note[];
  setNotes: React.Dispatch<React.SetStateAction<Note[]>>;
  loading: boolean;
  refreshNotes: () => Promise<void>;
}

const NotesContext = createContext<NotesContextType | undefined>(undefined);

export function NotesProvider({ children }: { children: React.ReactNode }) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshNotes = async () => {
    try {
      const { data, error } = await getNotes();
      if (error) throw error;
      setNotes(data || []);
    } catch (error) {
      message.error('Failed to fetch notes');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshNotes();
  }, []);

  return (
    <NotesContext.Provider value={{ notes, setNotes, loading, refreshNotes }}>
      {children}
    </NotesContext.Provider>
  );
}

export function useNotes() {
  const context = useContext(NotesContext);
  if (context === undefined) {
    throw new Error('useNotes must be used within a NotesProvider');
  }
  return context;
} 