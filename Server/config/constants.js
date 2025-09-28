module.exports = {
  // JWT Configuration
  JWT_SECRET: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
  JWT_EXPIRE: process.env.JWT_EXPIRE || '7d',
  
  // Video Processing
  MAX_FILE_SIZE: 100 * 1024 * 1024, // 100MB
  ALLOWED_VIDEO_TYPES: ['video/mp4', 'video/avi', 'video/mov', 'video/mkv', 'video/webm'],
  DEFAULT_CLIP_LENGTH: 60, // seconds
  
  // Video Status
  VIDEO_STATUS: {
    PENDING: 'pending',
    PROCESSING: 'processing',
    COMPLETED: 'completed',
    FAILED: 'failed',
    REJECTED: 'rejected'
  },
  
  // API Response Messages
  MESSAGES: {
    SUCCESS: 'Success',
    ERROR: 'Error',
    UNAUTHORIZED: 'Unauthorized access',
    NOT_FOUND: 'Resource not found',
    VALIDATION_ERROR: 'Validation error'
  }
};
