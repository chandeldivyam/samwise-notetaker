import { useMemo } from 'react';
import { Typography, Card } from 'antd';
import { Recording } from '@/types/recording';
import { TranscriptionSentence } from './TranscriptionSentence';

const { Title, Paragraph, Text } = Typography;

interface TranscriptionSectionProps {
	transcription: Recording['transcription'];
	mediaRef: React.RefObject<HTMLVideoElement | HTMLAudioElement>;
}

export function TranscriptionSection({
	transcription,
	mediaRef,
}: TranscriptionSectionProps) {
	const paragraphs = useMemo(() => {
		if (!transcription) return null;
		return transcription.results.channels[0].alternatives[0].paragraphs
			.paragraphs;
	}, [transcription]);

	if (!paragraphs) return null;

	return (
		<Card className="mt-8">
			<Title level={3}>Transcription</Title>
			<div className="overflow-y-auto max-h-[600px]">
				{paragraphs.map((paragraph, idx) => (
					<div key={idx} className="mb-4">
						<Text strong>{`Speaker ${paragraph.speaker}`}</Text>
						<Paragraph>
							{paragraph.sentences.map((sentence, sIdx) => (
								<TranscriptionSentence
									key={sIdx}
									sentence={sentence}
									mediaRef={mediaRef}
								/>
							))}
						</Paragraph>
					</div>
				))}
			</div>
		</Card>
	);
}
