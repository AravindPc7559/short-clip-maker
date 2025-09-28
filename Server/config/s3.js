const { S3Client, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { Upload } = require('@aws-sdk/lib-storage');
const multer = require('multer');
const path = require('path');

// Configure AWS SDK v3
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  }
});

// Check if required environment variables are set
if (!process.env.AWS_S3_BUCKET) {
  console.error('❌ AWS_S3_BUCKET environment variable is required');
  process.exit(1);
}

// Custom multer storage for AWS SDK v3
const s3Storage = {
  _handleFile: async function (req, file, cb) {
    try {
      const userId = req.user.id;
      const timestamp = Date.now();
      const fileName = `${userId}/videos/${timestamp}-${file.originalname}`;
      
      const upload = new Upload({
        client: s3Client,
        params: {
          Bucket: process.env.AWS_S3_BUCKET,
          Key: fileName,
          Body: file.stream,
          ContentType: file.mimetype,
          ACL: 'public-read',
          Metadata: {
            userId: userId,
            originalName: file.originalname,
            uploadedAt: new Date().toISOString()
          }
        }
      });

      const result = await upload.done();
      
      cb(null, {
        location: result.Location,
        key: result.Key,
        bucket: process.env.AWS_S3_BUCKET,
        etag: result.ETag,
        contentType: file.mimetype,
        size: file.size
      });
    } catch (error) {
      cb(error);
    }
  },
  
  _removeFile: function (req, file, cb) {
    // File removal is handled by deleteFromS3 function
    cb(null);
  }
};

// Multer configuration for S3 uploads
const upload = multer({
  storage: s3Storage,
  limits: {
    fileSize: 500 * 1024 * 1024, // 500MB limit
  },
  fileFilter: (req, file, cb) => {
    // Check if file is a video
    if (file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only video files are allowed!'), false);
    }
  }
});

// Upload file to S3
const uploadToS3 = async (file, userId, folder = 'videos') => {
  try {
    if (!process.env.AWS_S3_BUCKET) {
      throw new Error('AWS_S3_BUCKET environment variable is not set');
    }

    const timestamp = Date.now();
    const fileName = `${userId}/${folder}/${timestamp}-${file.originalname}`;
    
    const upload = new Upload({
      client: s3Client,
      params: {
        Bucket: process.env.AWS_S3_BUCKET,
        Key: fileName,
        Body: file.buffer,
        ContentType: file.mimetype,
        ACL: 'public-read',
        Metadata: {
          userId: userId,
          originalName: file.originalname,
          uploadedAt: new Date().toISOString()
        }
      }
    });

    const result = await upload.done();
    
    return {
      url: result.Location,
      key: result.Key,
      bucket: process.env.AWS_S3_BUCKET,
      region: process.env.AWS_REGION || 'us-east-1'
    };
    
  } catch (error) {
    console.error('S3 upload error:', error);
    throw new Error('Failed to upload file to S3');
  }
};

// Delete file from S3
const deleteFromS3 = async (key) => {
  try {
    const command = new DeleteObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key
    });

    await s3Client.send(command);
    return true;
  } catch (error) {
    console.error('S3 delete error:', error);
    throw new Error('Failed to delete file from S3');
  }
};

// Generate signed URL for private access
const getSignedUrl = async (key, expiresIn = 3600) => {
  try {
    const { getSignedUrl: awsGetSignedUrl } = require('@aws-sdk/s3-request-presigner');
    const { GetObjectCommand } = require('@aws-sdk/client-s3');
    
    const command = new GetObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key
    });

    return await awsGetSignedUrl(s3Client, command, { expiresIn });
  } catch (error) {
    console.error('S3 signed URL error:', error);
    throw new Error('Failed to generate signed URL');
  }
};

module.exports = {
  s3Client,
  upload,
  uploadToS3,
  deleteFromS3,
  getSignedUrl
};
