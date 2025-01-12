// src/lib/actions/recordings.ts
'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { generateS3Key, uploadToS3, deleteFromS3 } from '@/utils/s3';
import { CreateRecordingInput } from '@/types/recording';

export async function createRecording(data: CreateRecordingInput) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase.from('recordings').insert([{
      title: data.title,
      description: data.description,
      s3_key: data.s3_key,
      original_filename: data.original_filename,
      file_type: data.file_type,
      file_size: data.file_size,
      user_id: user.id,
    }]);

    if (error) throw error;

    revalidatePath('/dashboard/recordings');
    return { success: true };
  } catch (error) {
    console.error('Error creating recording:', error);
    // If database insert fails, clean up the S3 file
    await deleteFromS3(data.s3_key);
    return { error: 'Failed to create recording' };
  }
}