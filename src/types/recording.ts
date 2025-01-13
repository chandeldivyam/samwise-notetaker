// src/types/recording.ts
export interface Recording {
	id: string;
	title: string;
	description?: string;
	s3_key: string;
	original_filename: string;
	file_type: string;
	file_size: number;
	duration?: number;
	created_at: string;
	updated_at: string;
	user_id: string;
}

export interface CreateRecordingInput {
	title: string;
	description?: string;
	s3_key: string;
	original_filename: string;
	file_type: string;
	file_size: number;
}
