const ytdl = require('@distube/ytdl-core');
const { Innertube } = require('youtubei.js');
const { uploadToS3 } = require('../config/s3');
const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');

// Validate YouTube URL
const validateYouTubeUrl = (url) => {
  return ytdl.validateURL(url);
};

const cleanupPlayerScripts = () => {
  try {
    const fs = require('fs');
    const path = require('path');
    const serverDir = path.join(__dirname, '..');
    
    const files = fs.readdirSync(serverDir);
    const playerScripts = files.filter(file => file.includes('-player-script.js'));
    
    playerScripts.forEach(file => {
      try {
        fs.unlinkSync(path.join(serverDir, file));
      } catch (err) {
        // Ignore errors if file is already deleted
      }
    });
  } catch (error) {
    // Ignore cleanup errors
  }
};

const getVideoMetadata = async (url, retries = 3) => {
  let lastError;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      if (attempt > 1) console.log(`Retrying metadata extraction (${attempt}/${retries})`);
      
      const originalWarn = console.warn;
      console.warn = () => {};

      try {
        const info = await ytdl.getInfo(url, {
          requestOptions: {
            headers: {
              "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
            },
          },
        });

        console.warn = originalWarn;
        cleanupPlayerScripts();

        const videoDetails = info.videoDetails;

        return {
          title: videoDetails.title || "Unknown Title",
          duration: parseInt(videoDetails.lengthSeconds) || 0,
          uploader: videoDetails.author?.name || "Unknown Author",
          thumbnail: videoDetails.thumbnails?.[videoDetails.thumbnails.length - 1]?.url || "",
          description: videoDetails.description || "",
          viewCount: videoDetails.viewCount || "0",
        };
      } catch (ytdlError) {
        console.warn = originalWarn;
        cleanupPlayerScripts();
        throw ytdlError;
      }
    } catch (error) {
      lastError = error;

      if (attempt < retries) {
        await new Promise((res) => setTimeout(res, 2000 * attempt));
      }
    }
  }

  try {
    const videoId = url.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/)?.[1] || null;

    if (!videoId) throw new Error("Invalid YouTube URL");

    const oEmbedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;

    const res = await fetch(oEmbedUrl);
    const data = await res.json();

    return {
      title: data.title || `YouTube Video ${videoId}`,
      duration: 0,
      uploader: data.author_name || "Unknown Author",
      thumbnail: data.thumbnail_url || "",
      description: "",
      viewCount: "0",
    };
  } catch (fallbackError) {
    throw lastError || fallbackError;
  }
};

const downloadAndUploadToS3 = async (url, userId) => {
  try {
    if (!validateYouTubeUrl(url)) {
      throw new Error('Invalid YouTube URL');
    }

    const metadata = await getVideoMetadata(url);
    
    // Mock download result for testing (actual download will be handled by Python worker)
    const mockDownloadResult = {
      url: `https://mock-s3-bucket.s3.amazonaws.com/youtube-${userId}-${Date.now()}.mp4`,
      key: `youtube-${userId}-${Date.now()}.mp4`,
      bucket: 'mock-s3-bucket',
      region: 'us-east-1',
      fileName: `youtube_${userId}_${Date.now()}_${metadata.title.replace(/[^a-zA-Z0-9]/g, '_')}.mp4`,
      fileSize: 1000000,
      originalFilename: metadata.title || 'Unknown Title',
      metadata: {
        duration: metadata.duration || 0,
        title: metadata.title || 'Unknown Title',
        uploader: metadata.uploader || 'Unknown Author'
      }
    };
    
    return mockDownloadResult;
  } catch (error) {
    throw new Error(`Failed to download YouTube video: ${error.message}`);
  }
};

// Clean up on module load
cleanupPlayerScripts();

module.exports = {
  validateYouTubeUrl,
  getVideoMetadata,
  downloadAndUploadToS3,
  cleanupPlayerScripts
};
