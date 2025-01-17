import { Typography } from 'antd';
import { Recording } from '@/types/recording';
import { formatFileSize } from '@/utils/format';

const { Text } = Typography;

interface RecordingMetadataProps {
	recording: Recording;
}

export function RecordingMetadata({ recording }: RecordingMetadataProps) {
	return (
		<div className="mb-4 space-y-2">
			<div className="flex gap-4">
				<div>
					<Text type="secondary">File Type:</Text>{' '}
					<Text>{recording.file_type}</Text>
				</div>
				<div>
					<Text type="secondary">Size:</Text>{' '}
					<Text>{formatFileSize(recording.file_size)}</Text>
				</div>
				<div>
					<Text type="secondary">Uploaded:</Text>{' '}
					<Text>
						{new Date(recording.created_at).toLocaleDateString(
							'en-US',
							{
								year: 'numeric',
								month: 'long',
								day: 'numeric',
							}
						)}
					</Text>
				</div>
			</div>
			{recording.description && (
				<div>
					<Text type="secondary">Description:</Text>{' '}
					<Text>{recording.description}</Text>
				</div>
			)}
		</div>
	);
}
