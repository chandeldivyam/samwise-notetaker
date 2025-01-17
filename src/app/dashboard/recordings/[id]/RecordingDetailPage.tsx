'use client';

import { Card } from 'antd';
import { useRecordingDetail } from './useRecordingDetail';
import { MediaPlayer } from './MediaPlayer';
import { TranscriptionSection } from './TranscriptionSection';
import { RecordingMetadata } from './RecordingMetadata';
import { RecordingHeader } from './RecordingHeader';
import { Recording } from '@/types/recording';
import { RecordingDetailLoading } from './RecordingDetailLoading';

interface RecordingDetailPageProps {
	initialRecording: Recording;
}

export default function RecordingDetailPage({
	initialRecording,
}: RecordingDetailPageProps) {
	const {
		recording,
		mediaUrl,
		isTranscribing,
		mediaRef,
		handleTranscribe,
		isLoadingUrl,
	} = useRecordingDetail(initialRecording);

	if (isLoadingUrl) {
		return <RecordingDetailLoading />;
	}

	return (
		<div className="min-h-[calc(100vh-64px)] bg-component-background p-8">
			<div className="max-w-4xl mx-auto">
				<RecordingHeader
					title={recording.title}
					canTranscribe={!recording.transcription}
					onTranscribe={handleTranscribe}
					isTranscribing={isTranscribing}
				/>

				<Card className="mb-8">
					<RecordingMetadata recording={recording} />
					<MediaPlayer
						mediaUrl={mediaUrl}
						mediaRef={mediaRef}
						fileType={recording.file_type}
					/>
				</Card>

				<TranscriptionSection
					transcription={recording.transcription}
					mediaRef={mediaRef}
				/>
			</div>
		</div>
	);
}
