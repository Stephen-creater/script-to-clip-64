import { useState, useRef, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import SegmentTable from "@/components/Editor/SegmentTable";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, SkipBack, SkipForward } from "lucide-react";

interface Segment {
  id: string;
  name: string;
  type: string;
  video: string;
  script: string;
  animatedText: string;
  sticker: string;
  digitalHuman: string;
  audio: string;
}

const Editor = () => {
  const { previewOpen, onConfigurationChange } = useOutletContext<{ 
    previewOpen: boolean;
    onConfigurationChange?: (config: {
      isAudioGenerated: boolean;
      isGlobalSubtitleConfigured: boolean;
      isBgmConfigured: boolean;
    }) => void;
  }>();
  const [isPlaying, setIsPlaying] = useState(false);
  const [segments, setSegments] = useState<Segment[]>([]);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(45.6); // Total video duration in seconds
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const handleSegmentsChange = (newSegments: Segment[]) => {
    setSegments(newSegments);
  };

  const handleConfigurationChange = (config: {
    isAudioGenerated: boolean;
    isGlobalSubtitleConfigured: boolean;
    isBgmConfigured: boolean;
  }) => {
    if (onConfigurationChange) {
      onConfigurationChange(config);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleTimeChange = (value: number[]) => {
    setCurrentTime(value[0]);
  };

  const skipBackward = () => {
    setCurrentTime(Math.max(0, currentTime - 10));
  };

  const skipForward = () => {
    setCurrentTime(Math.min(totalDuration, currentTime + 10));
  };

  // Update current time when playing
  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= totalDuration) {
            setIsPlaying(false);
            return totalDuration;
          }
          return prev + 0.1;
        });
      }, 100);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, totalDuration]);

  const getCurrentSegment = () => {
    if (segments.length === 0) return null;
    
    // Calculate which segment should be active based on current time
    const segmentDuration = totalDuration / segments.length;
    const segmentIndex = Math.floor(currentTime / segmentDuration);
    return segments[Math.min(segmentIndex, segments.length - 1)];
  };

  const renderPreviewOverlays = () => {
    const currentSegment = getCurrentSegment();
    if (!currentSegment) return null;

    return (
      <div className="absolute inset-0 pointer-events-none z-10">
        {/* Subtitle */}
        {currentSegment.script && (
          <div 
            className="absolute left-1/2 transform -translate-x-1/2 bg-black/80 text-white px-4 py-2 rounded text-xs text-center leading-relaxed"
            style={{ 
              bottom: '15%',
              minWidth: '200px',
              maxWidth: '85%',
              whiteSpace: 'normal',
              wordBreak: 'break-word',
              textWrap: 'pretty' as any
            }}
          >
            {currentSegment.script}
          </div>
        )}
        
        {/* Animated Text */}
        {currentSegment.animatedText && currentSegment.animatedText !== "未设置" && (
          <div 
            className="absolute left-1/2 top-1/4 transform -translate-x-1/2 -translate-y-1/2 text-yellow-400 font-bold text-xl font-caveat"
          >
            {currentSegment.animatedText}
          </div>
        )}
        
        {/* Sticker */}
        {currentSegment.sticker && currentSegment.sticker !== "未设置" && (
          <div 
            className="absolute right-4 top-4 bg-blue-500/20 border border-blue-500 text-blue-400 px-2 py-1 rounded text-xs"
          >
            贴纸: {currentSegment.sticker}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex min-h-full">
      {/* Segment Table */}
      <div className={previewOpen ? "flex-1 min-h-0" : "w-full"}>
        <SegmentTable 
          onSegmentsChange={handleSegmentsChange}
          onConfigurationChange={handleConfigurationChange}
        />
      </div>

      {/* Video Preview - Only show when previewOpen is true */}
      {previewOpen && (
        <div className="w-1/3 bg-preview-bg border-l border-border p-6 flex-shrink-0 overflow-auto">
          <div className="relative rounded-lg flex items-center justify-center overflow-hidden mx-auto" style={{ 
            aspectRatio: '9/16', 
            maxHeight: '70vh', 
            width: 'auto',
            backgroundImage: 'linear-gradient(hsl(var(--border)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--border)) 1px, transparent 1px)',
            backgroundSize: '20px 20px',
            backgroundColor: 'hsl(var(--muted) / 0.3)'
          }}>
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-white/40 text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-white/10 rounded-full flex items-center justify-center">
                  {isPlaying ? (
                    <Pause size={24} className="text-white/60" />
                  ) : (
                    <Play size={24} className="text-white/60 ml-1" />
                  )}
                </div>
                <p className="text-sm">视频预览区域</p>
                <p className="text-xs mt-2 text-white/40">{formatTime(currentTime)} / {formatTime(totalDuration)}</p>
              </div>
            </div>
            {renderPreviewOverlays()}
          </div>
          
          {/* Video Controls */}
          <div className="mt-6 space-y-4">
            {/* Timeline Slider */}
            <div className="space-y-2">
              <Slider
                value={[currentTime]}
                onValueChange={handleTimeChange}
                max={totalDuration}
                step={0.1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(totalDuration)}</span>
              </div>
            </div>
            
            {/* Play Controls */}
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={skipBackward}
              >
                <SkipBack size={16} />
              </Button>
              <Button
                variant={isPlaying ? "default" : "outline"}
                size="sm"
                onClick={togglePlayPause}
                className="px-6"
              >
                {isPlaying ? <Pause size={16} /> : <Play size={16} />}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={skipForward}
              >
                <SkipForward size={16} />
              </Button>
            </div>
          </div>
          
          <div className="bg-card p-4 rounded-lg border border-border mt-6">
            <h3 className="text-sm font-medium mb-3">项目信息</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex justify-between">
                <span>总时长:</span>
                <span>{formatTime(totalDuration)}</span>
              </div>
              <div className="flex justify-between">
                <span>分段数:</span>
                <span>{segments.length}个</span>
              </div>
              <div className="flex justify-between">
                <span>当前播放:</span>
                <span>{getCurrentSegment()?.name || '-'}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Editor;