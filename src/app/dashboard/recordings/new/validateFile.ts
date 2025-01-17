export function validateFile(file: File) {
	const isValidFormat =
		file.type === 'audio/mpeg' ||
		file.type === 'audio/mp3' ||
		file.type === 'video/mp4';

	if (!isValidFormat) {
		return {
			isValid: false,
			error: 'You can only upload MP3 or MP4 files!',
		};
	}

	const isLessThan1000MB = file.size / 1024 / 1024 < 1000;
	if (!isLessThan1000MB) {
		return {
			isValid: false,
			error: 'File must be smaller than 1000MB!',
		};
	}

	return { isValid: true, error: null };
}
