'use client';

import { useEffect, useState } from 'react';
import { Button, List, Card, Typography, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getNotes } from '@/lib/actions/notes';

const { Title } = Typography;

interface Note {
  id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

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

  const handleCreateNote = () => {
    router.push('/dashboard/notes/new');
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <Title level={2}>My Notes</Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleCreateNote}
        >
          Create Note
        </Button>
      </div>

      <List
        grid={{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 3, xl: 4, xxl: 4 }}
        dataSource={notes}
        loading={loading}
        renderItem={(note) => (
          <List.Item>
            <Link href={`/dashboard/notes/${note.id}`}>
              <Card
                hoverable
                title={note.title}
                className="h-[200px] overflow-hidden"
              >
                <p className="text-gray-600 line-clamp-4">{note.content}</p>
                <div className="mt-4 text-xs text-gray-400">
                  Last updated: {new Date(note.updated_at).toLocaleDateString()}
                </div>
              </Card>
            </Link>
          </List.Item>
        )}
      />
    </div>
  );
} 