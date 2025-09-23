import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface TemplateCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateTemplate?: (templateData: any) => void;
}

export const TemplateCreationModal = ({ isOpen, onClose, onCreateTemplate }: TemplateCreationModalProps) => {
  const [templateData, setTemplateData] = useState({
    name: "",
    fontType: "",
    fontSize: "",
    fontStyle: ""
  });

  const handleSubmit = () => {
    if (templateData.name && templateData.fontType && templateData.fontSize && templateData.fontStyle) {
      onCreateTemplate?.(templateData);
      setTemplateData({ name: "", fontType: "", fontSize: "", fontStyle: "" });
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>新建花字模板</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="templateName">模板名称</Label>
            <Input
              id="templateName"
              placeholder="请输入模板名称"
              value={templateData.name}
              onChange={(e) => setTemplateData(prev => ({ ...prev, name: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fontType">字体类型</Label>
            <Select value={templateData.fontType} onValueChange={(value) => setTemplateData(prev => ({ ...prev, fontType: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="请选择字体类型" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="caveat-brush">CaveatBrush</SelectItem>
                <SelectItem value="arial">Arial</SelectItem>
                <SelectItem value="helvetica">Helvetica</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="fontSize">字体大小</Label>
            <Select value={templateData.fontSize} onValueChange={(value) => setTemplateData(prev => ({ ...prev, fontSize: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="请选择字体大小" />
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
            <Label htmlFor="fontStyle">字体样式</Label>
            <Select value={templateData.fontStyle} onValueChange={(value) => setTemplateData(prev => ({ ...prev, fontStyle: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="请选择字体样式" />
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
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            取消
          </Button>
          <Button onClick={handleSubmit} className="bg-accent text-accent-foreground">
            保存模板
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};