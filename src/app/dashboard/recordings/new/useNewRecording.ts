'use client';

import { useState, useEffect } from 'react';
import { Form } from 'antd';
import { useRouter } from 'next/navigation';
import { useMessage } from '@/utils/message';
import { validateFile } from './validateFile';
import { uploadRecording } from './uploadRecording';
import { RecordingFormValues } from './RecordingMetadataForm';

export function useNewRecording(userId: string) {
	const [form] = Form.useForm<RecordingFormValues>();
	const router = useRouter();
	const [uploading, setUploading] = useState(false);
	const [file, setFile] = useState<File | null>(null);
	const [uploadProgress, setUploadProgress] = useState(0);
	const messageApi = useMessage();

	useEffect(() => {
		const handleBeforeUnload = (e: BeforeUnloadEvent) => {
			if (uploading) {
				e.preventDefault();
				return (e.returnValue = '');
			}
		};

		window.addEventListener('beforeunload', handleBeforeUnload);
		return () =>
			window.removeEventListener('beforeunload', handleBeforeUnload);
	}, [uploading]);

	const handleFileSelect = (file: File) => {
		const { isValid, error } = validateFile(file);
		if (!isValid) {
			messageApi.error(error);
			return;
		}
		setFile(file);
	};

	const handleSubmit = async (values: RecordingFormValues) => {
		if (!file) {
			messageApi.error('Please select a file to upload');
			return;
		}

		setUploading(true);
		try {
			await uploadRecording({
				file,
				userId,
				metadata: values,
				onProgress: setUploadProgress,
			});

			messageApi.success('Recording uploaded successfully');
			router.push('/dashboard/recordings');
			router.refresh();
		} catch (error) {
			console.error('Error:', error);
			messageApi.error('Failed to upload recording');
		} finally {
			setUploadProgress(0);
		}
	};

	return {
		form,
		file,
		uploading,
		uploadProgress,
		handleFileSelect,
		handleSubmit,
	};
}
