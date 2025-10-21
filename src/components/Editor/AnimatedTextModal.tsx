import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Music, Move } from "lucide-react";
import { AudioSelectionModal } from "./AudioSelectionModal";
import { cn } from "@/lib/utils";

interface AnimatedTextModalProps {
  isOpen: boolean;
  onClose: () => void;
  segmentId: string;
  onSubmit?: (segmentId: string, data: any) => void;
}

export const AnimatedTextModal = ({ isOpen, onClose, segmentId, onSubmit }: AnimatedTextModalProps) => {
  const [formData, setFormData] = useState({
    content: "",
    template: "",
    soundEffect: "",
    volume: "50",
    delay: "0", // 延迟时间（秒）
    x: 50, // 位置 x (%)
    y: 50, // 位置 y (%)
    fontSize: 48, // 字体大小
  });

  const [isAudioModalOpen, setIsAudioModalOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ fontSize: 48, mouseY: 0 });
  const previewRef = useRef<HTMLDivElement>(null);

  const handleSubmit = () => {
    const updatedData = {
      content: formData.content,
      template: formData.template,
      soundEffect: formData.soundEffect,
      volume: formData.volume,
      delay: formData.delay,
      x: formData.x,
      y: formData.y,
      fontSize: formData.fontSize
    };
    
    onSubmit?.(segmentId, updatedData);
    onClose();
  };

  // 花字模板预设
  const textTemplates = [
    { id: "none", name: "无模板", style: { color: "#ffffff", textShadow: "none", WebkitTextStroke: "none" } },
    { id: "gold", name: "金色", style: { color: "#FFD700", textShadow: "2px 2px 4px rgba(0,0,0,0.5)", WebkitTextStroke: "1px rgba(0,0,0,0.3)" } },
    { id: "silver", name: "银色", style: { color: "#C0C0C0", textShadow: "2px 2px 4px rgba(0,0,0,0.5)", WebkitTextStroke: "1px rgba(0,0,0,0.3)" } },
    { id: "orange", name: "橙色", style: { color: "#FFA500", textShadow: "2px 2px 4px rgba(0,0,0,0.5)", WebkitTextStroke: "1px rgba(0,0,0,0.3)" } },
    { id: "red", name: "红色", style: { color: "#FF4444", textShadow: "2px 2px 4px rgba(0,0,0,0.5)", WebkitTextStroke: "1px rgba(0,0,0,0.3)" } },
    { id: "white", name: "白色", style: { color: "#FFFFFF", textShadow: "2px 2px 4px rgba(0,0,0,0.8)", WebkitTextStroke: "1px rgba(0,0,0,0.3)" } },
    { id: "pink", name: "粉色", style: { color: "#FFB6C1", textShadow: "2px 2px 4px rgba(0,0,0,0.5)", WebkitTextStroke: "1px rgba(0,0,0,0.3)" } },
    { id: "blue", name: "蓝色", style: { color: "#87CEEB", textShadow: "2px 2px 4px rgba(0,0,0,0.5)", WebkitTextStroke: "1px rgba(0,0,0,0.3)" } },
    { id: "yellow-green", name: "黄绿", style: { color: "#9ACD32", textShadow: "2px 2px 4px rgba(0,0,0,0.5)", WebkitTextStroke: "1px rgba(0,0,0,0.3)" } },
    { id: "cyan", name: "青色", style: { color: "#00CED1", textShadow: "2px 2px 4px rgba(0,0,0,0.5)", WebkitTextStroke: "1px rgba(0,0,0,0.3)" } },
    { id: "coral", name: "珊瑚", style: { color: "#FF7F50", textShadow: "2px 2px 4px rgba(0,0,0,0.5)", WebkitTextStroke: "1px rgba(0,0,0,0.3)" } },
    { id: "brown", name: "棕色", style: { color: "#A0826D", textShadow: "2px 2px 4px rgba(0,0,0,0.5)", WebkitTextStroke: "1px rgba(255,255,255,0.3)" } },
    { id: "beige", name: "米色", style: { color: "#E8D4B0", textShadow: "2px 2px 4px rgba(0,0,0,0.5)", WebkitTextStroke: "1px rgba(0,0,0,0.3)" } },
    { id: "salmon", name: "鲑鱼", style: { color: "#FA8072", textShadow: "2px 2px 4px rgba(0,0,0,0.5)", WebkitTextStroke: "1px rgba(0,0,0,0.3)" } },
    { id: "cream", name: "奶油", style: { color: "#FFFACD", textShadow: "2px 2px 4px rgba(0,0,0,0.6)", WebkitTextStroke: "1px rgba(0,0,0,0.3)" } },
    { id: "light-pink", name: "浅粉", style: { color: "#FFB6E1", textShadow: "2px 2px 4px rgba(0,0,0,0.5)", WebkitTextStroke: "1px rgba(0,0,0,0.3)" } },
    { id: "black", name: "黑色", style: { color: "#000000", textShadow: "2px 2px 4px rgba(255,255,255,0.5)", WebkitTextStroke: "1px rgba(255,255,255,0.3)" } },
    { id: "white-blue", name: "白蓝", style: { color: "#E0F4FF", textShadow: "2px 2px 4px rgba(0,0,0,0.5)", WebkitTextStroke: "1px rgba(0,0,0,0.3)" } },
    { id: "white-pink", name: "白粉", style: { color: "#FFE4F0", textShadow: "2px 2px 4px rgba(0,0,0,0.5)", WebkitTextStroke: "1px rgba(0,0,0,0.3)" } },
    { id: "khaki", name: "卡其", style: { color: "#C3B091", textShadow: "2px 2px 4px rgba(0,0,0,0.5)", WebkitTextStroke: "1px rgba(0,0,0,0.3)" } },
    { id: "mustard", name: "芥末", style: { color: "#FFDB58", textShadow: "2px 2px 4px rgba(0,0,0,0.5)", WebkitTextStroke: "1px rgba(0,0,0,0.3)" } },
    { id: "rose", name: "玫瑰", style: { color: "#C68484", textShadow: "2px 2px 4px rgba(0,0,0,0.5)", WebkitTextStroke: "1px rgba(0,0,0,0.3)" } },
    { id: "green", name: "绿色", style: { color: "#7FFF00", textShadow: "2px 2px 4px rgba(0,0,0,0.5)", WebkitTextStroke: "1px rgba(0,0,0,0.3)" } },
  ];

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!previewRef.current) return;
    e.stopPropagation();
    setIsDragging(true);
    const rect = previewRef.current.getBoundingClientRect();
    setDragStart({
      x: e.clientX - (rect.width * formData.x / 100),
      y: e.clientY - (rect.height * formData.y / 100)
    });
  };

  const handleResizeMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsResizing(true);
    setResizeStart({
      fontSize: formData.fontSize,
      mouseY: e.clientY
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && !isResizing && previewRef.current) {
      const rect = previewRef.current.getBoundingClientRect();
      const newX = ((e.clientX - dragStart.x) / rect.width) * 100;
      const newY = ((e.clientY - dragStart.y) / rect.height) * 100;
      
      setFormData(prev => ({
        ...prev,
        x: Math.max(0, Math.min(100, newX)),
        y: Math.max(0, Math.min(100, newY))
      }));
    } else if (isResizing) {
      const deltaY = resizeStart.mouseY - e.clientY;
      const newFontSize = resizeStart.fontSize + deltaY * 0.5;
      
      setFormData(prev => ({
        ...prev,
        fontSize: Math.max(12, Math.min(120, Math.round(newFontSize)))
      }));
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = -e.deltaY;
    const scaleFactor = delta > 0 ? 1.05 : 0.95;
    
    setFormData(prev => ({
      ...prev,
      fontSize: Math.max(12, Math.min(120, Math.round(prev.fontSize * scaleFactor)))
    }));
  };

  useEffect(() => {
    if (isDragging || isResizing) {
      document.addEventListener('mouseup', handleMouseUp as any);
      return () => document.removeEventListener('mouseup', handleMouseUp as any);
    }
  }, [isDragging, isResizing]);

  const handleAudioSelect = (fileId: string, fileName: string, folderId?: string) => {
    setFormData(prev => ({ ...prev, soundEffect: fileName }));
    console.log("选择音效:", { fileId, fileName, folderId });
  };

  const getSelectedTemplateStyle = () => {
    const selected = textTemplates.find(t => t.id === formData.template);
    return selected?.style || textTemplates[1].style; // 默认金色
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[900px]">
          <DialogHeader>
            <DialogTitle>花字样式</DialogTitle>
          </DialogHeader>
          
          <div className="grid grid-cols-2 gap-6 py-4">
            {/* 左侧配置 */}
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="content">花字内容</Label>
                <Input
                  id="content"
                  placeholder="请输入花字内容"
                  value={formData.content}
                  onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label>预设样式</Label>
                <div className="grid grid-cols-6 gap-2 p-3 bg-muted/50 rounded-lg max-h-[200px] overflow-y-auto">
                  {textTemplates.map((template) => (
                    <button
                      key={template.id}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, template: template.id }))}
                      className={cn(
                        "aspect-square rounded-lg flex items-center justify-center text-2xl font-bold transition-all",
                        "hover:scale-105 hover:shadow-md",
                        formData.template === template.id 
                          ? "ring-2 ring-primary shadow-lg scale-105" 
                          : "bg-card hover:bg-card/80"
                      )}
                      style={template.id === "none" ? {
                        backgroundColor: "hsl(var(--card))",
                        border: "2px dashed hsl(var(--border))"
                      } : {
                        backgroundColor: template.id === "black" ? "#1a1a1a" : "#2a2a2a",
                        ...template.style
                      }}
                      title={template.name}
                    >
                      {template.id === "none" ? "🚫" : "T"}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="soundEffect">音效选择</Label>
                <div className="space-y-3">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => setIsAudioModalOpen(true)}
                  >
                    {formData.soundEffect || "请选择音效文件夹"}
                  </Button>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="volume">音量</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          id="volume"
                          type="number"
                          min="0"
                          max="100"
                          value={formData.volume}
                          onChange={(e) => setFormData(prev => ({ ...prev, volume: e.target.value }))}
                          className="flex-1"
                        />
                        <span className="text-sm text-muted-foreground">%</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="delay">延迟时间</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          id="delay"
                          type="number"
                          min="0"
                          max="10"
                          step="0.1"
                          value={formData.delay}
                          onChange={(e) => setFormData(prev => ({ ...prev, delay: e.target.value }))}
                          className="flex-1"
                        />
                        <span className="text-sm text-muted-foreground">秒</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-2 p-3 bg-muted rounded-lg">
                    <Music size={16} className="text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-muted-foreground">
                      <p className="font-medium mb-1">音效说明：</p>
                      <p>• 音效出现时间与花字出现时间同步</p>
                      <p>• 音效播放时长为音效文件本身的时长</p>
                      <p>• 延迟时间：花字和音效延迟多少秒时同时出现</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 右侧预览 */}
            <div className="space-y-2">
              <Label>预览 (9:16竖屏)</Label>
              <div className="flex justify-center">
                <div 
                  ref={previewRef}
                  className="relative rounded-lg overflow-hidden border-2 border-border cursor-crosshair"
                  style={{
                    width: '100%',
                    maxWidth: '300px',
                    aspectRatio: '9/16',
                    backgroundImage: 'linear-gradient(hsl(var(--border)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--border)) 1px, transparent 1px)',
                    backgroundSize: '20px 20px',
                    backgroundColor: 'hsl(var(--muted) / 0.3)'
                  }}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                  onWheel={handleWheel}
                >
                  <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-sm px-4 text-center">
                    <div>
                      <p>拖拽花字调整位置</p>
                      <p className="text-xs mt-1">滚轮缩放大小</p>
                    </div>
                  </div>
                  
                  {formData.content && (
                    <div
                      className="absolute select-none group"
                      style={{
                        left: `${formData.x}%`,
                        top: `${formData.y}%`,
                        transform: 'translate(-50%, -50%)',
                        zIndex: 10
                      }}
                    >
                      {/* 花字文本 */}
                      <div
                        className="cursor-move relative"
                        style={{
                          fontSize: `${formData.fontSize}px`,
                          fontWeight: 'bold',
                          ...getSelectedTemplateStyle(),
                        }}
                        onMouseDown={handleMouseDown}
                      >
                        <div className="flex items-center gap-1">
                          <Move size={12} className="opacity-50" />
                          {formData.content}
                        </div>
                      </div>
                      
                      {/* 缩放控制点 */}
                      <div className="absolute -top-2 -left-2 w-4 h-4 bg-primary rounded-full border-2 border-background cursor-nwse-resize opacity-0 group-hover:opacity-100 transition-opacity"
                        onMouseDown={handleResizeMouseDown}
                      />
                      <div className="absolute -top-2 -right-2 w-4 h-4 bg-primary rounded-full border-2 border-background cursor-nesw-resize opacity-0 group-hover:opacity-100 transition-opacity"
                        onMouseDown={handleResizeMouseDown}
                      />
                      <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-primary rounded-full border-2 border-background cursor-nesw-resize opacity-0 group-hover:opacity-100 transition-opacity"
                        onMouseDown={handleResizeMouseDown}
                      />
                      <div className="absolute -bottom-2 -right-2 w-4 h-4 bg-primary rounded-full border-2 border-background cursor-nwse-resize opacity-0 group-hover:opacity-100 transition-opacity"
                        onMouseDown={handleResizeMouseDown}
                      />
                    </div>
                  )}
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2 text-center">
                💡 提示：拖拽调整位置 • 滚轮/边角调整大小 • 当前大小: {formData.fontSize}px
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onClose}>
              取消
            </Button>
            <Button onClick={handleSubmit} className="bg-accent text-accent-foreground">
              确定
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <AudioSelectionModal
        isOpen={isAudioModalOpen}
        onClose={() => setIsAudioModalOpen(false)}
        onSelect={handleAudioSelect}
      />
    </>
  );
};