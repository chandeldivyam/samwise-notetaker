'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

interface NoteData {
	title: string;
	content: string;
}

export async function createNote(data: NoteData) {
	try {
		const supabase = await createClient();

		// Get the current user
		const {
			data: { user },
		} = await supabase.auth.getUser();
		if (!user) throw new Error('Not authenticated');

		const { error } = await supabase.from('notes').insert([
			{
				title: data.title,
				content: data.content,
				user_id: user.id, // Add the user_id
			},
		]);

		if (error) throw error;

		revalidatePath('/dashboard/notes');
		return { success: true };
	} catch (error) {
		console.error('Error creating note:', error);
		return { error: 'Failed to create note' };
	}
}

export async function updateNote(id: string, data: NoteData) {
	try {
		const supabase = await createClient();

		// Get the current user
		const {
			data: { user },
		} = await supabase.auth.getUser();
		if (!user) throw new Error('Not authenticated');

		const { error } = await supabase
			.from('notes')
			.update({
				title: data.title,
				content: data.content,
			})
			.eq('id', id)
			.eq('user_id', user.id); // Ensure user owns the note

		if (error) throw error;

		revalidatePath('/dashboard/notes');
		return { success: true };
	} catch (error) {
		console.error('Error updating note:', error);
		return { error: 'Failed to update note' };
	}
}

export async function deleteNote(id: string) {
	try {
		const supabase = await createClient();

		// Get the current user
		const {
			data: { user },
		} = await supabase.auth.getUser();
		if (!user) throw new Error('Not authenticated');

		const { error } = await supabase
			.from('notes')
			.delete()
			.eq('id', id)
			.eq('user_id', user.id); // Ensure user owns the note

		if (error) throw error;

		revalidatePath('/dashboard/notes');
		return { success: true };
	} catch (error) {
		console.error('Error deleting note:', error);
		return { error: 'Failed to delete note' };
	}
}

export async function getNotes() {
	try {
		const supabase = await createClient();

		// Get the current user
		const {
			data: { user },
		} = await supabase.auth.getUser();
		if (!user) throw new Error('Not authenticated');

		const { data, error } = await supabase
			.from('notes')
			.select('*')
			.eq('user_id', user.id) // Filter by user_id
			.order('updated_at', { ascending: false });

		if (error) throw error;

		return { data };
	} catch (error) {
		console.error('Error fetching notes:', error);
		return { error: 'Failed to fetch notes' };
	}
}

export async function getNote(id: string) {
	try {
		const supabase = await createClient();

		// Get the current user
		const {
			data: { user },
		} = await supabase.auth.getUser();
		if (!user) throw new Error('Not authenticated');

		const { data, error } = await supabase
			.from('notes')
			.select('*')
			.eq('id', id)
			.eq('user_id', user.id)
			.single();

		if (error) throw error;

		return { data };
	} catch (error) {
		console.error('Error fetching note:', error);
		return { error: 'Failed to fetch note' };
	}
}
