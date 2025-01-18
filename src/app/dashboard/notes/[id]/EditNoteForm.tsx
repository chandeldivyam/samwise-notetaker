// ./src/app/dashboard/notes/[id]/EditNoteForm.tsx
'use client';

import { useState, useEffect } from 'react';
import { Input, Button, message, Form } from 'antd';
import { useRouter } from 'next/navigation';
import { updateNote, deleteNote } from '@/lib/actions/notes';
import NotesLayout from '@/components/NotesLayout';
import { useNotes } from '@/contexts/NotesContext';
import RichTextEditor from '@/components/RichTextEditor';
import { Note } from '@/types/note';

interface FormValues {
	title: string;
	content: string;
}

interface EditNoteFormProps {
	initialNote: Note;
}

export default function EditNoteForm({ initialNote }: EditNoteFormProps) {
	const [form] = Form.useForm<FormValues>();
	const router = useRouter();
	const { refreshNotes } = useNotes();
	const [saving, setSaving] = useState(false);
	const [deleting, setDeleting] = useState(false);
	const [isDirty, setIsDirty] = useState(false);

	// Set initial form values
	form.setFieldsValue(initialNote);

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
		setSaving(true);
		try {
			const { error } = await updateNote(initialNote.id, values);
			if (error) throw error;
			await refreshNotes();
			message.success('Note updated successfully');
			router.push('/dashboard/notes');
			setIsDirty(false);
		} catch (error) {
			message.error('Failed to update note');
			console.error('Error:', error);
		} finally {
			setSaving(false);
		}
	};

	const handleDelete = async () => {
		if (!confirm('Are you sure you want to delete this note?')) return;
		setDeleting(true);
		try {
			const { error } = await deleteNote(initialNote.id);
			if (error) throw error;
			await refreshNotes();
			message.success('Note deleted successfully');
			router.push('/dashboard/notes');
		} catch (error) {
			message.error('Failed to delete note');
			console.error('Error:', error);
		} finally {
			setDeleting(false);
		}
	};

	const onValuesChange = (
		changedValues: FormValues,
		allValues: FormValues
	) => {
		const hasChanges =
			initialNote.title !== allValues.title ||
			initialNote.content !== allValues.content;
		setIsDirty(hasChanges);
	};

	return (
		<NotesLayout>
			<div className="flex flex-col h-[calc(100vh-64px)] bg-component-background">
				<div className="flex-1 overflow-y-auto p-4 md:p-8">
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
								className="text-xl md:text-2xl font-bold px-0 text-text-primary"
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

				<div className="sticky bottom-0 p-4 border-t border-border-color bg-component-background">
					<div className="flex gap-2 justify-end max-w-screen-xl mx-auto">
						<Button
							danger
							onClick={handleDelete}
							loading={deleting}
							disabled={saving}
							className="w-full max-w-[200px]"
						>
							Delete
						</Button>
						<Button
							type="primary"
							onClick={form.submit}
							loading={saving}
							disabled={!isDirty || deleting}
							className="w-full max-w-[200px]"
						>
							Save
						</Button>
					</div>
				</div>
			</div>
		</NotesLayout>
	);
}
