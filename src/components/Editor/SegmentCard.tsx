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
  Trash2,
  Play,
  Mic,
  Music,
  Volume2,
  VolumeX,
  Type,
  Smile,
  Scissors,
  AlignVerticalJustifyStart,
  AlignVerticalJustifyCenter,
  AlignVerticalJustifyEnd,
  ChevronDown
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
  onOpenBgmSettings?: () => void;
  onOpenAnimatedText?: () => void;
  onOpenSticker?: () => void;
  onOpenBatchTrim?: () => void;
  onVideoSelect: (video: string) => void;
}

// Mock video data for demo - 9:16 vertical videos
const MOCK_VIDEOS = [
  { 
    id: "1", 
    thumbnail: "https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=360&h=640&fit=crop",
    keywords: ["火车", "旅行", "交通"],
    matchScore: 98
  },
  { 
    id: "2", 
    thumbnail: "https://images.unsplash.com/photo-1515165562839-978bbcf18277?w=360&h=640&fit=crop",
    keywords: ["车站", "人群", "城市"],
    matchScore: 92
  },
  { 
    id: "3", 
    thumbnail: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=360&h=640&fit=crop",
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
  onOpenBgmSettings,
  onOpenAnimatedText,
  onOpenSticker,
  onOpenBatchTrim,
  onVideoSelect
}: SegmentCardProps) => {
  const [isAiReady, setIsAiReady] = useState(false);
  const [isMatching, setIsMatching] = useState(false);
  const [matchedVideo, setMatchedVideo] = useState<typeof MOCK_VIDEOS[0] | null>(null);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [speed, setSpeed] = useState(audioSettings?.speed || 1.0);
  const [isHovering, setIsHovering] = useState(false);
  const [isCardHovering, setIsCardHovering] = useState(false);
  const [hasAnimatedText, setHasAnimatedText] = useState(false);
  const [hasSticker, setHasSticker] = useState(false);
  const [bgmEnabled, setBgmEnabled] = useState(false);
  const [isSubtitlePanelOpen, setIsSubtitlePanelOpen] = useState(false);
  const [subtitleColor, setSubtitleColor] = useState("white");
  const [subtitleSize, setSubtitleSize] = useState([24]);
  const [subtitlePosition, setSubtitlePosition] = useState<"top" | "center" | "bottom">("bottom");
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const isMatched = !!matchedVideo;

  const hasMatchableKeywords = KEYWORDS_TO_MATCH.some(keyword => 
    script.toLowerCase().includes(keyword.toLowerCase())
  );

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

  const handleLocalUpload = () => {
    // Trigger file upload dialog
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'video/*,image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        // Simulate upload with mock data
        setMatchedVideo(MOCK_VIDEOS[0]);
        onVideoSelect(MOCK_VIDEOS[0].thumbnail);
      }
    };
    input.click();
  };

  return (
    <div 
      className={cn(
        "bg-card rounded-xl border transition-all duration-200 overflow-hidden",
        isCardHovering ? "border-primary shadow-lg" : "border-border/60",
        "border-l-4",
        isMatched ? "border-l-emerald-500" : "border-l-muted-foreground/30"
      )}
      onMouseEnter={() => setIsCardHovering(true)}
      onMouseLeave={() => setIsCardHovering(false)}
    >
      <div className="flex gap-3 p-3">
        {/* Left Side: Control Panel */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Compact Header */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <GripVertical size={14} className="text-muted-foreground/50 cursor-grab" />
              <span className="text-xs text-muted-foreground font-medium">分段 #{index + 1}</span>
              {isAiReady && (
                <Badge variant="secondary" className="h-4 text-[9px] bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 animate-pulse px-1">
                  <Sparkles size={8} className="mr-0.5" />
                  Ready
                </Badge>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5 text-muted-foreground hover:text-destructive"
              onClick={onDelete}
            >
              <Trash2 size={12} />
            </Button>
          </div>

          {/* Layer 1: Script Input */}
          <div className="mb-3">
            <Textarea
              value={script}
              onChange={(e) => onScriptChange(e.target.value)}
              placeholder="请输入口播文案，AI 将自动分析语义匹配画面..."
              className="min-h-[120px] resize-none bg-muted/30 border-border/50 text-sm focus-visible:ring-1 focus-visible:ring-primary/50"
            />
          </div>

          {/* Layer 2: Refinement Toolbar */}
          <div className="mb-3 space-y-2">
            <div className="flex items-center gap-2">
              {/* Subtitle Settings Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsSubtitlePanelOpen(!isSubtitlePanelOpen)}
                className={cn(
                  "flex-1 h-8 text-xs gap-1.5 justify-between bg-background border-border/60",
                  isSubtitlePanelOpen && "bg-muted border-primary/50"
                )}
              >
                <div className="flex items-center gap-1.5">
                  <Type size={14} />
                  字幕设置
                </div>
                <ChevronDown 
                  size={12} 
                  className={cn(
                    "transition-transform duration-200",
                    isSubtitlePanelOpen && "rotate-180"
                  )}
                />
              </Button>

              {/* Batch Trim Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={onOpenBatchTrim}
                className="flex-1 h-8 text-xs gap-1.5 bg-background border-border/60 hover:border-primary/50"
              >
                <Scissors size={14} />
                批量裁剪
              </Button>
            </div>

            {/* Subtitle Settings Accordion Panel */}
            <div className={cn(
              "overflow-hidden transition-all duration-200 ease-out",
              isSubtitlePanelOpen ? "max-h-40 opacity-100" : "max-h-0 opacity-0"
            )}>
              <div className="p-3 bg-muted/40 rounded-lg border border-border/50 space-y-3">
                {/* Color Presets */}
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-muted-foreground">预设样式</span>
                  <div className="flex items-center gap-2">
                    {[
                      { color: "black", bg: "bg-black", border: "border-white/30" },
                      { color: "white", bg: "bg-white", border: "border-gray-300" },
                      { color: "yellow", bg: "bg-yellow-400", border: "border-yellow-500" },
                      { color: "blue", bg: "bg-blue-500", border: "border-blue-600" }
                    ].map((preset) => (
                      <button
                        key={preset.color}
                        onClick={() => setSubtitleColor(preset.color)}
                        className={cn(
                          "w-6 h-6 rounded-full border-2 transition-all",
                          preset.bg,
                          subtitleColor === preset.color 
                            ? "ring-2 ring-primary ring-offset-2 ring-offset-background" 
                            : preset.border
                        )}
                      />
                    ))}
                  </div>
                </div>

                {/* Font Size Slider */}
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[10px] text-muted-foreground">字体大小</span>
                  <div className="flex items-center gap-2 flex-1 max-w-[140px]">
                    <Slider
                      value={subtitleSize}
                      onValueChange={setSubtitleSize}
                      min={12}
                      max={48}
                      step={2}
                      className="flex-1"
                    />
                    <span className="text-[10px] font-medium text-muted-foreground w-6">{subtitleSize[0]}</span>
                  </div>
                </div>

                {/* Position Selector */}
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-muted-foreground">显示位置</span>
                  <div className="flex items-center gap-1 bg-muted rounded-md p-0.5">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setSubtitlePosition("top")}
                      className={cn(
                        "h-6 w-6",
                        subtitlePosition === "top" && "bg-background shadow-sm"
                      )}
                    >
                      <AlignVerticalJustifyStart size={12} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setSubtitlePosition("center")}
                      className={cn(
                        "h-6 w-6",
                        subtitlePosition === "center" && "bg-background shadow-sm"
                      )}
                    >
                      <AlignVerticalJustifyCenter size={12} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setSubtitlePosition("bottom")}
                      className={cn(
                        "h-6 w-6",
                        subtitlePosition === "bottom" && "bg-background shadow-sm"
                      )}
                    >
                      <AlignVerticalJustifyEnd size={12} />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Layer 3: Audio Configuration - Split Controls */}
          <div className="space-y-2 mb-3">
            {/* Voice/TTS Settings */}
            <div className="flex items-center gap-2 p-2 bg-muted/30 rounded-lg border border-border/50">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Mic size={12} className="text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] text-muted-foreground">口播配音</p>
                  <p className="text-xs font-medium truncate">{audioSettings?.voiceName || "选择音色"}</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <span className="text-[9px] text-muted-foreground">语速</span>
                <Slider
                  value={[speed]}
                  onValueChange={(value) => setSpeed(value[0])}
                  min={0.5}
                  max={2}
                  step={0.1}
                  className="w-14"
                />
                <span className="text-[9px] font-medium text-muted-foreground w-5">{speed.toFixed(1)}x</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onOpenAudioSettings}
                className="h-6 px-2 text-[10px]"
              >
                设置
              </Button>
            </div>

            {/* BGM Settings */}
            <div className="flex items-center gap-2 p-2 bg-muted/30 rounded-lg border border-border/50">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <div className="w-7 h-7 rounded-full bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                  <Music size={12} className="text-amber-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] text-muted-foreground">背景音乐</p>
                  <p className="text-xs font-medium truncate">
                    {bgmEnabled ? "已开启" : "未设置"}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "h-6 w-6",
                  bgmEnabled ? "text-amber-600" : "text-muted-foreground"
                )}
                onClick={() => setBgmEnabled(!bgmEnabled)}
              >
                {bgmEnabled ? <Volume2 size={12} /> : <VolumeX size={12} />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onOpenBgmSettings}
                className="h-6 px-2 text-[10px]"
              >
                设置
              </Button>
            </div>
          </div>

          {/* Layer 4: Decoration Toolbar */}
          <div className="flex items-center gap-2">
            <Button
              variant={hasAnimatedText ? "default" : "secondary"}
              size="sm"
              onClick={() => {
                setHasAnimatedText(!hasAnimatedText);
                onOpenAnimatedText?.();
              }}
              className={cn(
                "flex-1 h-8 text-xs gap-1.5",
                hasAnimatedText && "bg-purple-500 hover:bg-purple-600 text-white"
              )}
            >
              <Type size={14} />
              添加花字
            </Button>
            <Button
              variant={hasSticker ? "default" : "secondary"}
              size="sm"
              onClick={() => {
                setHasSticker(!hasSticker);
                onOpenSticker?.();
              }}
              className={cn(
                "flex-1 h-8 text-xs gap-1.5",
                hasSticker && "bg-amber-500 hover:bg-amber-600 text-white"
              )}
            >
              <Smile size={14} />
              添加贴纸
            </Button>
          </div>
        </div>

        {/* Right Side: 9:16 Visual Area */}
        <div 
          className="w-[253px] flex-shrink-0"
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
          <div className="relative aspect-[9/16] h-[450px] rounded-xl overflow-hidden bg-black">
            {/* Loading State */}
            {isMatching && (
              <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center z-20">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full border-2 border-primary/30 border-t-primary animate-spin"></div>
                  <Sparkles size={18} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary" />
                </div>
                <p className="mt-3 text-xs text-white/70">AI 正在搜索素材库...</p>
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
                <div className="absolute top-3 left-3 flex gap-1.5">
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
                <div className="absolute top-3 right-3">
                  <Badge className="h-5 text-[10px] bg-emerald-500 text-white">
                    {matchedVideo.matchScore}% Match
                  </Badge>
                </div>
                
                {/* Keywords Overlay */}
                <div className="absolute bottom-16 left-3 flex flex-wrap gap-1 max-w-[90%]">
                  {matchedVideo.keywords.map((keyword, i) => (
                    <Badge 
                      key={i} 
                      variant="secondary" 
                      className="h-5 text-[10px] bg-black/50 text-white backdrop-blur-sm border-0"
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
                    className="h-12 w-12 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30"
                  >
                    <Play size={20} className="text-white ml-0.5" />
                  </Button>
                </div>

                {/* Hover Action Bar */}
                <div className={cn(
                  "absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1 px-2 py-1.5 rounded-full",
                  "bg-black/60 backdrop-blur-md border border-white/20",
                  "transition-all duration-200",
                  isHovering ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
                )}>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 px-2.5 text-[11px] gap-1 text-white/90 hover:text-white hover:bg-white/20 rounded-full"
                    onClick={handleRefresh}
                  >
                    <RefreshCw size={12} />
                    换素材
                  </Button>
                  <div className="w-px h-4 bg-white/20" />
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 px-2.5 text-[11px] gap-1 text-white/90 hover:text-white hover:bg-white/20 rounded-full"
                    onClick={handleLocalUpload}
                  >
                    <Upload size={12} />
                    上传
                  </Button>
                </div>
              </>
            ) : !isMatching && (
              /* Empty State - Dual Action Buttons */
              <div className="h-full flex flex-col items-center justify-center gap-4 p-6">
                <div className="text-center mb-2">
                  <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-3">
                    <Sparkles size={28} className="text-white/40" />
                  </div>
                  <p className="text-xs text-white/50">
                    {script.trim() ? "选择素材来源" : "请先输入文案"}
                  </p>
                </div>
                
                {/* Primary: AI Match */}
                <Button
                  onClick={handleSmartMatch}
                  disabled={!script.trim() || isMatching}
                  size="lg"
                  className={cn(
                    "w-full gap-2 h-12 text-sm font-medium rounded-xl",
                    hasMatchableKeywords 
                      ? "bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg shadow-emerald-500/25 animate-pulse"
                      : "bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white"
                  )}
                >
                  <Sparkles size={18} />
                  智能匹配画面
                </Button>

                {/* Secondary: Local Upload */}
                <Button
                  onClick={handleLocalUpload}
                  variant="outline"
                  size="lg"
                  className="w-full gap-2 h-11 text-sm rounded-xl border-white/20 text-white/80 hover:text-white hover:bg-white/10 hover:border-white/30 bg-transparent"
                >
                  <Upload size={16} />
                  上传本地素材
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SegmentCard;
