// src/types/transcription.ts
export interface TranscriptionSegment {
    id: string;
    recording_id: string;
    speaker_label: string;
    original_speaker_number: number;
    person_id: string | null;
    start_time: number;
    end_time: number;
    text: string;
    created_at: string;
    updated_at: string;
  }

  export interface Speaker {
    original_speaker_number: number;
    person_id: string | null;
    speaker_label: string;
  }

  export interface SpeakerLabel {
    original_speaker_number: number;
    label: string;
  }