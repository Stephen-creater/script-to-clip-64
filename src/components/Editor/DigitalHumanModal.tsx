import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, User, Sliders } from "lucide-react";
import { Slider } from "@/components/ui/slider";

interface DigitalHumanModalProps {
  isOpen: boolean;
  onClose: () => void;
  segmentId: string;
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

export const DigitalHumanModal = ({ isOpen, onClose, segmentId }: DigitalHumanModalProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedHuman, setSelectedHuman] = useState<string>("");
  const [position, setPosition] = useState({ x: 50, y: 80 });
  const [scale, setScale] = useState([100]);
  const [selectedType, setSelectedType] = useState<string>("all");

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

  const handleSubmit = () => {
    if (!selectedHuman) return;
    console.log("Selected digital human:", {
      humanId: selectedHuman,
      position,
      scale: scale[0] / 100
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[900px] h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>配置数字人</DialogTitle>
          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
            <span>导出尺寸: 1080*1920</span>
          </div>
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
                  <div className="w-64 border-l border-border pl-4 space-y-4">
                    <div>
                      <h4 className="text-sm font-medium mb-3">预览</h4>
                      <div 
                        className="relative bg-gradient-to-br from-gray-900 to-gray-700 rounded-lg overflow-hidden" 
                        style={{ aspectRatio: '9/16', height: '200px' }}
                      >
                        <div 
                          className="absolute bg-white/20 border-2 border-primary rounded-lg flex items-center justify-center"
                          style={{
                            left: `${position.x}%`,
                            top: `${position.y}%`,
                            width: `${40 * scale[0] / 100}%`,
                            height: `${40 * scale[0] / 100}%`,
                            transform: `translate(-50%, -50%)`,
                          }}
                        >
                          <User size={32} className="text-primary" />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm mb-2 block">位置调整</Label>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Label className="text-xs w-12">水平</Label>
                            <Slider
                              value={[position.x]}
                              onValueChange={(value) => setPosition({ ...position, x: value[0] })}
                              min={0}
                              max={100}
                              step={1}
                              className="flex-1"
                            />
                            <span className="text-xs text-muted-foreground w-12 text-right">{position.x}%</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Label className="text-xs w-12">垂直</Label>
                            <Slider
                              value={[position.y]}
                              onValueChange={(value) => setPosition({ ...position, y: value[0] })}
                              min={0}
                              max={100}
                              step={1}
                              className="flex-1"
                            />
                            <span className="text-xs text-muted-foreground w-12 text-right">{position.y}%</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <Label className="text-sm mb-2 block">大小调整</Label>
                        <div className="flex items-center gap-2">
                          <Sliders size={14} className="text-muted-foreground" />
                          <Slider
                            value={scale}
                            onValueChange={setScale}
                            min={50}
                            max={150}
                            step={5}
                            className="flex-1"
                          />
                          <span className="text-xs text-muted-foreground w-12 text-right">{scale[0]}%</span>
                        </div>
                      </div>

                      <div className="pt-2 space-y-1">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={() => setPosition({ x: 20, y: 80 })}
                        >
                          左下角
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={() => setPosition({ x: 80, y: 80 })}
                        >
                          右下角
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={() => setPosition({ x: 50, y: 50 })}
                        >
                          居中
                        </Button>
                      </div>
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
              {selectedHuman ? "可以调整数字人的位置和大小" : "请先选择一个数字人"}
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={onClose}>
                取消
              </Button>
              <Button 
                onClick={handleSubmit} 
                disabled={!selectedHuman}
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
