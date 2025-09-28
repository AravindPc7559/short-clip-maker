// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

// Authentication Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  username: string;
  email: string;
  password: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  settings: {
    defaultClipLength: number;
    storagePreference: string;
    notificationEnabled: boolean;
  };
}

export interface AuthResponse {
  user: User;
  token: string;
}

// Upload Types
export interface UploadVideoRequest {
  video: File;
}

export interface UploadYouTubeRequest {
  youtubeUrl: string;
}

export interface Job {
  id: string;
  userId: string;
  video: {
    url: string;
    fileName: string;
    size: number;
    type: string;
    duration: number;
    source: 'upload' | 'youtube';
  };
  status: 'pending' | 'processing' | 'completed' | 'failed';
  result: Array<{
    clipUrl: string;
    startTime: number;
    endTime: number;
    duration: number;
  }>;
  createdAt: string;
  updatedAt: string;
}

// Legacy VideoJob type for backward compatibility
export interface VideoJob {
  jobId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  videoUrl: string;
  fileName: string;
  fileSize: number;
  duration: number;
  youtubeUrl?: string;
  createdAt: string;
}

// Video Processing Types
export interface Video {
  id: string;
  originalFilename: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'rejected';
  processingProgress: number;
  originalPath: string;
  originalSize: number;
  originalDuration: number;
  clipDetails?: {
    startTime: number;
    duration: number;
    outputPath: string;
    outputSize: number;
    thumbnailPath: string;
  };
  metadata?: {
    resolution: string;
    fps: number;
    codec: string;
    bitrate: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface VideoListResponse {
  videos: Video[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalVideos: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// User Settings Types
export interface UserSettings {
  defaultClipLength: number;
  storagePreference: 'local' | 'cloud';
  notificationEnabled: boolean;
}

export interface UpdateSettingsRequest {
  defaultClipLength?: number;
  storagePreference?: 'local' | 'cloud';
  notificationEnabled?: boolean;
}
