import { AudioPlayerService, AudioPlayerStatus } from "@/infrastructure/audio/audio-player.service";
import ytdl from "@distube/ytdl-core";
import { YoutubeSearchService } from "./youtube-search.service";
// @ts-ignore
import ffmpeg from "fluent-ffmpeg";
import { PassThrough, Readable } from "stream";
// import fs from 'fs'; // Removed fs
// import path from 'path'; // Removed path

export class YoutubePlayerService {
  constructor(
    private readonly youtubeSearchService: YoutubeSearchService,
    private readonly audioPlayerService: AudioPlayerService
  ) {}

  // TODO: Stops working after 02:54 minutes of the audio
  async playSong(input: string, language: string): Promise<void> {
    try {
      const song = (await this.youtubeSearchService.searchSongs(input))[0];
      if (!song) {
        throw new Error(`No songs found for query: ${input}`);
      }

      const videoId = song.videoId;
      const ytStream = ytdl(videoId, { quality: "highestaudio", filter: "audioonly" });

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

      const pcmStream = this.createFfmpegStream(ytStream, videoId);

      // Add logging for pcmStream events
      pcmStream.on('end', () => {
        console.log('pcmStream ended.');
      });
      pcmStream.on('error', (err) => {
        console.error('pcmStream error:', err);
      });

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

  private createFfmpegStream(ytStream: Readable, videoId: string, startTimemark?: string): Readable {
    let lastTimemark: string | null = null;
    let stuckCount = 0;
    const outputStream = new PassThrough();
    
    const processStream = (stream: Readable, timemark?: string) => {
      const command = ffmpeg(stream)
        .audioCodec('pcm_s16le')
        .format('s16le')
        .audioChannels(2)
        .audioFrequency(44100);
        
      // If we're restarting from a specific timemark
      if (timemark) {
        command.setStartTime(timemark);
      }
      
      return command
        .on('start', (commandLine) => {
          console.log(`ffmpeg process started${timemark ? ` from ${timemark}` : ''}:`, commandLine);
          lastTimemark = null;
          stuckCount = 0;
        })
        .on('progress', (progress) => {
          console.log('ffmpeg Processing: ' + progress.timemark);
          
          // Check if timemark is stuck
          if (lastTimemark === progress.timemark) {
            stuckCount++;
            console.log(`Detected potentially stuck ffmpeg process. Count: ${stuckCount}`);
            
            // If timemark hasn't changed for 3 consecutive progress events, restart
            if (stuckCount >= 3) {
              console.log(`ffmpeg appears stuck at ${progress.timemark}. Restarting process...`);
              
              // Kill current process and restart
              command.kill('SIGKILL');
              
              // Create a new ytdl stream with the same video ID
              const newYtStream = ytdl(videoId, { quality: "highestaudio", filter: "audioonly" });
              
              // Start a new ffmpeg process from the stuck timemark
              processStream(newYtStream, progress.timemark);
            }
          } else {
            lastTimemark = progress.timemark;
            stuckCount = 0;
          }
        })
        .on('end', () => {
          console.log('ffmpeg processing finished.');
        })
        .on('error', (err: Error) => {
          // Only log as error if it's not from us killing the process
          if (!err.message.includes('SIGKILL')) {
            console.error('ffmpeg conversion error:', err);
          }
        })
        .pipe(outputStream, { end: false }) as Readable;
    };
    
    // Start the initial processing
    processStream(ytStream);
    
    return outputStream;
  }
}
