const { Queue } = require('bullmq');
const redis = require('./redis');

// Create video processing queue
const videoProcessingQueue = new Queue('video-processing', {
  connection: redis,
  defaultJobOptions: {
    removeOnComplete: 10,
    removeOnFail: 5,
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
  },
});

// Handle queue events
videoProcessingQueue.on('error', (error) => {
  console.error('❌ Queue error:', error);
});

videoProcessingQueue.on('waiting', (job) => {
  console.log(`⏳ Job ${job.id} is waiting`);
});

videoProcessingQueue.on('active', (job) => {
  console.log(`🔄 Job ${job.id} is now active`);
});

videoProcessingQueue.on('completed', (job) => {
  console.log(`✅ Job ${job.id} completed`);
});

videoProcessingQueue.on('failed', (job, err) => {
  console.error(`❌ Job ${job.id} failed:`, err.message);
});

module.exports = {
  videoProcessingQueue
};
