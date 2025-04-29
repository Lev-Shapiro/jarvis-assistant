import { AudioToolbarService } from '@/infrastructure/audio/audio-toolbar.service';

export class AudioToolbarReceptor {
  constructor(private readonly audioToolbarService: AudioToolbarService) {}

  public handleResumeAction(): void {
    // This method would be called when the resume button is clicked
    // Implementation depends on how the AudioPlayerService handles resuming playback
  }

  public handlePauseAction(): void {
    // This method would be called when the pause button is clicked
    // Implementation depends on how the AudioPlayerService handles pausing playback
  }

  public handleStopAction(): void {
    // Forward the stop action to the service
    // The service is already handling the stop action directly via IPC,
    // but this method could be used if needed for additional logic
  }

  public handleExitAction(): void {
    // Deactivate the toolbar
    this.audioToolbarService.deactivateToolbar();
  }

  public handleSeekAction(position: number): void {
    // Handle seeking to a specific position
    // Implementation depends on how the AudioPlayerService handles seeking
  }
}
