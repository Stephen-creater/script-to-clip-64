import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Trash2, Plus } from "lucide-react";
import { toast } from "sonner";

interface ScriptVariant {
  id: string;
  content: string;
}

interface ScriptVariantModalProps {
  isOpen: boolean;
  onClose: () => void;
  segmentId: string;
  segmentName: string;
  initialVariants?: ScriptVariant[];
  onSubmit: (segmentId: string, variants: ScriptVariant[]) => void;
}

export const ScriptVariantModal = ({
  isOpen,
  onClose,
  segmentId,
  segmentName,
  initialVariants = [],
  onSubmit,
}: ScriptVariantModalProps) => {
  const [variants, setVariants] = useState<ScriptVariant[]>(
    initialVariants.length > 0 ? initialVariants : [{ id: "1", content: "" }]
  );

  const addVariant = () => {
    const newId = String(Math.max(...variants.map(v => parseInt(v.id) || 0)) + 1);
    setVariants([...variants, { id: newId, content: "" }]);
  };

  const removeVariant = (id: string) => {
    if (variants.length <= 1) {
      toast.error("至少需要保留一个文案");
      return;
    }
    setVariants(variants.filter(v => v.id !== id));
  };

  const updateVariant = (id: string, content: string) => {
    setVariants(variants.map(v => (v.id === id ? { ...v, content } : v)));
  };

  const handleSubmit = () => {
    const validVariants = variants.filter(v => v.content.trim() !== "");
    if (validVariants.length === 0) {
      toast.error("请至少添加一个文案");
      return;
    }
    onSubmit(segmentId, validVariants);
    toast.success(`已保存 ${validVariants.length} 个文案`);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>多选文案 - {segmentName}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            添加多组文案，导出时系统将随机选择不同文案生成多个视频版本
          </p>

          {/* 变体列表 */}
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-3">
              {variants.map((variant, index) => (
                <div key={variant.id} className="flex gap-2">
                  <div className="flex-1">
                    <label className="text-sm font-medium mb-1 block">
                      文案 {index + 1}
                    </label>
                    <Textarea
                      value={variant.content}
                      onChange={(e) => updateVariant(variant.id, e.target.value)}
                      placeholder="请输入文案内容"
                      className="min-h-[80px]"
                    />
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeVariant(variant.id)}
                    disabled={variants.length <= 1}
                    className="mt-7"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </ScrollArea>

          {/* 操作按钮 */}
          <div className="flex justify-between pt-4 border-t">
            <Button variant="outline" onClick={addVariant}>
              <Plus className="w-4 h-4 mr-2" />
              添加新文案
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>
                取消
              </Button>
              <Button onClick={handleSubmit}>
                保存 ({variants.filter(v => v.content.trim()).length})
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
