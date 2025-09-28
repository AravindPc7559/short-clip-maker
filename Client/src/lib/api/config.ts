// API Configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.BACKEND_URL || 'http://localhost:3000/api',
  IS_DEV: import.meta.env.NODE_ENV === 'development',
  TIMEOUT: 10000,
  ENDPOINTS: {
    AUTH: {
      LOGIN: '/auth/login',
      SIGNUP: '/auth/signup',
      ME: '/auth/me',
    },
    UPLOAD: {
      VIDEO: '/upload/video',
      YOUTUBE: '/upload/youtube',
      STATUS: '/upload/status',
      JOBS: '/upload/jobs',
    },
    VIDEO: {
      PROCESS: '/video/process',
      LIST: '/video/list',
      STATUS: '/video/status',
      RESULT: '/video/result',
      DELETE: '/video',
    },
    USER: {
      SETTINGS: '/user/settings',
    },
  },
} as const;

// Environment configuration
export const ENV = {
  NODE_ENV: import.meta.env.NODE_ENV || 'development',
  API_URL: import.meta.env.BACKEND_URL || 'http://localhost:3000',
  IS_DEV: import.meta.env.NODE_ENV === 'development',
} as const;
