import { generateUploadUrl } from '@/lib/actions/s3';
import { createRecording } from '@/lib/actions/recordings';
import { uploadFileWithProgress } from '@/utils/upload';

interface UploadRecordingParams {
	file: File;
	userId: string;
	metadata: {
		title: string;
		description?: string;
	};
	onProgress: (progress: number) => void;
}

export async function uploadRecording({
	file,
	userId,
	metadata,
	onProgress,
}: UploadRecordingParams) {
	// Generate presigned URL
	const {
		url,
		key,
		error: urlError,
	} = await generateUploadUrl(userId, file.type, 'recordings');
	if (urlError || !url || !key) {
		throw new Error(urlError || 'Failed to generate upload URL');
	}

	// Upload file with progress tracking
	await uploadFileWithProgress(url, file, onProgress);

	// Create recording record in database
	const { error } = await createRecording({
		title: metadata.title,
		description: metadata.description,
		s3_key: key,
		original_filename: file.name,
		file_type: file.type,
		file_size: file.size,
	});

	if (error) throw new Error(error);
}
