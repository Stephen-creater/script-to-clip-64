import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Move, Ban } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface GlobalSubtitleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: () => void;
}

export const GlobalSubtitleModal = ({ isOpen, onClose, onComplete }: GlobalSubtitleModalProps) => {
  const [formData, setFormData] = useState({
    template: "none",
    x: 50, // 位置 x (%)
    y: 87, // 位置 y (%)
    fontSize: 24, // 字体大小
  });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ fontSize: 24, mouseY: 0 });
  const previewRef = useRef<HTMLDivElement>(null);

  const handleSubmit = () => {
    const updatedData = {
      template: formData.template,
      x: formData.x,
      y: formData.y,
      fontSize: formData.fontSize
    };
    console.log("Global subtitle config:", updatedData);
    onComplete?.();
    onClose();
  };

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
        fontSize: Math.max(12, Math.min(72, Math.round(newFontSize)))
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
      fontSize: Math.max(12, Math.min(72, Math.round(prev.fontSize * scaleFactor)))
    }));
  };

  useEffect(() => {
    if (isDragging || isResizing) {
      document.addEventListener('mouseup', handleMouseUp as any);
      return () => document.removeEventListener('mouseup', handleMouseUp as any);
    }
  }, [isDragging, isResizing]);

  // 预设字幕样式
  const subtitleTemplates = [
    { id: 'none', name: '无', icon: <Ban className="w-6 h-6" /> },
    { id: 'template1', name: '样式1', color: '#FF6B6B', stroke: '#000', icon: <span className="text-xl font-bold" style={{ color: '#FF6B6B', textShadow: '1px 1px 2px #000' }}>T</span> },
    { id: 'template2', name: '样式2', color: '#4ECDC4', stroke: '#000', icon: <span className="text-xl font-bold" style={{ color: '#4ECDC4', textShadow: '1px 1px 2px #000' }}>T</span> },
    { id: 'template3', name: '样式3', color: '#FFE66D', stroke: '#000', icon: <span className="text-xl font-bold" style={{ color: '#FFE66D', textShadow: '1px 1px 2px #000' }}>T</span> },
    { id: 'template4', name: '样式4', color: '#FF6B9D', stroke: '#000', icon: <span className="text-xl font-bold" style={{ color: '#FF6B9D', textShadow: '1px 1px 2px #000' }}>T</span> },
    { id: 'template5', name: '样式5', color: '#FFFFFF', stroke: '#000', icon: <span className="text-xl font-bold" style={{ color: '#FFFFFF', textShadow: '1px 1px 2px #000' }}>T</span> },
    { id: 'template6', name: '样式6', color: '#95E1D3', stroke: '#000', icon: <span className="text-xl font-bold" style={{ color: '#95E1D3', textShadow: '1px 1px 2px #000' }}>T</span> },
    { id: 'template7', name: '样式7', color: '#F38181', stroke: '#000', icon: <span className="text-xl font-bold" style={{ color: '#F38181', textShadow: '1px 1px 2px #000' }}>T</span> },
    { id: 'template8', name: '样式8', color: '#A8E6CF', stroke: '#000', icon: <span className="text-xl font-bold" style={{ color: '#A8E6CF', textShadow: '1px 1px 2px #000' }}>T</span> },
    { id: 'template9', name: '样式9', color: '#FFD3B6', stroke: '#000', icon: <span className="text-xl font-bold" style={{ color: '#FFD3B6', textShadow: '1px 1px 2px #000' }}>T</span> },
    { id: 'template10', name: '样式10', color: '#FFAAA5', stroke: '#000', icon: <span className="text-xl font-bold" style={{ color: '#FFAAA5', textShadow: '1px 1px 2px #000' }}>T</span> },
    { id: 'template11', name: '样式11', color: '#FF8B94', stroke: '#000', icon: <span className="text-xl font-bold" style={{ color: '#FF8B94', textShadow: '1px 1px 2px #000' }}>T</span> },
    { id: 'template12', name: '样式12', color: '#FFC6FF', stroke: '#000', icon: <span className="text-xl font-bold" style={{ color: '#FFC6FF', textShadow: '1px 1px 2px #000' }}>T</span> },
    { id: 'template13', name: '样式13', color: '#BDB2FF', stroke: '#000', icon: <span className="text-xl font-bold" style={{ color: '#BDB2FF', textShadow: '1px 1px 2px #000' }}>T</span> },
    { id: 'template14', name: '样式14', color: '#A0C4FF', stroke: '#000', icon: <span className="text-xl font-bold" style={{ color: '#A0C4FF', textShadow: '1px 1px 2px #000' }}>T</span> },
    { id: 'template15', name: '样式15', color: '#9BF6FF', stroke: '#000', icon: <span className="text-xl font-bold" style={{ color: '#9BF6FF', textShadow: '1px 1px 2px #000' }}>T</span> },
    { id: 'template16', name: '样式16', color: '#CAFFBF', stroke: '#000', icon: <span className="text-xl font-bold" style={{ color: '#CAFFBF', textShadow: '1px 1px 2px #000' }}>T</span> },
    { id: 'template17', name: '样式17', color: '#FDFFB6', stroke: '#000', icon: <span className="text-xl font-bold" style={{ color: '#FDFFB6', textShadow: '1px 1px 2px #000' }}>T</span> },
    { id: 'template18', name: '样式18', color: '#FFC8DD', stroke: '#000', icon: <span className="text-xl font-bold" style={{ color: '#FFC8DD', textShadow: '1px 1px 2px #000' }}>T</span> },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[900px]">
        <DialogHeader>
          <DialogTitle>字幕全局设置</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-2 gap-6 py-4">
          {/* 左侧配置 */}
          <div className="space-y-6">
            <div className="space-y-2">
              <Label>预设样式</Label>
              <ScrollArea className="h-[400px] rounded-md border p-4">
                <div className="grid grid-cols-6 gap-2">
                  {subtitleTemplates.map((template) => (
                    <button
                      key={template.id}
                      onClick={() => setFormData(prev => ({ ...prev, template: template.id }))}
                      className={`flex items-center justify-center w-12 h-12 rounded-lg transition-all ${
                        formData.template === template.id
                          ? 'bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2'
                          : 'bg-secondary hover:bg-secondary/80'
                      }`}
                      title={template.name}
                    >
                      {template.icon}
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </div>

            <div className="p-3 bg-muted rounded-lg">
              <p className="text-xs text-muted-foreground">
                💡 此设置将应用于所有分段的字幕。预览中显示第一个分段的字幕样式，您可以拖拽调整位置并使用滚轮调整大小。
              </p>
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
                    <p>拖拽字幕调整位置</p>
                    <p className="text-xs mt-1">滚轮缩放大小</p>
                  </div>
                </div>
                
                {/* 示例字幕文本 */}
                <div
                  className="absolute select-none text-center group"
                  style={{
                    left: `${formData.x}%`,
                    top: `${formData.y}%`,
                    transform: 'translate(-50%, -50%)',
                    zIndex: 10,
                  }}
                >
                  {/* 字幕文本 */}
                  <div
                    className="cursor-move px-4 relative"
                    style={{
                      fontSize: `${formData.fontSize}px`,
                      fontWeight: 'bold',
                      color: '#FFFFFF',
                      textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
                      WebkitTextStroke: '0.5px rgba(0,0,0,0.5)',
                    }}
                    onMouseDown={handleMouseDown}
                  >
                    <div className="flex items-center justify-center gap-1">
                      <Move size={12} className="opacity-50" />
                      <span>这是第一个分段的字幕示例</span>
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
  );
};