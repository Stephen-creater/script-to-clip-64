import { useState, useMemo, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Search, User, Loader2, RefreshCw, Sparkles, Lock, X } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface DigitalHuman {
  id: string;
  name: string;
  position: { x: number; y: number };
  scale: number;
}

interface DigitalHumanModalProps {
  isOpen: boolean;
  onClose: () => void;
  segmentId: string;
  onSubmit?: (segmentId: string, digitalHumans: DigitalHuman[]) => void;
  currentDigitalHumans?: DigitalHuman[];
  isControlling?: boolean;
  controllingSegmentName?: string | null;
}

// 预设数字人模板
const DIGITAL_HUMAN_TEMPLATES = [
  { id: "1", name: "商务男性", type: "professional", gender: "male" },
  { id: "2", name: "知性女性", type: "professional", gender: "female" },
  { id: "3", name: "年轻男性", type: "casual", gender: "male" },
  { id: "4", name: "年轻女性", type: "casual", gender: "female" },
  { id: "5", name: "活力男生", type: "casual", gender: "male" },
  { id: "6", name: "清新女生", type: "casual", gender: "female" },
  { id: "7", name: "卡通男孩", type: "cartoon", gender: "male" },
  { id: "8", name: "卡通女孩", type: "cartoon", gender: "female" },
];

const MAX_DIGITAL_HUMANS = 3;

