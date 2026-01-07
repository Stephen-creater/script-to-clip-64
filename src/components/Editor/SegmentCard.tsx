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
  Settings,
  ChevronDown,
  ChevronUp,
  AlignCenter,
  AlignStartVertical,
  AlignEndVertical
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { TrimModal } from "./TrimModal";

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

interface SubtitleStyle {
  preset: string;
  font: string;
  size: number;
  position: 'top' | 'center' | 'bottom';
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
  onVideoSelect: (video: string) => void;
}

// Subtitle style presets
const SUBTITLE_PRESETS = [
  { id: "yellow-black", name: "黄字黑边", bgColor: "transparent", textColor: "#FFD700", stroke: "#000" },
  { id: "white-blue", name: "白字蓝底", bgColor: "#1E40AF", textColor: "#FFFFFF", stroke: "none" },
  { id: "variety", name: "综艺花字", bgColor: "#FF6B6B", textColor: "#FFFFFF", stroke: "#000" },
  { id: "minimal", name: "简约白字", bgColor: "transparent", textColor: "#FFFFFF", stroke: "rgba(0,0,0,0.5)" },
  { id: "neon", name: "霓虹发光", bgColor: "transparent", textColor: "#00FF88", stroke: "#00FF88" },
];

const FONT_OPTIONS = [
  { id: "default", name: "默认字体" },
  { id: "songti", name: "宋体" },
  { id: "heiti", name: "黑体" },
  { id: "kaiti", name: "楷体" },
  { id: "yuanti", name: "圆体" },
];

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
  const [isTrimModalOpen, setIsTrimModalOpen] = useState(false);
  const [isSubtitleAdvancedOpen, setIsSubtitleAdvancedOpen] = useState(false);
  const [subtitleStyle, setSubtitleStyle] = useState<SubtitleStyle>({
    preset: "yellow-black",
    font: "default",
    size: 24,
    position: "bottom"
  });
  const [trimRange, setTrimRange] = useState<{ inPoint: number; outPoint: number } | null>(null);
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
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'video/*,image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        setMatchedVideo(MOCK_VIDEOS[0]);
        onVideoSelect(MOCK_VIDEOS[0].thumbnail);
      }
    };
    input.click();
  };

  const handleTrimConfirm = (inPoint: number, outPoint: number) => {
    setTrimRange({ inPoint, outPoint });
  };

  const selectedPreset = SUBTITLE_PRESETS.find(p => p.id === subtitleStyle.preset);

  return (
    <TooltipProvider>
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
            <div className="mb-2">
              <Textarea
                value={script}
                onChange={(e) => onScriptChange(e.target.value)}
                placeholder="请输入口播文案，AI 将自动分析语义匹配画面..."
                className="min-h-[100px] resize-none bg-muted/30 border-border/50 text-sm focus-visible:ring-1 focus-visible:ring-primary/50"
              />
            </div>

            {/* Layer 2: Subtitle Styling */}
            <div className="mb-2 p-2 bg-muted/30 rounded-lg border border-border/50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] text-muted-foreground font-medium">字幕外观</span>
                <Collapsible open={isSubtitleAdvancedOpen} onOpenChange={setIsSubtitleAdvancedOpen}>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-5 px-1.5 text-[9px] gap-0.5">
                      <Settings size={10} />
                      自定义
                      {isSubtitleAdvancedOpen ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
                    </Button>
                  </CollapsibleTrigger>
                </Collapsible>
              </div>

              {/* Preset Bubbles */}
              <div className="flex items-center gap-1.5 mb-2">
                {SUBTITLE_PRESETS.map((preset) => (
                  <Tooltip key={preset.id}>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => setSubtitleStyle(prev => ({ ...prev, preset: preset.id }))}
                        className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center text-[8px] font-bold transition-all",
                          "border-2",
                          subtitleStyle.preset === preset.id 
                            ? "border-primary ring-2 ring-primary/30 scale-110" 
                            : "border-transparent hover:scale-105"
                        )}
                        style={{
                          backgroundColor: preset.bgColor === "transparent" ? "#1a1a1a" : preset.bgColor,
                          color: preset.textColor,
                          textShadow: preset.stroke !== "none" ? `0 0 2px ${preset.stroke}` : undefined
                        }}
                      >
                        字
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="text-xs">
                      {preset.name}
                    </TooltipContent>
                  </Tooltip>
                ))}
              </div>

              {/* Advanced Options */}
              <Collapsible open={isSubtitleAdvancedOpen} onOpenChange={setIsSubtitleAdvancedOpen}>
                <CollapsibleContent className="space-y-2 pt-2 border-t border-border/50">
                  {/* Font Selection */}
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] text-muted-foreground w-10">字体</span>
                    <Select 
                      value={subtitleStyle.font} 
                      onValueChange={(v) => setSubtitleStyle(prev => ({ ...prev, font: v }))}
                    >
                      <SelectTrigger className="h-6 text-[10px] flex-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {FONT_OPTIONS.map((font) => (
                          <SelectItem key={font.id} value={font.id} className="text-xs">
                            {font.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Font Size */}
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] text-muted-foreground w-10">字号</span>
                    <Slider
                      value={[subtitleStyle.size]}
                      onValueChange={(v) => setSubtitleStyle(prev => ({ ...prev, size: v[0] }))}
                      min={12}
                      max={48}
                      step={2}
                      className="flex-1"
                    />
                    <span className="text-[9px] text-muted-foreground w-6">{subtitleStyle.size}px</span>
                  </div>

                  {/* Position */}
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] text-muted-foreground w-10">位置</span>
                    <div className="flex gap-1 flex-1">
                      {[
                        { value: 'top', icon: AlignStartVertical, label: '上' },
                        { value: 'center', icon: AlignCenter, label: '中' },
                        { value: 'bottom', icon: AlignEndVertical, label: '下' },
                      ].map(({ value, icon: Icon, label }) => (
                        <Button
                          key={value}
                          variant={subtitleStyle.position === value ? "default" : "secondary"}
                          size="sm"
                          onClick={() => setSubtitleStyle(prev => ({ ...prev, position: value as 'top' | 'center' | 'bottom' }))}
                          className="flex-1 h-6 text-[9px] gap-0.5"
                        >
                          <Icon size={10} />
                          {label}
                        </Button>
                      ))}
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>

            {/* Layer 3: Audio Configuration - Split Controls */}
            <div className="space-y-2 mb-2">
              {/* Voice/TTS Settings */}
              <div className="flex items-center gap-2 p-2 bg-muted/30 rounded-lg border border-border/50">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Mic size={10} className="text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[9px] text-muted-foreground">口播配音</p>
                    <p className="text-[10px] font-medium truncate">{audioSettings?.voiceName || "选择音色"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <span className="text-[8px] text-muted-foreground">语速</span>
                  <Slider
                    value={[speed]}
                    onValueChange={(value) => setSpeed(value[0])}
                    min={0.5}
                    max={2}
                    step={0.1}
                    className="w-12"
                  />
                  <span className="text-[8px] font-medium text-muted-foreground w-5">{speed.toFixed(1)}x</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onOpenAudioSettings}
                  className="h-5 px-1.5 text-[9px]"
                >
                  设置
                </Button>
              </div>

              {/* BGM Settings */}
              <div className="flex items-center gap-2 p-2 bg-muted/30 rounded-lg border border-border/50">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <div className="w-6 h-6 rounded-full bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                    <Music size={10} className="text-amber-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[9px] text-muted-foreground">背景音乐</p>
                    <p className="text-[10px] font-medium truncate">
                      {bgmEnabled ? "已开启" : "未设置"}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "h-5 w-5",
                    bgmEnabled ? "text-amber-600" : "text-muted-foreground"
                  )}
                  onClick={() => setBgmEnabled(!bgmEnabled)}
                >
                  {bgmEnabled ? <Volume2 size={10} /> : <VolumeX size={10} />}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onOpenBgmSettings}
                  className="h-5 px-1.5 text-[9px]"
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
                  "flex-1 h-7 text-[10px] gap-1",
                  hasAnimatedText && "bg-purple-500 hover:bg-purple-600 text-white"
                )}
              >
                <Type size={12} />
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
                  "flex-1 h-7 text-[10px] gap-1",
                  hasSticker && "bg-amber-500 hover:bg-amber-600 text-white"
                )}
              >
                <Smile size={12} />
                添加贴纸
              </Button>
            </div>
          </div>

          {/* Right Side: 9:16 Visual Area */}
          <div 
            className="w-[220px] flex-shrink-0"
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
          >
            <div className="relative aspect-[9/16] h-[390px] rounded-xl overflow-hidden bg-black">
              {/* Loading State */}
              {isMatching && (
                <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center z-20">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full border-2 border-primary/30 border-t-primary animate-spin"></div>
                    <Sparkles size={16} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary" />
                  </div>
                  <p className="mt-2 text-[10px] text-white/70">AI 正在搜索素材库...</p>
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
                  <div className="absolute top-2 left-2 flex flex-wrap gap-1">
                    {hasAnimatedText && (
                      <Badge className="h-4 text-[8px] bg-purple-500/90 text-white backdrop-blur-sm">
                        <Type size={8} className="mr-0.5" />
                        花字
                      </Badge>
                    )}
                    {hasSticker && (
                      <Badge className="h-4 text-[8px] bg-amber-500/90 text-white backdrop-blur-sm">
                        <Smile size={8} className="mr-0.5" />
                        贴纸
                      </Badge>
                    )}
                    {trimRange && (
                      <Badge className="h-4 text-[8px] bg-blue-500/90 text-white backdrop-blur-sm">
                        <Scissors size={8} className="mr-0.5" />
                        已裁剪
                      </Badge>
                    )}
                  </div>

                  {/* Match Score Badge */}
                  <div className="absolute top-2 right-2">
                    <Badge className="h-4 text-[8px] bg-emerald-500 text-white">
                      {matchedVideo.matchScore}%
                    </Badge>
                  </div>

                  {/* Subtitle Preview */}
                  <div 
                    className={cn(
                      "absolute left-2 right-2 text-center px-2 py-1 rounded",
                      subtitleStyle.position === 'top' && "top-10",
                      subtitleStyle.position === 'center' && "top-1/2 -translate-y-1/2",
                      subtitleStyle.position === 'bottom' && "bottom-14"
                    )}
                    style={{
                      backgroundColor: selectedPreset?.bgColor === "transparent" ? "transparent" : selectedPreset?.bgColor,
                      color: selectedPreset?.textColor,
                      textShadow: selectedPreset?.stroke !== "none" 
                        ? `1px 1px 2px ${selectedPreset?.stroke}, -1px -1px 2px ${selectedPreset?.stroke}` 
                        : undefined,
                      fontSize: `${Math.max(10, subtitleStyle.size * 0.5)}px`,
                      fontWeight: 'bold'
                    }}
                  >
                    {script.slice(0, 20) || "字幕预览"}
                    {script.length > 20 && "..."}
                  </div>
                  
                  {/* Keywords Overlay */}
                  <div className="absolute bottom-12 left-2 flex flex-wrap gap-1 max-w-[90%]">
                    {matchedVideo.keywords.map((keyword, i) => (
                      <Badge 
                        key={i} 
                        variant="secondary" 
                        className="h-4 text-[8px] bg-black/50 text-white backdrop-blur-sm border-0"
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
                      className="h-10 w-10 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30"
                    >
                      <Play size={16} className="text-white ml-0.5" />
                    </Button>
                  </div>

                  {/* Hover Action Bar */}
                  <div className={cn(
                    "absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-0.5 px-1.5 py-1 rounded-full",
                    "bg-black/60 backdrop-blur-md border border-white/20",
                    "transition-all duration-200",
                    isHovering ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
                  )}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 px-2 text-[10px] gap-1 text-white/90 hover:text-white hover:bg-white/20 rounded-full"
                          onClick={handleRefresh}
                        >
                          <RefreshCw size={10} />
                          换
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>换一个素材</TooltipContent>
                    </Tooltip>
                    <div className="w-px h-3 bg-white/20" />
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 px-2 text-[10px] gap-1 text-white/90 hover:text-white hover:bg-white/20 rounded-full"
                          onClick={() => setIsTrimModalOpen(true)}
                        >
                          <Scissors size={10} />
                          剪
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>截取片段</TooltipContent>
                    </Tooltip>
                    <div className="w-px h-3 bg-white/20" />
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 px-2 text-[10px] gap-1 text-white/90 hover:text-white hover:bg-white/20 rounded-full"
                          onClick={handleLocalUpload}
                        >
                          <Upload size={10} />
                          传
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>上传本地素材</TooltipContent>
                    </Tooltip>
                  </div>
                </>
              ) : !isMatching && (
                /* Empty State - Dual Action Buttons */
                <div className="h-full flex flex-col items-center justify-center gap-3 p-4">
                  <div className="text-center mb-1">
                    <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-2">
                      <Sparkles size={22} className="text-white/40" />
                    </div>
                    <p className="text-[10px] text-white/50">
                      {script.trim() ? "选择素材来源" : "请先输入文案"}
                    </p>
                  </div>
                  
                  {/* Primary: AI Match */}
                  <Button
                    onClick={handleSmartMatch}
                    disabled={!script.trim() || isMatching}
                    size="default"
                    className={cn(
                      "w-full gap-1.5 h-10 text-xs font-medium rounded-lg",
                      hasMatchableKeywords 
                        ? "bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg shadow-emerald-500/25 animate-pulse"
                        : "bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white"
                    )}
                  >
                    <Sparkles size={14} />
                    智能匹配画面
                  </Button>

                  {/* Secondary: Local Upload */}
                  <Button
                    onClick={handleLocalUpload}
                    variant="outline"
                    size="default"
                    className="w-full gap-1.5 h-9 text-xs rounded-lg border-white/20 text-white/80 hover:text-white hover:bg-white/10 hover:border-white/30 bg-transparent"
                  >
                    <Upload size={14} />
                    上传本地素材
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Trim Modal */}
      {matchedVideo && (
        <TrimModal
          isOpen={isTrimModalOpen}
          onClose={() => setIsTrimModalOpen(false)}
          videoThumbnail={matchedVideo.thumbnail}
          originalDuration={45}
          requiredDuration={3.5}
          onConfirm={handleTrimConfirm}
        />
      )}
    </TooltipProvider>
  );
};

export default SegmentCard;
