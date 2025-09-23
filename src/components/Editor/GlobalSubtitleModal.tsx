import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Plus } from "lucide-react";
import { SubtitleTemplateCreationModal } from "./SubtitleTemplateCreationModal";

interface GlobalSubtitleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: () => void;
}

export const GlobalSubtitleModal = ({ isOpen, onClose, onComplete }: GlobalSubtitleModalProps) => {
  const [formData, setFormData] = useState({
    template: "",
    distanceFromTop: "87"
  });
  
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);

  const handleSubmit = () => {
    // Handle global subtitle configuration
    console.log("Global subtitle config:", formData);
    onComplete?.();
    onClose();
  };

  const handleCreateTemplate = (templateData: any) => {
    console.log("New subtitle template created:", templateData);
    // Here you would typically save the template and update available templates
    setFormData(prev => ({ ...prev, template: templateData.name }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle>字幕全局设置</DialogTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-6 w-6 p-0"
          >
            <X size={16} />
          </Button>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="globalSubtitleTemplate">字幕模板</Label>
            <div className="flex items-center gap-2">
              <Select value={formData.template} onValueChange={(value) => setFormData(prev => ({ ...prev, template: value }))}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="请选择" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="字幕模板1">字幕模板1</SelectItem>
                  <SelectItem value="字幕模板2">字幕模板2</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsTemplateModalOpen(true)}
                className="px-3"
              >
                <Plus size={16} className="mr-1" />
                新增字幕模板
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="globalSubtitleDistance">距离顶部距离</Label>
            <div className="flex items-center gap-2">
              <Input
                id="globalSubtitleDistance"
                value={formData.distanceFromTop}
                onChange={(e) => setFormData(prev => ({ ...prev, distanceFromTop: e.target.value }))}
                className="flex-1"
              />
              <span className="text-sm text-muted-foreground">%</span>
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
      
      <SubtitleTemplateCreationModal
        isOpen={isTemplateModalOpen}
        onClose={() => setIsTemplateModalOpen(false)}
        onCreateTemplate={handleCreateTemplate}
      />
    </Dialog>
  );
};