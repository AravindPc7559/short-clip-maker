import { api } from '../client';
import { API_CONFIG } from '../config';
import { 
  ApiResponse, 
  UploadVideoRequest, 
  UploadYouTubeRequest, 
  VideoJob,
  Job 
} from '../types';

class UploadService {
  private baseUrl = API_CONFIG.ENDPOINTS.UPLOAD;

  // Upload video file
  async uploadVideo(file: File): Promise<VideoJob> {
    try {
      const formData = new FormData();
      formData.append('video', file);

      const response = await api.post<ApiResponse<{ 
        jobId: string;
        videoId: string;
        status: string;
        fileUrl: string;
        originalFilename: string;
        fileSize: number;
        createdAt: string;
      }>>(
        this.baseUrl.VIDEO,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (response.data.success && response.data.data) {
        // Convert backend response to VideoJob format
        return {
          jobId: response.data.data.jobId,
          status: response.data.data.status as 'pending' | 'processing' | 'completed' | 'failed',
          videoUrl: response.data.data.fileUrl,
          fileName: response.data.data.originalFilename,
          fileSize: response.data.data.fileSize,
          duration: 0, // Will be updated during processing
          createdAt: response.data.data.createdAt
        };
      } else {
        throw new Error(response.data.message || 'Video upload failed');
      }
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Video upload failed. Please try again.'
      );
    }
  }

  // Upload YouTube video
  async uploadYouTubeVideo(youtubeUrl: string): Promise<VideoJob> {
    try {
      const response = await api.post<ApiResponse<{
        jobId: string;
        videoId: string;
        status: string;
        videoUrl: string;
        fileName: string;
        fileSize: number;
        duration: number;
        youtubeUrl: string;
        createdAt: string;
      }>>(
        this.baseUrl.YOUTUBE,
        { youtubeUrl }
      );

      if (response.data.success && response.data.data) {
        // Convert backend response to VideoJob format
        return {
          jobId: response.data.data.jobId,
          status: response.data.data.status as 'pending' | 'processing' | 'completed' | 'failed',
          videoUrl: response.data.data.videoUrl,
          fileName: response.data.data.fileName,
          fileSize: response.data.data.fileSize,
          duration: response.data.data.duration,
          youtubeUrl: response.data.data.youtubeUrl,
          createdAt: response.data.data.createdAt
        };
      } else {
        throw new Error(response.data.message || 'YouTube video upload failed');
      }
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'YouTube video upload failed. Please try again.'
      );
    }
  }

  // Get job status
  async getJobStatus(jobId: string): Promise<Job> {
    try {
      const response = await api.get<ApiResponse<{ job: Job }>>(
        `${this.baseUrl.STATUS}/${jobId}`
      );

      if (response.data.success && response.data.data) {
        return response.data.data.job;
      } else {
        throw new Error(response.data.message || 'Failed to get job status');
      }
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Failed to get job status'
      );
    }
  }

  // Get user's jobs
  async getUserJobs(page: number = 1, limit: number = 10, status?: string): Promise<{
    jobs: Job[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
    };
  }> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(status && { status })
      });

      const response = await api.get<ApiResponse<{
        jobs: Job[];
        pagination: {
          currentPage: number;
          totalPages: number;
          totalItems: number;
          itemsPerPage: number;
        };
      }>>(
        `${this.baseUrl.JOBS}?${params.toString()}`
      );

      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to get user jobs');
      }
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Failed to get user jobs'
      );
    }
  }

  // Poll job status (useful for real-time updates)
  async pollJobStatus(
    jobId: string, 
    onUpdate: (job: Job) => void,
    interval: number = 2000
  ): Promise<void> {
    const poll = async () => {
      try {
        const job = await this.getJobStatus(jobId);
        onUpdate(job);
        
        // Continue polling if not completed or failed
        if (job.status === 'pending' || job.status === 'processing') {
          setTimeout(poll, interval);
        }
      } catch (error) {
        console.error('Error polling job status:', error);
        // Stop polling on error
      }
    };

    poll();
  }

  // Legacy method for backward compatibility
  async pollUploadStatus(
    jobId: string, 
    onUpdate: (status: VideoJob) => void,
    interval: number = 2000
  ): Promise<void> {
    const poll = async () => {
      try {
        const job = await this.getJobStatus(jobId);
        // Convert Job to VideoJob format for backward compatibility
        const videoJob: VideoJob = {
          jobId: job.id,
          status: job.status,
          videoUrl: job.video.url,
          fileName: job.video.fileName,
          fileSize: job.video.size,
          duration: job.video.duration,
          createdAt: job.createdAt
        };
        onUpdate(videoJob);
        
        // Continue polling if not completed or failed
        if (job.status === 'pending' || job.status === 'processing') {
          setTimeout(poll, interval);
        }
      } catch (error) {
        console.error('Error polling upload status:', error);
        // Stop polling on error
      }
    };

    poll();
  }
}

export const uploadService = new UploadService();
