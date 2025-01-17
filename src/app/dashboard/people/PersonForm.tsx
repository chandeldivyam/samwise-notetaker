// ./src/app/dashboard/people/PersonForm.tsx
'use client';

import { useState, useEffect } from 'react';
import { Input, Button, Form, Select, Space } from 'antd';
import { useRouter } from 'next/navigation';
import RichTextEditor from '@/components/RichTextEditor';
import { Person } from '@/types/person';
import { useMessage, showSuccess, showError } from '@/utils/message';

interface FormValues {
	name: string;
	email: string;
	tags: string[];
	description: string;
}

interface PersonFormProps {
	initialPerson?: Person;
	onSubmit: (
		values: FormValues
	) => Promise<{ error?: string; details?: string }>;
	submitButtonText: string;
}

export default function PersonForm({
	initialPerson,
	onSubmit,
	submitButtonText,
}: PersonFormProps) {
	const [form] = Form.useForm<FormValues>();
	const router = useRouter();
	const [loading, setLoading] = useState(false);
	const [isDirty, setIsDirty] = useState(false);
	const message = useMessage();

	// Set initial form values if editing
	if (initialPerson) {
		form.setFieldsValue(initialPerson);
	}

	// Handle beforeunload
	useEffect(() => {
		const handleBeforeUnload = (event: BeforeUnloadEvent) => {
			if (isDirty) {
				event.preventDefault();
				event.returnValue =
					'You have unsaved changes. Are you sure you want to leave?';
				return 'You have unsaved changes. Are you sure you want to leave?';
			}
		};
		window.addEventListener('beforeunload', handleBeforeUnload);
		return () =>
			window.removeEventListener('beforeunload', handleBeforeUnload);
	}, [isDirty]);

	const onFinish = async (values: FormValues) => {
		setLoading(true);
		try {
			const { error, details } = await onSubmit(values);
			if (error) {
				showError(
					message,
					`Failed to save person: ${details || error}`
				);
				return;
			}

			showSuccess(
				message,
				`Person ${initialPerson ? 'updated' : 'created'} successfully`
			);
			router.push('/dashboard/people');
			setIsDirty(false);
		} catch (error) {
			showError(message, 'An unexpected error occurred');
			console.error('Error:', error);
		} finally {
			setLoading(false);
		}
	};

	const onValuesChange = () => {
		setIsDirty(true);
	};

	return (
		<div className="flex flex-col h-[calc(100vh-64px)] bg-component-background">
			<div className="flex-1 overflow-y-auto p-4 md:p-8">
				<div className="max-w-3xl mx-auto">
					<Form
						form={form}
						layout="vertical"
						onFinish={onFinish}
						onValuesChange={onValuesChange}
					>
						<Form.Item
							name="name"
							label="Name"
							rules={[
								{
									required: true,
									message: 'Please input the name!',
								},
							]}
						>
							<Input
								placeholder="Enter name"
								size="large"
								className="text-text-primary"
							/>
						</Form.Item>

						<Form.Item
							name="email"
							label="Email"
							rules={[
								{
									required: true,
									message: 'Please input the email!',
								},
								{
									type: 'email',
									message: 'Please enter a valid email!',
								},
							]}
						>
							<Input
								placeholder="Enter email"
								size="large"
								className="text-text-primary"
							/>
						</Form.Item>

						<Form.Item name="tags" label="Tags">
							<Select
								mode="tags"
								placeholder="Add tags"
								size="large"
								className="text-text-primary"
							/>
						</Form.Item>

						<Form.Item
							name="description"
							label="Description"
							rules={[
								{
									required: true,
									message: 'Please input the description!',
								},
							]}
						>
							<RichTextEditor placeholder="Start writing description..." />
						</Form.Item>
					</Form>
				</div>
			</div>

			<div className="sticky bottom-0 p-4 border-t border-border-color bg-component-background">
				<div className="flex gap-2 justify-end max-w-3xl mx-auto">
					<Space>
						<Button
							onClick={() => router.back()}
							disabled={loading}
						>
							Cancel
						</Button>
						<Button
							type="primary"
							onClick={form.submit}
							loading={loading}
							disabled={!isDirty}
						>
							{submitButtonText}
						</Button>
					</Space>
				</div>
			</div>
		</div>
	);
}
