'use client';

import { useState } from 'react';
import { Input, Button, message, Form } from 'antd';
import { useRouter } from 'next/navigation';
import { createNote, getNotes } from '@/lib/actions/notes';
import NotesLayout from '@/components/NotesLayout';
import { Note } from '@/types/note';
import { useNotes } from '@/contexts/NotesContext';
import RichTextEditor from '@/components/RichTextEditor';

const { TextArea } = Input;

export default function NewNotePage() {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const router = useRouter();
  const { refreshNotes } = useNotes();

  const onFinish = async (values: { title: string; content: string }) => {
    setLoading(true);
    try {
      const { error } = await createNote(values);
      if (error) throw error;

      await refreshNotes();
      message.success('Note created successfully');
      router.push('/dashboard/notes');
    } catch (error) {
      message.error('Failed to create note');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <NotesLayout>
      <div className="p-8">
        <Form 
          form={form}
          layout="vertical" 
          onFinish={onFinish}
        >
          <Form.Item
            name="title"
            rules={[{ required: true, message: 'Please input the title!' }]}
          >
            <Input
              placeholder="Title"
              variant="borderless"
              size="large"
              className="text-2xl font-bold px-0"
            />
          </Form.Item>

          <Form.Item
            name="content"
            rules={[{ required: true, message: 'Please input the content!' }]}
          >
            <RichTextEditor 
              placeholder="Start writing..."
            />
          </Form.Item>

          <div className="fixed bottom-8 right-8">
            <Button type="primary" onClick={form.submit} loading={loading}>
              Create
            </Button>
          </div>
        </Form>
      </div>
    </NotesLayout>
  );
} 