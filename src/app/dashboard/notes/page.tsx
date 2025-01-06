'use client';

import { useEffect, useState } from 'react';
import { Typography, message } from 'antd';
import { getNotes } from '@/lib/actions/notes';
import NotesLayout from '@/components/NotesLayout';
import { Note } from '@/types/note';

const { Title } = Typography;

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadNotes() {
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
    }
    
    loadNotes();
  }, []);

  return (
    <NotesLayout notes={notes}>
      <div className="flex items-center justify-center h-full">
        <div className="text-center text-gray-500">
          <Title level={3}>Select a note or create a new one</Title>
          <p>Your notes will appear here</p>
        </div>
      </div>
    </NotesLayout>
  );
} 