export const DigitalHumanModal = ({ 
  isOpen, 
  onClose, 
  segmentId, 
  onSubmit,
  currentDigitalHumans = [],
  isControlling = true,
  controllingSegmentName = null
}: DigitalHumanModalProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedHumans, setSelectedHumans] = useState<string[]>([]);
  const [generatedHumans, setGeneratedHumans] = useState<DigitalHuman[]>([]);
  const [selectedType, setSelectedType] = useState<string>("all");
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);

  // 初始化已配置的数字人
  useEffect(() => {
    if (isOpen && currentDigitalHumans.length > 0) {
      setGeneratedHumans(currentDigitalHumans);
      setSelectedHumans(currentDigitalHumans.map(h => h.id));
    }
  }, [isOpen, currentDigitalHumans]);

  const filteredHumans = useMemo(() => {
    let filtered = DIGITAL_HUMAN_TEMPLATES;

    if (selectedType !== "all") {
      filtered = filtered.filter(h => h.type === selectedType);
    }

    if (searchQuery) {
      filtered = filtered.filter(h => 
        h.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  }, [selectedType, searchQuery]);


  const handleHumanSelect = (humanId: string) => {
    if (!isControlling) {
      toast({
        title: "无法修改",
        description: `此分段的数字人配置由${controllingSegmentName}统一管理`,
        variant: "destructive",
      });
      return;
    }

    if (selectedHumans.includes(humanId)) {
      setSelectedHumans(selectedHumans.filter(id => id !== humanId));
    } else {
      if (selectedHumans.length >= MAX_DIGITAL_HUMANS) {
        toast({
          title: `最多只能选择${MAX_DIGITAL_HUMANS}个数字人`,
          variant: "destructive",
        });
        return;
      }
      setSelectedHumans([...selectedHumans, humanId]);
    }
  };

  const handleGenerate = async (isRegenerate = false) => {
    if (!isControlling) {
      toast({
        title: "无法生成",
        description: `此分段的数字人配置由${controllingSegmentName}统一管理`,
        variant: "destructive",
      });
      return;
    }

    if (selectedHumans.length === 0) {
      toast({
        title: "请先选择数字人模板",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    setProgress(0);
    if (isRegenerate) {
      setGeneratedHumans([]);
    }

    toast({
      title: `${isRegenerate ? "重新" : "开始"}生成数字人...`,
      description: "预计需要约2分钟，请耐心等待",
    });

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) {
          clearInterval(progressInterval);
          return 95;
        }
        return prev + 2;
      });
    }, 100);

    try {
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      clearInterval(progressInterval);
      setProgress(100);
      
      setTimeout(() => {
        const newGeneratedHumans = selectedHumans.map(humanId => ({
          id: humanId,
          name: DIGITAL_HUMAN_TEMPLATES.find(h => h.id === humanId)?.name || "未知",
          position: { x: 50, y: 80 },
          scale: 1
        }));
        
        setGeneratedHumans(newGeneratedHumans);
        setIsGenerating(false);
        
        toast({
          title: `分段 ${segmentId} 生成成功！`,
          description: `已生成${selectedHumans.length}个数字人`,
        });
      }, 100);
      
    } catch (error) {
      clearInterval(progressInterval);
      setIsGenerating(false);
      setProgress(0);
      toast({
        title: `分段 ${segmentId} 生成失败`,
        description: "请稍后重试",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = () => {
    if (!isControlling) {
      toast({
        title: "无法保存",
        description: `此分段的数字人配置由${controllingSegmentName}统一管理`,
        variant: "destructive",
      });
      return;
    }

    if (generatedHumans.length === 0) {
      toast({
        title: "请先生成数字人",
        variant: "destructive",
      });
      return;
    }
    
    if (onSubmit) {
      onSubmit(segmentId, generatedHumans);
    }
    
    console.log("Selected digital humans:", generatedHumans);
    onClose();
  };

  const handleRemoveHuman = (humanId: string) => {
    if (!isControlling) {
      toast({
        title: "无法删除",
        description: `此分段的数字人配置由${controllingSegmentName}统一管理`,
        variant: "destructive",
      });
      return;
    }
    setSelectedHumans(selectedHumans.filter(id => id !== humanId));
    setGeneratedHumans(generatedHumans.filter(h => h.id !== humanId));
  };

  useEffect(() => {
    if (!isOpen) {
      if (generatedHumans.length === 0) {
        setIsGenerating(false);
        setProgress(0);
        setSelectedHumans([]);
      }
    }
  }, [isOpen, generatedHumans.length]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[900px] h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>配置数字人 - 分段 {segmentId}</span>
            {!isControlling && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground font-normal">
                <Lock size={14} />
                <span>由{controllingSegmentName}统一管理</span>
              </div>
            )}
          </DialogTitle>
          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
            <span>导出尺寸: 1080*1920</span>
            <span>已选择: {selectedHumans.length}/{MAX_DIGITAL_HUMANS}</span>
          </div>
        </DialogHeader>

        <div className="flex-1 flex gap-6 overflow-hidden">
          {/* Left: Template Selection */}
          <div className="w-[45%] flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="flex-1 space-y-2">
                <Label>搜索数字人</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
                  <Input
                    placeholder="搜索数字人名称..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                    disabled={!isControlling}
                  />
                </div>
              </div>

              <div className="w-[180px] space-y-2">
                <Label>筛选类型</Label>
                <Select value={selectedType} onValueChange={setSelectedType} disabled={!isControlling}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部类型</SelectItem>
                    <SelectItem value="professional">商务专业</SelectItem>
                    <SelectItem value="casual">休闲自然</SelectItem>
                    <SelectItem value="cartoon">卡通形象</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <ScrollArea className="flex-1">
              <div className="grid grid-cols-4 gap-3 pr-2">
                {filteredHumans.map((human) => {
                  const isSelected = selectedHumans.includes(human.id);
                  const selectionIndex = selectedHumans.indexOf(human.id);
                  
                  return (
                    <button
                      key={human.id}
                      onClick={() => handleHumanSelect(human.id)}
                      disabled={!isControlling}
                      className={cn(
                        "relative p-4 rounded-lg border-2 transition-all",
                        "hover:border-primary/50 hover:shadow-lg hover:scale-105",
                        "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100",
                        "flex flex-col items-center gap-3",
                        isSelected 
                          ? "border-primary bg-primary/10 shadow-md" 
                          : "border-border"
                      )}
                    >
                      <div className={cn(
                        "w-16 h-16 rounded-full flex items-center justify-center transition-all",
                        isSelected ? "bg-primary/20" : "bg-muted"
                      )}>
                        <User size={32} className={cn(
                          "transition-colors",
                          isSelected ? "text-primary" : "text-muted-foreground"
                        )} />
                      </div>
                      <div className="text-sm font-medium text-center">{human.name}</div>
                      {isSelected && (
                        <div className="absolute -top-2 -right-2 h-7 w-7 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold shadow-lg">
                          {selectionIndex + 1}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </ScrollArea>

            {selectedHumans.length > 0 && (
              <div className="pt-3 border-t border-border">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-medium">已选择 {selectedHumans.length}/{MAX_DIGITAL_HUMANS}</div>
                  {isControlling && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedHumans([]);
                        setGeneratedHumans([]);
                      }}
                      className="h-7 text-xs"
                    >
                      清空
                    </Button>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedHumans.map((humanId, index) => {
                    const human = DIGITAL_HUMAN_TEMPLATES.find(h => h.id === humanId);
                    return (
                      <div 
                        key={humanId}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-sm border border-primary/20"
                      >
                        <span className="flex items-center justify-center h-5 w-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold">
                          {index + 1}
                        </span>
                        <span className="font-medium">{human?.name}</span>
                        {isControlling && (
                          <button
                            onClick={() => handleRemoveHuman(humanId)}
                            className="ml-1 hover:text-destructive transition-colors"
                          >
                            <X size={14} />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Right: Preview */}
          <div className="flex-1 flex flex-col gap-3 relative">
            <Label>预览效果</Label>
            <div 
              className="relative flex-1 bg-muted rounded-lg overflow-hidden"
              style={{ aspectRatio: '9/16' }}
            >
              {/* 1080*1920 Preview Frame */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-sm text-muted-foreground">1080 × 1920</div>
              </div>

              {/* Digital Humans Preview */}
              {generatedHumans.map((human, index) => (
                <div
                  key={human.id}
                  className="absolute"
                  style={{
                    left: `${human.position.x}%`,
                    top: `${human.position.y}%`,
                    transform: `translate(-50%, -50%) scale(${human.scale})`,
                  }}
                >
                  <div className="relative">
                    <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center">
                      <User size={40} className="text-primary" />
                    </div>
                    <div className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold shadow-lg">
                      {index + 1}
                    </div>
                  </div>
                </div>
              ))}

              {/* Instructions */}
              {generatedHumans.length === 0 && !isGenerating && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-muted-foreground space-y-2">
                    <User size={48} className="mx-auto opacity-30" />
                    <div className="text-sm">选择数字人后点击生成</div>
                  </div>
                </div>
              )}
            </div>

            {/* Progress indicator - bottom right */}
            {isGenerating && (
              <div className="absolute bottom-4 right-4 bg-primary text-primary-foreground rounded-lg p-4 shadow-xl min-w-[240px]">
                <div className="flex items-center gap-3 mb-3">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span className="font-semibold">正在生成数字人...</span>
                </div>
                <Progress value={progress} className="h-3 bg-primary-foreground/20" />
                <div className="flex justify-between mt-2 text-sm">
                  <span>{progress}%</span>
                  <span>预计约2分钟</span>
                </div>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="flex items-center justify-between">
          <div className="flex gap-2">
            {isControlling && (
              <>
                {generatedHumans.length === 0 ? (
                  <Button
                    onClick={() => handleGenerate(false)}
                    disabled={isGenerating || selectedHumans.length === 0}
                    className="gap-2"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        生成中...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4" />
                        生成数字人
                      </>
                    )}
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    onClick={() => handleGenerate(true)}
                    disabled={isGenerating}
                    className="gap-2"
                  >
                    <RefreshCw className="h-4 w-4" />
                    重新生成
                  </Button>
                )}
              </>
            )}
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              {isControlling ? "取消" : "关闭"}
            </Button>
            {isControlling && (
              <Button onClick={handleSubmit} disabled={generatedHumans.length === 0}>
                确定
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
