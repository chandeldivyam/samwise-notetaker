// src/app/dashboard/recordings/page.tsx
'use client';

import { Button, Spin, Table, Space, Popconfirm, message } from 'antd';
import {
	PlusOutlined,
	DeleteOutlined,
	PlayCircleOutlined,
} from '@ant-design/icons';
import Link from 'next/link';
import { useRecordings } from '@/contexts/RecordingsContext';
import { deleteRecording } from '@/lib/actions/recordings';
import { useState } from 'react';
import { Recording } from '@/types/recording';

const formatFileSize = (bytes: number) => {
	if (bytes === 0) return '0 Bytes';
	const k = 1024;
	const sizes = ['Bytes', 'KB', 'MB', 'GB'];
	const i = Math.floor(Math.log(bytes) / Math.log(k));
	return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export default function RecordingsPage() {
	const { groupedRecordings, loading, refreshRecordings } = useRecordings();
	const [messageApi, contextHolder] = message.useMessage();
	const [deletingId, setDeletingId] = useState<string | null>(null);

	const handleDelete = async (id: string) => {
		setDeletingId(id);
		const { error } = await deleteRecording(id);
		if (error) {
			messageApi.open({
				type: 'error',
				content: 'Failed to delete recording',
			});
		} else {
			messageApi.open({
				type: 'success',
				content: 'Recording deleted successfully',
			});
			refreshRecordings();
		}
		setDeletingId(null);
	};

	const columns = [
		{
			title: 'Title',
			dataIndex: 'title',
			key: 'title',
			render: (text: string, record: Recording) => (
				<Link href={`/dashboard/recordings/${record.id}`}>
					<div className="flex items-center gap-2">
						<PlayCircleOutlined className="text-xl text-primary" />
						<span className="text-primary hover:underline">
							{text}
						</span>
					</div>
				</Link>
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
			render: (_: string, record: Recording) => (
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

	const dataSource = Object.entries(groupedRecordings).flatMap(
		([, recordings]) =>
			recordings.map((recording) => ({
				...recording,
				key: recording.id,
			}))
	);

	if (loading) {
		return (
			<div className="flex justify-center items-center min-h-[calc(100vh-64px)]">
				<Spin size="large" />
			</div>
		);
	}

	return (
		<div className="min-h-[calc(100vh-64px)] bg-component-background p-8">
			{contextHolder}
			<div className="max-w-7xl mx-auto">
				<div className="flex justify-end items-center mb-8">
					<Link href="/dashboard/recordings/new">
						<Button type="primary" icon={<PlusOutlined />}>
							New Recording
						</Button>
					</Link>
				</div>

				<Table
					columns={columns}
					dataSource={dataSource}
					loading={loading}
					locale={{ emptyText: 'No recordings yet' }}
				/>
			</div>
		</div>
	);
}
