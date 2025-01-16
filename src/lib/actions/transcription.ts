// src/lib/actions/transcription.ts
'use server';

import { createClient } from '@/utils/supabase/server';
import { getS3SignedUrl } from './s3';

export async function transcribeRecording(recordingId: string) {
  try {
    const supabase = await createClient();

    // Get recording details
    const { data: recording, error: recordingError } = await supabase
      .from('recordings')
      .select('*')
      .eq('id', recordingId)
      .single();

    if (recordingError) throw recordingError;

    // Get signed URL for the recording
    const { url: mediaUrl, error: urlError } = await getS3SignedUrl(recording.s3_key);
    if (urlError) throw urlError;

    // Update status to processing
    await supabase
      .from('recordings')
      .update({ transcription_status: 'processing' })
      .eq('id', recordingId);

    // Call Deepgram API
    const response = await fetch('https://api.deepgram.com/v1/listen?' + new URLSearchParams({
      smart_format: 'true',
      punctuate: 'true',
      paragraphs: 'true',
      diarize: 'true',
      language: 'en',
      model: 'nova-2'
    }), {
      method: 'POST',
      headers: {
        'Authorization': `Token ${process.env.DEEPGRAM_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ url: mediaUrl })
    });

    if (!response.ok) {
      throw new Error(`Deepgram API error: ${response.statusText}`);
    }

    const result = await response.json();
    console.log(result);

    // Update recording with transcription
    const { error: updateError } = await supabase
      .from('recordings')
      .update({ 
        transcription: result,
        transcription_status: 'completed'
      })
      .eq('id', recordingId);

    if (updateError) throw updateError;

    return { success: true };
  } catch (error) {
    console.log('Transcription error:', error);
    console.error('Transcription error:', error);
    // Update status to failed
    const supabase = await createClient();
    await supabase
      .from('recordings')
      .update({ transcription_status: 'failed' })
      .eq('id', recordingId);

    return { error: 'Failed to transcribe recording' };
  }
}