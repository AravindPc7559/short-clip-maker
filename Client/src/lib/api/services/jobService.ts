import apiClient from "../client";
import { ApiResponse } from "../types";


export interface Job {
  id: string;
  video_id: string;
  job_type: 'transcription' | 'segmentation' | 'clipping' | 'upload';
  status: 'pending' | 'running' | 'done' | 'failed';
  progress: number;
  output: Record<string, any>;
  error_log: string;
  priority: number;
  started_at?: string;
  completed_at?: string;
  processing_duration?: number;
  created_at: string;
  updated_at: string;
  video?: {
    id: string;
    filename: string;
    status: string;
  };
}

export interface JobsPaginatedResponse {
  jobs: Job[];
  pagination: {
    current_page: number;
    total_pages: number;
    total_items: number;
    items_per_page: number;
  };
}

export interface VideoJobsResponse {
  video: {
    id: string;
    filename: string;
    status: string;
  };
  jobs: Job[];
  total: number;
}

export interface CreateJobRequest {
  video_id: string;
  job_type: 'transcription' | 'segmentation' | 'clipping' | 'upload';
  priority?: number;
}

export interface UpdateJobProgressRequest {
  progress?: number;
  status?: 'pending' | 'running' | 'done' | 'failed';
  output?: Record<string, any>;
  error_log?: string;
}

class JobService {
  /**
   * Create a new job
   */
  async createJob(jobData: CreateJobRequest): Promise<Job> {
    const response = await apiClient.post<ApiResponse<{ job: Job }>>(
      '/jobs/create',
      jobData
    );

    return response.data.data.job;
  }

  /**
   * Get all jobs for the authenticated user
   */
  async getUserJobs(
    page = 1, 
    limit = 20, 
    status?: string, 
    job_type?: string
  ): Promise<JobsPaginatedResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (status) {
      params.append('status', status);
    }
    if (job_type) {
      params.append('job_type', job_type);
    }

    const response = await apiClient.get<ApiResponse<JobsPaginatedResponse>>(
      `/jobs/user?${params.toString()}`
    );

    return response.data.data;
  }

  /**
   * Get all jobs for a specific video
   */
  async getVideoJobs(videoId: string): Promise<VideoJobsResponse> {
    const response = await apiClient.get<ApiResponse<VideoJobsResponse>>(
      `/videos/${videoId}/jobs`
    );

    return response.data.data;
  }

  /**
   * Get job status and details
   */
  async getJobStatus(jobId: string): Promise<{ job: Job; video: any }> {
    const response = await apiClient.get<ApiResponse<{ job: Job; video: any }>>(
      `/jobs/${jobId}`
    );

    return response.data.data;
  }

  /**
   * Update job progress (for worker use)
   */
  async updateJobProgress(jobId: string, progressData: UpdateJobProgressRequest): Promise<Job> {
    const response = await apiClient.put<ApiResponse<{ job: Job }>>(
      `/jobs/${jobId}/progress`,
      progressData
    );

    return response.data.data.job;
  }

  /**
   * Poll job status until completion
   */
  async pollJobStatus(
    jobId: string,
    onUpdate: (job: Job) => void,
    interval = 2000,
    maxAttempts = 300 // 10 minutes at 2 second intervals
  ): Promise<Job> {
    let attempts = 0;

    return new Promise((resolve, reject) => {
      const poll = async () => {
        try {
          attempts++;
          
          const { job } = await this.getJobStatus(jobId);
          onUpdate(job);

          // Check if job is complete
          if (job.status === 'done' || job.status === 'failed') {
            resolve(job);
            return;
          }

          // Check if we've exceeded max attempts
          if (attempts >= maxAttempts) {
            reject(new Error('Job polling timeout'));
            return;
          }

          // Continue polling
          setTimeout(poll, interval);
        } catch (error) {
          reject(error);
        }
      };

      poll();
    });
  }

  /**
   * Get jobs by status
   */
  async getJobsByStatus(
    status: 'pending' | 'running' | 'done' | 'failed',
    page = 1,
    limit = 20
  ): Promise<JobsPaginatedResponse> {
    return this.getUserJobs(page, limit, status);
  }

  /**
   * Get jobs by type
   */
  async getJobsByType(
    job_type: 'transcription' | 'segmentation' | 'clipping' | 'upload',
    page = 1,
    limit = 20
  ): Promise<JobsPaginatedResponse> {
    return this.getUserJobs(page, limit, undefined, job_type);
  }

  /**
   * Get job statistics for user
   */
  async getJobStats(): Promise<{
    total_jobs: number;
    pending_jobs: number;
    running_jobs: number;
    completed_jobs: number;
    failed_jobs: number;
    by_type: Record<string, number>;
  }> {
    const jobsResponse = await this.getUserJobs(1, 1000); // Get all jobs for stats
    const jobs = jobsResponse.jobs;

    const byType = jobs.reduce((acc, job) => {
      acc[job.job_type] = (acc[job.job_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total_jobs: jobs.length,
      pending_jobs: jobs.filter(j => j.status === 'pending').length,
      running_jobs: jobs.filter(j => j.status === 'running').length,
      completed_jobs: jobs.filter(j => j.status === 'done').length,
      failed_jobs: jobs.filter(j => j.status === 'failed').length,
      by_type: byType
    };
  }

  /**
   * Cancel a pending job (if supported)
   */
  async cancelJob(jobId: string): Promise<void> {
    await this.updateJobProgress(jobId, { status: 'failed', error_log: 'Cancelled by user' });
  }

  /**
   * Retry a failed job
   */
  async retryJob(jobId: string): Promise<Job> {
    return this.updateJobProgress(jobId, { 
      status: 'pending', 
      progress: 0, 
      error_log: '' 
    });
  }
}

export const jobService = new JobService();
