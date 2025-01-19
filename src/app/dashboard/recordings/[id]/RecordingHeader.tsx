// src/app/dashboard/recordings/[id]/RecordingHeader.tsx
import { Typography, Button, Space, Tag, Tooltip } from 'antd';
import { CloudDownloadOutlined, ShareAltOutlined } from '@ant-design/icons';
import { formatFileSize, formatDuration } from '@/utils/format';

const { Title } = Typography;

interface RecordingHeaderProps {
	title: string;
	createdAt: string;
	fileSize: number;
	fileType: string;
	duration?: number;
	canTranscribe: boolean;
	onTranscribe: () => void;
	isTranscribing: boolean;
	transcriptionStatus?: string;
}

export function RecordingHeader({
	title,
	createdAt,
	fileSize,
	fileType,
	duration,
	canTranscribe,
	onTranscribe,
	isTranscribing,
	transcriptionStatus,
}: RecordingHeaderProps) {
	const getStatusColor = (status?: string) => {
		switch (status) {
			case 'completed':
				return 'success';
			case 'processing':
				return 'processing';
			case 'failed':
				return 'error';
			default:
				return 'default';
		}
	};

	return (
		<div className="bg-component-background rounded-lg shadow-sm p-6 mb-6">
			<div className="flex justify-between items-start mb-4">
				<div>
					<Title level={2} className="mb-2">
						{title}
					</Title>
					<Space size={[16, 8]} wrap>
						<span>{new Date(createdAt).toLocaleDateString()}</span>
						<span>•</span>
						<span>{formatFileSize(fileSize)}</span>
						<span>•</span>
						<span className="uppercase">
							{fileType.split('/')[1]}
						</span>
						{duration && (
							<>
								<span>•</span>
								<span>{formatDuration(duration)}</span>
							</>
						)}
						{transcriptionStatus && (
							<>
								<span>•</span>
								<Tag
									color={getStatusColor(transcriptionStatus)}
								>
									{transcriptionStatus
										.charAt(0)
										.toUpperCase() +
										transcriptionStatus.slice(1)}
								</Tag>
							</>
						)}
					</Space>
				</div>
				<Space>
					<Tooltip title="Download Recording">
						<Button icon={<CloudDownloadOutlined />}>
							Download
						</Button>
					</Tooltip>
					<Tooltip title="Share Recording">
						<Button icon={<ShareAltOutlined />}>Share</Button>
					</Tooltip>
					{canTranscribe && (
						<Button
							type="primary"
							onClick={onTranscribe}
							loading={isTranscribing}
						>
							Transcribe
						</Button>
					)}
				</Space>
			</div>
		</div>
	);
}
