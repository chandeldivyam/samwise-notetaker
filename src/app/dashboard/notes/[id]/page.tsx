import { getNote } from '@/lib/actions/notes';
import EditNoteForm from './EditNoteForm';
import { redirect } from 'next/navigation';

export default async function EditNotePage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const resolvedParams = await params;
	const { data: note, error } = await getNote(resolvedParams.id);

	if (error || !note) {
		redirect('/dashboard/notes');
	}

	return <EditNoteForm initialNote={note} />;
}
