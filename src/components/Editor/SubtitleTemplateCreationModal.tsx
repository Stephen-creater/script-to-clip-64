import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X } from "lucide-react";

interface SubtitleTemplateCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateTemplate?: (templateData: any) => void;
}

export const SubtitleTemplateCreationModal = ({ isOpen, onClose, onCreateTemplate }: SubtitleTemplateCreationModalProps) => {
  const [templateData, setTemplateData] = useState({
    name: "",
    fontType: "",
    fontSize: "",
    fontStyle: ""
  });

  const handleSubmit = () => {
    if (templateData.name && templateData.fontType && templateData.fontSize && templateData.fontStyle) {
      onCreateTemplate?.(templateData);
      setTemplateData({
        name: "",
        fontType: "",
        fontSize: "",
        fontStyle: ""
      });
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle>新建字幕模板</DialogTitle>
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
                <SelectItem value="微软雅黑">微软雅黑</SelectItem>
                <SelectItem value="宋体">宋体</SelectItem>
                <SelectItem value="黑体">黑体</SelectItem>
                <SelectItem value="楷体">楷体</SelectItem>
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
                <SelectItem value="12px">12px</SelectItem>
                <SelectItem value="14px">14px</SelectItem>
                <SelectItem value="16px">16px</SelectItem>
                <SelectItem value="18px">18px</SelectItem>
                <SelectItem value="20px">20px</SelectItem>
                <SelectItem value="24px">24px</SelectItem>
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
                <SelectItem value="普通">普通</SelectItem>
                <SelectItem value="加粗">加粗</SelectItem>
                <SelectItem value="斜体">斜体</SelectItem>
                <SelectItem value="下划线">下划线</SelectItem>
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