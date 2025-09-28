import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Upload as UploadIcon, Youtube, File, X, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { uploadService, VideoJob } from "@/lib/api";

const Upload = () => {
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isYoutubeUploading, setIsYoutubeUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [currentJob, setCurrentJob] = useState<VideoJob | null>(null);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'processing' | 'completed' | 'failed'>('idle');
  
  const { toast } = useToast();
  const navigate = useNavigate();

  // Prevent default drag and drop behavior on the entire page
  useEffect(() => {
    const preventDefaults = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
    };

    const events = ['dragenter', 'dragover', 'dragleave', 'drop'];
    events.forEach(eventName => {
      document.body.addEventListener(eventName, preventDefaults, false);
    });

    return () => {
      events.forEach(eventName => {
        document.body.removeEventListener(eventName, preventDefaults, false);
      });
    };
  }, []);

  const handleFileDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const files = Array.from(e.dataTransfer.files);
    const videoFile = files.find(file => file.type.startsWith('video/'));
    
    if (videoFile) {
      setUploadedFile(videoFile);
      toast({
        title: "File ready",
        description: `${videoFile.name} is ready to upload`,
      });
    } else {
      toast({
        title: "Invalid file",
        description: "Please upload a video file",
        variant: "destructive",
      });
    }
  }, [toast]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!uploadedFile) return;
    
    setIsUploading(true);
    setUploadStatus('uploading');
    setUploadProgress(0);

    try {
      // Upload video to backend
      const job = await uploadService.uploadVideo(uploadedFile);
      
      setCurrentJob(job);
      setUploadStatus('processing');
      setUploadProgress(100);

      toast({
        title: "Upload successful!",
        description: "Your video is being processed",
      });

      // Start polling for upload status
      uploadService.pollUploadStatus(job.jobId, (updatedJob) => {
        setCurrentJob(updatedJob);
        // Set progress based on status
        if (updatedJob.status === 'pending') setUploadProgress(25);
        else if (updatedJob.status === 'processing') setUploadProgress(75);
        else if (updatedJob.status === 'completed') setUploadProgress(100);
        else if (updatedJob.status === 'failed') setUploadProgress(0);
        
        if (updatedJob.status === 'completed') {
          setUploadStatus('completed');
          toast({
            title: "Processing complete!",
            description: "Your video is ready for clip generation",
            action: (
              <Button
                variant="outline"
                onClick={() => navigate("/dashboard/status")}
              >
                View Status
              </Button>
            )
          });
        } else if (updatedJob.status === 'failed') {
          setUploadStatus('failed');
          toast({
            title: "Processing failed",
            description: updatedJob.error?.message || "Something went wrong",
            variant: "destructive",
          });
        }
      });

    } catch (error: any) {
      setUploadStatus('failed');
      setIsUploading(false);
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload video",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleYoutubeSubmit = async () => {
    if (!youtubeUrl) return;
    
    // Basic YouTube URL validation
    const youtubeRegex = /^https?:\/\/(www\.)?(youtube\.com|youtu\.be)\/.+/;
    if (!youtubeRegex.test(youtubeUrl)) {
      toast({
        title: "Invalid YouTube URL",
        description: "Please enter a valid YouTube URL",
        variant: "destructive",
      });
      return;
    }

    setIsYoutubeUploading(true);
    setUploadStatus('uploading');

    try {
      // Upload YouTube video to backend
      const job = await uploadService.uploadYouTubeVideo(youtubeUrl);
      
      setCurrentJob(job);
      setUploadStatus('processing');

      toast({
        title: "YouTube video queued!",
        description: "Your YouTube video is being downloaded and processed",
      });

      // Start polling for upload status
      uploadService.pollUploadStatus(job.jobId, (updatedJob) => {
        setCurrentJob(updatedJob);
        // Set progress based on status
        if (updatedJob.status === 'pending') setUploadProgress(25);
        else if (updatedJob.status === 'processing') setUploadProgress(75);
        else if (updatedJob.status === 'completed') setUploadProgress(100);
        else if (updatedJob.status === 'failed') setUploadProgress(0);
        
        if (updatedJob.status === 'completed') {
          setUploadStatus('completed');
          toast({
            title: "YouTube video ready!",
            description: "Your video is ready for clip generation",
            action: (
              <Button
                variant="outline"
                onClick={() => navigate("/dashboard/status")}
              >
                View Status
              </Button>
            )
          });
        } else if (updatedJob.status === 'failed') {
          setUploadStatus('failed');
          toast({
            title: "YouTube processing failed",
            description: updatedJob.error?.message || "Failed to process YouTube video",
            variant: "destructive",
          });
        }
      });

      setYoutubeUrl("");
    } catch (error: any) {
      setUploadStatus('failed');
      toast({
        title: "YouTube upload failed",
        description: error.message || "Failed to process YouTube video",
        variant: "destructive",
      });
    } finally {
      setIsYoutubeUploading(false);
    }
  };

  const removeFile = () => {
    setUploadedFile(null);
    setUploadProgress(0);
    setCurrentJob(null);
    setUploadStatus('idle');
  };

  const getStatusBadge = () => {
    switch (uploadStatus) {
      case 'uploading':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
          <Loader2 className="w-3 h-3 mr-1 animate-spin" />
          Uploading
        </Badge>;
      case 'processing':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
          <Loader2 className="w-3 h-3 mr-1 animate-spin" />
          Processing
        </Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          <CheckCircle className="w-3 h-3 mr-1" />
          Completed
        </Badge>;
      case 'failed':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
          <AlertCircle className="w-3 h-3 mr-1" />
          Failed
        </Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Upload Video</h1>
        <p className="text-muted-foreground mt-2">
          Upload your video file or paste a YouTube link to get started
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* File Upload */}
        <Card className="transition-smooth hover:shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UploadIcon className="w-5 h-5" />
              File Upload
            </CardTitle>
            <CardDescription>
              Drag and drop your video file or click to browse
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div
              onDrop={handleFileDrop}
              onDragOver={handleDragOver}
              className="relative border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:border-primary/50 transition-fast cursor-pointer overflow-hidden"
            >
              {uploadedFile ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-center gap-2">
                    <File className="w-8 h-8 text-primary" />
                    <div className="text-left flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{uploadedFile.name}</p>
                        {getStatusBadge()}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {(uploadedFile.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                      {currentJob && (
                        <p className="text-xs text-muted-foreground">
                          Job ID: {currentJob.jobId.slice(0, 8)}...
                        </p>
                      )}
                    </div>
                    {uploadStatus === 'idle' && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={removeFile}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  
                  {uploadProgress > 0 && (
                    <div className="space-y-2">
                      <Progress value={uploadProgress} className="w-full" />
                      <p className="text-sm text-muted-foreground">
                        {uploadProgress}% uploaded
                      </p>
                    </div>
                  )}
                  
                  <Button 
                    onClick={handleUpload} 
                    disabled={isUploading || uploadStatus !== 'idle'}
                    variant="gradient"
                    className="w-full"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Uploading...
                      </>
                    ) : uploadStatus === 'completed' ? (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Upload Complete
                      </>
                    ) : uploadStatus === 'failed' ? (
                      "Upload Failed - Try Again"
                    ) : (
                      "Start Upload"
                    )}
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <UploadIcon className="w-12 h-12 mx-auto text-muted-foreground" />
                  <div>
                    <p className="text-lg font-medium">Drop your video here</p>
                    <p className="text-muted-foreground">or click to browse files</p>
                  </div>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleFileSelect}
                    onClick={(e) => e.stopPropagation()}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* YouTube URL */}
        <Card 
          className="transition-smooth hover:shadow-lg"
          onClick={(e) => e.stopPropagation()}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Youtube className="w-5 h-5 text-red-500" />
              YouTube Link
            </CardTitle>
            <CardDescription>
              Paste a YouTube URL to process the video directly
            </CardDescription>
          </CardHeader>
          <CardContent 
            className="space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-2">
              <Label htmlFor="youtube-url">YouTube URL</Label>
              <Input
                id="youtube-url"
                type="url"
                placeholder="https://www.youtube.com/watch?v=..."
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                onFocus={(e) => e.stopPropagation()}
                className="transition-fast"
              />
            </div>
            
            <Button 
              onClick={handleYoutubeSubmit}
              disabled={!youtubeUrl || isYoutubeUploading}
              variant="outline"
              className="w-full"
            >
              {isYoutubeUploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing YouTube Video...
                </>
              ) : (
                "Process YouTube Video"
              )}
            </Button>

            <div className="text-center text-sm text-muted-foreground">
              <p>Supported formats: MP4, MOV, AVI, MKV</p>
              <p>Max file size: 500MB</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Upload;