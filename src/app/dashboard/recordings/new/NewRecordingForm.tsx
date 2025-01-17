'use client';

import { Typography } from 'antd';
import { useNewRecording } from './useNewRecording';
import { UploadSection } from './UploadSection';
import { RecordingMetadataForm } from './RecordingMetadataForm';
import { UploadProgress } from './UploadProgress';

const { Title } = Typography;

interface NewRecordingFormProps {
	userId: string;
}

export function NewRecordingForm({ userId }: NewRecordingFormProps) {
	const {
		form,
		file,
		uploading,
		uploadProgress,
		handleFileSelect,
		handleSubmit,
	} = useNewRecording(userId);

	return (
		<>
			<Title level={2} className="mb-8 text-text-primary">
				Upload New Recording
			</Title>

			<RecordingMetadataForm
				form={form}
				onSubmit={handleSubmit}
				disabled={uploading}
				hasFile={!!file}
			>
				<UploadSection
					file={file}
					onFileSelect={handleFileSelect}
					disabled={uploading}
				/>

				{uploading && <UploadProgress progress={uploadProgress} />}
			</RecordingMetadataForm>
		</>
	);
}
