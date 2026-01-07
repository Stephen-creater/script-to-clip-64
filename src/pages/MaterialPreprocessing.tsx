import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  Upload, 
  Sparkles, 
  Scissors, 
  Database,
  Check,
  Loader2,
  Play,
  Plus,
  X,
  Eye,
  EyeOff,
  Clock,
  Download
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

// Mock data for processing pipeline
const PIPELINE_STEPS = [
  { id: 1, name: "原始上传", icon: Upload, status: "completed" as const },
  { id: 2, name: "去水印/画质增强", icon: Sparkles, status: "processing" as const },
  { id: 3, name: "智能分镜切割", icon: Scissors, status: "pending" as const },
  { id: 4, name: "AI 打标入库", icon: Database, status: "pending" as const },
];

// Mock data for AI-generated tags
const MOCK_TAGS = {
  visual: ["火车", "铁轨", "车站", "站台", "乘客", "行李箱"],
  shot: ["中景", "推镜头", "跟拍", "航拍", "固定机位"],
  emotion: ["期待", "温暖", "匆忙", "离别", "重逢"],
  marketing: ["旅行", "出行", "交通工具", "城市生活", "通勤"],
};

// Mock data for scene cuts
const MOCK_SCENE_CUTS = [
  { id: 1, thumbnail: "bg-blue-200", duration: "0:03", startTime: "00:00", endTime: "00:03", description: "火车进站全景" },
  { id: 2, thumbnail: "bg-emerald-200", duration: "0:05", startTime: "00:03", endTime: "00:08", description: "乘客下车特写" },
  { id: 3, thumbnail: "bg-orange-200", duration: "0:04", startTime: "00:08", endTime: "00:12", description: "站台人流中景" },
  { id: 4, thumbnail: "bg-purple-200", duration: "0:06", startTime: "00:12", endTime: "00:18", description: "列车启动跟拍" },
  { id: 5, thumbnail: "bg-pink-200", duration: "0:03", startTime: "00:18", endTime: "00:21", description: "窗外风景航拍" },
  { id: 6, thumbnail: "bg-cyan-200", duration: "0:05", startTime: "00:21", endTime: "00:26", description: "车厢内部空镜" },
];

