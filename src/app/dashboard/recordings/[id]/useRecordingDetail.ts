import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Recording } from '@/types/recording';
import { getS3SignedUrl } from '@/lib/actions/s3';
import { transcribeRecording } from '@/lib/actions/transcription';
import { getTranscriptionSegments } from '@/lib/actions/transcription-segments';
import { useMessage } from '@/utils/message';
import { getRecording } from '@/lib/actions/recordings';
import { TranscriptionSegment } from '@/types/transcription';

export function useRecordingDetail(initialRecording: Recording) {
	const [recording, setRecording] = useState(initialRecording);
	const [mediaUrl, setMediaUrl] = useState<string | null>(null);
	const [isTranscribing, setIsTranscribing] = useState(false);
	const [isLoadingUrl, setIsLoadingUrl] = useState(true);
	const [segments, setSegments] = useState<TranscriptionSegment[]>([]);
	const mediaRef = useRef<HTMLAudioElement | HTMLVideoElement>(null);
	const messageApi = useMessage();
	const router = useRouter();

	useEffect(() => {
		let isMounted = true;

		const fetchSignedUrl = async () => {
			try {
				const { url, error } = await getS3SignedUrl(recording.s3_key);
				if (error || !url)
					throw new Error(error || 'Failed to fetch URL');
				if (isMounted) {
					setMediaUrl(url);
				}
			} catch (error) {
				console.error('Error:', error);
				messageApi.error('Failed to load media');
			} finally {
				if (isMounted) {
					setIsLoadingUrl(false);
				}
			}
		};

		fetchSignedUrl();

		return () => {
			isMounted = false;
		};
	}, [recording.s3_key, messageApi]);

	const handleTranscribe = async () => {
		setIsTranscribing(true);
		try {
			const { error } = await transcribeRecording(recording.id);
			if (error) throw new Error(error);

			// Fetch updated recording data
			const { data: updatedRecording, error: fetchError } =
				await getRecording(recording.id);
			if (fetchError || !updatedRecording)
				throw new Error(
					fetchError || 'Failed to fetch updated recording'
				);
			
			const { data: transcriptionSegments } = await getTranscriptionSegments(recording.id);


			setRecording(updatedRecording);
			setSegments(transcriptionSegments || []);
			messageApi.success('Transcription completed successfully');
			router.refresh(); // Refresh the server component
		} catch (error) {
			console.log('Error:', error);
			messageApi.error('Failed to transcribe recording');
		} finally {
			setIsTranscribing(false);
		}
	};

	useEffect(() => {
		if (recording.transcription_status === 'completed') {
		  getTranscriptionSegments(recording.id)
			.then(({ data }) => {
			  setSegments(data || []);
			})
			.catch((error) => {
			  console.error('Error fetching segments:', error);
			  messageApi.error('Failed to fetch transcription segments');
			});
		}
	  }, [recording.id, recording.transcription_status]);

	  const refreshSegments = async () => {
		try {
		  const { data } = await getTranscriptionSegments(recording.id);
		  setSegments(data || []);
		} catch (error) {
		  console.error('Error refreshing segments:', error);
		  messageApi.error('Failed to refresh transcription segments');
		}
	  };
	
	
	return {
		recording,
		mediaUrl,
		isTranscribing,
		isLoadingUrl,
		mediaRef,
		segments,
		handleTranscribe,
		refreshSegments,
	};
}
