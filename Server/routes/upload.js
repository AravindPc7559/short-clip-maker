const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/uploadController');
const { upload } = require('../config/s3');
const auth = require('../middlewares/auth');

// @route   POST /upload/video
// @desc    Upload video file
// @access  Private
router.post('/video', auth, upload.single('video'), uploadController.uploadVideo);

// @route   POST /upload/youtube
// @desc    Upload YouTube video
// @access  Private
router.post('/youtube', auth, uploadController.uploadYouTubeVideo);

// @route   GET /upload/status/:jobId
// @desc    Get job status
// @access  Private
router.get('/status/:jobId', auth, uploadController.getJobStatus);

// @route   GET /upload/jobs
// @desc    Get user's jobs
// @access  Private
router.get('/jobs', auth, uploadController.getUserJobs);

module.exports = router;
