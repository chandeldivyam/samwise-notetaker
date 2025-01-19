// src/lib/actions/transcription-segments.ts
'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { Recording } from '@/types/recording';

export async function processDeepgramTranscription(
	recordingId: string,
	deepgramResponse: Recording['transcription']
) {
	const supabase = await createClient();

	if (!deepgramResponse) {
		throw new Error('Deepgram response is empty');
	}
	const paragraphs =
		deepgramResponse.results.channels[0].alternatives[0].paragraphs
			.paragraphs;

	const segments = paragraphs.flatMap((paragraph) =>
		paragraph.sentences.map((sentence) => ({
			recording_id: recordingId,
			speaker_label: `Speaker ${paragraph.speaker}`,
			original_speaker_number: paragraph.speaker,
			start_time: sentence.start,
			end_time: sentence.end,
			text: sentence.text,
		}))
	);

	const { error } = await supabase
		.from('transcription_segments')
		.insert(segments);

	if (error) throw error;

	revalidatePath(`/dashboard/recordings/${recordingId}`);
}

export async function updateSpeakerLabel(segmentId: string, newLabel: string) {
	const supabase = await createClient();

	const { error } = await supabase
		.from('transcription_segments')
		.update({ speaker_label: newLabel })
		.eq('id', segmentId);

	if (error) throw error;
}

export async function getTranscriptionSegments(recordingId: string) {
	const supabase = await createClient();

	const { data, error } = await supabase
		.from('transcription_segments')
		.select('*')
		.eq('recording_id', recordingId)
		.order('start_time');

	if (error) throw error;

	return { data };
}

export async function updateSegmentSpeaker(
	segmentId: string,
	personId: string | null
) {
	const supabase = await createClient();

	const { error } = await supabase
		.from('transcription_segments')
		.update({ person_id: personId })
		.eq('id', segmentId);

	if (error) throw error;
}

export async function updateAllSegmentsByOriginalSpeaker(
	recordingId: string,
	originalSpeakerNumber: number,
	personId: string | null,
	speakerLabel: string
) {
	const supabase = await createClient();

	const { error } = await supabase
		.from('transcription_segments')
		.update({
			person_id: personId,
			speaker_label: speakerLabel,
		})
		.eq('recording_id', recordingId)
		.eq('original_speaker_number', originalSpeakerNumber);

	if (error) throw error;
}