const MaterialPreprocessing = () => {
  const navigate = useNavigate();
  const [showOriginal, setShowOriginal] = useState(false);
  const [tags, setTags] = useState(MOCK_TAGS);
  const [addedToLibrary, setAddedToLibrary] = useState<number[]>([]);

  const handleRemoveTag = (category: keyof typeof MOCK_TAGS, tagToRemove: string) => {
    setTags(prev => ({
      ...prev,
      [category]: prev[category].filter(tag => tag !== tagToRemove)
    }));
  };

  const handleAddToLibrary = (sceneId: number) => {
    setAddedToLibrary(prev => [...prev, sceneId]);
  };

  const getStepStatusStyle = (status: "completed" | "processing" | "pending") => {
    switch (status) {
      case "completed":
        return "bg-emerald-500 text-white";
      case "processing":
        return "bg-primary text-primary-foreground animate-pulse";
      case "pending":
        return "bg-muted text-muted-foreground";
    }
  };

  const getProgressValue = () => {
    const completedSteps = PIPELINE_STEPS.filter(s => s.status === "completed").length;
    const processingSteps = PIPELINE_STEPS.filter(s => s.status === "processing").length;
    return ((completedSteps + processingSteps * 0.5) / PIPELINE_STEPS.length) * 100;
  };

  const TagCategory = ({ 
    title, 
    category, 
    color 
  }: { 
    title: string; 
    category: keyof typeof MOCK_TAGS; 
    color: string;
  }) => (
    <div className="space-y-2">
      <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
        <span className={cn("w-2 h-2 rounded-full", color)} />
        {title}
      </h4>
      <div className="flex flex-wrap gap-1.5">
        {tags[category].map((tag) => (
          <Badge 
            key={tag} 
            variant="secondary" 
            className="pl-2 pr-1 py-0.5 text-xs flex items-center gap-1 hover:bg-secondary/80"
          >
            {tag}
            <button 
              onClick={() => handleRemoveTag(category, tag)}
              className="ml-0.5 hover:bg-muted rounded-full p-0.5"
            >
              <X size={10} />
            </button>
          </Badge>
        ))}
        <button className="inline-flex items-center gap-1 px-2 py-0.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted rounded-full border border-dashed border-muted-foreground/30 transition-colors">
          <Plus size={10} />
          添加
        </button>
      </div>
    </div>
  );

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="flex-shrink-0 border-b border-border bg-card px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => navigate("/materials")}
            >
              <ArrowLeft size={20} />
            </Button>
            <div>
              <h1 className="text-lg font-semibold text-foreground">素材预处理</h1>
              <p className="text-sm text-muted-foreground">train_station_raw_footage.mp4</p>
            </div>
          </div>
          <Button className="bg-emerald-600 hover:bg-emerald-700">
            <Download size={16} className="mr-2" />
            导出全部分镜
          </Button>
        </div>

        {/* Pipeline Progress */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-3">
            {PIPELINE_STEPS.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center transition-all",
                    getStepStatusStyle(step.status)
                  )}>
                    {step.status === "completed" ? (
                      <Check size={18} />
                    ) : step.status === "processing" ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <step.icon size={18} />
                    )}
                  </div>
                  <span className={cn(
                    "text-xs mt-2 font-medium",
                    step.status === "pending" ? "text-muted-foreground" : "text-foreground"
                  )}>
                    {step.name}
                  </span>
                </div>
                {index < PIPELINE_STEPS.length - 1 && (
                  <div className={cn(
                    "w-24 h-0.5 mx-2",
                    PIPELINE_STEPS[index + 1].status !== "pending" ? "bg-emerald-500" : "bg-muted"
                  )} />
                )}
              </div>
            ))}
          </div>
          <Progress value={getProgressValue()} className="h-1.5" />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Video Preview */}
        <div className="w-1/2 p-6 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-foreground">视频预览</h2>
            <div className="flex items-center gap-3 bg-muted rounded-full px-3 py-1.5">
              <span className={cn(
                "text-xs font-medium transition-colors",
                showOriginal ? "text-muted-foreground" : "text-foreground"
              )}>
                Cleaned
              </span>
              <Switch 
                checked={showOriginal} 
                onCheckedChange={setShowOriginal}
              />
              <span className={cn(
                "text-xs font-medium transition-colors",
                showOriginal ? "text-foreground" : "text-muted-foreground"
              )}>
                Original
              </span>
            </div>
          </div>

          {/* Video Player Area */}
          <div className="flex-1 bg-muted rounded-xl overflow-hidden relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className={cn(
                "w-full h-full flex items-center justify-center transition-all duration-300",
                showOriginal ? "bg-slate-700" : "bg-slate-800"
              )}>
                {showOriginal && (
                  <div className="absolute top-4 right-4 bg-red-500/80 text-white text-xs px-2 py-1 rounded">
                    水印示例
                  </div>
                )}
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-3 cursor-pointer hover:bg-white/30 transition-colors">
                    <Play size={28} className="text-white ml-1" />
                  </div>
                  <p className="text-white/80 text-sm">
                    {showOriginal ? "原始视频" : "处理后视频"}
                  </p>
                </div>
              </div>
            </div>

            {/* Comparison indicator */}
            <div className="absolute bottom-4 left-4 right-4">
              <div className="bg-black/60 backdrop-blur-sm rounded-lg px-4 py-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {showOriginal ? (
                    <EyeOff size={14} className="text-orange-400" />
                  ) : (
                    <Eye size={14} className="text-emerald-400" />
                  )}
                  <span className="text-white text-xs">
                    {showOriginal ? "显示原始画面（含水印/低画质）" : "显示处理后画面（已增强）"}
                  </span>
                </div>
                <span className="text-white/60 text-xs">00:26 / 00:26</span>
              </div>
            </div>
          </div>

          {/* Enhancement Stats */}
          {!showOriginal && (
            <div className="mt-4 grid grid-cols-3 gap-3">
              <div className="bg-emerald-50 dark:bg-emerald-950/30 rounded-lg p-3 text-center">
                <p className="text-emerald-600 dark:text-emerald-400 text-lg font-bold">100%</p>
                <p className="text-xs text-muted-foreground">水印移除</p>
              </div>
              <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-3 text-center">
                <p className="text-blue-600 dark:text-blue-400 text-lg font-bold">1080p</p>
                <p className="text-xs text-muted-foreground">画质提升</p>
              </div>
              <div className="bg-purple-50 dark:bg-purple-950/30 rounded-lg p-3 text-center">
                <p className="text-purple-600 dark:text-purple-400 text-lg font-bold">+15%</p>
                <p className="text-xs text-muted-foreground">清晰度增强</p>
              </div>
            </div>
          )}
        </div>

        {/* Right: Tag Editor */}
        <div className="w-1/2 border-l border-border p-6 overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
                <Sparkles size={16} className="text-primary" />
                智能标签
              </h2>
              <p className="text-xs text-muted-foreground mt-1">AI 自动识别，支持手动编辑</p>
            </div>
            <Badge variant="outline" className="text-xs">
              {Object.values(tags).flat().length} 个标签
            </Badge>
          </div>

          <div className="space-y-5">
            <TagCategory title="视觉标签" category="visual" color="bg-blue-500" />
            <TagCategory title="镜头标签" category="shot" color="bg-emerald-500" />
            <TagCategory title="情绪标签" category="emotion" color="bg-orange-500" />
            <TagCategory title="营销标签 (OTA专用)" category="marketing" color="bg-purple-500" />
          </div>

          {/* Scene Cuts Section */}
          <div className="mt-8 pt-6 border-t border-border">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
                  <Scissors size={16} className="text-primary" />
                  智能分镜
                </h2>
                <p className="text-xs text-muted-foreground mt-1">
                  自动识别 {MOCK_SCENE_CUTS.length} 个片段
                </p>
              </div>
              <Button variant="outline" size="sm">
                全部入库
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {MOCK_SCENE_CUTS.map((scene) => (
                <div 
                  key={scene.id}
                  className="group bg-card border border-border rounded-lg overflow-hidden hover:border-primary/50 transition-colors"
                >
                  {/* Thumbnail */}
                  <div className={cn(
                    "aspect-video relative",
                    scene.thumbnail
                  )}>
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center">
                        <Play size={14} className="text-slate-800 ml-0.5" />
                      </div>
                    </div>
                    <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded flex items-center gap-1">
                      <Clock size={10} />
                      {scene.duration}
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-2.5">
                    <p className="text-xs font-medium text-foreground truncate">
                      {scene.description}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {scene.startTime} - {scene.endTime}
                    </p>
                    <Button 
                      size="sm" 
                      variant={addedToLibrary.includes(scene.id) ? "secondary" : "default"}
                      className={cn(
                        "w-full mt-2 h-7 text-xs",
                        addedToLibrary.includes(scene.id) && "bg-emerald-100 text-emerald-700 hover:bg-emerald-100"
                      )}
                      onClick={() => handleAddToLibrary(scene.id)}
                      disabled={addedToLibrary.includes(scene.id)}
                    >
                      {addedToLibrary.includes(scene.id) ? (
                        <>
                          <Check size={12} className="mr-1" />
                          已入库
                        </>
                      ) : (
                        <>
                          <Database size={12} className="mr-1" />
                          入库
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MaterialPreprocessing;
