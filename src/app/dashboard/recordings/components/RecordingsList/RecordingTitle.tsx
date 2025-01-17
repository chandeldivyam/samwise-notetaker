import { PlayCircleOutlined } from '@ant-design/icons';
import { Recording } from '@/types/recording';

interface RecordingTitleProps {
	record: Recording;
	onMouseEnter: (path: string) => void;
}

export function RecordingTitle({ record, onMouseEnter }: RecordingTitleProps) {
	return (
		<div
			className="flex items-center gap-2"
			onMouseEnter={() =>
				onMouseEnter(`/dashboard/recordings/${record.id}`)
			}
		>
			<PlayCircleOutlined className="text-xl text-primary" />
			<span className="text-primary hover:underline">{record.title}</span>
		</div>
	);
}
