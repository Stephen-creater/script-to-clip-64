import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GripVertical, Plus, Trash2, X, Settings2, Type } from "lucide-react";
import { cn } from "@/lib/utils";

interface StickerItem {
  id: string;
  type: 'text' | 'sticker';
  content: string;
  fontTemplate?: string;
  fontFamily?: string;
  fontSize: number;
  delayTime: number;
  position: { x: number; y: number };
}

interface StickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  segmentId: string;
  onSubmit?: (items: StickerItem[]) => void;
}

const fontTemplates = [
  { id: "template1", name: "模板1 - 标准白字" },
  { id: "template2", name: "模板2 - 渐变紫字" },
  { id: "template3", name: "模板3 - 描边黄字" },
];

const fontFamilies = [
  { id: "default", name: "默认字体" },
  { id: "songti", name: "宋体" },
  { id: "heiti", name: "黑体" },
  { id: "kaiti", name: "楷体" },
  { id: "caveat", name: "Caveat Brush" },
];

export const StickerModal = ({ isOpen, onClose, segmentId, onSubmit }: StickerModalProps) => {
  const [items, setItems] = useState<StickerItem[]>([
    {
      id: "1",
      type: 'text',
      content: "花字示例文案",
      fontTemplate: "",
      fontFamily: "",
      fontSize: 80,
      delayTime: 0,
      position: { x: 50, y: 20 }
    }
  ]);
  const [selectedItemId, setSelectedItemId] = useState<string>("1");

  const selectedItem = items.find(item => item.id === selectedItemId);

  const handleAddText = () => {
    const newItem: StickerItem = {
      id: Date.now().toString(),
      type: 'text',
      content: "新花字文案",
      fontTemplate: "",
      fontFamily: "",
      fontSize: 80,
      delayTime: 0,
      position: { x: 50, y: 30 + items.length * 10 }
    };
    setItems([...items, newItem]);
    setSelectedItemId(newItem.id);
  };

  const handleAddSticker = () => {
    const newItem: StickerItem = {
      id: Date.now().toString(),
      type: 'sticker',
      content: "贴纸",
      fontTemplate: "",
      fontFamily: "",
      fontSize: 80,
      delayTime: 0,
      position: { x: 50, y: 30 + items.length * 10 }
    };
    setItems([...items, newItem]);
    setSelectedItemId(newItem.id);
  };

  const handleDeleteItem = (id: string) => {
    const newItems = items.filter(item => item.id !== id);
    setItems(newItems);
    if (selectedItemId === id && newItems.length > 0) {
      setSelectedItemId(newItems[0].id);
    } else if (newItems.length === 0) {
      setSelectedItemId("");
    }
  };

  const handleUpdateItem = (id: string, updates: Partial<StickerItem>) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, ...updates } : item
    ));
  };

  const handleClearSelection = () => {
    setSelectedItemId("");
  };

  const handleSubmit = () => {
    onSubmit?.(items);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[85vh] p-0 gap-0">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle>花字/贴纸设置</DialogTitle>
        </DialogHeader>

        <div className="flex flex-1 min-h-[500px]">
          {/* 左侧 - 已添加列表 */}
          <div className="w-[280px] border-r flex flex-col">
            <div className="p-4 border-b flex items-center justify-between">
              <div>
                <span className="text-sm font-medium">已添加花字/贴纸</span>
                <span className="text-sm text-muted-foreground ml-1">({items.length})</span>
                <p className="text-xs text-muted-foreground mt-1">拖拽调整层级 (越靠上层级越高)</p>
              </div>
              <div className="flex flex-col gap-1">
                <Button size="sm" variant="default" className="h-7 text-xs gap-1" onClick={handleAddText}>
                  <Plus size={12} />
                  添加花字
                </Button>
                <Button size="sm" variant="default" className="h-7 text-xs gap-1" onClick={handleAddSticker}>
                  <Plus size={12} />
                  添加贴纸
                </Button>
              </div>
            </div>
            
            <ScrollArea className="flex-1">
              <div className="p-3 space-y-2">
                {items.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setSelectedItemId(item.id)}
                    className={cn(
                      "flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-all group",
                      selectedItemId === item.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    <GripVertical size={16} className="text-muted-foreground cursor-grab flex-shrink-0" />
                    <div className="w-10 h-10 rounded bg-muted flex items-center justify-center flex-shrink-0">
                      <Type size={20} className="text-muted-foreground" />
                    </div>
                    <span className="flex-1 text-sm truncate">{item.content}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 opacity-0 group-hover:opacity-100 text-destructive hover:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteItem(item.id);
                      }}
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                ))}
                {items.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    暂无花字/贴纸，点击上方按钮添加
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* 中间 - 设置面板 */}
          <div className="w-[320px] border-r flex flex-col">
            {selectedItem ? (
              <>
                <div className="p-4 border-b flex items-center justify-between">
                  <span className="text-sm font-medium">当前花字设置</span>
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleClearSelection}>
                    <X size={14} />
                  </Button>
                </div>
                <ScrollArea className="flex-1">
                  <div className="p-4 space-y-5">
                    {/* 花字文本 */}
                    <div className="space-y-2">
                      <Label className="text-sm">花字文本</Label>
                      <div className="relative">
                        <Textarea
                          value={selectedItem.content}
                          onChange={(e) => handleUpdateItem(selectedItem.id, { content: e.target.value })}
                          placeholder="请输入花字文本"
                          className="min-h-[80px] resize-none pr-12"
                          maxLength={100}
                        />
                        <span className="absolute bottom-2 right-2 text-xs text-muted-foreground">
                          {selectedItem.content.length} / 100
                        </span>
                      </div>
                    </div>

                    {/* 字体样式模板 */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm">
                          字体样式模板<span className="text-destructive">*</span>
                        </Label>
                        <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs">
                          <Settings2 size={12} />
                          管理
                        </Button>
                      </div>
                      <Select
                        value={selectedItem.fontTemplate || ""}
                        onValueChange={(value) => handleUpdateItem(selectedItem.id, { fontTemplate: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="请选择花字字体样式模板（必填）" />
                        </SelectTrigger>
                        <SelectContent>
                          {fontTemplates.map((template) => (
                            <SelectItem key={template.id} value={template.id}>
                              {template.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* 自定义设置 */}
                    <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
                      <h4 className="text-sm font-medium">自定义设置（覆盖模板）</h4>
                      
                      {/* 字体 */}
                      <div className="space-y-2">
                        <Label className="text-sm">
                          字体<span className="text-destructive">*</span>
                        </Label>
                        <Select
                          value={selectedItem.fontFamily || ""}
                          onValueChange={(value) => handleUpdateItem(selectedItem.id, { fontFamily: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="请选择字体（必填）" />
                          </SelectTrigger>
                          <SelectContent>
                            {fontFamilies.map((font) => (
                              <SelectItem key={font.id} value={font.id}>
                                {font.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">设置后将覆盖模板中的字体</p>
                      </div>

                      {/* 字体大小 */}
                      <div className="space-y-2">
                        <Label className="text-sm">字体大小</Label>
                        <p className="text-sm text-muted-foreground">当前: {selectedItem.fontSize} px</p>
                        <Slider
                          value={[selectedItem.fontSize]}
                          onValueChange={(value) => handleUpdateItem(selectedItem.id, { fontSize: value[0] })}
                          min={12}
                          max={200}
                          step={1}
                          className="w-full"
                        />
                        <p className="text-xs text-muted-foreground">描边宽度、阴影偏移和阴影模糊会根据字体大小等比缩放</p>
                      </div>
                    </div>

                    {/* 时间设置 */}
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium">时间设置</h4>
                      <div className="flex items-center gap-3">
                        <Label className="text-sm whitespace-nowrap">延时时间 ⓘ</Label>
                        <div className="flex items-center gap-2 flex-1">
                          <Input
                            type="number"
                            value={selectedItem.delayTime}
                            onChange={(e) => handleUpdateItem(selectedItem.id, { delayTime: parseFloat(e.target.value) || 0 })}
                            className="w-20 text-center"
                            step="0.1"
                            min="0"
                          />
                          <span className="text-sm text-muted-foreground">秒</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </ScrollArea>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
                请选择左侧的花字/贴纸进行编辑
              </div>
            )}
          </div>

          {/* 右侧 - 预览 */}
          <div className="flex-1 flex flex-col">
            <div className="p-4 border-b">
              <span className="text-sm font-medium">花字/贴纸预览</span>
              <span className="text-sm text-muted-foreground ml-2">(9:16 竖屏)</span>
            </div>
            <div className="flex-1 p-4 flex items-center justify-center bg-muted/30">
              <div 
                className="relative rounded-lg overflow-hidden shadow-lg"
                style={{ 
                  width: '200px',
                  aspectRatio: '9/16',
                  background: 'linear-gradient(135deg, hsl(270 50% 60%) 0%, hsl(280 60% 50%) 50%, hsl(260 50% 55%) 100%)'
                }}
              >
                {/* Grid overlay */}
                <div 
                  className="absolute inset-0 opacity-20"
                  style={{
                    backgroundImage: 'linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)',
                    backgroundSize: '20px 20px'
                  }}
                />
                
                {/* Center dot */}
                <div className="absolute left-1/2 top-1/2 w-2 h-2 bg-white rounded-full transform -translate-x-1/2 -translate-y-1/2 opacity-60" />
                
                {/* Render items */}
                {items.map((item) => (
                  <div
                    key={item.id}
                    className={cn(
                      "absolute text-white font-bold transition-all",
                      selectedItemId === item.id && "ring-2 ring-white ring-offset-2 ring-offset-transparent rounded"
                    )}
                    style={{
                      left: `${item.position.x}%`,
                      top: `${item.position.y}%`,
                      transform: 'translate(-50%, -50%)',
                      fontSize: `${Math.max(12, item.fontSize * 0.15)}px`,
                      textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
                    }}
                  >
                    {item.content}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 底部按钮 */}
        <div className="px-6 py-4 border-t flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>取消</Button>
          <Button onClick={handleSubmit}>确认</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StickerModal;
