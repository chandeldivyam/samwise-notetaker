'use client';

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { getNotes } from '@/lib/actions/notes';
import { Note } from '@/types/note';
import { message } from 'antd';

interface GroupedNotes {
  [key: string]: Note[];
}

interface NotesContextType {
  notes: Note[];
  groupedNotes: GroupedNotes;
  setNotes: React.Dispatch<React.SetStateAction<Note[]>>;
  loading: boolean;
  refreshNotes: () => Promise<void>;
}

const NotesContext = createContext<NotesContextType | undefined>(undefined);

export function NotesProvider({ children }: { children: React.ReactNode }) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  // Group notes by date
  const groupedNotes = useMemo(() => {
    return notes.reduce((groups: GroupedNotes, note) => {
      const date = new Date(note.updated_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(note);
      return groups;
    }, {});
  }, [notes]);

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
    <NotesContext.Provider value={{ notes, setNotes, groupedNotes, loading, refreshNotes }}>
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