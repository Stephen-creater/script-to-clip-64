import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface AnimatedTextModalProps {
  isOpen: boolean;
  onClose: () => void;
  segmentId: string;
}

export const AnimatedTextModal = ({ isOpen, onClose, segmentId }: AnimatedTextModalProps) => {
  const [formData, setFormData] = useState({
    style: "",
    font: "",
    fontSize: "",
    distanceFromTop: "20"
  });

  const handleSubmit = () => {
    // Handle form submission
    console.log("Animated text config:", formData);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>花字样式</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="style">花字样式</Label>
            <Input
              id="style"
              placeholder="请选择"
              value={formData.style}
              onChange={(e) => setFormData(prev => ({ ...prev, style: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="font">花字字体</Label>
            <Input
              id="font"
              placeholder="请选择"
              value={formData.font}
              onChange={(e) => setFormData(prev => ({ ...prev, font: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fontSize">字体大小</Label>
            <Input
              id="fontSize"
              placeholder="请输入"
              value={formData.fontSize}
              onChange={(e) => setFormData(prev => ({ ...prev, fontSize: e.target.value }))}
            />
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