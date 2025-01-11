'use client';
import { useEffect, useState, useCallback } from 'react';
import { Input, Button, message, Form, Spin } from 'antd';
import { useRouter } from 'next/navigation';
import { getNote, updateNote, deleteNote } from '@/lib/actions/notes';
import { use } from 'react';
import NotesLayout from '@/components/NotesLayout';
import { useNotes } from '@/contexts/NotesContext';
import RichTextEditor from '@/components/RichTextEditor';

export default function EditNotePage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const resolvedParams = use(params);
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [form] = Form.useForm();
	const router = useRouter();
	const { refreshNotes } = useNotes();
	const [deleting, setDeleting] = useState(false);

	useEffect(() => {
		fetchNote();
	}, []);

	const fetchNote = useCallback(async () => {
		try {
			const { data, error } = await getNote(resolvedParams.id);
			if (error) throw error;
			if (!data) {
				message.error('Note not found');
				router.push('/dashboard/notes');
				return;
			}
			form.setFieldsValue(data);
		} catch (error) {
			message.error('Failed to fetch note');
			console.error('Error:', error);
			router.push('/dashboard/notes');
		} finally {
			setLoading(false);
		}
	}, [form, resolvedParams.id, router]);

	const onFinish = async (values: { title: string; content: string }) => {
		setSaving(true);
		try {
			const { error } = await updateNote(resolvedParams.id, values);
			if (error) throw error;
			await refreshNotes();
			message.success('Note updated successfully');
			router.push('/dashboard/notes');
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
			const { error } = await deleteNote(resolvedParams.id);
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

	if (loading) {
		return (
			<NotesLayout>
				<div className="flex justify-center items-center h-full">
					<Spin size="large" />
				</div>
			</NotesLayout>
		);
	}

	return (
		<NotesLayout>
			<div className="flex flex-col h-[calc(100vh-64px)] bg-component-background">
				<div className="flex-1 overflow-y-auto p-4 md:p-8">
					<Form form={form} layout="vertical" onFinish={onFinish}>
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
							block={window.innerWidth < 640}
							className="w-full max-w-[200px]"
						>
							Delete
						</Button>
						<Button
							type="primary"
							onClick={form.submit}
							loading={saving}
							disabled={deleting}
							block={window.innerWidth < 640}
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
