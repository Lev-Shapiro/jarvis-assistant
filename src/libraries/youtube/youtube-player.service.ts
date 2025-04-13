import { AudioPlayerService, AudioPlayerStatus } from "@/infrastructure/audio/audio-player.service";
import ytdl from "@distube/ytdl-core";
import { YoutubeSearchService } from "./youtube-search.service";
// @ts-ignore
import ffmpeg from "fluent-ffmpeg";
// import fs from 'fs'; // Removed fs
// import path from 'path'; // Removed path

export class YoutubePlayerService {
  constructor(
    private readonly youtubeSearchService: YoutubeSearchService,
    private readonly audioPlayerService: AudioPlayerService
  ) {}

  async playSong(input: string): Promise<void> {
    try {
      const song = (await this.youtubeSearchService.searchSongs(input))[0];
      if (!song) {
        throw new Error(`No songs found for query: ${input}`);
      }

      const ytStream = ytdl(song.videoId, { quality: "highestaudio", filter: "audioonly" });

      // Add logging for stream events
      ytStream.on('info', (info) => {
        console.log('ytdl stream info:', info.videoDetails.title);
      });
      ytStream.on('progress', (chunkLength, downloaded, total) => {
        console.log(`ytdl progress: ${downloaded}/${total}`);
      });
      ytStream.on('error', (err) => {
        console.error('ytdl stream error:', err);
      });
      ytStream.on('end', () => {
        console.log('ytdl stream ended.');
      });
      ytStream.on('close', () => {
        console.log('ytdl stream closed.');
      });

      const pcmStream = ffmpeg(ytStream)
        .audioCodec('pcm_s16le')
        .format('s16le')
        .audioChannels(2)
        .audioFrequency(44100)
        .on('error', (err: Error) => {
          console.error('ffmpeg conversion error:', err);
        })
        .pipe();

      // Start playing the audio
      this.audioPlayerService.playAudioStream(pcmStream);
      
      // Create a promise that resolves when the audio finishes playing
      return new Promise<void>((resolve, reject) => {
        // Set up a status change listener
        const statusListener = (status: AudioPlayerStatus) => {
          console.log(`Audio player status changed: ${status}`);
          
          // When the status changes to IDLE (finished) or ERROR, resolve or reject
          if (status === AudioPlayerStatus.IDLE) {
            this.audioPlayerService.onStatusChange(statusListener); // Remove listener
            resolve();
          } else if (status === AudioPlayerStatus.ERROR) {
            this.audioPlayerService.onStatusChange(statusListener); // Remove listener
            reject(new Error('Audio playback failed'));
          }
        };
        
        // Register the status change listener
        this.audioPlayerService.onStatusChange(statusListener);
      });

    } catch (error) {
      console.error("Error playing song:", error);
      throw error;
    }
  }
}
