// src/app/dashboard/recordings/[id]/RecordingDetail.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { Typography, Spin, Button } from 'antd';
import { Recording } from '@/types/recording';
import { getS3SignedUrl } from '@/lib/actions/s3';
import { transcribeRecording } from '@/lib/actions/transcription';
import { useMessage, showError, showSuccess } from '@/utils/message';
import { getRecording } from '@/lib/actions/recordings';

const { Title, Paragraph, Text } = Typography;

interface RecordingDetailProps {
	initialRecording: Recording;
}

export default function RecordingDetail({
	initialRecording,
}: RecordingDetailProps) {
	const [recording, setRecording] = useState(initialRecording);
    const [mediaUrl, setMediaUrl] = useState<string | null>(null);
    const [isTranscribing, setIsTranscribing] = useState(false);
    const mediaRef = useRef<HTMLAudioElement | HTMLVideoElement>(null);
    const messageApi = useMessage();

	const fetchUpdatedRecording = async (id: string) => {
		const { data: updatedRecording, error } = await getRecording(id);
		if (!error && updatedRecording) {
		  setRecording(updatedRecording);
		}
	  };	  


	useEffect(() => {
		const fetchSignedUrl = async () => {
			const { url, error } = await getS3SignedUrl(
				initialRecording.s3_key
			);
			if (error || !url) {
				showError(messageApi, 'Failed to fetch recording URL');
				return;
			}
			setMediaUrl(url);
		};

		fetchSignedUrl();
	}, [initialRecording.s3_key]);

	if (!mediaUrl) {
		return (
			<div className="flex justify-center items-center min-h-[calc(100vh-64px)]">
				<Spin size="large" />
			</div>
		);
	}

	const isVideo = initialRecording.file_type.startsWith('video');

    const handleTranscribe = async () => {
		setIsTranscribing(true);
		try {
		  const { error } = await transcribeRecording(recording.id);
		  if (error) {
			showError(messageApi, 'Failed to transcribe recording');
			return;
		  }
		  
		  // Fetch the updated recording data
		  await fetchUpdatedRecording(recording.id);
		  showSuccess(messageApi, 'Transcription completed');
		} catch (error) {
			console.error(error);
		  showError(messageApi, 'An unexpected error occurred');
		} finally {
		  setIsTranscribing(false);
		}
	  };
    
      const renderTranscription = () => {
        if (!recording.transcription) return null;
    
        const transcription = recording.transcription.results.channels[0].alternatives[0];
        return (
          <div className="mt-8 p-6 rounded-lg shadow bg-component-background">
            <Title level={3}>Transcription</Title>
			<div className="overflow-y-auto">
				{transcription.paragraphs.paragraphs.map((paragraph, idx) => (
				<div key={idx} className="mb-4">
					<Text strong>{`Speaker ${paragraph.speaker}`}</Text>
					<Paragraph>
					{paragraph.sentences.map((sentence, sIdx) => (
						<span
						key={sIdx}
						className="cursor-pointer hover:bg-text-secondary"
						onClick={() => {
							if (mediaRef.current) {
							mediaRef.current.currentTime = sentence.start;
							mediaRef.current.play();
							}
						}}
						>
						{sentence.text}{' '}
						</span>
					))}
					</Paragraph>
				</div>
				))}
			</div>
          </div>
        );
      };
    
    

	return (
		<div className="min-h-[calc(100vh-64px)] bg-component-background p-8">
			<div className="max-w-4xl mx-auto">
				<div className="flex justify-between items-center mb-8">
					<Title level={2} className="mb-0">
						{initialRecording.title}
					</Title>
					{!recording.transcription && (
						<Button 
						type="primary"
						onClick={handleTranscribe}
						loading={isTranscribing}
						>
						Transcribe
						</Button>
					)}
				</div>

				<div className="mb-8">
					{isVideo ? (
						<video
							ref={mediaRef as React.RefObject<HTMLVideoElement>}
							controls
							className="w-full rounded-lg"
							src={mediaUrl}
						/>
					) : (
						<audio
							ref={mediaRef as React.RefObject<HTMLAudioElement>}
							controls
							className="w-full"
							src={mediaUrl}
						/>
					)}
				</div>
				{renderTranscription()}
			</div>
		</div>
	);
}
