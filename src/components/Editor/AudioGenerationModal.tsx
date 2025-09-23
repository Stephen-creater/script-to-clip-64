import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Volume2 } from "lucide-react";

interface AudioGenerationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  segmentCount: number;
}

export const AudioGenerationModal = ({ 
  isOpen, 
  onClose, 
  onComplete, 
  segmentCount 
}: AudioGenerationModalProps) => {
  const [progress, setProgress] = useState(0);
  const [currentSegment, setCurrentSegment] = useState(0);

  useEffect(() => {
    if (!isOpen) {
      setProgress(0);
      setCurrentSegment(0);
      return;
    }

    const interval = setInterval(() => {
      setCurrentSegment((prev) => {
        const next = prev + 1;
        const progressPercent = (next / segmentCount) * 100;
        setProgress(progressPercent);
        
        if (next >= segmentCount) {
          clearInterval(interval);
          setTimeout(() => {
            onComplete();
            onClose();
          }, 200);
        }
        
        return next;
      });
    }, 2000 / segmentCount); // Complete all segments in 2 seconds total

    return () => clearInterval(interval);
  }, [isOpen, segmentCount, onComplete, onClose]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Volume2 size={20} className="text-primary" />
            音频生成中
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="text-center">
            <div className="text-sm text-muted-foreground mb-2">
              正在生成第 {Math.min(currentSegment + 1, segmentCount)} / {segmentCount} 个分段的音频
            </div>
            <Progress value={progress} className="w-full" />
            <div className="text-xs text-muted-foreground mt-2">
              {Math.round(progress)}% 完成
            </div>
          </div>
          
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="text-sm font-medium mb-2">生成状态:</div>
            <div className="space-y-1 text-xs">
              {Array.from({ length: segmentCount }).map((_, index) => (
                <div 
                  key={index} 
                  className={`flex items-center gap-2 ${
                    index < currentSegment 
                      ? 'text-green-600' 
                      : index === currentSegment 
                        ? 'text-primary animate-pulse' 
                        : 'text-muted-foreground'
                  }`}
                >
                  <div className={`w-2 h-2 rounded-full ${
                    index < currentSegment 
                      ? 'bg-green-600' 
                      : index === currentSegment 
                        ? 'bg-primary' 
                        : 'bg-muted-foreground/30'
                  }`} />
                  分段{index + 1} {
                    index < currentSegment 
                      ? '✓ 已完成' 
                      : index === currentSegment 
                        ? '⏳ 生成中...' 
                        : '⏸ 等待中'
                  }
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};