import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Music, Plus, Move, Maximize2 } from "lucide-react";
import { TemplateCreationModal } from "./TemplateCreationModal";
import { AudioSelectionModal } from "./AudioSelectionModal";

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
    x: 50, // 位置 x (%)
    y: 50, // 位置 y (%)
    fontSize: 48, // 字体大小
  });

  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [isAudioModalOpen, setIsAudioModalOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const previewRef = useRef<HTMLDivElement>(null);

  const handleSubmit = () => {
    const updatedData = {
      content: formData.content,
      template: formData.template,
      soundEffect: formData.soundEffect,
      volume: formData.volume,
      x: formData.x,
      y: formData.y,
      fontSize: formData.fontSize
    };
    
    onSubmit?.(segmentId, updatedData);
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
      fontSize: Math.max(12, Math.min(120, Math.round(prev.fontSize * scaleFactor)))
    }));
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mouseup', handleMouseUp as any);
      return () => document.removeEventListener('mouseup', handleMouseUp as any);
    }
  }, [isDragging]);

  const handleCreateTemplate = (templateData: any) => {
    // Here you would typically save the template data to state or backend
    console.log("创建新模板:", templateData);
    // For now, we'll just log it
  };

  const handleAudioSelect = (fileId: string, fileName: string, folderId?: string) => {
    setFormData(prev => ({ ...prev, soundEffect: fileName }));
    console.log("选择音效:", { fileId, fileName, folderId });
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
                <div className="flex items-center justify-between">
                  <Label htmlFor="template">花字模板</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsTemplateModalOpen(true)}
                    className="h-8 gap-2"
                  >
                    <Plus size={14} />
                    新建花字模板
                  </Button>
                </div>
                <Select value={formData.template} onValueChange={(value) => setFormData(prev => ({ ...prev, template: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="请选择" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="template1">花字模板1</SelectItem>
                    <SelectItem value="template2">花字模板2</SelectItem>
                  </SelectContent>
                </Select>
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
                  
                  <div className="flex items-start gap-2 p-3 bg-muted rounded-lg">
                    <Music size={16} className="text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-muted-foreground">
                      <p className="font-medium mb-1">音效说明：</p>
                      <p>• 音效出现时间与花字出现时间同步</p>
                      <p>• 音效播放时长为音效文件本身的时长</p>
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
                      <p>拖拽花字调整位置</p>
                      <p className="text-xs mt-1">滚轮缩放大小</p>
                    </div>
                  </div>
                  
                  {formData.content && (
                    <div
                      className="absolute cursor-move select-none"
                      style={{
                        left: `${formData.x}%`,
                        top: `${formData.y}%`,
                        transform: 'translate(-50%, -50%)',
                        fontSize: `${formData.fontSize}px`,
                        fontWeight: 'bold',
                        color: '#FFD700',
                        textShadow: '2px 2px 4px rgba(0,0,0,0.5), -1px -1px 2px rgba(255,255,255,0.3)',
                        WebkitTextStroke: '1px rgba(0,0,0,0.3)',
                        zIndex: 10
                      }}
                      onMouseDown={handleMouseDown}
                    >
                      <div className="flex items-center gap-1">
                        <Move size={12} className="opacity-50" />
                        {formData.content}
                      </div>
                    </div>
                  )}
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
      </Dialog>

      <TemplateCreationModal
        isOpen={isTemplateModalOpen}
        onClose={() => setIsTemplateModalOpen(false)}
        onCreateTemplate={handleCreateTemplate}
      />

      <AudioSelectionModal
        isOpen={isAudioModalOpen}
        onClose={() => setIsAudioModalOpen(false)}
        onSelect={handleAudioSelect}
      />
    </>
  );
};