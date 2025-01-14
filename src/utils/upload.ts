import axios from 'axios';

export type UploadProgressCallback = (progress: number) => void;

export async function uploadFileWithProgress(
	url: string,
	file: File,
	onProgress?: UploadProgressCallback
): Promise<void> {
	try {
		await axios.put(url, file, {
			headers: {
				'Content-Type': file.type,
				'x-amz-server-side-encryption': 'AES256',
			},
			onUploadProgress: (progressEvent) => {
				if (onProgress && progressEvent.total) {
					const percentCompleted = Math.round(
						(progressEvent.loaded * 100) / progressEvent.total
					);
					onProgress(percentCompleted);
				}
			},
		});
	} catch (error) {
		console.error('Error uploading file:', error);
		if (axios.isAxiosError(error)) {
			console.error('Response:', error.response?.data);
			console.error('Status:', error.response?.status);
		}
		throw new Error('Failed to upload file');
	}
}
