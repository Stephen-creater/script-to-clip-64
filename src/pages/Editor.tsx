import { useState, useRef, useEffect } from "react";
import { useOutletContext, useNavigate, useSearchParams } from "react-router-dom";
import SegmentTable from "@/components/Editor/SegmentTable";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Play, Pause, SkipBack, SkipForward, Save, Lock, Clock, FileText, Building2, User, Check, Layers } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

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
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();
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
  const [saveTemplateOpen, setSaveTemplateOpen] = useState(false);
  const [useTemplateOpen, setUseTemplateOpen] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [taskName, setTaskName] = useState(searchParams.get('taskName') || '请命名');
  const [isEditingName, setIsEditingName] = useState(false);
  const [templateTab, setTemplateTab] = useState<'team' | 'personal'>('team');
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(null);

  // Mock templates data
  const templates = [
    { id: 1, title: '带货混剪_快节奏', type: 'team' as const, durationMode: 'fixed' as const, duration: '15s', segments: 5, tags: ['高转化', '快闪'], color: 'bg-orange-100' },
    { id: 2, title: '风景Vlog_舒缓', type: 'team' as const, durationMode: 'flexible' as const, duration: '30s', segments: 3, tags: ['卡点', '空镜'], color: 'bg-emerald-100' },
    { id: 3, title: '口播_知识科普', type: 'team' as const, durationMode: 'fixed' as const, duration: '60s', segments: 8, tags: ['字幕大', '安全区'], color: 'bg-blue-100' },
    { id: 4, title: '我的专用_英铁', type: 'personal' as const, durationMode: 'flexible' as const, duration: '20s', segments: 4, tags: ['个人'], color: 'bg-purple-100' },
    { id: 5, title: '产品展示_高端', type: 'team' as const, durationMode: 'fixed' as const, duration: '45s', segments: 6, tags: ['高级感', '慢节奏'], color: 'bg-slate-100' },
    { id: 6, title: '日常记录_轻松', type: 'personal' as const, durationMode: 'flexible' as const, duration: '25s', segments: 5, tags: ['生活', '记录'], color: 'bg-pink-100' },
  ];

  const filteredTemplates = templates.filter(t => t.type === templateTab);

  const handleUseTemplate = () => {
    const template = templates.find(t => t.id === selectedTemplateId);
    if (!template) {
      toast({
        title: "请选择一个模板",
        variant: "destructive"
      });
      return;
    }

    // 切换到模板对应的时长模式
    handleDurationModeChange(template.durationMode);
    // 填入任务名
    setTaskName(template.title);
    // 关闭弹窗
    setUseTemplateOpen(false);
    setSelectedTemplateId(null);
    
    toast({
      title: "模板引用成功",
      description: `已切换到"${template.durationMode === 'fixed' ? '固定时长' : '灵活时长'}"模式`
    });
  };

  const durationMode = (searchParams.get('durationMode') as 'flexible' | 'fixed') || 'fixed';

  // 切换时长模式
  const handleDurationModeChange = (mode: 'flexible' | 'fixed') => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('durationMode', mode);
    setSearchParams(newParams, { replace: true });
  };

  const handleSaveAsTemplate = () => {
    if (!newTemplateName.trim()) {
      toast({
        title: "请输入模板名称",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "模板保存成功",
      description: `模板"${newTemplateName}"已保存`
    });
    setSaveTemplateOpen(false);
    setNewTemplateName('');
    navigate('/templates');
  };

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
    <div className="flex flex-col min-h-full">
      {/* Top Header with Duration Mode Tabs */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-border bg-card">
        <div className="flex items-center gap-4">
          {/* Duration Mode Tabs */}
          <div className="flex p-1 bg-muted rounded-lg">
            <button
              onClick={() => handleDurationModeChange('fixed')}
              className={cn(
                "px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-200 flex items-center gap-1.5",
                durationMode === 'fixed'
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Lock size={14} />
              固定时长
            </button>
            <button
              onClick={() => handleDurationModeChange('flexible')}
              className={cn(
                "px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-200 flex items-center gap-1.5",
                durationMode === 'flexible'
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Clock size={14} />
              灵活时长
            </button>
          </div>

          {/* Task Name */}
          <div>
            {isEditingName ? (
              <Input
                value={taskName}
                onChange={(e) => setTaskName(e.target.value)}
                onBlur={() => setIsEditingName(false)}
                onKeyDown={(e) => e.key === 'Enter' && setIsEditingName(false)}
                className="h-8 w-48 text-lg font-semibold"
                autoFocus
              />
            ) : (
              <h2 
                className="text-lg font-semibold cursor-pointer hover:text-primary transition-colors"
                onClick={() => setIsEditingName(true)}
              >
                {taskName}
              </h2>
            )}
            <p className="text-sm text-muted-foreground">编辑任务</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setSaveTemplateOpen(true)}
          >
            <Save size={16} className="mr-2" />
            另存为模板
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setUseTemplateOpen(true)}
          >
            <FileText size={16} className="mr-2" />
            引用模板
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 min-h-0">
        {/* Segment Table */}
        <div className={previewOpen ? "flex-1 min-h-0" : "w-full"}>
          <SegmentTable 
            durationMode={durationMode}
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

      {/* Save as Template Dialog */}
      <Dialog open={saveTemplateOpen} onOpenChange={setSaveTemplateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>另存为模板</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Label className="text-sm font-medium">模板名称</Label>
            <Input
              placeholder="输入模板名称..."
              value={newTemplateName}
              onChange={(e) => setNewTemplateName(e.target.value)}
              className="mt-2"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSaveTemplateOpen(false)}>
              取消
            </Button>
            <Button onClick={handleSaveAsTemplate}>
              确认保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Use Template Dialog */}
      <Dialog open={useTemplateOpen} onOpenChange={setUseTemplateOpen}>
        <DialogContent className="max-w-5xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>引用模板</DialogTitle>
          </DialogHeader>
          
          {/* Tabs */}
          <div className="flex gap-1 p-1 bg-muted rounded-lg w-fit">
            <button
              onClick={() => setTemplateTab('team')}
              className={cn(
                "px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center gap-2",
                templateTab === 'team'
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Building2 size={16} />
              团队公共库
            </button>
            <button
              onClick={() => setTemplateTab('personal')}
              className={cn(
                "px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center gap-2",
                templateTab === 'personal'
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <User size={16} />
              个人专用库
            </button>
          </div>

          {/* Template Grid */}
          <div className="flex-1 overflow-y-auto py-4">
            {filteredTemplates.length > 0 ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredTemplates.map((template) => {
                  const isSelected = selectedTemplateId === template.id;
                  return (
                    <button
                      key={template.id}
                      onClick={() => setSelectedTemplateId(template.id)}
                      className={cn(
                        "group relative bg-card rounded-xl border-2 overflow-hidden text-left transition-all duration-200 hover:shadow-lg",
                        isSelected
                          ? "border-primary shadow-md"
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      {/* Selected Check */}
                      {isSelected && (
                        <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-primary flex items-center justify-center z-10">
                          <Check size={14} className="text-primary-foreground" />
                        </div>
                      )}

                      {/* Color Header */}
                      <div className={cn(
                        "h-20 flex items-center justify-center gap-2 relative",
                        template.color
                      )}>
                        <Badge variant="secondary" className="bg-white/80 text-foreground gap-1">
                          <Clock size={12} />
                          {template.duration}
                        </Badge>
                        <Badge 
                          variant="secondary" 
                          className={cn(
                            "gap-1",
                            template.durationMode === 'fixed' 
                              ? "bg-blue-100 text-blue-700" 
                              : "bg-green-100 text-green-700"
                          )}
                        >
                          {template.durationMode === 'fixed' ? <Lock size={12} /> : <Clock size={12} />}
                          {template.durationMode === 'fixed' ? '固定' : '灵活'}
                        </Badge>
                      </div>

                      {/* Content */}
                      <div className="p-4 space-y-3">
                        <h3 className="font-semibold text-foreground line-clamp-1">
                          {template.title}
                        </h3>
                        
                        {/* Tags */}
                        <div className="flex flex-wrap gap-1.5">
                          {template.tags.map((tag, idx) => (
                            <Badge 
                              key={idx} 
                              variant="outline" 
                              className="text-xs px-2 py-0.5 text-muted-foreground"
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>

                        {/* Segments Info */}
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Layers size={12} />
                          <span>{template.segments} 个分段</span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="h-full flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                    <FileText size={24} className="text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground">暂无模板</p>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setUseTemplateOpen(false);
              setSelectedTemplateId(null);
            }}>
              取消
            </Button>
            <Button onClick={handleUseTemplate} disabled={!selectedTemplateId}>
              确认引用
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Editor;