'use client';

import { useEffect, useState } from 'react';
import { Input, Button, message, Form, Card, Spin } from 'antd';
import { useRouter } from 'next/navigation';
import { getNote, updateNote, deleteNote } from '@/lib/actions/notes';
import { use } from 'react';

const { TextArea } = Input;

interface Note {
  id: string;
  title: string;
  content: string;
}

export default function EditNotePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();
  const router = useRouter();

  useEffect(() => {
    fetchNote();
  }, []);

  const fetchNote = async () => {
    try {
      const { data, error } = await getNote(resolvedParams.id);
      if (error) throw error;
      if (data) {
        form.setFieldsValue(data);
      }
    } catch (error) {
      message.error('Failed to fetch note');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const onFinish = async (values: { title: string; content: string }) => {
    setSaving(true);
    try {
      const { error } = await updateNote(resolvedParams.id, values);
      if (error) throw error;

      message.success('Note updated successfully');
      router.push('/dashboard/notes');
    } catch (error) {
      message.error('Failed to update note');
      console.error('Error:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this note?')) return;

    try {
      const { error } = await deleteNote(resolvedParams.id);
      if (error) throw error;

      message.success('Note deleted successfully');
      router.push('/dashboard/notes');
    } catch (error) {
      message.error('Failed to delete note');
      console.error('Error:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-64px)]">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="p-8">
      <Card title="Edit Note" className="max-w-2xl mx-auto">
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item
            name="title"
            label="Title"
            rules={[{ required: true, message: 'Please input the title!' }]}
          >
            <Input placeholder="Enter note title" />
          </Form.Item>

          <Form.Item
            name="content"
            label="Content"
            rules={[{ required: true, message: 'Please input the content!' }]}
          >
            <TextArea rows={10} placeholder="Enter note content" />
          </Form.Item>

          <Form.Item>
            <div className="flex justify-between">
              <Button danger onClick={handleDelete}>
                Delete Note
              </Button>
              <div className="flex gap-2">
                <Button onClick={() => router.back()}>Cancel</Button>
                <Button type="primary" htmlType="submit" loading={saving}>
                  Save Changes
                </Button>
              </div>
            </div>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
} 