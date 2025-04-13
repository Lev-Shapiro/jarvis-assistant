export interface RecordedAudioData {
  buffer: Buffer;
  format: string;
}

export interface SavedAudioData extends RecordedAudioData {
  id: string;
}