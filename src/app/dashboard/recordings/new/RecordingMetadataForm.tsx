'use client';

import { Form, Input, Button } from 'antd';
import { FormInstance } from 'antd/lib/form';

export interface RecordingFormValues {
	title: string;
	description?: string;
}

interface RecordingMetadataFormProps {
	form: FormInstance<RecordingFormValues>;
	onSubmit: (values: RecordingFormValues) => Promise<void>;
	disabled: boolean;
	hasFile: boolean;
	children: React.ReactNode;
}

export function RecordingMetadataForm({
	form,
	onSubmit,
	disabled,
	hasFile,
	children,
}: RecordingMetadataFormProps) {
	return (
		<Form<RecordingFormValues>
			form={form}
			layout="vertical"
			onFinish={onSubmit}
			className="space-y-6"
		>
			<Form.Item
				name="title"
				label="Title"
				rules={[{ required: true, message: 'Please enter a title' }]}
			>
				<Input
					placeholder="Enter recording title"
					className="border-border-color hover:border-text-primary focus:border-text-primary"
					disabled={disabled}
				/>
			</Form.Item>

			<Form.Item name="description" label="Description">
				<Input.TextArea
					placeholder="Enter recording description (optional)"
					rows={4}
					className="border-border-color hover:border-text-primary focus:border-text-primary"
					disabled={disabled}
				/>
			</Form.Item>

			{children}

			<Form.Item className="mb-0">
				<Button
					type="primary"
					htmlType="submit"
					loading={disabled}
					disabled={!hasFile || disabled}
					className="w-full h-10 text-base font-medium bg-primary hover:bg-primary-dark"
				>
					{disabled ? 'Uploading...' : 'Upload Recording'}
				</Button>
			</Form.Item>
		</Form>
	);
}
