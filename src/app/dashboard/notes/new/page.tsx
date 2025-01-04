'use client';

import { useState } from 'react';
import { Input, Button, message, Form, Card } from 'antd';
import { useRouter } from 'next/navigation';
import { createNote } from '@/lib/actions/notes';

const { TextArea } = Input;

export default function NewNotePage() {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const router = useRouter();

  const onFinish = async (values: { title: string; content: string }) => {
    setLoading(true);
    try {
      const { error } = await createNote(values);
      if (error) throw error;

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
    <div className="p-8">
      <Card title="Create New Note" className="max-w-2xl mx-auto">
        <Form 
          form={form}
          layout="vertical" 
          onFinish={onFinish}
        >
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
            <div className="flex justify-end gap-2">
              <Button onClick={() => router.back()}>Cancel</Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                Create Note
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
} 