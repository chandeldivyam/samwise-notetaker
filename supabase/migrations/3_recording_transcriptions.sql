-- Add to your migrations file
ALTER TABLE recordings ADD COLUMN transcription jsonb;
ALTER TABLE recordings ADD COLUMN transcription_status text DEFAULT 'pending';