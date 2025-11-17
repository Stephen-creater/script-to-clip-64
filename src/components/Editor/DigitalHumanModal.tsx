import { useState, useMemo, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Search, User, Move, ZoomIn, Loader2, RefreshCw, Sparkles, Lock, X } from "lucide-react";
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
  { id: "1", name: "商务男性", thumbnail: "/assets/stickers/test1.png", type: "professional" },
  { id: "2", name: "知性女性", thumbnail: "/assets/stickers/test2.png", type: "professional" },
  { id: "3", name: "年轻男性", thumbnail: "/assets/stickers/test1.png", type: "casual" },
  { id: "4", name: "年轻女性", thumbnail: "/assets/stickers/test2.png", type: "casual" },
  { id: "5", name: "卡通形象1", thumbnail: "/assets/stickers/test1.png", type: "cartoon" },
  { id: "6", name: "卡通形象2", thumbnail: "/assets/stickers/test2.png", type: "cartoon" },
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
  const [position, setPosition] = useState({ x: 50, y: 80 });
  const [scale, setScale] = useState(100);
  const [selectedType, setSelectedType] = useState<string>("all");
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const previewRef = useRef<HTMLDivElement>(null);
  const humanRef = useRef<HTMLDivElement>(null);

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

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!previewRef.current || selectedHumans.length === 0 || !isControlling) return;
    
    const target = e.target as HTMLElement;
    if (target.classList.contains('resize-handle')) {
      setIsResizing(true);
    } else {
      setIsDragging(true);
    }
    e.preventDefault();
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!previewRef.current || !humanRef.current) return;

    if (isDragging) {
      const rect = previewRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      
      setPosition({
        x: Math.max(10, Math.min(90, x)),
        y: Math.max(10, Math.min(90, y))
      });
    } else if (isResizing) {
      const rect = previewRef.current.getBoundingClientRect();
      const humanRect = humanRef.current.getBoundingClientRect();
      const centerX = humanRect.left + humanRect.width / 2;
      const centerY = humanRect.top + humanRect.height / 2;
      const distance = Math.sqrt(
        Math.pow(e.clientX - centerX, 2) + Math.pow(e.clientY - centerY, 2)
      );
      const baseDistance = Math.min(rect.width, rect.height) * 0.2;
      const newScale = Math.max(50, Math.min(150, (distance / baseDistance) * 100));
      setScale(newScale);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
  };

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
      title: `${isRegenerate ? "重新" : "开始"}生成分段 ${segmentId} 的数字人...`,
      description: "预计需要约60秒，请耐心等待",
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
          position,
          scale: scale / 100
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
          {isGenerating && (
            <div className="mt-3 space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>正在生成数字人... {progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}
        </DialogHeader>

        <div className="flex-1 flex gap-4 overflow-hidden">
          <div className="w-[40%] flex flex-col gap-3">
            <div className="space-y-2">
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

            <div className="space-y-2">
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

            <ScrollArea className="flex-1">
              <div className="grid grid-cols-2 gap-2 pr-2">
                {filteredHumans.map((human) => {
                  const isSelected = selectedHumans.includes(human.id);
                  const selectionIndex = selectedHumans.indexOf(human.id);
                  
                  return (
                    <button
                      key={human.id}
                      onClick={() => handleHumanSelect(human.id)}
                      disabled={!isControlling}
                      className={cn(
                        "relative p-3 rounded-lg border-2 transition-all",
                        "hover:border-primary/50 hover:shadow-md",
                        "disabled:opacity-50 disabled:cursor-not-allowed",
                        isSelected 
                          ? "border-primary bg-primary/10" 
                          : "border-border"
                      )}
                    >
                      <div className="aspect-[3/4] bg-muted rounded-md mb-2 overflow-hidden">
                        <img 
                          src={human.thumbnail} 
                          alt={human.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="text-sm font-medium text-center">{human.name}</div>
                      {isSelected && (
                        <div className="absolute top-1 right-1 h-6 w-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold">
                          {selectionIndex + 1}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </ScrollArea>

            {selectedHumans.length > 0 && isControlling && (
              <div className="pt-2 border-t border-border">
                <div className="text-sm font-medium mb-2">已选择的数字人:</div>
                <div className="flex flex-wrap gap-2">
                  {selectedHumans.map((humanId, index) => {
                    const human = DIGITAL_HUMAN_TEMPLATES.find(h => h.id === humanId);
                    return (
                      <div 
                        key={humanId}
                        className="flex items-center gap-1 px-2 py-1 rounded-md bg-primary/10 text-sm"
                      >
                        <span className="font-bold text-primary">{index + 1}.</span>
                        <span>{human?.name}</span>
                        <button
                          onClick={() => handleRemoveHuman(humanId)}
                          className="ml-1 hover:text-destructive"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="flex-1 flex flex-col gap-3">
            <div className="space-y-2">
              <Label>预览 (1080*1920)</Label>
              <div 
                ref={previewRef}
                className="aspect-[9/16] bg-muted rounded-lg relative overflow-hidden border-2 border-border cursor-move"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              >
                {generatedHumans.length > 0 ? (
                  <div
                    ref={humanRef}
                    className="absolute"
                    style={{
                      left: `${position.x}%`,
                      top: `${position.y}%`,
                      transform: `translate(-50%, -50%) scale(${scale / 100})`,
                      transition: isDragging || isResizing ? 'none' : 'transform 0.2s',
                      cursor: isDragging ? 'grabbing' : 'grab'
                    }}
                  >
                    <div className="relative">
                      <User size={80} className="text-primary" />
                      <div className="absolute -top-2 -right-2 flex gap-1">
                        {generatedHumans.map((_, index) => (
                          <div 
                            key={index}
                            className="h-5 w-5 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center font-bold"
                          >
                            {index + 1}
                          </div>
                        ))}
                      </div>
                      {isControlling && (
                        <div className="absolute -bottom-2 -right-2 resize-handle h-4 w-4 bg-primary rounded-full cursor-nwse-resize" />
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <User size={48} className="mx-auto mb-2 opacity-50" />
                      <p className="text-sm">选择并生成数字人后可预览</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-xs flex items-center gap-1">
                  <Move size={12} />
                  位置调整
                </Label>
                <p className="text-xs text-muted-foreground">
                  {isControlling ? "拖拽数字人调整位置" : "只读模式"}
                </p>
              </div>
              <div className="space-y-1">
                <Label className="text-xs flex items-center gap-1">
                  <ZoomIn size={12} />
                  大小: {scale}%
                </Label>
                <p className="text-xs text-muted-foreground">
                  {isControlling ? "拖拽右下角调整大小" : "只读模式"}
                </p>
              </div>
            </div>
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
