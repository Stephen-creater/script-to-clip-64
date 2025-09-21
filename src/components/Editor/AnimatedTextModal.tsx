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
  onSubmit?: (segmentId: string, data: any) => void;
}

export const AnimatedTextModal = ({ isOpen, onClose, segmentId, onSubmit }: AnimatedTextModalProps) => {
  const [formData, setFormData] = useState({
    content: "",
    style: "",
    font: "",
    fontSize: "",
    distanceFromTop: "20"
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
      font: formData.font === "xinyi-crown-black" ? "欣意冠黑体2.0" :
            formData.font === "ushe-title-black" ? "优设标题黑" :
            formData.font === "douyin" ? "抖音体" :
            formData.font === "ali-health" ? "阿里健康体2.0" :
            formData.font === "ushe-good-body" ? "优设好身体" :
            formData.font === "hubin-male-god" ? "胡濒波男神体" :
            formData.font === "jiangcheng-round-400w" ? "江城圆体 400W" :
            formData.font === "jiangcheng-moon-400w" ? "江城月湖体 400W" :
            formData.font === "jiangcheng-justice-400w" ? "江城正义体 400W" :
            formData.font === "jiangcheng-zhiyin-400w" ? "江城知音体 400W" :
            formData.font === "maoken-sugar-round" ? "猫啃网糖圆体(测试版)0.11" :
            formData.font === "pangmen-title" ? "庞门正道标题体" : formData.font,
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
                <SelectItem value="xinyi-crown-black">欣意冠黑体2.0</SelectItem>
                <SelectItem value="ushe-title-black">优设标题黑</SelectItem>
                <SelectItem value="douyin">抖音体</SelectItem>
                <SelectItem value="ali-health">阿里健康体2.0</SelectItem>
                <SelectItem value="ushe-good-body">优设好身体</SelectItem>
                <SelectItem value="hubin-male-god">胡濒波男神体</SelectItem>
                <SelectItem value="jiangcheng-round-400w">江城圆体 400W</SelectItem>
                <SelectItem value="jiangcheng-moon-400w">江城月湖体 400W</SelectItem>
                <SelectItem value="jiangcheng-justice-400w">江城正义体 400W</SelectItem>
                <SelectItem value="jiangcheng-zhiyin-400w">江城知音体 400W</SelectItem>
                <SelectItem value="maoken-sugar-round">猫啃网糖圆体(测试版)0.11</SelectItem>
                <SelectItem value="pangmen-title">庞门正道标题体</SelectItem>
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