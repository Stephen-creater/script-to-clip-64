import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Play,
  Pause,
  Scissors,
  CornerDownLeft,
  CornerDownRight,
  X,
  Upload,
  Tag,
  Trash2,
  FileVideo,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface ClipItem {
  id: string;
  name: string;
  startTime: number;
  endTime: number;
  duration: number;
  tags: string[];
  thumbnail?: string;
}

interface PreprocessingWorkbenchProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClipsSubmit?: (clips: ClipItem[]) => void;
}

const PreprocessingWorkbench = ({
  open,
  onOpenChange,
  onClipsSubmit,
}: PreprocessingWorkbenchProps) => {
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string>("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [inPoint, setInPoint] = useState<number | null>(null);
  const [outPoint, setOutPoint] = useState<number | null>(null);
  const [clips, setClips] = useState<ClipItem[]>([]);
  const [waveformData, setWaveformData] = useState<number[]>([]);

  // Generate mock waveform data
  useEffect(() => {
    if (duration > 0) {
      const points = Math.floor(duration * 10);
      const data = Array.from({ length: points }, () => Math.random() * 0.8 + 0.2);
      setWaveformData(data);
    }
  }, [duration]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("video/")) {
      setVideoFile(file);
      const url = URL.createObjectURL(file);
      setVideoUrl(url);
      setInPoint(null);
      setOutPoint(null);
      setClips([]);
    }
  };

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleSetInPoint = () => {
    setInPoint(currentTime);
    toast({
      title: "入点已设置",
      description: `入点: ${formatTime(currentTime)}`,
    });
  };

  const handleSetOutPoint = () => {
    setOutPoint(currentTime);
    toast({
      title: "出点已设置",
      description: `出点: ${formatTime(currentTime)}`,
    });
  };

  const handleExtractClip = () => {
    if (inPoint === null || outPoint === null) {
      toast({
        title: "请先设置入点和出点",
        variant: "destructive",
      });
      return;
    }

    if (outPoint <= inPoint) {
      toast({
        title: "出点必须大于入点",
        variant: "destructive",
      });
      return;
    }

    const newClip: ClipItem = {
      id: `clip-${Date.now()}`,
      name: `片段 ${clips.length + 1}`,
      startTime: inPoint,
      endTime: outPoint,
      duration: outPoint - inPoint,
      tags: [],
    };

    setClips([...clips, newClip]);
    setInPoint(null);
    setOutPoint(null);

    toast({
      title: "片段已提取",
      description: `时长: ${formatTime(newClip.duration)}`,
    });
  };

  const handleRemoveClip = (clipId: string) => {
    setClips(clips.filter((c) => c.id !== clipId));
  };

  const handleClipNameChange = (clipId: string, name: string) => {
    setClips(clips.map((c) => (c.id === clipId ? { ...c, name } : c)));
  };

  const handleAddTag = (clipId: string, tag: string) => {
    if (!tag.trim()) return;
    setClips(
      clips.map((c) =>
        c.id === clipId && !c.tags.includes(tag)
          ? { ...c, tags: [...c.tags, tag] }
          : c
      )
    );
  };

  const handleRemoveTag = (clipId: string, tag: string) => {
    setClips(
      clips.map((c) =>
        c.id === clipId ? { ...c, tags: c.tags.filter((t) => t !== tag) } : c
      )
    );
  };

  const handleSyncToLibrary = () => {
    if (clips.length === 0) {
      toast({
        title: "暂存篮为空",
        description: "请先提取一些片段",
        variant: "destructive",
      });
      return;
    }

    onClipsSubmit?.(clips);
    toast({
      title: "同步成功",
      description: `${clips.length} 个片段已入库`,
    });
    setClips([]);
    onOpenChange(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (videoRef.current && duration > 0) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percentage = x / rect.width;
      const newTime = percentage * duration;
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleClose = () => {
    if (videoUrl) {
      URL.revokeObjectURL(videoUrl);
    }
    setVideoFile(null);
    setVideoUrl("");
    setClips([]);
    setInPoint(null);
    setOutPoint(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-[95vw] w-[95vw] h-[90vh] p-0 gap-0">
        <DialogHeader className="p-4 border-b border-border">
          <DialogTitle className="flex items-center gap-2">
            <Scissors size={20} />
            素材预处理工作台
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-1 overflow-hidden">
          {/* Left Panel - Editor (65%) */}
          <div className="w-[65%] flex flex-col border-r border-border">
            {/* Video Player Area */}
            <div className="flex-1 bg-black flex items-center justify-center relative">
              {!videoUrl ? (
                <div className="text-center">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="video/*"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                  <Button
                    size="lg"
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-gradient-primary"
                  >
                    <Upload size={20} className="mr-2" />
                    选择视频文件
                  </Button>
                  <p className="text-muted-foreground text-sm mt-4">
                    支持 MP4, MOV, AVI 等格式
                  </p>
                </div>
              ) : (
                <video
                  ref={videoRef}
                  src={videoUrl}
                  className="max-w-full max-h-full"
                  onTimeUpdate={handleTimeUpdate}
                  onLoadedMetadata={handleLoadedMetadata}
                  onEnded={() => setIsPlaying(false)}
                />
              )}
            </div>

            {/* Timeline with Waveform */}
            {videoUrl && (
              <div className="p-4 bg-card border-t border-border">
                {/* Waveform Visualization */}
                <div
                  className="h-16 bg-muted rounded-lg mb-3 relative cursor-pointer overflow-hidden"
                  onClick={handleProgressClick}
                >
                  {/* Waveform bars */}
                  <div className="absolute inset-0 flex items-center justify-around px-1">
                    {waveformData.map((height, index) => (
                      <div
                        key={index}
                        className={cn(
                          "w-1 rounded-full transition-colors",
                          index / waveformData.length <= currentTime / duration
                            ? "bg-primary"
                            : "bg-muted-foreground/30"
                        )}
                        style={{ height: `${height * 100}%` }}
                      />
                    ))}
                  </div>

                  {/* In/Out points markers */}
                  {inPoint !== null && (
                    <div
                      className="absolute top-0 bottom-0 w-0.5 bg-success z-10"
                      style={{ left: `${(inPoint / duration) * 100}%` }}
                    >
                      <div className="absolute -top-1 left-1/2 -translate-x-1/2 text-xs text-success font-medium">
                        I
                      </div>
                    </div>
                  )}
                  {outPoint !== null && (
                    <div
                      className="absolute top-0 bottom-0 w-0.5 bg-destructive z-10"
                      style={{ left: `${(outPoint / duration) * 100}%` }}
                    >
                      <div className="absolute -top-1 left-1/2 -translate-x-1/2 text-xs text-destructive font-medium">
                        O
                      </div>
                    </div>
                  )}

                  {/* Selection range */}
                  {inPoint !== null && outPoint !== null && (
                    <div
                      className="absolute top-0 bottom-0 bg-primary/20 z-5"
                      style={{
                        left: `${(inPoint / duration) * 100}%`,
                        width: `${((outPoint - inPoint) / duration) * 100}%`,
                      }}
                    />
                  )}

                  {/* Current time indicator */}
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-foreground z-20"
                    style={{ left: `${(currentTime / duration) * 100}%` }}
                  />
                </div>

                {/* Time display */}
                <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>

                {/* Controls */}
                <div className="flex items-center justify-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSetInPoint}
                    className="gap-1"
                  >
                    <CornerDownLeft size={16} />
                    入点 (I)
                  </Button>

                  <Button
                    size="icon"
                    onClick={handlePlayPause}
                    className="h-12 w-12 rounded-full"
                  >
                    {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSetOutPoint}
                    className="gap-1"
                  >
                    出点 (O)
                    <CornerDownRight size={16} />
                  </Button>

                  <div className="w-px h-8 bg-border mx-2" />

                  <Button
                    onClick={handleExtractClip}
                    disabled={inPoint === null || outPoint === null}
                    className="gap-1 bg-gradient-primary"
                  >
                    <Scissors size={16} />
                    提取片段
                  </Button>
                </div>

                {/* In/Out display */}
                {(inPoint !== null || outPoint !== null) && (
                  <div className="flex items-center justify-center gap-4 mt-3 text-sm">
                    {inPoint !== null && (
                      <span className="text-success">
                        入点: {formatTime(inPoint)}
                      </span>
                    )}
                    {outPoint !== null && (
                      <span className="text-destructive">
                        出点: {formatTime(outPoint)}
                      </span>
                    )}
                    {inPoint !== null && outPoint !== null && outPoint > inPoint && (
                      <span className="text-muted-foreground">
                        时长: {formatTime(outPoint - inPoint)}
                      </span>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Panel - Clip Basket (35%) */}
          <div className="w-[35%] flex flex-col bg-card">
            <div className="p-4 border-b border-border">
              <h3 className="font-semibold flex items-center gap-2">
                <FileVideo size={18} />
                暂存篮
                <Badge variant="secondary">{clips.length}</Badge>
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                提取的片段将显示在这里
              </p>
            </div>

            {/* Clips List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {clips.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Scissors size={48} className="mx-auto mb-4 opacity-30" />
                  <p>暂无片段</p>
                  <p className="text-sm mt-1">设置入点和出点后提取片段</p>
                </div>
              ) : (
                clips.map((clip, index) => (
                  <div
                    key={clip.id}
                    className="bg-muted/50 rounded-lg p-3 border border-border"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2 flex-1">
                        <Badge variant="outline" className="shrink-0">
                          {index + 1}
                        </Badge>
                        <Input
                          value={clip.name}
                          onChange={(e) =>
                            handleClipNameChange(clip.id, e.target.value)
                          }
                          className="h-8 text-sm"
                          placeholder="片段名称"
                        />
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => handleRemoveClip(clip.id)}
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>

                    <div className="text-xs text-muted-foreground mb-2">
                      {formatTime(clip.startTime)} - {formatTime(clip.endTime)} (
                      {formatTime(clip.duration)})
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1 mb-2">
                      {clip.tags.map((tag) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="text-xs cursor-pointer hover:bg-destructive/20"
                          onClick={() => handleRemoveTag(clip.id, tag)}
                        >
                          #{tag}
                          <X size={10} className="ml-1" />
                        </Badge>
                      ))}
                    </div>

                    {/* Add tag input */}
                    <div className="flex items-center gap-1">
                      <Tag size={14} className="text-muted-foreground" />
                      <Input
                        placeholder="添加标签..."
                        className="h-7 text-xs"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            handleAddTag(clip.id, e.currentTarget.value);
                            e.currentTarget.value = "";
                          }
                        }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Submit Button */}
            <div className="p-4 border-t border-border">
              <Button
                className="w-full bg-gradient-primary"
                size="lg"
                onClick={handleSyncToLibrary}
                disabled={clips.length === 0}
              >
                <Upload size={18} className="mr-2" />
                一键同步入库 ({clips.length})
              </Button>
            </div>
          </div>
        </div>

        <canvas ref={canvasRef} className="hidden" />
      </DialogContent>
    </Dialog>
  );
};

export default PreprocessingWorkbench;
