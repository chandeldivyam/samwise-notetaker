'use client';

import { useState } from 'react';
import { Upload, Form, Input, Button, message, Typography } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { createRecording } from '@/lib/actions/recordings';
import { uploadToS3, generateS3Key } from '@/utils/s3';
import { createClient } from '@/utils/supabase/client';

const { Title } = Typography;
const { Dragger } = Upload;

export default function NewRecordingPage() {
  const [form] = Form.useForm();
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const beforeUpload = (file: File) => {
    const isAudioOrVideo = file.type.startsWith('audio/') || file.type.startsWith('video/');
    const isValidFormat = ['audio/mpeg', 'audio/mp3', 'video/mp4'].includes(file.type);
    
    if (!isAudioOrVideo || !isValidFormat) {
      message.error('You can only upload MP3 or MP4 files!');
      return false;
    }

    const isLessThan100MB = file.size / 1024 / 1024 < 100;
    if (!isLessThan100MB) {
      message.error('File must be smaller than 100MB!');
      return false;
    }

    setFile(file);
    return false;
  };

  const onFinish = async (values: { title: string; description?: string }) => {
    if (!file) {
      message.error('Please select a file to upload');
      return;
    }
    const supabase = await createClient();
    const { data: user } = await supabase.auth.getUser();
    if (!user) {
      message.error('User not authenticated');
      return;
    }

    setUploading(true);
    try {
      const userId = user.user?.id;
      if (!userId) throw new Error('User ID not found');
      const s3Key = await generateS3Key(userId, file.type);
      const { error: uploadError } = await uploadToS3(file, s3Key);
      
      if (uploadError) throw new Error(uploadError);
  
      const { error } = await createRecording({
        title: values.title,
        description: values.description,
        s3_key: s3Key,
        original_filename: file.name,
        file_type: file.type,
        file_size: file.size,
      });
  
      if (error) throw new Error(error);
  
      message.success('Recording uploaded successfully');
      router.push('/dashboard/recordings');
    } catch (error) {
      console.error('Error:', error);
      message.error('Failed to upload recording');
    } finally {
      setUploading(false);
    }
  };
  

  return (
    <div className="min-h-[calc(100vh-48px)] bg-component-background">
      <div className="max-w-3xl mx-auto p-8">
        <Title level={2} className="mb-8 text-text-primary">
          Upload New Recording
        </Title>
        
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          className="space-y-6"
        >
          <Form.Item
            name="title"
            label="Title"
            rules={[{ required: true, message: 'Please enter a title' }]}
          >
            <Input 
              placeholder="Enter recording title"
              className="border-border-color hover:border-text-primary focus:border-text-primary"
            />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
          >
            <Input.TextArea 
              placeholder="Enter recording description (optional)" 
              rows={4}
              className="border-border-color hover:border-text-primary focus:border-text-primary"
            />
          </Form.Item>

          <Form.Item 
            label="Recording File" 
            required
            className="border-border-color"
          >
            <Dragger
              beforeUpload={beforeUpload}
              maxCount={1}
              showUploadList={true}
              className="bg-component-background border-2 border-dashed border-border-color hover:border-text-primary"
            >
              <p className="ant-upload-drag-icon">
                <InboxOutlined className="text-4xl" />
              </p>
              <p className="ant-upload-text text-lg font-medium">
                Click or drag MP3 or MP4 file to upload
              </p>
              <p className="ant-upload-hint text-text-secondary">
                Support for MP3 and MP4 files only. Max file size: 100MB
              </p>
            </Dragger>
          </Form.Item>

          <Form.Item className="mb-0">
            <Button
              type="primary"
              htmlType="submit"
              loading={uploading}
              disabled={!file}
              className="w-full h-10 text-base font-medium bg-primary hover:bg-primary-dark"
            >
              {uploading ? 'Uploading...' : 'Upload Recording'}
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
}