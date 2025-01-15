// src/lib/actions/recordings.ts
'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { CreateRecordingInput } from '@/types/recording';
import { deleteS3Object } from './s3';

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
	const supabase = await createClient();
  
	try {
	  // Start a Supabase transaction
	  const { data: recording, error: fetchError } = await supabase
		.from('recordings')
		.select('s3_key')
		.eq('id', id)
		.single();
  
	  if (fetchError) throw fetchError;
	  if (!recording) throw new Error('Recording not found');
  
	  // Delete from S3 first
	  const { error: s3Error } = await deleteS3Object(recording.s3_key);
	  if (s3Error) throw s3Error;
  
	  // If S3 deletion succeeds, delete from database
	  const { error: deleteError } = await supabase
		.from('recordings')
		.delete()
		.eq('id', id);
  
	  if (deleteError) {
		// If database deletion fails, we should log this as an inconsistency
		// since the S3 file is already deleted
		console.error('Database deletion failed after S3 deletion:', deleteError);
		throw deleteError;
	  }
  
	  return { success: true };
	} catch (error) {
	  console.error('Error in deleteRecording:', error);
	  
	  // If this was a database error and S3 deletion already happened,
	  // we should log this for administrative cleanup
	  if (error instanceof Error) {
		return { 
		  error: 'Failed to delete recording',
		  details: error.message 
		};
	  }
	  return { error: 'Failed to delete recording' };
	}
  }
  
  
