import apiClient from '../client';
import { API_CONFIG } from '../config';
import { ApiResponse } from '../types';

export interface Clip {
  id: string;
  clip_url: string;
  start_time: number;
  end_time: number;
  duration: number;
  transcript: string;
  ai_tags: Record<string, any>;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  file_size: number;
  created_at: string;
  video?: {
    id: string;
    filename: string;
    status: string;
  };
}

export interface ClipsPaginatedResponse {
  clips: Clip[];
  pagination: {
    current_page: number;
    total_pages: number;
    total_items: number;
    items_per_page: number;
  };
}

export interface VideoClipsResponse {
  video: {
    id: string;
    filename: string;
    status: string;
  };
  clips: Clip[];
  total: number;
}

export interface CreateClipRequest {
  clip_url: string;
  start_time: number;
  end_time: number;
  transcript?: string;
  ai_tags?: Record<string, any>;
}

class ClipService {
  /**
   * Get all clips for the authenticated user
   */
  async getUserClips(page = 1, limit = 20, status?: string): Promise<ClipsPaginatedResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (status) {
      params.append('status', status);
    }

    const response = await apiClient.get<ApiResponse<ClipsPaginatedResponse>>(
      `/clips/user?${params.toString()}`
    );

    return response.data.data;
  }

  /**
   * Get all clips for a specific video
   */
  async getVideoClips(videoId: string): Promise<VideoClipsResponse> {
    const response = await apiClient.get<ApiResponse<VideoClipsResponse>>(
      `/videos/${videoId}/clips`
    );

    return response.data.data;
  }

  /**
   * Get details of a single clip
   */
  async getClipDetails(clipId: string): Promise<{ clip: Clip; video: any }> {
    const response = await apiClient.get<ApiResponse<{ clip: Clip; video: any }>>(
      `/clips/${clipId}`
    );

    return response.data.data;
  }

  /**
   * Create a new clip for a video (for testing/manual creation)
   */
  async createClip(videoId: string, clipData: CreateClipRequest): Promise<Clip> {
    const response = await apiClient.post<ApiResponse<{ clip: Clip }>>(
      `/videos/${videoId}/clips`,
      clipData
    );

    return response.data.data.clip;
  }

  /**
   * Delete a clip
   */
  async deleteClip(clipId: string): Promise<void> {
    await apiClient.delete(`/clips/${clipId}`);
  }

  /**
   * Download a clip (returns the clip URL for download)
   */
  async downloadClip(clipId: string): Promise<string> {
    const clipDetails = await this.getClipDetails(clipId);
    return clipDetails.clip.clip_url;
  }

  /**
   * Get clips by status for a user
   */
  async getClipsByStatus(status: 'pending' | 'processing' | 'completed' | 'failed', page = 1, limit = 20): Promise<ClipsPaginatedResponse> {
    return this.getUserClips(page, limit, status);
  }

  /**
   * Search clips by transcript content
   */
  async searchClips(query: string, page = 1, limit = 20): Promise<Clip[]> {
    const allClips = await this.getUserClips(page, limit);
    
    // Client-side filtering by transcript (in a real app, this would be server-side)
    return allClips.clips.filter(clip => 
      clip.transcript.toLowerCase().includes(query.toLowerCase())
    );
  }

  /**
   * Get clip statistics for user
   */
  async getClipStats(): Promise<{
    total_clips: number;
    completed_clips: number;
    processing_clips: number;
    total_duration: number;
    total_size: number;
  }> {
    const clipsResponse = await this.getUserClips(1, 1000); // Get all clips for stats
    const clips = clipsResponse.clips;

    return {
      total_clips: clips.length,
      completed_clips: clips.filter(c => c.status === 'completed').length,
      processing_clips: clips.filter(c => c.status === 'processing').length,
      total_duration: clips.reduce((sum, clip) => sum + clip.duration, 0),
      total_size: clips.reduce((sum, clip) => sum + clip.file_size, 0)
    };
  }
}

export const clipService = new ClipService();
