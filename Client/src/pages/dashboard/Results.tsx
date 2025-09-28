import { useState, useEffect } from "react";
import { Download, Trash2, Play, Clock, Filter, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { videoService, clipService, Video, Clip } from "@/lib/api";

// Mock data for generated clips
const mockClips = [
  {
    id: "1",
    title: "Key Marketing Insights",
    duration: "0:45",
    thumbnail: "/placeholder-video.jpg",
    videoTitle: "Marketing Presentation 2024",
    createdAt: "2024-01-15",
    downloads: 12,
    size: "8.2 MB",
  },
  {
    id: "2",
    title: "Product Demo Highlight", 
    duration: "1:30",
    thumbnail: "/placeholder-video.jpg",
    videoTitle: "Product Demo - New Features",
    createdAt: "2024-01-15",
    downloads: 5,
    size: "15.7 MB",
  },
  {
    id: "3",
    title: "Customer Success Story",
    duration: "0:35",
    thumbnail: "/placeholder-video.jpg", 
    videoTitle: "Customer Testimonials",
    createdAt: "2024-01-13",
    downloads: 18,
    size: "6.1 MB",
  },
  {
    id: "4",
    title: "AI Business Benefits",
    duration: "1:15",
    thumbnail: "/placeholder-video.jpg",
    videoTitle: "Webinar: AI in Business", 
    createdAt: "2024-01-12",
    downloads: 25,
    size: "12.3 MB",
  },
  {
    id: "5",
    title: "ROI Statistics",
    duration: "0:50",
    thumbnail: "/placeholder-video.jpg",
    videoTitle: "Marketing Presentation 2024",
    createdAt: "2024-01-15",
    downloads: 8,
    size: "9.5 MB",
  },
  {
    id: "6", 
    title: "Feature Walkthrough",
    duration: "2:10",
    thumbnail: "/placeholder-video.jpg",
    videoTitle: "Product Demo - New Features",
    createdAt: "2024-01-14",
    downloads: 3,
    size: "18.9 MB",
  },
];

const Results = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [filterBy, setFilterBy] = useState("all");
  const [videos, setVideos] = useState<Video[]>([]);
  const [clips, setClips] = useState<Clip[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState<'videos' | 'clips'>('clips');
  
  const { toast } = useToast();

  // Fetch completed videos and clips from backend
  const fetchData = async (showLoader = false) => {
    if (showLoader) setIsRefreshing(true);
    
    try {
      // Fetch both videos and clips in parallel
      const [videosResponse, clipsResponse] = await Promise.all([
        videoService.getUserVideos(1, 50, 'completed'),
        clipService.getUserClips(1, 100, 'completed')
      ]);
      
      setVideos(videosResponse.videos);
      setClips(clipsResponse.clips);
    } catch (error: any) {
      console.error('Failed to fetch data:', error);
      toast({
        title: "Failed to load data",
        description: error.message || "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData(true);
  }, []);

  const handleDownload = async (videoId: string, title: string) => {
    try {
      const result = await videoService.getVideoResult(videoId);
      
      if (result.clipDetails?.outputPath) {
        // In a real app, you would create a download link or trigger download
        toast({
          title: "Download ready",
          description: `"${title}" is ready for download`,
        });
      } else {
        toast({
          title: "Download not available",
          description: "Video processing may still be in progress",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Download failed",
        description: error.message || "Failed to prepare download",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (videoId: string, title: string) => {
    try {
      await videoService.deleteVideo(videoId);
      
      // Remove from local state
      setVideos(prev => prev.filter(video => video.id !== videoId));
      
      toast({
        title: "Video deleted",
        description: `"${title}" has been removed`,
      });
    } catch (error: any) {
      toast({
        title: "Delete failed",
        description: error.message || "Failed to delete video",
        variant: "destructive",
      });
    }
  };

  const handleClipDownload = async (clipId: string, title: string) => {
    try {
      const clipUrl = await clipService.downloadClip(clipId);
      
      // Create download link
      const link = document.createElement('a');
      link.href = clipUrl;
      link.download = title;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Download started",
        description: `"${title}" is downloading`,
      });
    } catch (error: any) {
      toast({
        title: "Download failed",
        description: error.message || "Failed to download clip",
        variant: "destructive",
      });
    }
  };

  const handleClipDelete = async (clipId: string, title: string) => {
    try {
      await clipService.deleteClip(clipId);
      
      // Remove from local state
      setClips(prev => prev.filter(clip => clip.id !== clipId));
      
      toast({
        title: "Clip deleted",
        description: `"${title}" has been removed`,
      });
    } catch (error: any) {
      toast({
        title: "Delete failed",
        description: error.message || "Failed to delete clip",
        variant: "destructive",
      });
    }
  };

  const filteredVideos = videos.filter(video => {
    const matchesSearch = video.originalFilename.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const filteredClips = clips.filter(clip => {
    const matchesSearch = (clip.video?.filename || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                         clip.transcript.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const sortedVideos = [...filteredVideos].sort((a, b) => {
    switch (sortBy) {
      case "newest":
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case "oldest":
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case "duration":
        return (a.originalDuration || 0) - (b.originalDuration || 0);
      default:
        return 0;
    }
  });

  const sortedClips = [...filteredClips].sort((a, b) => {
    switch (sortBy) {
      case "newest":
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      case "oldest":
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      case "duration":
        return a.duration - b.duration;
      case "size":
        return a.file_size - b.file_size;
      default:
        return 0;
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {viewMode === 'clips' ? 'Generated Clips' : 'Processed Videos'}
          </h1>
          <p className="text-muted-foreground mt-2">
            {viewMode === 'clips' 
              ? 'Download and manage your generated video clips' 
              : 'Download and manage your completed videos'
            }
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setViewMode('clips')}
            variant={viewMode === 'clips' ? 'default' : 'outline'}
            size="sm"
          >
            Clips
          </Button>
          <Button
            onClick={() => setViewMode('videos')}
            variant={viewMode === 'videos' ? 'default' : 'outline'}
            size="sm"
          >
            Videos
          </Button>
          <Button
            onClick={() => fetchData(true)}
            disabled={isRefreshing}
            variant="outline"
            size="sm"
          >
            {isRefreshing ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4 mr-2" />
            )}
            Refresh
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search clips..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="transition-fast"
          />
        </div>
        
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest first</SelectItem>
            <SelectItem value="oldest">Oldest first</SelectItem>
            <SelectItem value="size">File size</SelectItem>
            <SelectItem value="duration">Duration</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterBy} onValueChange={setFilterBy}>
          <SelectTrigger className="w-full sm:w-48">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Filter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All clips</SelectItem>
            <SelectItem value="recent">Recent (7 days)</SelectItem>
            <SelectItem value="popular">Popular</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        {viewMode === 'clips' ? (
          <>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">{clips.length}</div>
                <p className="text-xs text-muted-foreground">Total clips</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">
                  {clips.filter(c => c.status === 'completed').length}
                </div>
                <p className="text-xs text-muted-foreground">Completed</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">
                  {(clips.reduce((sum, clip) => sum + clip.file_size, 0) / (1024 * 1024)).toFixed(1)} MB
                </div>
                <p className="text-xs text-muted-foreground">Total size</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">
                  {Math.round(clips.reduce((sum, clip) => sum + clip.duration, 0) / 60)}m
                </div>
                <p className="text-xs text-muted-foreground">Total duration</p>
              </CardContent>
            </Card>
          </>
        ) : (
          <>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">{videos.length}</div>
                <p className="text-xs text-muted-foreground">Total videos</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">
                  {videos.filter(v => v.status === 'completed').length}
                </div>
                <p className="text-xs text-muted-foreground">Completed</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">
                  {(videos.reduce((sum, video) => sum + (video.originalSize || 0), 0) / (1024 * 1024)).toFixed(1)} MB
                </div>
                <p className="text-xs text-muted-foreground">Total size</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">
                  {Math.round(videos.reduce((sum, video) => sum + (video.originalDuration || 0), 0) / 60)}m
                </div>
                <p className="text-xs text-muted-foreground">Total duration</p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Content Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      ) : viewMode === 'clips' ? (
        sortedClips.length === 0 ? (
          <div className="text-center py-12">
            <Play className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No clips found</h3>
            <p className="text-muted-foreground">
              {searchQuery ? "Try adjusting your search terms" : "Process a video to generate clips"}
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {sortedClips.map((clip) => (
              <Card key={clip.id} className="group hover:shadow-lg transition-smooth">
                <CardContent className="p-0">
                  {/* Clip Thumbnail */}
                  <div className="relative aspect-video bg-muted rounded-t-lg overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
                    <div className="absolute bottom-3 left-3 z-20">
                      <Badge variant="secondary" className="bg-black/60 text-white backdrop-blur-sm">
                        <Clock className="w-3 h-3 mr-1" />
                        {Math.round(clip.duration)}s
                      </Badge>
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center z-20">
                      <div className="w-12 h-12 bg-primary/90 rounded-full flex items-center justify-center backdrop-blur-sm group-hover:scale-110 transition-transform">
                        <Play className="w-5 h-5 text-white fill-white" />
                      </div>
                    </div>
                    <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                      <Play className="w-16 h-16 text-muted-foreground opacity-50" />
                    </div>
                  </div>

                  {/* Clip Content */}
                  <div className="p-4 space-y-3">
                    <div>
                      <h3 className="font-semibold line-clamp-2 mb-1">
                        Clip {clip.start_time}s - {clip.end_time}s
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        From: {clip.video?.filename || 'Unknown'}
                      </p>
                      {clip.transcript && (
                        <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                          "{clip.transcript}"
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>{clip.status}</span>
                      <span>{(clip.file_size / (1024 * 1024)).toFixed(1)} MB</span>
                    </div>

                    <div className="flex gap-2">
                      <Button 
                        variant="gradient" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => handleClipDownload(clip.id, `clip-${clip.start_time}-${clip.end_time}`)}
                      >
                        <Download className="w-4 h-4 mr-1" />
                        Download
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="text-muted-foreground hover:text-destructive"
                        onClick={() => handleClipDelete(clip.id, `clip-${clip.start_time}-${clip.end_time}`)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )
      ) : (
        sortedVideos.length === 0 ? (
          <div className="text-center py-12">
            <Play className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No completed videos found</h3>
            <p className="text-muted-foreground">
              {searchQuery ? "Try adjusting your search terms" : "Upload and process a video to see results here"}
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {sortedVideos.map((video) => (
            <Card key={video.id} className="group hover:shadow-lg transition-smooth">
              <CardContent className="p-0">
                {/* Thumbnail */}
                <div className="relative aspect-video bg-muted rounded-t-lg overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
                  <div className="absolute bottom-3 left-3 z-20">
                    <Badge variant="secondary" className="bg-black/60 text-white backdrop-blur-sm">
                      <Clock className="w-3 h-3 mr-1" />
                      {video.originalDuration ? `${Math.floor(video.originalDuration / 60)}:${(video.originalDuration % 60).toString().padStart(2, '0')}` : 'Unknown'}
                    </Badge>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center z-20">
                    <div className="w-12 h-12 bg-primary/90 rounded-full flex items-center justify-center backdrop-blur-sm group-hover:scale-110 transition-transform">
                      <Play className="w-5 h-5 text-white fill-white" />
                    </div>
                  </div>
                  <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                    <Play className="w-16 h-16 text-muted-foreground opacity-50" />
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 space-y-3">
                  <div>
                    <h3 className="font-semibold line-clamp-2 mb-1">{video.originalFilename}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      Created: {new Date(video.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>{video.status}</span>
                    <span>{((video.originalSize || 0) / (1024 * 1024)).toFixed(1)} MB</span>
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      variant="gradient" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => handleDownload(video.id, video.originalFilename)}
                    >
                      <Download className="w-4 h-4 mr-1" />
                      Download
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="text-muted-foreground hover:text-destructive"
                      onClick={() => handleDelete(video.id, video.originalFilename)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
              </Card>
            ))}
          </div>
        )
      )}
    </div>
  );
};

export default Results;