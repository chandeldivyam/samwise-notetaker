import { Typography, Button } from 'antd';

const { Title } = Typography;

interface RecordingHeaderProps {
	title: string;
	canTranscribe: boolean;
	onTranscribe: () => void;
	isTranscribing: boolean;
}

export function RecordingHeader({
	title,
	canTranscribe,
	onTranscribe,
	isTranscribing,
}: RecordingHeaderProps) {
	return (
		<div className="flex justify-between items-center mb-8">
			<Title level={2} className="mb-0">
				{title}
			</Title>
			{canTranscribe && (
				<Button
					type="primary"
					onClick={onTranscribe}
					loading={isTranscribing}
				>
					Transcribe
				</Button>
			)}
		</div>
	);
}
