import { useState, useRef, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import SegmentTable from "@/components/Editor/SegmentTable";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, SkipBack, SkipForward } from "lucide-react";

interface DigitalHuman {
  id: string;
  name: string;
  position: { x: number; y: number };
  scale: number;
}

interface Segment {
  id: string;
  name: string;
  type: string;
  video: string;
  script: string;
  animatedText: string;
  sticker: string;
  enableDigitalHumans?: boolean; // 是否显示数字人
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
  const [globalDigitalHumans, setGlobalDigitalHumans] = useState<DigitalHuman[]>([]); // 全局数字人配置
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(45.6); // Total video duration in seconds
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const handleSegmentsChange = (newSegments: Segment[]) => {
    setSegments(newSegments);
  };

  const handleGlobalDigitalHumansChange = (digitalHumans: DigitalHuman[]) => {
    setGlobalDigitalHumans(digitalHumans);
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
        {/* Subtitle - positioned in safe zone above TikTok bottom area */}
        {currentSegment.script && (
          <div 
            className="absolute left-2 right-14 transform bg-black/80 text-white px-3 py-1.5 rounded text-[10px] text-center leading-relaxed border-2 border-cyan-400/50"
            style={{ 
              bottom: '32%', // Above TikTok caption zone (safe area)
              whiteSpace: 'normal',
              wordBreak: 'break-word',
            }}
          >
            <span className="absolute -top-4 left-1 text-[8px] text-cyan-400 bg-black/70 px-1 rounded">字幕</span>
            {currentSegment.script}
          </div>
        )}
        
        {/* Animated Text (花字) - positioned in center safe area */}
        {currentSegment.animatedText && currentSegment.animatedText !== "未设置" && (
          <div 
            className="absolute left-2 right-14 top-1/3 text-yellow-400 font-bold text-sm font-caveat text-center border-2 border-yellow-400/50 rounded px-2 py-1 bg-black/30"
          >
            <span className="absolute -top-4 left-1 text-[8px] text-yellow-400 bg-black/70 px-1 rounded">花字</span>
            {currentSegment.animatedText}
          </div>
        )}
        
        {/* Sticker - positioned in safe zone avoiding right TikTok buttons */}
        {currentSegment.sticker && currentSegment.sticker !== "未设置" && (
          <div 
            className="absolute left-2 top-20 bg-blue-500/30 border-2 border-blue-400/50 text-blue-300 px-2 py-1 rounded text-[10px]"
          >
            <span className="absolute -top-4 left-1 text-[8px] text-blue-400 bg-black/70 px-1 rounded">贴纸</span>
            {currentSegment.sticker}
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
          globalDigitalHumans={globalDigitalHumans}
          onGlobalDigitalHumansChange={handleGlobalDigitalHumansChange}
        />
      </div>

      {/* Video Preview - Only show when previewOpen is true */}
      {previewOpen && (
        <div className="w-1/3 bg-preview-bg border-l border-border p-6 flex-shrink-0 overflow-auto">
          {/* Phone Frame Container */}
          <div className="relative mx-auto" style={{ maxWidth: '280px' }}>
            {/* Phone Frame */}
            <div className="relative bg-black rounded-[2.5rem] p-2 shadow-2xl">
              {/* Phone Notch */}
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-24 h-6 bg-black rounded-b-2xl z-20" />
              
              {/* Screen Content */}
              <div className="relative rounded-[2rem] overflow-hidden" style={{ aspectRatio: '9/16' }}>
                {/* Video Preview Area */}
                <div className="w-full h-full flex items-center justify-center"
                  style={{
                    backgroundImage: 'linear-gradient(hsl(var(--border)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--border)) 1px, transparent 1px)',
                    backgroundSize: '20px 20px',
                    backgroundColor: 'hsl(var(--muted) / 0.3)'
                  }}
                >
                  <div className="text-white/40 text-center">
                    <div className="w-12 h-12 mx-auto mb-2 bg-white/10 rounded-full flex items-center justify-center">
                      {isPlaying ? (
                        <Pause size={20} className="text-white/60" />
                      ) : (
                        <Play size={20} className="text-white/60 ml-0.5" />
                      )}
                    </div>
                    <p className="text-xs">视频预览</p>
                  </div>
                </div>

                {/* Preview Overlays (Subtitles, Stickers, Animated Text) */}
                {renderPreviewOverlays()}

                {/* TikTok UI Overlay Zones - Shows dangerous areas */}
                <div className="absolute inset-0 pointer-events-none z-20">
                  {/* Top Zone - TikTok Header Area */}
                  <div className="absolute top-0 left-0 right-0 h-16 bg-red-500/20 border-b-2 border-dashed border-red-500/50 flex items-center justify-center">
                    <span className="text-red-400 text-[10px] font-medium">TikTok 顶部区域</span>
                  </div>
                  
                  {/* Bottom Zone - TikTok Caption/Controls Area */}
                  <div className="absolute bottom-0 left-0 right-0 h-28 bg-red-500/20 border-t-2 border-dashed border-red-500/50 flex items-end justify-center pb-2">
                    <span className="text-red-400 text-[10px] font-medium">TikTok 文案/控制区域</span>
                  </div>
                  
                  {/* Right Side - TikTok Action Buttons Area */}
                  <div className="absolute right-0 top-1/4 bottom-32 w-12 bg-orange-500/20 border-l-2 border-dashed border-orange-500/50 flex items-center justify-center">
                    <span className="text-orange-400 text-[8px] font-medium writing-vertical" style={{ writingMode: 'vertical-rl' }}>按钮区</span>
                  </div>

                  {/* Safe Zone Indicator */}
                  <div className="absolute top-16 left-0 right-12 bottom-28 border-2 border-dashed border-green-500/50 rounded">
                    <span className="absolute top-1 left-1 text-green-400 text-[8px] bg-black/50 px-1 rounded">安全区域</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Legend */}
            <div className="mt-4 space-y-1 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500/30 border border-red-500/50 rounded" />
                <span className="text-muted-foreground">被TikTok UI遮挡区域</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500/30 border border-green-500/50 rounded" />
                <span className="text-muted-foreground">安全显示区域</span>
              </div>
            </div>
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