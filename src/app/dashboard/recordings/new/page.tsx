'use client';

import { useState, useEffect } from 'react';
import { Upload, Form, Input, Button, Typography, Progress } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { createRecording } from '@/lib/actions/recordings';
import { generateUploadUrl } from '@/lib/actions/s3';
import { uploadFileWithProgress } from '@/utils/upload';
import { useMessage, showSuccess, showError } from '@/utils/message';
import { getCurrentUser } from '@/lib/actions/auth';

const { Title } = Typography;
const { Dragger } = Upload;

export default function NewRecordingPage() {
	const [form] = Form.useForm();
	const router = useRouter();
	const [uploading, setUploading] = useState(false);
	const [file, setFile] = useState<File | null>(null);
	const messageApi = useMessage();
	const [uploadProgress, setUploadProgress] = useState(0);

	useEffect(() => {
		const handleBeforeUnload = (e: BeforeUnloadEvent) => {
			if (uploading) {
				e.preventDefault();
				return (e.returnValue = '');
			}
		};

		window.addEventListener('beforeunload', handleBeforeUnload);

		return () => {
			window.removeEventListener('beforeunload', handleBeforeUnload);
		};
	}, [uploading]);

	// Updated beforeUpload to allow only mp3 (audio/mpeg | audio/mp3) and mp4 (video/mp4)
	const beforeUpload = (file: File) => {
		const isValidFormat =
			file.type === 'audio/mpeg' ||
			file.type === 'audio/mp3' ||
			file.type === 'video/mp4';

		if (!isValidFormat) {
			showError(messageApi, 'You can only upload MP3 or MP4 files!');
			return false;
		}

		// Check file size (< 1000MB)
		const isLessThan100MB = file.size / 1024 / 1024 < 1000;
		if (!isLessThan100MB) {
			showError(messageApi, 'File must be smaller than 1000MB!');
			return false;
		}

		setFile(file);
		// Returning false so antd doesn’t auto-upload
		return false;
	};

	const onFinish = async (values: {
		title: string;
		description?: string;
	}) => {
		if (!file) {
			showError(messageApi, 'Please select a file to upload');
			return;
		}

		const { user, error: userError } = await getCurrentUser();
		if (userError || !user) {
			throw new Error('User not authenticated');
		}

		setUploading(true);
		try {
			const userId = user.id;
			if (!userId) throw new Error('User ID not found');

			// Generate presigned URL from server action
			const {
				url,
				key,
				error: urlError,
			} = await generateUploadUrl(userId, file.type, 'recordings');
			if (urlError || !url || !key)
				throw new Error(urlError || 'Failed to generate upload URL');

			// Upload file with progress tracking
			await uploadFileWithProgress(url, file, (progress) => {
				setUploadProgress(progress);
			});

			// Create recording record in database
			const { error } = await createRecording({
				title: values.title,
				description: values.description,
				s3_key: key,
				original_filename: file.name,
				file_type: file.type,
				file_size: file.size,
			});

			if (error) throw new Error(error);

			showSuccess(messageApi, 'Recording uploaded successfully');
			router.push('/dashboard/recordings');
		} catch (error) {
			console.error('Error:', error);
			showError(messageApi, 'Failed to upload recording');
		} finally {
			setUploading(false);
			setUploadProgress(0);
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
						rules={[
							{ required: true, message: 'Please enter a title' },
						]}
					>
						<Input
							placeholder="Enter recording title"
							className="border-border-color hover:border-text-primary focus:border-text-primary"
						/>
					</Form.Item>

					<Form.Item name="description" label="Description">
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
							// Only accept .mp3 and .mp4
							accept=".mp3,.mp4"
							// Ensure only one file is allowed
							multiple={false}
							maxCount={1}
							showUploadList={true}
							beforeUpload={beforeUpload}
							className="bg-component-background border-2 border-dashed border-border-color hover:border-text-primary"
						>
							<p className="ant-upload-drag-icon">
								<InboxOutlined className="text-4xl" />
							</p>
							<p className="ant-upload-text text-lg font-medium">
								Click or drag MP3 or MP4 file to upload
							</p>
							<p className="ant-upload-hint text-text-secondary">
								Support for MP3 and MP4 files only. Max file
								size: 100MB
							</p>
						</Dragger>
					</Form.Item>
					{uploading && (
						<div className="mt-4">
							<Progress
								percent={uploadProgress}
								status="active"
							/>
						</div>
					)}

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
