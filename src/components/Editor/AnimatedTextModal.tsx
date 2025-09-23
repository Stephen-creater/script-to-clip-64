import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Folder, Music, Plus } from "lucide-react";
import { TemplateCreationModal } from "./TemplateCreationModal";

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
    distanceFromTop: "20",
    soundEffect: "",
    volume: "50"
  });

  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);

  const handleSubmit = () => {
    const updatedData = {
      content: formData.content,
      template: formData.template,
      distanceFromTop: formData.distanceFromTop,
      soundEffect: formData.soundEffect,
      volume: formData.volume
    };
    
    onSubmit?.(segmentId, updatedData);
    onClose();
  };

  const handleCreateTemplate = (templateData: any) => {
    // Here you would typically save the template data to state or backend
    console.log("创建新模板:", templateData);
    // For now, we'll just log it
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>花字样式</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
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
              <Label htmlFor="distance">距离顶部距离</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="distance"
                  value={formData.distanceFromTop}
                  onChange={(e) => setFormData(prev => ({ ...prev, distanceFromTop: e.target.value }))}
                  className="flex-1"
                />
                <span className="text-sm text-muted-foreground">%</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="soundEffect">音效选择</Label>
              <div className="space-y-3">
                <Select value={formData.soundEffect} onValueChange={(value) => setFormData(prev => ({ ...prev, soundEffect: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="请选择音效文件夹" />
                  </SelectTrigger>
                   <SelectContent>
                     <SelectItem value="funny">
                       <div className="flex items-center gap-2">
                         <Folder size={16} />
                         <span>搞笑音效</span>
                       </div>
                     </SelectItem>
                     <SelectItem value="transition">
                       <div className="flex items-center gap-2">
                         <Folder size={16} />
                         <span>转场音效</span>
                       </div>
                     </SelectItem>
                     <SelectItem value="environment">
                       <div className="flex items-center gap-2">
                         <Folder size={16} />
                         <span>环境音效</span>
                       </div>
                     </SelectItem>
                     <SelectItem value="special">
                       <div className="flex items-center gap-2">
                         <Folder size={16} />
                         <span>特效音效</span>
                       </div>
                     </SelectItem>
                   </SelectContent>
                </Select>
                
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
    </>
  );
};