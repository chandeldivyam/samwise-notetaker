'use client';

import { Form, Upload } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import { RcFile } from 'antd/lib/upload';

const { Dragger } = Upload;

interface UploadSectionProps {
	file: File | null; // Add this line
	onFileSelect: (file: File) => void;
	disabled: boolean;
}

export function UploadSection({
	file,
	onFileSelect,
	disabled,
}: UploadSectionProps) {
	const handleBeforeUpload = (file: RcFile) => {
		onFileSelect(file);
		return false; // Prevent automatic upload
	};

	return (
		<Form.Item
			label="Recording File"
			required
			className="border-border-color"
		>
			<Dragger
				accept=".mp3,.mp4"
				multiple={false}
				maxCount={1}
				showUploadList={true}
				beforeUpload={handleBeforeUpload}
				disabled={disabled}
				fileList={
					file
						? [
								{
									uid: '-1',
									name: file.name,
									status: 'done',
									size: file.size,
									type: file.type,
								},
							]
						: []
				}
				className="bg-component-background border-2 border-dashed border-border-color hover:border-text-primary"
			>
				<p className="ant-upload-drag-icon">
					<InboxOutlined className="text-4xl" />
				</p>
				<p className="ant-upload-text text-lg font-medium">
					Click or drag MP3 or MP4 file to upload
				</p>
				<p className="ant-upload-hint text-text-secondary">
					Support for MP3 and MP4 files only. Max file size: 1000MB
				</p>
			</Dragger>
		</Form.Item>
	);
}
