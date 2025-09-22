import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";

interface GlobalSubtitleModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GlobalSubtitleModal = ({ isOpen, onClose }: GlobalSubtitleModalProps) => {
  const [formData, setFormData] = useState({
    style: "",
    animation: "",
    font: "",
    distanceFromTop: "87"
  });

  const handleSubmit = () => {
    // Handle global subtitle configuration
    console.log("Global subtitle config:", formData);
    onClose();
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
            <Label htmlFor="globalSubtitleStyle">字幕样式</Label>
            <Input
              id="globalSubtitleStyle"
              placeholder="请选择"
              value={formData.style}
              onChange={(e) => setFormData(prev => ({ ...prev, style: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="globalSubtitleAnimation">字幕动画</Label>
            <Input
              id="globalSubtitleAnimation"
              placeholder="请选择"
              value={formData.animation}
              onChange={(e) => setFormData(prev => ({ ...prev, animation: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="globalSubtitleFont">字体</Label>
            <Input
              id="globalSubtitleFont"
              placeholder="请选择"
              value={formData.font}
              onChange={(e) => setFormData(prev => ({ ...prev, font: e.target.value }))}
            />
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
    </Dialog>
  );
};