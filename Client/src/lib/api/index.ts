// Centralized API exports
export { api } from './client';
export { API_CONFIG, ENV } from './config';
export * from './types';

// Service exports
export { authService } from './services/authService';
export { uploadService } from './services/uploadService';
export { videoService } from './services/videoService';
export { clipService } from './services/clipService';
export { jobService } from './services/jobService';

// Re-export commonly used types
export type {
  ApiResponse,
  LoginRequest,
  SignupRequest,
  AuthResponse,
  User,
  VideoJob,
  Video,
  VideoListResponse,
  UserSettings,
  UpdateSettingsRequest,
} from './types';

// Export clip and job types
export type { Clip } from './services/clipService';
export type { Job } from './services/jobService';
