import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Trash2, Plus, Wand2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

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
  const [isGenerating, setIsGenerating] = useState(false);
  const [variantCount, setVariantCount] = useState(5);

  const addVariant = () => {
    const newId = String(Math.max(...variants.map(v => parseInt(v.id) || 0)) + 1);
    setVariants([...variants, { id: newId, content: "" }]);
  };

  const removeVariant = (id: string) => {
    if (variants.length <= 1) {
      toast.error("至少需要保留一个文案变体");
      return;
    }
    setVariants(variants.filter(v => v.id !== id));
  };

  const updateVariant = (id: string, content: string) => {
    setVariants(variants.map(v => (v.id === id ? { ...v, content } : v)));
  };

  const handleAIGenerate = async () => {
    const baseVariant = variants.find(v => v.content.trim() !== "");
    if (!baseVariant) {
      toast.error("请先输入一个基础文案作为参考");
      return;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-script-variants", {
        body: {
          baseScript: baseVariant.content,
          count: variantCount,
        },
      });

      if (error) throw error;

      if (data?.variants) {
        const newVariants = data.variants.map((content: string, index: number) => ({
          id: String(variants.length + index + 1),
          content,
        }));
        setVariants([...variants, ...newVariants]);
        toast.success(`已生成 ${newVariants.length} 个文案变体`);
      }
    } catch (error: any) {
      console.error("AI生成失败:", error);
      toast.error(error.message || "AI生成失败，请重试");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = () => {
    const validVariants = variants.filter(v => v.content.trim() !== "");
    if (validVariants.length === 0) {
      toast.error("请至少添加一个文案变体");
      return;
    }
    onSubmit(segmentId, validVariants);
    toast.success(`已保存 ${validVariants.length} 个文案变体`);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>管理文案变体 - {segmentName}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* AI生成区域 */}
          <div className="p-4 border rounded-lg bg-muted/50">
            <div className="flex items-center gap-4 mb-3">
              <div className="flex-1">
                <label className="text-sm font-medium mb-2 block">
                  AI一键生成多个变体
                </label>
                <p className="text-xs text-muted-foreground">
                  基于当前第一个文案，AI将生成多个不同表达方式的变体
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min={1}
                  max={10}
                  value={variantCount}
                  onChange={(e) => setVariantCount(parseInt(e.target.value) || 1)}
                  className="w-20"
                />
                <span className="text-sm text-muted-foreground">个</span>
              </div>
            </div>
            <Button
              onClick={handleAIGenerate}
              disabled={isGenerating}
              className="w-full"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  AI生成中...
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4 mr-2" />
                  AI生成文案变体
                </>
              )}
            </Button>
          </div>

          {/* 变体列表 */}
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-3">
              {variants.map((variant, index) => (
                <div key={variant.id} className="flex gap-2">
                  <div className="flex-1">
                    <label className="text-sm font-medium mb-1 block">
                      变体 {index + 1}
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
              添加新变体
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>
                取消
              </Button>
              <Button onClick={handleSubmit}>
                保存变体 ({variants.filter(v => v.content.trim()).length})
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
