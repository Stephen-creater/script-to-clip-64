import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Folder, Music } from "lucide-react";

interface AnimatedTextModalProps {
  isOpen: boolean;
  onClose: () => void;
  segmentId: string;
  onSubmit?: (segmentId: string, data: any) => void;
}

export const AnimatedTextModal = ({ isOpen, onClose, segmentId, onSubmit }: AnimatedTextModalProps) => {
  const [formData, setFormData] = useState({
    content: "",
    style: "",
    font: "",
    fontSize: "",
    distanceFromTop: "20",
    soundEffect: ""
  });

  const handleSubmit = () => {
    // Handle form submission
    const updatedData = {
      content: formData.content,
      style: formData.style === "shadow" ? "阴影" : 
             formData.style === "outline" ? "描边" :
             formData.style === "gradient" ? "渐变" :
             formData.style === "glow" ? "发光" :
             formData.style === "3d" ? "3D效果" : formData.style,
      font: formData.font === "caveat-brush" ? "CaveatBrush" : formData.font,
      fontSize: formData.fontSize === "small" ? "小号 (24px)" :
                formData.fontSize === "medium" ? "中号 (32px)" :
                formData.fontSize === "large" ? "大号 (48px)" :
                formData.fontSize === "xlarge" ? "特大号 (64px)" : formData.fontSize,
      distanceFromTop: formData.distanceFromTop
    };
    
    onSubmit?.(segmentId, updatedData);
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
                <SelectItem value="caveat-brush">CaveatBrush</SelectItem>
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
                    defaultValue="50"
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
  );
};