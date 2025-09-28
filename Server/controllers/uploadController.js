const Job = require('../models/Job');
const { uploadToS3 } = require('../config/s3');
const { videoProcessingQueue } = require('../config/queue');
const { downloadAndUploadToS3, validateYouTubeUrl, getVideoMetadata } = require('../services/youtubeService');
const { MESSAGES } = require('../config/constants');

// @desc    Upload video file
// @route   POST /upload/video
// @access  Private
const uploadVideo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No video file provided',
        error: 'Please select a video file to upload'
      });
    }

    const userId = req.user.id;
    const file = req.file;

    // Upload to S3
    const s3Result = await uploadToS3(file, userId, 'videos');

    // Create job document
    const job = await Job.create({
      userId,
      video: {
        url: s3Result.url,
        fileName: s3Result.key.split('/').pop(), // Extract filename from key
        size: file.size,
        type: file.mimetype,
        duration: 0, // Will be updated during processing
        source: 'upload'
      },
      status: 'pending'
    });

    // Add job to queue for processing
    await videoProcessingQueue.add('process-video', {
      jobId: job._id,
      userId,
      videoUrl: s3Result.url,
      videoKey: s3Result.key,
      source: 'upload'
    }, {
      priority: 1,
      delay: 1000 // Process after 1 second
    });

    res.status(201).json({
      success: true,
      message: 'Video uploaded successfully',
      data: {
        jobId: job._id,
        status: job.status,
        videoUrl: job.video.url,
        fileName: job.video.fileName,
        fileSize: job.video.size,
        createdAt: job.createdAt
      }
    });
  } catch (error) {
    console.error('Upload video error:', error);
    res.status(500).json({
      success: false,
      message: MESSAGES.ERROR,
      error: error.message
    });
  }
};

// @desc    Upload YouTube video
// @route   POST /upload/youtube
// @access  Private
const uploadYouTubeVideo = async (req, res) => {
  try {
    const { youtubeUrl } = req.body;
    const userId = req.user.id;

    if (!youtubeUrl) {
      return res.status(400).json({
        success: false,
        message: 'YouTube URL is required',
        error: 'Please provide a valid YouTube URL'
      });
    }

    if (!validateYouTubeUrl(youtubeUrl)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid YouTube URL',
        error: 'Please provide a valid YouTube URL'
      });
    }

    const downloadResult = await downloadAndUploadToS3(youtubeUrl, userId);

    const job = await Job.create({
      userId,
      video: {
        url: downloadResult.url,
        fileName: downloadResult.fileName,
        size: downloadResult.fileSize,
        type: 'video/mp4',
        duration: downloadResult.metadata.duration,
        source: 'youtube'
      },
      status: 'pending'
    });

    await videoProcessingQueue.add('process-video', {
      jobId: job._id,
      userId,
      videoUrl: downloadResult.url,
      videoKey: downloadResult.key,
      source: 'youtube'
    }, {
      priority: 1,
      delay: 1000
    });

    res.status(201).json({
      success: true,
      message: 'YouTube video downloaded and uploaded successfully',
      data: {
        jobId: job._id,
        status: job.status,
        videoUrl: job.video.url,
        fileName: job.video.fileName,
        fileSize: job.video.size,
        duration: job.video.duration,
        youtubeUrl: youtubeUrl,
        createdAt: job.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: MESSAGES.ERROR,
      error: error.message
    });
  }
};

// @desc    Get job status
// @route   GET /upload/status/:jobId
// @access  Private
const getJobStatus = async (req, res) => {
  try {
    const { jobId } = req.params;
    const userId = req.user.id;

    const job = await Job.findOne({
      _id: jobId,
      userId
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found',
        error: 'Job not found or access denied'
      });
    }

    res.json({
      success: true,
      message: 'Job status retrieved successfully',
      data: {
        job: {
          id: job._id,
          status: job.status,
          video: job.video,
          result: job.result,
          createdAt: job.createdAt,
          updatedAt: job.updatedAt
        }
      }
    });
  } catch (error) {
    console.error('Get job status error:', error);
    res.status(500).json({
      success: false,
      message: MESSAGES.ERROR,
      error: error.message
    });
  }
};

// @desc    Get user's jobs
// @route   GET /upload/jobs
// @access  Private
const getUserJobs = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10, status } = req.query;

    // Build query
    let query = { userId };
    if (status) {
      query.status = status;
    }

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Get jobs with pagination
    const jobs = await Job.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await Job.countDocuments(query);

    res.json({
      success: true,
      message: 'User jobs retrieved successfully',
      data: {
        jobs: jobs.map(job => ({
          id: job._id,
          status: job.status,
          video: job.video,
          result: job.result,
          createdAt: job.createdAt,
          updatedAt: job.updatedAt
        })),
        pagination: {
          currentPage: pageNum,
          totalPages: Math.ceil(total / limitNum),
          totalItems: total,
          itemsPerPage: limitNum
        }
      }
    });
  } catch (error) {
    console.error('Get user jobs error:', error);
    res.status(500).json({
      success: false,
      message: MESSAGES.ERROR,
      error: error.message
    });
  }
};

module.exports = {
  uploadVideo,
  uploadYouTubeVideo,
  getJobStatus,
  getUserJobs
};
