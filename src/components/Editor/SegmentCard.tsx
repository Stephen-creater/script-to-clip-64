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
  Loader2,
  Type,
  Smile
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
    thumbnail: "https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=400&h=225&fit=crop",
    keywords: ["火车", "旅行", "交通"],
    matchScore: 98
  },
  { 
    id: "2", 
    thumbnail: "https://images.unsplash.com/photo-1515165562839-978bbcf18277?w=400&h=225&fit=crop",
    keywords: ["车站", "人群", "城市"],
    matchScore: 92
  },
  { 
    id: "3", 
    thumbnail: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400&h=225&fit=crop",
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
  const [hasAnimatedText, setHasAnimatedText] = useState(false);
  const [hasSticker, setHasSticker] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Determine status: matched or not
  const isMatched = !!matchedVideo;

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

  const toggleAnimatedText = () => setHasAnimatedText(!hasAnimatedText);
  const toggleSticker = () => setHasSticker(!hasSticker);

  return (
    <div className={cn(
      "bg-card rounded-lg border border-border shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden",
      "border-l-4",
      isMatched ? "border-l-emerald-500" : "border-l-muted-foreground/30"
    )}>
      <div className="grid grid-cols-12 gap-4 p-3">
        {/* Left Side: Script Area (5 cols) */}
        <div className="col-span-5 flex flex-col">
          {/* Compact Header */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <GripVertical size={14} className="text-muted-foreground/50 cursor-grab" />
              <span className="text-sm text-muted-foreground font-medium">分段 #{index + 1}</span>
              {isAiReady && (
                <Badge variant="secondary" className="h-5 text-[10px] bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 animate-pulse px-1.5">
                  <Sparkles size={10} className="mr-0.5" />
                  Ready
                </Badge>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-muted-foreground hover:text-destructive"
              onClick={onDelete}
            >
              <Trash2 size={14} />
            </Button>
          </div>

          {/* Script Textarea with Footer Tools */}
          <div className="flex-1 flex flex-col bg-muted/30 rounded-md border border-border/50 overflow-hidden">
            <Textarea
              value={script}
              onChange={(e) => onScriptChange(e.target.value)}
              placeholder="请输入口播文案，AI 将自动分析语义匹配画面..."
              className="flex-1 min-h-[100px] max-h-[140px] resize-none border-0 bg-transparent text-sm focus-visible:ring-0 focus-visible:ring-offset-0"
            />
            
            {/* Footer Toolbar */}
            <div className="flex items-center justify-between px-2 py-1.5 border-t border-border/50 bg-muted/50">
              <Button
                variant="ghost"
                size="sm"
                onClick={onOpenAudioSettings}
                className="h-7 px-2 text-xs gap-1.5 text-muted-foreground hover:text-foreground"
              >
                <Volume2 size={12} />
                {audioSettings?.voiceName || "配音"}
              </Button>
              
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-muted-foreground">语速</span>
                <Slider
                  value={[speed]}
                  onValueChange={(value) => setSpeed(value[0])}
                  min={0.5}
                  max={2}
                  step={0.1}
                  className="w-16"
                />
                <span className="text-[10px] font-medium text-muted-foreground w-6">{speed.toFixed(1)}x</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Visual Area (7 cols) */}
        <div className="col-span-7">
          <div 
            className="relative aspect-video rounded-lg overflow-hidden bg-muted/50"
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
          >
            {/* Loading State */}
            {isMatching && (
              <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center z-20">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full border-2 border-primary/30 border-t-primary animate-spin"></div>
                  <Sparkles size={16} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary" />
                </div>
                <p className="mt-2 text-xs text-muted-foreground">AI 正在搜索素材库...</p>
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
                
                {/* Top Layer: Decoration Chips */}
                <div className="absolute top-2 left-2 flex gap-1.5">
                  {hasAnimatedText && (
                    <Badge className="h-5 text-[10px] bg-purple-500/90 text-white backdrop-blur-sm">
                      <Type size={10} className="mr-0.5" />
                      花字
                    </Badge>
                  )}
                  {hasSticker && (
                    <Badge className="h-5 text-[10px] bg-amber-500/90 text-white backdrop-blur-sm">
                      <Smile size={10} className="mr-0.5" />
                      贴纸
                    </Badge>
                  )}
                </div>

                {/* Match Score Badge */}
                <div className="absolute top-2 right-2">
                  <Badge className="h-5 text-[10px] bg-emerald-500 text-white">
                    {matchedVideo.matchScore}%
                  </Badge>
                </div>
                
                {/* Keywords Overlay */}
                <div className="absolute bottom-12 left-2 flex flex-wrap gap-1">
                  {matchedVideo.keywords.map((keyword, i) => (
                    <Badge 
                      key={i} 
                      variant="secondary" 
                      className="h-5 text-[10px] bg-black/40 text-white backdrop-blur-sm border-0"
                    >
                      #{keyword}
                    </Badge>
                  ))}
                </div>

                {/* Play Button */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                  <Button
                    size="icon"
                    variant="secondary"
                    className="h-10 w-10 rounded-full bg-white/80 hover:bg-white shadow-lg"
                  >
                    <Play size={16} className="text-foreground ml-0.5" />
                  </Button>
                </div>

                {/* Floating Dock Toolbar - iOS Style */}
                <div className={cn(
                  "absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1 px-2 py-1.5 rounded-full",
                  "bg-black/50 backdrop-blur-md border border-white/10",
                  "transition-opacity duration-200",
                  isHovering ? "opacity-100" : "opacity-0"
                )}>
                  <Button
                    size="sm"
                    variant="ghost"
                    className={cn(
                      "h-7 px-2 text-[11px] gap-1 text-white/90 hover:text-white hover:bg-white/20",
                      hasAnimatedText && "bg-white/20"
                    )}
                    onClick={toggleAnimatedText}
                  >
                    <Type size={12} />
                    花字
                  </Button>
                  <div className="w-px h-4 bg-white/20" />
                  <Button
                    size="sm"
                    variant="ghost"
                    className={cn(
                      "h-7 px-2 text-[11px] gap-1 text-white/90 hover:text-white hover:bg-white/20",
                      hasSticker && "bg-white/20"
                    )}
                    onClick={toggleSticker}
                  >
                    <Smile size={12} />
                    贴纸
                  </Button>
                  <div className="w-px h-4 bg-white/20" />
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 px-2 text-[11px] gap-1 text-white/90 hover:text-white hover:bg-white/20"
                    onClick={handleRefresh}
                  >
                    <RefreshCw size={12} />
                    换素材
                  </Button>
                </div>
              </>
            ) : !isMatching && (
              /* Empty State */
              <div className="h-full border-2 border-dashed border-muted-foreground/20 rounded-lg flex flex-col items-center justify-center">
                <Button
                  onClick={handleSmartMatch}
                  disabled={!script.trim() || isMatching}
                  size="sm"
                  className={cn(
                    "gap-1.5 shadow-md text-xs",
                    hasMatchableKeywords 
                      ? "bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white animate-pulse"
                      : "bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white"
                  )}
                >
                  <Sparkles size={14} />
                  智能匹配画面
                </Button>
                <p className="mt-1.5 text-[10px] text-muted-foreground">
                  {script.trim() ? "点击让 AI 匹配最佳素材" : "请先输入文案"}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SegmentCard;
