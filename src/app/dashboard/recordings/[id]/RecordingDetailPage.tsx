'use client';

import { Card } from 'antd';
import { useRecordingDetail } from './useRecordingDetail';
import { MediaPlayer } from './MediaPlayer';
import { TranscriptionSection } from './TranscriptionSection';
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
		segments,
		handleTranscribe,
		isLoadingUrl,
		refreshSegments,
	} = useRecordingDetail(initialRecording);

	if (isLoadingUrl) {
		return <RecordingDetailLoading />;
	}

	return (
		<div className="min-h-[calc(100vh-64px)] bg-component-background p-8">
			<div className="max-w-6xl mx-auto">
				<RecordingHeader
					title={recording.title}
					createdAt={recording.created_at}
					fileSize={recording.file_size}
					fileType={recording.file_type}
					duration={recording.duration}
					canTranscribe={!recording.transcription}
					onTranscribe={handleTranscribe}
					isTranscribing={isTranscribing}
					transcriptionStatus={recording.transcription_status}
				/>

				<div className="grid gap-6 grid-cols-1">
					<Card className="shadow-sm">
						<MediaPlayer
							mediaUrl={mediaUrl}
							mediaRef={mediaRef}
							fileType={recording.file_type}
						/>
					</Card>

					{segments && segments.length > 0 && (
						<Card className="shadow-sm">
							<TranscriptionSection
								segments={segments}
								mediaRef={mediaRef}
								recordingId={recording.id}
								onRefreshSegments={refreshSegments}
							/>
						</Card>
					)}
				</div>
			</div>
		</div>
	);
}
