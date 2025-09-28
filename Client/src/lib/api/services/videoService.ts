import { api } from '../client';
import { API_CONFIG } from '../config';
import { 
  ApiResponse, 
  Video, 
  VideoListResponse 
} from '../types';

class VideoService {
  private baseUrl = API_CONFIG.ENDPOINTS.VIDEO;

  // Start video processing from upload job
  async startVideoProcessing(jobId: string): Promise<Video> {
    try {
      const response = await api.post<ApiResponse<{ video: Video }>>(
        `${this.baseUrl.PROCESS}/${jobId}`
      );

      if (response.data.success && response.data.data) {
        return response.data.data.video;
      } else {
        throw new Error(response.data.message || 'Failed to start video processing');
      }
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Failed to start video processing'
      );
    }
  }

  // Get user's videos with pagination
  async getUserVideos(
    page: number = 1, 
    limit: number = 10, 
    status?: string
  ): Promise<VideoListResponse> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(status && { status }),
      });

      const response = await api.get<ApiResponse<VideoListResponse>>(
        `${this.baseUrl.LIST}?${params}`
      );

      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to get videos');
      }
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Failed to get videos'
      );
    }
  }

  // Get video processing status
  async getVideoStatus(videoId: string): Promise<Video> {
    try {
      const response = await api.get<ApiResponse<{ video: Video }>>(
        `${this.baseUrl.STATUS}/${videoId}`
      );

      if (response.data.success && response.data.data) {
        return response.data.data.video;
      } else {
        throw new Error(response.data.message || 'Failed to get video status');
      }
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Failed to get video status'
      );
    }
  }

  // Get video result
  async getVideoResult(videoId: string): Promise<Video> {
    try {
      const response = await api.get<ApiResponse<{ video: Video }>>(
        `${this.baseUrl.RESULT}/${videoId}`
      );

      if (response.data.success && response.data.data) {
        return response.data.data.video;
      } else {
        throw new Error(response.data.message || 'Failed to get video result');
      }
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Failed to get video result'
      );
    }
  }

  // Delete video
  async deleteVideo(videoId: string): Promise<void> {
    try {
      const response = await api.delete<ApiResponse>(
        `${this.baseUrl.DELETE}/${videoId}`
      );

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to delete video');
      }
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Failed to delete video'
      );
    }
  }

  // Poll video status (useful for real-time updates)
  async pollVideoStatus(
    videoId: string, 
    onUpdate: (video: Video) => void,
    interval: number = 2000
  ): Promise<void> {
    const poll = async () => {
      try {
        const video = await this.getVideoStatus(videoId);
        onUpdate(video);
        
        // Continue polling if not completed or failed
        if (video.status === 'pending' || video.status === 'processing') {
          setTimeout(poll, interval);
        }
      } catch (error) {
        console.error('Error polling video status:', error);
        // Stop polling on error
      }
    };

    poll();
  }
}

export const videoService = new VideoService();
