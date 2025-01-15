'use client';

import { Button, Table, Space, Popconfirm } from 'antd';
import {
	PlusOutlined,
	DeleteOutlined,
	PlayCircleOutlined,
} from '@ant-design/icons';
import { useState } from 'react';
import { Recording } from '@/types/recording';
import { deleteRecording } from '@/lib/actions/recordings';
import { useRouter } from 'next/navigation';
import { useMessage, showSuccess, showError } from '@/utils/message';

interface RecordingsListProps {
	initialRecordings: Recording[];
}

const formatFileSize = (bytes: number) => {
	if (bytes === 0) return '0 Bytes';
	const k = 1024;
	const sizes = ['Bytes', 'KB', 'MB', 'GB'];
	const i = Math.floor(Math.log(bytes) / Math.log(k));
	return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export default function RecordingsList({
	initialRecordings,
}: RecordingsListProps) {
	const [recordings, setRecordings] = useState(initialRecordings);
	const [deletingId, setDeletingId] = useState<string | null>(null);
	const router = useRouter();
	const message = useMessage();

	const handleDelete = async (id: string) => {
        setDeletingId(id);
        try {
          const { error, details } = await deleteRecording(id);
          if (error) {
            showError(message, `Failed to delete recording: ${details || error}`);
            return;
          }
      
          showSuccess(message, 'Recording deleted successfully');
          setRecordings(recordings.filter((rec) => rec.id !== id));
          router.refresh();
        } catch (error) {
          showError(message, 'An unexpected error occurred while deleting the recording');
          console.error('Error:', error);
        } finally {
          setDeletingId(null);
        }
      };
      

	const handleRowClick = (record: Recording) => {
		router.push(`/dashboard/recordings/${record.id}`);
	};

	const handleMouseOver = (path: string) => {
		router.prefetch(path);
	};

	const columns = [
		{
			title: 'Title',
			dataIndex: 'title',
			key: 'title',
			render: (text: string, record: Recording) => (
				<div
					className="flex items-center gap-2 cursor-pointer"
					onClick={() => handleRowClick(record)}
					onMouseEnter={() =>
						handleMouseOver(`/dashboard/recordings/${record.id}`)
					}
				>
					<PlayCircleOutlined className="text-xl text-primary" />
					<span className="text-primary hover:underline">{text}</span>
				</div>
			),
		},
		{
			title: 'File Size',
			dataIndex: 'file_size',
			key: 'file_size',
			render: (file_size: number) => formatFileSize(file_size),
		},
		{
			title: 'Date',
			dataIndex: 'created_at',
			key: 'created_at',
			render: (created_at: string) =>
				new Date(created_at).toLocaleDateString('en-US', {
					year: 'numeric',
					month: 'long',
					day: 'numeric',
				}),
		},
		{
			title: 'Actions',
			key: 'actions',
			render: (_: Recording, record: Recording) => (
				<Space size="middle">
					<Popconfirm
						title="Delete the recording"
						description="Are you sure you want to delete this recording?"
						onConfirm={() => handleDelete(record.id)}
						okText="Yes"
						cancelText="No"
						disabled={deletingId === record.id}
					>
						<Button
							icon={<DeleteOutlined />}
							type="text"
							danger
							loading={deletingId === record.id}
							disabled={deletingId === record.id}
						/>
					</Popconfirm>
				</Space>
			),
		},
	];

	return (
		<div className="min-h-[calc(100vh-64px)] bg-component-background p-8">
			<div className="max-w-7xl mx-auto">
				<div className="flex justify-end items-center mb-8">
					<Button
						type="primary"
						icon={<PlusOutlined />}
						onClick={() => router.push('/dashboard/recordings/new')}
						onMouseEnter={() =>
							handleMouseOver('/dashboard/recordings/new')
						}
					>
						New Recording
					</Button>
				</div>

				<Table
					columns={columns}
					dataSource={recordings.map((rec) => ({
						...rec,
						key: rec.id,
					}))}
					locale={{ emptyText: 'No recordings yet' }}
				/>
			</div>
		</div>
	);
}
