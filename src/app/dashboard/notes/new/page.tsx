'use client';

import { useState, useEffect } from 'react';
import { Input, Button, message, Form } from 'antd';
import { useRouter } from 'next/navigation';
import { createNote } from '@/lib/actions/notes';
import NotesLayout from '@/components/NotesLayout';
import { useNotes } from '@/contexts/NotesContext';
import RichTextEditor from '@/components/RichTextEditor';

interface FormValues {
	title: string;
	content: string;
}

interface ChangedValues {
	title?: string;
	content?: string;
}

export default function NewNotePage() {
	const [loading, setLoading] = useState(false);
	const [form] = Form.useForm<FormValues>();
	const router = useRouter();
	const { refreshNotes } = useNotes();
	const [isDirty, setIsDirty] = useState(false);

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

		return () => {
			window.removeEventListener('beforeunload', handleBeforeUnload);
		};
	}, [isDirty]);

	const onFinish = async (values: FormValues) => {
		setLoading(true);
		try {
			const { error } = await createNote(values);
			if (error) throw error;

			await refreshNotes();
			message.success('Note created successfully');
			router.push('/dashboard/notes');
			setIsDirty(false);
		} catch (error) {
			message.error('Failed to create note');
			console.error('Error:', error);
		} finally {
			setLoading(false);
		}
	};

	const onValuesChange = (
		changedValues: ChangedValues,
		allValues: FormValues
	) => {
		// If either title or content has any value, we are dirty
		const hasValues = !!allValues.title || !!allValues.content;
		setIsDirty(hasValues);
	};

	return (
		<NotesLayout>
			<div className="flex flex-col h-[calc(100vh-48px)] bg-component-background">
				<div className="flex-1 overflow-y-auto p-8">
					<Form
						form={form}
						layout="vertical"
						onFinish={onFinish}
						onValuesChange={onValuesChange}
					>
						<Form.Item
							name="title"
							rules={[
								{
									required: true,
									message: 'Please input the title!',
								},
							]}
						>
							<Input
								placeholder="Title"
								variant="borderless"
								size="large"
								className="text-2xl font-bold px-0 text-text-primary"
							/>
						</Form.Item>

						<Form.Item
							name="content"
							rules={[
								{
									required: true,
									message: 'Please input the content!',
								},
							]}
						>
							<RichTextEditor placeholder="Start writing..." />
						</Form.Item>
					</Form>
				</div>

				<div className="sticky bottom-0 p-4 border-t border-border-color bg-component-background flex justify-end">
					<Button
						type="primary"
						onClick={form.submit}
						loading={loading}
						disabled={!isDirty}
						className="w-full max-w-[200px]" // Add max-width and remove block prop
					>
						Create
					</Button>
				</div>
			</div>
		</NotesLayout>
	);
}
