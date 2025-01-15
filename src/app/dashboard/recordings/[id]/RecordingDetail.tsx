// src/app/dashboard/recordings/[id]/RecordingDetail.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { Typography, Button, Descriptions, Modal, Spin } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { Recording } from '@/types/recording';
import { deleteRecording } from '@/lib/actions/recordings';
import { getS3SignedUrl } from '@/lib/actions/s3';
import { useMessage, showSuccess, showError } from '@/utils/message';

const { Title } = Typography;

interface RecordingDetailProps {
	initialRecording: Recording;
}

export default function RecordingDetail({
	initialRecording,
}: RecordingDetailProps) {
	const [mediaUrl, setMediaUrl] = useState<string | null>(null);
	const [deleting, setDeleting] = useState(false);
	const mediaRef = useRef<HTMLAudioElement | HTMLVideoElement>(null);
	const router = useRouter();
	const messageApi = useMessage();

	useEffect(() => {
		const fetchSignedUrl = async () => {
			const { url, error } = await getS3SignedUrl(
				initialRecording.s3_key
			);
			if (error || !url) {
				showError(messageApi, 'Failed to fetch recording URL');
				return;
			}
			setMediaUrl(url);
		};

		fetchSignedUrl();
	}, [initialRecording.s3_key]);

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
					const { error } = await deleteRecording(
						initialRecording.id
					);
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

	if (!mediaUrl) {
		return (
			<div className="flex justify-center items-center min-h-[calc(100vh-64px)]">
				<Spin size="large" />
			</div>
		);
	}

	const isVideo = initialRecording.file_type.startsWith('video');

	return (
		<div className="min-h-[calc(100vh-64px)] bg-component-background p-8">
			<div className="max-w-4xl mx-auto">
				<div className="flex justify-between items-center mb-8">
					<Title level={2} className="mb-0">
						{initialRecording.title}
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
						{initialRecording.description || 'No description'}
					</Descriptions.Item>
					<Descriptions.Item label="File Name">
						{initialRecording.original_filename}
					</Descriptions.Item>
					<Descriptions.Item label="File Type">
						{initialRecording.file_type}
					</Descriptions.Item>
					<Descriptions.Item label="File Size">
						{formatFileSize(initialRecording.file_size)}
					</Descriptions.Item>
					<Descriptions.Item label="Created At">
						{formatDate(initialRecording.created_at)}
					</Descriptions.Item>
					<Descriptions.Item label="Last Updated">
						{formatDate(initialRecording.updated_at)}
					</Descriptions.Item>
				</Descriptions>
			</div>
		</div>
	);
}
