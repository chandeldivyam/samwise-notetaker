// src/lib/actions/recordings.ts
'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { CreateRecordingInput } from '@/types/recording';

export async function createRecording(data: CreateRecordingInput) {
	try {
		const supabase = await createClient();

		const {
			data: { user },
		} = await supabase.auth.getUser();
		if (!user) throw new Error('Not authenticated');

		const { error } = await supabase.from('recordings').insert([
			{
				title: data.title,
				description: data.description,
				s3_key: data.s3_key,
				original_filename: data.original_filename,
				file_type: data.file_type,
				file_size: data.file_size,
				user_id: user.id,
			},
		]);

		if (error) throw error;

		revalidatePath('/dashboard/recordings');
		return { success: true };
	} catch (error) {
		console.error('Error creating recording:', error);
		//TODO: If database insert fails, clean up the S3 file
		return { error: 'Failed to create recording' };
	}
}

export async function getRecordings() {
	try {
		const supabase = await createClient();

		const { data, error } = await supabase
			.from('recordings')
			.select('*')
			.order('created_at', { ascending: false });

		if (error) throw error;

		return { data };
	} catch (error) {
		console.error('Error fetching recordings:', error);
		return { error: 'Failed to fetch recordings' };
	}
}

export async function getRecording(id: string) {
	try {
		const supabase = await createClient();

		const { data, error } = await supabase
			.from('recordings')
			.select('*')
			.eq('id', id)
			.single();

		if (error) throw error;

		return { data };
	} catch (error) {
		console.error('Error fetching recording:', error);
		return { error: 'Failed to fetch recording' };
	}
}

export async function deleteRecording(id: string) {
	try {
		const supabase = await createClient();

		// Get the recording first to get the S3 key
		const { data: recording, error: fetchError } = await supabase
			.from('recordings')
			.select('s3_key')
			.eq('id', id)
			.single();

		if (fetchError) throw fetchError;
		if (!recording) throw new Error('Recording not found');

		// Delete from database
		const { error: deleteError } = await supabase
			.from('recordings')
			.delete()
			.eq('id', id);

		if (deleteError) throw deleteError;

		// TODO: Delete from S3
		// You'll need to implement S3 deletion here

		return { success: true };
	} catch (error) {
		console.error('Error deleting recording:', error);
		return { error: 'Failed to delete recording' };
	}
}
