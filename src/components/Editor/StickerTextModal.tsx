import { useState, useMemo, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Settings, Plus, Trash2, Type, Sticker, ChevronDown, Move } from "lucide-react";
import { useMaterials } from "@/hooks/useMaterials";
import { useFolders } from "@/hooks/useFolders";
import { cn } from "@/lib/utils";

interface AnimatedTextItem {
  id: string;
  content: string;
  template: string;
  x: number;
  y: number;
  fontSize: number;
}

interface StickerItem {
  id: string;
  materialId: string;
  name: string;
  x: number;
  y: number;
  scale: number;
}

interface StickerTextModalProps {
  isOpen: boolean;
  onClose: () => void;
  segmentId: string;
  onSubmit?: (segmentId: string, data: { animatedTexts: AnimatedTextItem[]; stickers: StickerItem[] }) => void;
}

export const StickerTextModal = ({ isOpen, onClose, segmentId, onSubmit }: StickerTextModalProps) => {
  // 花字列表
  const [animatedTexts, setAnimatedTexts] = useState<AnimatedTextItem[]>([
    { id: '1', content: '花字示例文案', template: 'gold', x: 50, y: 20, fontSize: 32 }
  ]);
  
  // 贴纸列表
  const [stickers, setStickers] = useState<StickerItem[]>([]);
  
  // 当前选中的项目
  const [selectedItemId, setSelectedItemId] = useState<string>('1');
  const [selectedItemType, setSelectedItemType] = useState<'text' | 'sticker'>('text');
  
  // 拖拽状态
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ size: 1, mouseY: 0 });
  const previewRef = useRef<HTMLDivElement>(null);
  
  // 自定义设置展开状态
  const [isCustomSettingsOpen, setIsCustomSettingsOpen] = useState(true);

  const { materials, getMaterialUrl } = useMaterials();
  const { folders } = useFolders();

  // 花字模板预设
  const textTemplates = [
    { id: "gold", name: "金色", style: { color: "#FFD700", textShadow: "2px 2px 4px rgba(0,0,0,0.5)" } },
    { id: "silver", name: "银色", style: { color: "#C0C0C0", textShadow: "2px 2px 4px rgba(0,0,0,0.5)" } },
    { id: "orange", name: "橙色", style: { color: "#FFA500", textShadow: "2px 2px 4px rgba(0,0,0,0.5)" } },
    { id: "red", name: "红色", style: { color: "#FF4444", textShadow: "2px 2px 4px rgba(0,0,0,0.5)" } },
    { id: "white", name: "白色", style: { color: "#FFFFFF", textShadow: "2px 2px 4px rgba(0,0,0,0.8)" } },
    { id: "pink", name: "粉色", style: { color: "#FFB6C1", textShadow: "2px 2px 4px rgba(0,0,0,0.5)" } },
  ];

  const getSelectedItem = () => {
    if (selectedItemType === 'text') {
      return animatedTexts.find(t => t.id === selectedItemId);
    } else {
      return stickers.find(s => s.id === selectedItemId);
    }
  };

  const handleAddAnimatedText = () => {
    const newText: AnimatedTextItem = {
      id: Date.now().toString(),
      content: '新花字',
      template: 'gold',
      x: 50,
      y: 30 + animatedTexts.length * 10,
      fontSize: 32
    };
    setAnimatedTexts([...animatedTexts, newText]);
    setSelectedItemId(newText.id);
    setSelectedItemType('text');
  };

  const handleAddSticker = () => {
    const newSticker: StickerItem = {
      id: Date.now().toString(),
      materialId: '',
      name: '新贴纸',
      x: 50,
      y: 50 + stickers.length * 10,
      scale: 1
    };
    setStickers([...stickers, newSticker]);
    setSelectedItemId(newSticker.id);
    setSelectedItemType('sticker');
  };

  const handleDeleteItem = (id: string, type: 'text' | 'sticker') => {
    if (type === 'text') {
      setAnimatedTexts(animatedTexts.filter(t => t.id !== id));
      if (selectedItemId === id && animatedTexts.length > 1) {
        const remaining = animatedTexts.filter(t => t.id !== id);
        setSelectedItemId(remaining[0]?.id || '');
      }
    } else {
      setStickers(stickers.filter(s => s.id !== id));
      if (selectedItemId === id && stickers.length > 1) {
        const remaining = stickers.filter(s => s.id !== id);
        setSelectedItemId(remaining[0]?.id || '');
      }
    }
  };

  const updateAnimatedText = (id: string, updates: Partial<AnimatedTextItem>) => {
    setAnimatedTexts(texts => texts.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const updateSticker = (id: string, updates: Partial<StickerItem>) => {
    setStickers(items => items.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  // 拖拽处理
  const handleItemMouseDown = (e: React.MouseEvent, id: string, type: 'text' | 'sticker') => {
    e.stopPropagation();
    setSelectedItemId(id);
    setSelectedItemType(type);
    setIsDragging(true);
    
    if (!previewRef.current) return;
    const rect = previewRef.current.getBoundingClientRect();
    
    if (type === 'text') {
      const item = animatedTexts.find(t => t.id === id);
      if (item) {
        setDragStart({
          x: e.clientX - (rect.width * item.x / 100),
          y: e.clientY - (rect.height * item.y / 100)
        });
      }
    } else {
      const item = stickers.find(s => s.id === id);
      if (item) {
        setDragStart({
          x: e.clientX - (rect.width * item.x / 100),
          y: e.clientY - (rect.height * item.y / 100)
        });
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!previewRef.current) return;
    const rect = previewRef.current.getBoundingClientRect();

    if (isDragging && !isResizing) {
      const newX = ((e.clientX - dragStart.x) / rect.width) * 100;
      const newY = ((e.clientY - dragStart.y) / rect.height) * 100;
      
      if (selectedItemType === 'text') {
        updateAnimatedText(selectedItemId, {
          x: Math.max(0, Math.min(100, newX)),
          y: Math.max(0, Math.min(100, newY))
        });
      } else {
        updateSticker(selectedItemId, {
          x: Math.max(0, Math.min(100, newX)),
          y: Math.max(0, Math.min(100, newY))
        });
      }
    } else if (isResizing) {
      const deltaY = resizeStart.mouseY - e.clientY;
      const newSize = resizeStart.size + deltaY * 0.5;
      
      if (selectedItemType === 'text') {
        updateAnimatedText(selectedItemId, {
          fontSize: Math.max(12, Math.min(120, Math.round(newSize)))
        });
      } else {
        updateSticker(selectedItemId, {
          scale: Math.max(0.3, Math.min(3, resizeStart.size + deltaY * 0.01))
        });
      }
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
  };

  useEffect(() => {
    if (isDragging || isResizing) {
      const handler = () => handleMouseUp();
      document.addEventListener('mouseup', handler);
      return () => document.removeEventListener('mouseup', handler);
    }
  }, [isDragging, isResizing]);

  const handleSubmit = () => {
    onSubmit?.(segmentId, { animatedTexts, stickers });
    onClose();
  };

  const getTemplateStyle = (templateId: string) => {
    return textTemplates.find(t => t.id === templateId)?.style || textTemplates[0].style;
  };

  const selectedText = selectedItemType === 'text' ? animatedTexts.find(t => t.id === selectedItemId) : null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[1000px] max-h-[85vh] p-0 gap-0 flex flex-col">
        <DialogHeader className="px-6 py-4 border-b flex-shrink-0">
          <DialogTitle>花字/贴纸设置</DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-1 overflow-hidden min-h-0">
          {/* 左侧：已添加花字/贴纸列表 */}
          <div className="w-56 border-r flex flex-col flex-shrink-0">
            <div className="p-4 border-b">
              <p className="text-sm font-medium mb-1">已添加花字/贴纸 ({animatedTexts.length + stickers.length})</p>
              <p className="text-xs text-muted-foreground">如有音频会话，将使用上段素材</p>
              <div className="flex gap-2 mt-3">
                <Button size="sm" variant="default" className="flex-1" onClick={handleAddAnimatedText}>
                  <Plus size={14} className="mr-1" />
                  添加花字
                </Button>
                <Button size="sm" variant="secondary" className="flex-1" onClick={handleAddSticker}>
                  <Plus size={14} className="mr-1" />
                  添加贴纸
                </Button>
              </div>
            </div>
            
            <ScrollArea className="flex-1">
              <div className="p-2 space-y-1">
                {animatedTexts.map((text) => (
                  <div
                    key={text.id}
                    onClick={() => { setSelectedItemId(text.id); setSelectedItemType('text'); }}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all group",
                      selectedItemId === text.id && selectedItemType === 'text'
                        ? "bg-primary/10 border border-primary"
                        : "hover:bg-muted border border-transparent"
                    )}
                  >
                    <Type size={16} className="text-primary flex-shrink-0" />
                    <span className="flex-1 truncate text-sm">{text.content || '花字'}</span>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6 opacity-0 group-hover:opacity-100"
                      onClick={(e) => { e.stopPropagation(); handleDeleteItem(text.id, 'text'); }}
                    >
                      <Trash2 size={12} />
                    </Button>
                  </div>
                ))}
                
                {stickers.map((sticker) => (
                  <div
                    key={sticker.id}
                    onClick={() => { setSelectedItemId(sticker.id); setSelectedItemType('sticker'); }}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all group",
                      selectedItemId === sticker.id && selectedItemType === 'sticker'
                        ? "bg-primary/10 border border-primary"
                        : "hover:bg-muted border border-transparent"
                    )}
                  >
                    <Sticker size={16} className="text-secondary-foreground flex-shrink-0" />
                    <span className="flex-1 truncate text-sm">{sticker.name}</span>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6 opacity-0 group-hover:opacity-100"
                      onClick={(e) => { e.stopPropagation(); handleDeleteItem(sticker.id, 'sticker'); }}
                    >
                      <Trash2 size={12} />
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* 中间：当前花字设置 */}
          <div className="w-72 border-r flex flex-col flex-shrink-0">
            <div className="px-4 py-3 border-b bg-muted/30">
              <h3 className="text-sm font-medium">当前花字设置</h3>
            </div>
            
            <ScrollArea className="flex-1">
              <div className="p-4 space-y-4">
                {selectedItemType === 'text' && selectedText && (
                  <>
                    {/* 花字文本 */}
                    <div className="space-y-2">
                      <Label className="text-xs">花字文本</Label>
                      <Input
                        value={selectedText.content}
                        onChange={(e) => updateAnimatedText(selectedText.id, { content: e.target.value })}
                        placeholder="花字示例文案"
                        className="text-sm"
                      />
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-muted-foreground">{selectedText.content.length} / 100</span>
                        <Button variant="ghost" size="sm" className="h-6 text-xs gap-1">
                          <Settings size={12} />
                          管理
                        </Button>
                      </div>
                    </div>

                    {/* 字体样式模板 */}
                    <div className="space-y-2">
                      <Label className="text-xs">字体样式模板*</Label>
                      <Select
                        value={selectedText.template}
                        onValueChange={(value) => updateAnimatedText(selectedText.id, { template: value })}
                      >
                        <SelectTrigger className="text-sm">
                          <SelectValue placeholder="请选择花字字体样式模板（公开）" />
                        </SelectTrigger>
                        <SelectContent>
                          {textTemplates.map(t => (
                            <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* 自定义设置 */}
                    <Collapsible open={isCustomSettingsOpen} onOpenChange={setIsCustomSettingsOpen}>
                      <CollapsibleTrigger className="flex items-center justify-between w-full py-2 text-sm font-medium bg-muted/50 px-3 rounded-lg">
                        <span>自定义设置（覆盖模板）</span>
                        <ChevronDown size={16} className={cn("transition-transform", isCustomSettingsOpen && "rotate-180")} />
                      </CollapsibleTrigger>
                      <CollapsibleContent className="pt-3 space-y-3">
                        <div className="space-y-2">
                          <Label className="text-xs">字体*</Label>
                          <Select defaultValue="caveat">
                            <SelectTrigger className="text-sm">
                              <SelectValue placeholder="请选择字体 (公开)" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="caveat">Caveat Brush</SelectItem>
                              <SelectItem value="noto">Noto Sans</SelectItem>
                              <SelectItem value="source">Source Han Sans</SelectItem>
                            </SelectContent>
                          </Select>
                          <p className="text-xs text-muted-foreground">该属性将覆盖模板对应字体</p>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-xs">字体大小</Label>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">当前:</span>
                            <Input
                              type="number"
                              value={selectedText.fontSize}
                              onChange={(e) => updateAnimatedText(selectedText.id, { fontSize: parseInt(e.target.value) || 32 })}
                              className="w-20 text-sm"
                            />
                            <span className="text-xs text-muted-foreground">px</span>
                          </div>
                          <p className="text-xs text-muted-foreground">温馨提醒：用鼠标滚轮可直接拖拽该区域字体大小调节</p>
                        </div>
                      </CollapsibleContent>
                    </Collapsible>

                    {/* 时间设置 */}
                    <div className="space-y-2 pt-2 border-t">
                      <Label className="text-xs">时间设置</Label>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">起始时间 ⓘ</span>
                        <Input type="number" defaultValue="0.0" className="w-20 text-sm" step="0.1" />
                        <span className="text-xs text-muted-foreground">秒</span>
                      </div>
                    </div>
                  </>
                )}

                {selectedItemType === 'sticker' && (
                  <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                    <Sticker size={32} className="mb-2 opacity-50" />
                    <p className="text-sm">贴纸设置</p>
                    <p className="text-xs">请从素材库选择贴纸</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* 右侧：预览区域 */}
          <div className="flex-1 flex flex-col min-w-0 bg-muted/20">
            <div className="px-4 py-3 border-b bg-muted/30 flex items-center justify-between">
              <h3 className="text-sm font-medium">花字/贴纸预览 (9:16 竖屏)</h3>
            </div>
            
            <div className="flex-1 flex items-center justify-center p-6">
              <div 
                ref={previewRef}
                className="relative rounded-lg overflow-hidden border-2 border-border cursor-crosshair shadow-lg"
                style={{
                  width: '200px',
                  aspectRatio: '9/16',
                  background: 'linear-gradient(135deg, hsl(var(--primary) / 0.6) 0%, hsl(var(--primary) / 0.3) 50%, hsl(var(--accent) / 0.5) 100%)',
                }}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              >
                {/* 网格背景 */}
                <div 
                  className="absolute inset-0 opacity-20"
                  style={{
                    backgroundImage: 'linear-gradient(hsl(var(--background)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--background)) 1px, transparent 1px)',
                    backgroundSize: '20px 20px'
                  }}
                />

                {/* 渲染花字 */}
                {animatedTexts.map((text) => (
                  <div
                    key={text.id}
                    className={cn(
                      "absolute select-none cursor-move group",
                      selectedItemId === text.id && selectedItemType === 'text' && "ring-2 ring-white/50 rounded"
                    )}
                    style={{
                      left: `${text.x}%`,
                      top: `${text.y}%`,
                      transform: 'translate(-50%, -50%)',
                      fontSize: `${text.fontSize}px`,
                      fontWeight: 'bold',
                      ...getTemplateStyle(text.template)
                    }}
                    onMouseDown={(e) => handleItemMouseDown(e, text.id, 'text')}
                  >
                    {text.content}
                  </div>
                ))}

                {/* 渲染贴纸 */}
                {stickers.map((sticker) => (
                  <div
                    key={sticker.id}
                    className={cn(
                      "absolute select-none cursor-move",
                      selectedItemId === sticker.id && selectedItemType === 'sticker' && "ring-2 ring-white/50 rounded"
                    )}
                    style={{
                      left: `${sticker.x}%`,
                      top: `${sticker.y}%`,
                      transform: `translate(-50%, -50%) scale(${sticker.scale})`,
                    }}
                    onMouseDown={(e) => handleItemMouseDown(e, sticker.id, 'sticker')}
                  >
                    <div className="w-12 h-12 bg-primary/50 rounded flex items-center justify-center text-white text-xs">
                      贴纸
                    </div>
                  </div>
                ))}

                {/* 中心点 */}
                <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-white/50 rounded-full transform -translate-x-1/2 -translate-y-1/2" />
              </div>
            </div>
          </div>
        </div>

        {/* 底部按钮 */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t flex-shrink-0">
          <Button variant="outline" onClick={onClose}>
            取消
          </Button>
          <Button onClick={handleSubmit}>
            确认
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
