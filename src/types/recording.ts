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
	transcription?: {
		results: {
		  channels: Array<{
			alternatives: Array<{
			  transcript: string;
			  confidence: number;
			  words: Array<{
				word: string;
				start: number;
				end: number;
				confidence: number;
				speaker: number;
				speaker_confidence: number;
				punctuated_word: string;
			  }>;
			  paragraphs: {
				transcript: string;
				paragraphs: Array<{
				  sentences: Array<{
					text: string;
					start: number;
					end: number;
				  }>;
				  speaker: number;
				  num_words: number;
				  start: number;
				  end: number;
				}>;
			  };
			}>;
		  }>;
		};
	  };
	  transcription_status?: 'pending' | 'processing' | 'completed' | 'failed';
	
}

export interface CreateRecordingInput {
	title: string;
	description?: string;
	s3_key: string;
	original_filename: string;
	file_type: string;
	file_size: number;
}
