import { useState, useMemo, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Search, User, Move, ZoomIn, Loader2, RefreshCw, Sparkles } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface DigitalHumanModalProps {
  isOpen: boolean;
  onClose: () => void;
  segmentId: string;
  onSubmit?: (segmentId: string, data: any) => void;
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

export const DigitalHumanModal = ({ isOpen, onClose, segmentId, onSubmit }: DigitalHumanModalProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedHuman, setSelectedHuman] = useState<string>("");
  const [position, setPosition] = useState({ x: 50, y: 80 });
  const [scale, setScale] = useState(100);
  const [selectedType, setSelectedType] = useState<string>("all");
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedHuman, setGeneratedHuman] = useState<string>("");
  const [progress, setProgress] = useState(0);
  const previewRef = useRef<HTMLDivElement>(null);
  const humanRef = useRef<HTMLDivElement>(null);

  const filteredHumans = useMemo(() => {
    let filtered = DIGITAL_HUMAN_TEMPLATES;

    // 按类型筛选
    if (selectedType !== "all") {
      filtered = filtered.filter(h => h.type === selectedType);
    }

    // 按搜索关键词筛选
    if (searchQuery) {
      filtered = filtered.filter(h => 
        h.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  }, [selectedType, searchQuery]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!previewRef.current || !selectedHuman) return;
    
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

  // 模拟生成数字人的API调用
  const handleGenerate = async (isRegenerate = false) => {
    if (!selectedHuman) {
      toast({
        title: "请先选择数字人模板",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    setProgress(0);
    // 如果是重新生成，清空之前的结果
    if (isRegenerate) {
      setGeneratedHuman("");
    }

    toast({
      title: `${isRegenerate ? "重新" : "开始"}生成分段 ${segmentId} 的数字人...`,
      description: "预计需要约60秒，请耐心等待",
    });

    // 模拟进度更新 - 实际5秒完成，但显示60秒
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) {
          clearInterval(progressInterval);
          return 95;
        }
        return prev + 2; // 每次增加2%，5秒完成
      });
    }, 100); // 每0.1秒更新一次

    // 模拟API调用 - 实际5秒
    try {
      await new Promise(resolve => setTimeout(resolve, 5000)); // 5秒延迟（测试用）
      
      // 确保先清除interval
      clearInterval(progressInterval);
      
      // 然后按顺序更新状态
      setProgress(100);
      
      // 使用setTimeout确保状态更新的顺序
      setTimeout(() => {
        setGeneratedHuman(selectedHuman);
        setIsGenerating(false);
        
        toast({
          title: `分段 ${segmentId} 生成成功！`,
          description: "数字人已生成，您可以调整位置和大小",
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
    if (!generatedHuman) {
      toast({
        title: "请先生成数字人",
        variant: "destructive",
      });
      return;
    }
    
    // 获取选中的数字人模板信息
    const selectedTemplate = DIGITAL_HUMAN_TEMPLATES.find(h => h.id === generatedHuman);
    
    // 调用onSubmit回调更新分段状态
    if (onSubmit) {
      onSubmit(segmentId, {
        humanId: generatedHuman,
        humanName: selectedTemplate?.name || "已配置",
        position,
        scale: scale / 100
      });
    }
    
    console.log("Selected digital human:", {
      humanId: generatedHuman,
      position,
      scale: scale / 100
    });
    onClose();
  };

  // 当弹窗打开且有已生成的数字人时，自动选中对应的模板
  useEffect(() => {
    if (isOpen && generatedHuman && !selectedHuman) {
      setSelectedHuman(generatedHuman);
    }
  }, [isOpen, generatedHuman, selectedHuman]);

  // 当关闭弹窗时只重置生成中的状态，保留已生成的结果
  useEffect(() => {
    if (!isOpen) {
      // 只重置正在进行的生成，保留已完成的结果
      if (!generatedHuman) {
        setIsGenerating(false);
        setProgress(0);
      }
    }
  }, [isOpen, generatedHuman]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[900px] h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>配置数字人 - 分段 {segmentId}</DialogTitle>
          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
            <span>导出尺寸: 1080*1920</span>
          </div>
          {isGenerating && (
            <div className="mt-3 p-4 bg-blue-500/10 border border-blue-500/30 rounded-md space-y-3">
              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                <Loader2 className="animate-spin" size={16} />
                <span className="text-sm font-medium">正在生成分段 {segmentId} 的数字人...</span>
              </div>
              <div className="space-y-2">
                <Progress value={progress} className="h-2" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>预计剩余时间: {Math.ceil((100 - progress) * 0.6)}秒</span>
                  <span>{progress}%</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                💡 生成过程较长，您可以先去处理其他事项，生成完成后会有提示
              </p>
            </div>
          )}
        </DialogHeader>
        
        <div className="flex-1 min-h-0">
          <ScrollArea className="h-full pr-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Select value={selectedType} onValueChange={setSelectedType}>
                    <SelectTrigger className="w-[160px]">
                      <SelectValue placeholder="选择类型" />
                    </SelectTrigger>
                    <SelectContent className="z-50 bg-popover">
                      <SelectItem value="all">全部类型</SelectItem>
                      <SelectItem value="professional">商务专业</SelectItem>
                      <SelectItem value="casual">年轻活力</SelectItem>
                      <SelectItem value="cartoon">卡通形象</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Enter搜索"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-[200px]"
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <div className="grid grid-cols-4 gap-4">
                    {filteredHumans.map(human => (
                      <div
                        key={human.id}
                        className={`relative cursor-pointer border-2 rounded-lg p-3 transition-colors ${
                          selectedHuman === human.id
                            ? 'border-primary bg-primary/10' 
                            : 'border-border hover:border-primary/50'
                        }`}
                        onClick={() => setSelectedHuman(human.id)}
                      >
                        <div className="aspect-square bg-muted rounded flex items-center justify-center mb-2">
                          <User size={48} className="text-muted-foreground" />
                        </div>
                        <p className="text-xs text-center truncate font-medium">{human.name}</p>
                      </div>
                    ))}
                  </div>
                  
                  {filteredHumans.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                      <User size={48} className="mb-4" />
                      <p>未找到匹配的数字人</p>
                      <p className="text-sm">请尝试其他搜索条件</p>
                    </div>
                  )}
                </div>

                {selectedHuman && (
                  <div className="w-80 border-l border-border pl-4 space-y-4">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium">预览区域</h4>
                        {generatedHuman && !isGenerating && (
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Move size={14} />
                            <span>拖动调整</span>
                            <ZoomIn size={14} className="ml-2" />
                            <span>边角缩放</span>
                          </div>
                        )}
                      </div>
                      
                      <div 
                        ref={previewRef}
                        className="relative rounded-lg overflow-hidden select-none" 
                        style={{ 
                          aspectRatio: '9/16', 
                          height: '320px',
                          backgroundImage: 'linear-gradient(hsl(var(--border)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--border)) 1px, transparent 1px)',
                          backgroundSize: '20px 20px',
                          backgroundColor: 'hsl(var(--muted) / 0.3)'
                        }}
                        onMouseMove={generatedHuman && !isGenerating ? handleMouseMove : undefined}
                        onMouseUp={generatedHuman && !isGenerating ? handleMouseUp : undefined}
                        onMouseLeave={generatedHuman && !isGenerating ? handleMouseUp : undefined}
                      >
                        {!generatedHuman && !isGenerating && (
                          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                            <div className="text-center space-y-2">
                              <User size={48} className="mx-auto opacity-50" />
                              <p className="text-sm">点击下方按钮生成数字人</p>
                            </div>
                          </div>
                        )}
                        
                        {isGenerating && (
                          <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm">
                            <div className="text-center space-y-3">
                              <Loader2 size={48} className="mx-auto animate-spin text-primary" />
                              <p className="text-sm font-medium">AI正在创作中...</p>
                              <p className="text-xs text-muted-foreground">请稍候片刻</p>
                            </div>
                          </div>
                        )}
                        
                        {generatedHuman && !isGenerating && (
                          <div 
                            ref={humanRef}
                            className="absolute bg-white/20 border-2 border-primary rounded-lg flex items-center justify-center transition-none cursor-move"
                            style={{
                              left: `${position.x}%`,
                              top: `${position.y}%`,
                              width: `${40 * scale / 100}%`,
                              height: `${40 * scale / 100}%`,
                              transform: `translate(-50%, -50%)`,
                              cursor: isDragging ? 'grabbing' : 'grab'
                            }}
                            onMouseDown={handleMouseDown}
                          >
                            <User size={32} className="text-primary pointer-events-none" />
                            
                            {/* 四个角的缩放手柄 */}
                            <div 
                              className="resize-handle absolute -top-1 -left-1 w-3 h-3 bg-primary rounded-full cursor-nwse-resize hover:scale-125 transition-transform"
                              onMouseDown={handleMouseDown}
                            />
                            <div 
                              className="resize-handle absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full cursor-nesw-resize hover:scale-125 transition-transform"
                              onMouseDown={handleMouseDown}
                            />
                            <div 
                              className="resize-handle absolute -bottom-1 -left-1 w-3 h-3 bg-primary rounded-full cursor-nesw-resize hover:scale-125 transition-transform"
                              onMouseDown={handleMouseDown}
                            />
                            <div 
                              className="resize-handle absolute -bottom-1 -right-1 w-3 h-3 bg-primary rounded-full cursor-nwse-resize hover:scale-125 transition-transform"
                              onMouseDown={handleMouseDown}
                            />
                          </div>
                        )}
                        
                        {generatedHuman && !isGenerating && (
                          <div className="absolute bottom-2 left-2 right-2 text-center text-xs text-white/60 bg-black/30 rounded px-2 py-1">
                            位置: {Math.round(position.x)}%, {Math.round(position.y)}% | 大小: {Math.round(scale)}%
                          </div>
                        )}
                      </div>

                      {/* 生成按钮移到预览下方 */}
                      {!generatedHuman && !isGenerating && (
                        <div>
                          <Button 
                            onClick={() => handleGenerate(false)} 
                            className="w-full"
                            size="lg"
                          >
                            <Sparkles className="mr-2" size={16} />
                            生成数字人
                          </Button>
                          <p className="text-xs text-muted-foreground mt-2 text-center">
                            ⏱️ 生成需要约60秒
                          </p>
                        </div>
                      )}
                      
                      {generatedHuman && !isGenerating && (
                        <Button 
                          onClick={() => handleGenerate(true)} 
                          variant="outline"
                          className="w-full"
                        >
                          <RefreshCw className="mr-2" size={16} />
                          重新生成
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </ScrollArea>
        </div>

        <DialogFooter className="border-t border-border pt-4">
          <div className="flex justify-between items-center w-full">
            <div className="text-sm text-muted-foreground">
              {!selectedHuman && "请先选择一个数字人模板"}
              {selectedHuman && !generatedHuman && !isGenerating && "选择模板后点击生成数字人"}
              {isGenerating && "生成中，请耐心等待..."}
              {generatedHuman && !isGenerating && "可以调整数字人的位置和大小"}
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={onClose} disabled={isGenerating}>
                取消
              </Button>
              <Button 
                onClick={handleSubmit} 
                disabled={!generatedHuman || isGenerating}
                className="bg-accent text-accent-foreground"
              >
                确定
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
