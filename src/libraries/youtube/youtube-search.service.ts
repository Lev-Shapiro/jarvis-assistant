import { google, youtube_v3 } from 'googleapis';

export interface Song {
  videoId: string;
  name: string;
  thumbnailUrl: string;
  channelTitle: string;
  duration?: string;
}

export class YoutubeSearchService {
  private youtube: youtube_v3.Youtube;

  constructor() {
    this.youtube = google.youtube({
      version: 'v3',
      auth: process.env.GOOGLE_API_KEY
    });
  }

  /**
   * Search for songs on YouTube based on the provided query
   * @param query The search query
   * @param maxResults Maximum number of results to return (default: 5)
   * @returns A promise that resolves to an array of Song objects
   */
  async searchSongs(query: string, maxResults: number = 5): Promise<Song[]> {
    try {
      const response = await this.youtube.search.list({
        part: ['snippet'],
        q: `${query}`,
        maxResults,
        type: ['video'],
        videoCategoryId: '10', // Music category
        videoEmbeddable: 'true',
      });

      if (!response.data.items || response.data.items.length === 0) {
        return [];
      }

      const songs: Song[] = [];
      const videoIds = response.data.items.map(item => item.id?.videoId).filter(Boolean) as string[];

      // Get additional details for the videos (including duration)
      const videoDetails = await this.getVideoDetails(videoIds);

      for (const item of response.data.items) {
        if (item.id?.videoId && item.snippet) {
          const videoDetail = videoDetails.find(v => v.id === item.id?.videoId);

          songs.push({
            videoId: item.id.videoId,
            name: item.snippet.title || 'Unknown Title',
            thumbnailUrl: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.default?.url || '',
            channelTitle: item.snippet.channelTitle || 'Unknown Channel',
            duration: videoDetail?.duration
          });
        }
      }

      return songs;
    } catch (error) {
      console.error('Error searching YouTube songs:', error);
      throw new Error(`Failed to search YouTube songs: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Get additional details for videos including duration
   * @param videoIds Array of video IDs
   * @returns Promise with video details
   */
  private async getVideoDetails(videoIds: string[]): Promise<Array<{ id: string, duration: string }>> {
    try {
      const response = await this.youtube.videos.list({
        part: ['contentDetails'],
        id: videoIds
      });

      if (!response.data.items || response.data.items.length === 0) {
        return [];
      }

      return response.data.items.map(item => ({
        id: item.id || '',
        duration: item.contentDetails?.duration || ''
      }));
    } catch (error) {
      console.error('Error fetching video details:', error);
      return [];
    }
  }
}