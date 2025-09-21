import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface AnimatedTextModalProps {
  isOpen: boolean;
  onClose: () => void;
  segmentId: string;
}

export const AnimatedTextModal = ({ isOpen, onClose, segmentId }: AnimatedTextModalProps) => {
  const [formData, setFormData] = useState({
    content: "",
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
            <Label htmlFor="content">花字内容</Label>
            <Input
              id="content"
              placeholder="请输入花字内容"
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="style">花字样式</Label>
            <Select value={formData.style} onValueChange={(value) => setFormData(prev => ({ ...prev, style: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="请选择" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="shadow">阴影</SelectItem>
                <SelectItem value="outline">描边</SelectItem>
                <SelectItem value="gradient">渐变</SelectItem>
                <SelectItem value="glow">发光</SelectItem>
                <SelectItem value="3d">3D效果</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="font">花字字体</Label>
            <Select value={formData.font} onValueChange={(value) => setFormData(prev => ({ ...prev, font: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="请选择" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="songti">宋体</SelectItem>
                <SelectItem value="heiti">黑体</SelectItem>
                <SelectItem value="kaiti">楷体</SelectItem>
                <SelectItem value="fangsong">仿宋</SelectItem>
                <SelectItem value="lihei">丽黑</SelectItem>
                <SelectItem value="yuanti">圆体</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="fontSize">字体大小</Label>
            <Select value={formData.fontSize} onValueChange={(value) => setFormData(prev => ({ ...prev, fontSize: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="请选择" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="small">小号 (24px)</SelectItem>
                <SelectItem value="medium">中号 (32px)</SelectItem>
                <SelectItem value="large">大号 (48px)</SelectItem>
                <SelectItem value="xlarge">特大号 (64px)</SelectItem>
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