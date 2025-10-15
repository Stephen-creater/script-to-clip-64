import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Plus, Move } from "lucide-react";
import { SubtitleTemplateCreationModal } from "./SubtitleTemplateCreationModal";

interface GlobalSubtitleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: () => void;
}

export const GlobalSubtitleModal = ({ isOpen, onClose, onComplete }: GlobalSubtitleModalProps) => {
  const [formData, setFormData] = useState({
    template: "",
    x: 50, // 位置 x (%)
    y: 87, // 位置 y (%)
    fontSize: 24, // 字体大小
  });
  
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
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
    setIsDragging(true);
    const rect = previewRef.current.getBoundingClientRect();
    setDragStart({
      x: e.clientX - (rect.width * formData.x / 100),
      y: e.clientY - (rect.height * formData.y / 100)
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !previewRef.current) return;
    const rect = previewRef.current.getBoundingClientRect();
    const newX = ((e.clientX - dragStart.x) / rect.width) * 100;
    const newY = ((e.clientY - dragStart.y) / rect.height) * 100;
    
    setFormData(prev => ({
      ...prev,
      x: Math.max(0, Math.min(100, newX)),
      y: Math.max(0, Math.min(100, newY))
    }));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
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
    if (isDragging) {
      document.addEventListener('mouseup', handleMouseUp as any);
      return () => document.removeEventListener('mouseup', handleMouseUp as any);
    }
  }, [isDragging]);

  const handleCreateTemplate = (templateData: any) => {
    console.log("New subtitle template created:", templateData);
    // Here you would typically save the template and update available templates
    setFormData(prev => ({ ...prev, template: templateData.name }));
  };

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
              <div className="flex items-center justify-between">
                <Label htmlFor="globalSubtitleTemplate">字幕模板</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsTemplateModalOpen(true)}
                  className="h-8 gap-2"
                >
                  <Plus size={14} />
                  新增字幕模板
                </Button>
              </div>
              <Select value={formData.template} onValueChange={(value) => setFormData(prev => ({ ...prev, template: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="请选择" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="字幕模板1">字幕模板1</SelectItem>
                  <SelectItem value="字幕模板2">字幕模板2</SelectItem>
                </SelectContent>
              </Select>
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
                className="relative bg-muted rounded-lg overflow-hidden border-2 border-border cursor-crosshair"
                style={{
                  width: '100%',
                  maxWidth: '300px',
                  aspectRatio: '9/16'
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
                  className="absolute cursor-move select-none text-center px-4"
                  style={{
                    left: `${formData.x}%`,
                    top: `${formData.y}%`,
                    transform: 'translate(-50%, -50%)',
                    fontSize: `${formData.fontSize}px`,
                    fontWeight: 'bold',
                    color: '#FFFFFF',
                    textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
                    WebkitTextStroke: '0.5px rgba(0,0,0,0.5)',
                    zIndex: 10,
                    maxWidth: '90%'
                  }}
                  onMouseDown={handleMouseDown}
                >
                  <div className="flex items-center justify-center gap-1">
                    <Move size={12} className="opacity-50" />
                    <span>这是第一个分段的字幕示例</span>
                  </div>
                </div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              💡 提示：拖拽调整位置 • 滚轮调整大小 • 当前大小: {formData.fontSize}px
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
      
      <SubtitleTemplateCreationModal
        isOpen={isTemplateModalOpen}
        onClose={() => setIsTemplateModalOpen(false)}
        onCreateTemplate={handleCreateTemplate}
      />
    </Dialog>
  );
};