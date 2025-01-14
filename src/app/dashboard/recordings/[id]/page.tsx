'use client';

import { useEffect, useState, useRef } from 'react';
import { Typography, Button, Spin, Descriptions, Modal } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { getRecording, deleteRecording } from '@/lib/actions/recordings';
import { getS3SignedUrl } from '@/lib/actions/s3';
import { useMessage, showSuccess, showError } from '@/utils/message';
import { Recording } from '@/types/recording';
import { use } from 'react';

const { Title } = Typography;

export default function RecordingDetailPage({
	params: paramsPromise,
}: {
	params: Promise<{ id: string }>;
}) {
	// Unwrap `params` using `React.use()`
	const params = use(paramsPromise);

	const [recording, setRecording] = useState<Recording | null>(null);
	const [loading, setLoading] = useState(true);
	const [deleting, setDeleting] = useState(false);
	const [mediaUrl, setMediaUrl] = useState<string | null>(null);
	const mediaRef = useRef<HTMLAudioElement | HTMLVideoElement>(null);
	const router = useRouter();
	const messageApi = useMessage();

	useEffect(() => {
		fetchRecording();
	}, [params.id]);

	const fetchRecording = async () => {
		try {
			const { data, error } = await getRecording(params.id);
			if (error) throw error;
			if (!data) {
				showError(messageApi, 'Recording not found');
				router.push('/dashboard/recordings');
				return;
			}
			setRecording(data);

			// Get signed URL for playback
			const { url, error: urlError } = await getS3SignedUrl(data.s3_key);
			if (!url) {
				showError(messageApi, 'Failed to fetch recording');
				throw new Error('Failed to fetch signed URL');
			}
			if (urlError) throw urlError;
			setMediaUrl(url);
		} catch (error) {
			showError(messageApi, 'Failed to fetch recording');
			console.error('Error:', error);
			router.push('/dashboard/recordings');
		} finally {
			setLoading(false);
		}
	};

	const handleDelete = async () => {
		Modal.confirm({
			title: 'Delete Recording',
			content: 'Are you sure you want to delete this recording?',
			okText: 'Yes',
			okType: 'danger',
			cancelText: 'No',
			onOk: async () => {
				setDeleting(true);
				try {
					const { error } = await deleteRecording(params.id);
					if (error) throw error;
					showSuccess(messageApi, 'Recording deleted successfully');
					router.push('/dashboard/recordings');
				} catch (error) {
					showError(messageApi, 'Failed to delete recording');
					console.error('Error:', error);
				} finally {
					setDeleting(false);
				}
			},
		});
	};

	const formatFileSize = (bytes: number) => {
		if (bytes === 0) return '0 Bytes';
		const k = 1024;
		const sizes = ['Bytes', 'KB', 'MB', 'GB'];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
	};

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleString();
	};

	if (loading) {
		return (
			<div className="flex justify-center items-center min-h-[calc(100vh-64px)]">
				<Spin size="large" />
			</div>
		);
	}

	if (!recording || !mediaUrl) {
		return null;
	}

	const isVideo = recording.file_type.startsWith('video');

	return (
		<div className="min-h-[calc(100vh-64px)] bg-component-background p-8">
			<div className="max-w-4xl mx-auto">
				<div className="flex justify-between items-center mb-8">
					<Title level={2} className="mb-0">
						{recording.title}
					</Title>
					<div className="space-x-4">
						<Button
							danger
							icon={<DeleteOutlined />}
							onClick={handleDelete}
							loading={deleting}
						>
							Delete
						</Button>
					</div>
				</div>

				<div className="mb-8">
					{isVideo ? (
						<video
							ref={mediaRef as React.RefObject<HTMLVideoElement>}
							controls
							className="w-full rounded-lg"
							src={mediaUrl}
						/>
					) : (
						<audio
							ref={mediaRef as React.RefObject<HTMLAudioElement>}
							controls
							className="w-full"
							src={mediaUrl}
						/>
					)}
				</div>

				<Descriptions bordered column={1}>
					<Descriptions.Item label="Description">
						{recording.description || 'No description'}
					</Descriptions.Item>
					<Descriptions.Item label="File Name">
						{recording.original_filename}
					</Descriptions.Item>
					<Descriptions.Item label="File Type">
						{recording.file_type}
					</Descriptions.Item>
					<Descriptions.Item label="File Size">
						{formatFileSize(recording.file_size)}
					</Descriptions.Item>
					<Descriptions.Item label="Created At">
						{formatDate(recording.created_at)}
					</Descriptions.Item>
					<Descriptions.Item label="Last Updated">
						{formatDate(recording.updated_at)}
					</Descriptions.Item>
				</Descriptions>
			</div>
		</div>
	);
}
