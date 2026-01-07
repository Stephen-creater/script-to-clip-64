import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { 
  GripVertical, 
  Sparkles, 
  RefreshCw, 
  Upload, 
  Scissors,
  Volume2,
  Trash2,
  Play,
  ChevronRight,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AudioSettings {
  voiceId: string;
  voiceName: string;
  voiceAvatar: string;
  voiceStyle: string;
  speed: number;
  ttsVolume: number;
  bgmVolume: number;
  autoDucking: boolean;
  bgmTracks: { id: string; name: string; duration: string }[];
  loopMode: 'loop' | 'shuffle';
}

interface SegmentCardProps {
  id: string;
  index: number;
  name: string;
  script: string;
  video: string;
  audioSettings?: AudioSettings;
  onScriptChange: (script: string) => void;
  onDelete: () => void;
  onOpenAudioSettings: () => void;
  onVideoSelect: (video: string) => void;
}

// Mock video data for demo
const MOCK_VIDEOS = [
  { 
    id: "1", 
    thumbnail: "https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=400&h=300&fit=crop",
    keywords: ["火车", "旅行", "交通"],
    matchScore: 98
  },
  { 
    id: "2", 
    thumbnail: "https://images.unsplash.com/photo-1515165562839-978bbcf18277?w=400&h=300&fit=crop",
    keywords: ["车站", "人群", "城市"],
    matchScore: 92
  },
  { 
    id: "3", 
    thumbnail: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400&h=300&fit=crop",
    keywords: ["公交", "省钱", "通勤"],
    matchScore: 85
  }
];

const KEYWORDS_TO_MATCH = ["火车", "车站", "省钱", "旅行", "交通"];

const SegmentCard = ({
  id,
  index,
  name,
  script,
  video,
  audioSettings,
  onScriptChange,
  onDelete,
  onOpenAudioSettings,
  onVideoSelect
}: SegmentCardProps) => {
  const [isAiReady, setIsAiReady] = useState(false);
  const [isMatching, setIsMatching] = useState(false);
  const [matchedVideo, setMatchedVideo] = useState<typeof MOCK_VIDEOS[0] | null>(null);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [speed, setSpeed] = useState(audioSettings?.speed || 1.0);
  const [isHovering, setIsHovering] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Check if script contains matching keywords
  const hasMatchableKeywords = KEYWORDS_TO_MATCH.some(keyword => 
    script.toLowerCase().includes(keyword.toLowerCase())
  );

  // Handle typing detection for AI Ready state
  useEffect(() => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    setIsAiReady(false);
    
    if (script.trim().length > 0) {
      typingTimeoutRef.current = setTimeout(() => {
        setIsAiReady(true);
      }, 800);
    }

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [script]);

  const handleSmartMatch = () => {
    setIsMatching(true);
    setIsAiReady(false);
    
    // Simulate AI matching process
    setTimeout(() => {
      setMatchedVideo(MOCK_VIDEOS[currentVideoIndex]);
      setIsMatching(false);
      onVideoSelect(MOCK_VIDEOS[currentVideoIndex].thumbnail);
    }, 1500);
  };

  const handleRefresh = () => {
    setIsMatching(true);
    const nextIndex = (currentVideoIndex + 1) % MOCK_VIDEOS.length;
    setCurrentVideoIndex(nextIndex);
    
    setTimeout(() => {
      setMatchedVideo(MOCK_VIDEOS[nextIndex]);
      setIsMatching(false);
      onVideoSelect(MOCK_VIDEOS[nextIndex].thumbnail);
    }, 800);
  };

  return (
    <div className="bg-card rounded-xl border border-border shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">
      {/* Card Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-muted/30 border-b border-border">
        <div className="flex items-center gap-3">
          <GripVertical size={18} className="text-muted-foreground cursor-grab hover:text-foreground transition-colors" />
          <span className="font-medium text-foreground">分段 #{index + 1}</span>
          {isAiReady && (
            <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 animate-pulse">
              <Sparkles size={12} className="mr-1" />
              AI Ready
            </Badge>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={onDelete}
        >
          <Trash2 size={16} />
        </Button>
      </div>

      {/* Card Body - Left Right Split */}
      <div className="flex flex-col lg:flex-row">
        {/* Left Side: Script & Audio */}
        <div className="flex-1 p-4 border-b lg:border-b-0 lg:border-r border-border">
          <div className="space-y-4">
            {/* Script Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">口播文案</label>
              <Textarea
                value={script}
                onChange={(e) => onScriptChange(e.target.value)}
                placeholder="请输入口播文案，AI 将自动分析语义匹配画面..."
                className="min-h-[120px] resize-none bg-background/50 focus:bg-background transition-colors"
              />
            </div>

            {/* Audio Controls */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onOpenAudioSettings}
                className="gap-2"
              >
                <Volume2 size={14} />
                {audioSettings?.voiceName || "生成配音"}
              </Button>
              
              <div className="flex items-center gap-2 flex-1 min-w-[180px]">
                <span className="text-xs text-muted-foreground whitespace-nowrap">语速</span>
                <Slider
                  value={[speed]}
                  onValueChange={(value) => setSpeed(value[0])}
                  min={0.5}
                  max={2}
                  step={0.1}
                  className="flex-1"
                />
                <span className="text-xs font-medium text-foreground w-10">{speed.toFixed(1)}x</span>
              </div>
            </div>
          </div>
        </div>

        {/* Connection Arrow */}
        <div className="hidden lg:flex items-center justify-center w-8 -mx-4 z-10">
          <div className="flex flex-col items-center gap-1">
            <div className="w-px h-8 bg-gradient-to-b from-transparent via-border to-border"></div>
            <ChevronRight size={20} className="text-muted-foreground/50" />
            <div className="w-px h-8 bg-gradient-to-b from-border via-border to-transparent"></div>
          </div>
        </div>

        {/* Right Side: Visual Match */}
        <div className="flex-1 p-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">画面匹配</label>
            
            <div 
              className="relative aspect-video rounded-lg overflow-hidden"
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
            >
              {/* Loading State */}
              {isMatching && (
                <div className="absolute inset-0 bg-muted/80 backdrop-blur-sm flex flex-col items-center justify-center z-20">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full border-2 border-primary/30 border-t-primary animate-spin"></div>
                    <Sparkles size={20} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary" />
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground">AI 正在搜索素材库...</p>
                </div>
              )}

              {/* Matched Video State */}
              {matchedVideo && !isMatching ? (
                <>
                  {/* Video Thumbnail */}
                  <img 
                    src={matchedVideo.thumbnail} 
                    alt="Matched video"
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Overlay with Keywords */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent">
                    <div className="absolute bottom-3 left-3 right-3">
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {matchedVideo.keywords.map((keyword, i) => (
                          <Badge 
                            key={i} 
                            variant="secondary" 
                            className="bg-white/20 text-white backdrop-blur-sm text-xs"
                          >
                            #{keyword}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-emerald-500 text-white">
                          {matchedVideo.matchScore}% 匹配
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Play Button */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    <Button
                      size="icon"
                      variant="secondary"
                      className="h-12 w-12 rounded-full bg-white/90 hover:bg-white shadow-lg"
                    >
                      <Play size={20} className="text-foreground ml-0.5" />
                    </Button>
                  </div>

                  {/* Hover Actions */}
                  <div className={cn(
                    "absolute top-2 right-2 flex gap-1.5 transition-opacity duration-200",
                    isHovering ? "opacity-100" : "opacity-0"
                  )}>
                    <Button
                      size="sm"
                      variant="secondary"
                      className="h-8 bg-white/90 hover:bg-white shadow-sm gap-1.5"
                      onClick={handleRefresh}
                    >
                      <RefreshCw size={14} />
                      换一换
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      className="h-8 bg-white/90 hover:bg-white shadow-sm gap-1.5"
                    >
                      <Upload size={14} />
                      上传
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      className="h-8 bg-white/90 hover:bg-white shadow-sm gap-1.5"
                    >
                      <Scissors size={14} />
                      裁剪
                    </Button>
                  </div>
                </>
              ) : !isMatching && (
                /* Empty State */
                <div className="h-full border-2 border-dashed border-muted-foreground/30 rounded-lg flex flex-col items-center justify-center bg-muted/20 min-h-[160px]">
                  <Button
                    onClick={handleSmartMatch}
                    disabled={!script.trim() || isMatching}
                    className={cn(
                      "gap-2 shadow-lg",
                      hasMatchableKeywords 
                        ? "bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white animate-pulse"
                        : "bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white"
                    )}
                  >
                    <Sparkles size={16} />
                    智能匹配画面
                  </Button>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {script.trim() ? "点击按钮让 AI 为您匹配最佳素材" : "请先输入口播文案"}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SegmentCard;
