import { VideoData } from '@/infrastructure/infobar/infobar.types';
import { DomUtils } from '../../utils/dom.utils';
import { InfobarRenderer } from '../renderer.interface';

/**
 * Renderer for video data
 */
export class VideoRenderer implements InfobarRenderer<VideoData> {
  /**
   * Renders video data into an HTML element
   * @param data The video data
   * @returns The rendered HTML element
   */
  render(data: VideoData): HTMLElement {
    const container = DomUtils.createElement('figure', {
      classes: ['video-container']
    });
    
    // Create video element with advanced controls
    const videoWrapper = DomUtils.createElement('div', {
      classes: ['video-wrapper']
    });
    
    const video = DomUtils.createElement('video', {
      attributes: {
        src: data.src,
        width: String(data.width),
        height: String(data.height),
        ...(data.autoplay ? { autoplay: 'autoplay' } : {}),
        ...(data.controls !== false ? { controls: 'controls' } : {})
      },
      classes: ['video-player']
    }) as HTMLVideoElement;
    
    // Add loading indicator and error handling
    const loadingIndicator = DomUtils.createElement('div', {
      classes: ['video-loading'],
      content: 'Loading video...'
    });
    
    video.addEventListener('loadeddata', () => {
      videoWrapper.classList.add('video-loaded');
      if (videoWrapper.contains(loadingIndicator)) {
        videoWrapper.removeChild(loadingIndicator);
      }
      
      // Create custom controls if not using native controls
      if (!data.controls) {
        this.addCustomControls(videoWrapper, video);
      }
    });
    
    video.addEventListener('error', () => {
      const errorIndicator = DomUtils.createElement('div', {
        classes: ['video-error'],
        content: 'Failed to load video'
      });
      videoWrapper.innerHTML = '';
      videoWrapper.appendChild(errorIndicator);
    });
    
    videoWrapper.appendChild(loadingIndicator);
    videoWrapper.appendChild(video);
    container.appendChild(videoWrapper);
    
    // Add caption if provided
    if (data.caption) {
      const figcaption = DomUtils.createElement('figcaption', {
        content: data.caption,
        classes: ['video-caption']
      });
      container.appendChild(figcaption);
    }
    
    return container;
  }
  
  /**
   * Adds custom video controls for better UX
   * @param container The video container
   * @param video The video element
   */
  private addCustomControls(container: HTMLElement, video: HTMLVideoElement): void {
    const controlsContainer = DomUtils.createElement('div', {
      classes: ['custom-video-controls']
    });
    
    // Play/Pause button
    const playPauseButton = DomUtils.createElement('button', {
      classes: ['video-play-pause', 'video-control-button'],
      content: '▶'
    });
    
    // Progress bar
    const progressBarContainer = DomUtils.createElement('div', {
      classes: ['video-progress-container']
    });
    
    const progressBar = DomUtils.createElement('div', {
      classes: ['video-progress-bar']
    });
    
    const progressIndicator = DomUtils.createElement('div', {
      classes: ['video-progress-indicator']
    });
    
    progressBar.appendChild(progressIndicator);
    progressBarContainer.appendChild(progressBar);
    
    // Time display
    const timeDisplay = DomUtils.createElement('div', {
      classes: ['video-time-display'],
      content: '0:00 / 0:00'
    });
    
    // Volume control
    const volumeContainer = DomUtils.createElement('div', {
      classes: ['video-volume-container']
    });
    
    const volumeButton = DomUtils.createElement('button', {
      classes: ['video-volume-button', 'video-control-button'],
      content: '🔊'
    });
    
    const volumeSlider = DomUtils.createElement('input', {
      classes: ['video-volume-slider'],
      attributes: {
        type: 'range',
        min: '0',
        max: '1',
        step: '0.1',
        value: '1'
      }
    }) as HTMLInputElement;
    
    volumeContainer.appendChild(volumeButton);
    volumeContainer.appendChild(volumeSlider);
    
    // Fullscreen button
    const fullscreenButton = DomUtils.createElement('button', {
      classes: ['video-fullscreen-button', 'video-control-button'],
      content: '⛶'
    });
    
    // Add all controls to container
    controlsContainer.appendChild(playPauseButton);
    controlsContainer.appendChild(progressBarContainer);
    controlsContainer.appendChild(timeDisplay);
    controlsContainer.appendChild(volumeContainer);
    controlsContainer.appendChild(fullscreenButton);
    
    container.appendChild(controlsContainer);
    
    // Add event listeners
    
    // Play/Pause
    playPauseButton.addEventListener('click', () => {
      if (video.paused) {
        video.play();
        playPauseButton.textContent = '❚❚';
      } else {
        video.pause();
        playPauseButton.textContent = '▶';
      }
    });
    
    // Progress bar interaction
    progressBarContainer.addEventListener('click', (e) => {
      const rect = progressBarContainer.getBoundingClientRect();
      const percent = (e.clientX - rect.left) / rect.width;
      video.currentTime = percent * video.duration;
    });
    
    // Time update
    video.addEventListener('timeupdate', () => {
      // Update progress bar
      const percent = (video.currentTime / video.duration) * 100;
      progressIndicator.style.width = `${percent}%`;
      
      // Update time display
      timeDisplay.textContent = `${this.formatTime(video.currentTime)} / ${this.formatTime(video.duration)}`;
    });
    
    // Volume control
    volumeButton.addEventListener('click', () => {
      if (video.muted) {
        video.muted = false;
        volumeButton.textContent = '🔊';
        volumeSlider.value = video.volume.toString();
      } else {
        video.muted = true;
        volumeButton.textContent = '🔇';
      }
    });
    
    volumeSlider.addEventListener('input', () => {
      video.volume = parseFloat(volumeSlider.value);
      video.muted = video.volume === 0;
      volumeButton.textContent = video.muted ? '🔇' : '🔊';
    });
    
    // Fullscreen
    fullscreenButton.addEventListener('click', () => {
      if (!document.fullscreenElement) {
        container.requestFullscreen().catch(err => {
          console.error(`Error attempting to enable fullscreen: ${err.message}`);
        });
      } else {
        document.exitFullscreen();
      }
    });
  }
  
  /**
   * Formats time in seconds to MM:SS format
   * @param seconds Time in seconds
   * @returns Formatted time string
   */
  private formatTime(seconds: number): string {
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
  }
} 