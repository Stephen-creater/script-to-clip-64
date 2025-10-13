import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Volume2, CheckCircle2, XCircle, VideoIcon } from "lucide-react";

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
  const [showResults, setShowResults] = useState(false);
  const [segmentResults, setSegmentResults] = useState<boolean[]>([]);

  useEffect(() => {
    if (!isOpen) {
      setProgress(0);
      setCurrentSegment(0);
      setShowResults(false);
      setSegmentResults([]);
      return;
    }

    // Initialize segment results with ~15% failure rate
    const results = Array.from({ length: segmentCount }, () => Math.random() > 0.15);
    setSegmentResults(results);

    const interval = setInterval(() => {
      setCurrentSegment((prev) => {
        const next = prev + 1;
        const progressPercent = (next / segmentCount) * 100;
        setProgress(progressPercent);
        
        if (next >= segmentCount) {
          clearInterval(interval);
          setTimeout(() => {
            setShowResults(true);
            onComplete();
          }, 500);
        }
        
        return next;
      });
    }, 2000 / segmentCount); // Complete all segments in 2 seconds total

    return () => clearInterval(interval);
  }, [isOpen, segmentCount, onComplete]);

  const successCount = segmentResults.filter(Boolean).length;
  const failedCount = segmentResults.length - successCount;

  const handleStartCompose = () => {
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        {!showResults ? (
          <>
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
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <VideoIcon size={20} className="text-primary" />
                音频生成完成
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 text-center">
                  <CheckCircle2 size={32} className="text-green-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-green-600">{successCount}</div>
                  <div className="text-xs text-muted-foreground mt-1">生成成功</div>
                </div>
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-center">
                  <XCircle size={32} className="text-red-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-red-600">{failedCount}</div>
                  <div className="text-xs text-muted-foreground mt-1">生成失败</div>
                </div>
              </div>

              <div className="bg-card border border-border rounded-lg p-4 max-h-[200px] overflow-y-auto">
                <div className="text-sm font-medium mb-2">详细结果:</div>
                <div className="space-y-1 text-xs">
                  {segmentResults.map((success, index) => (
                    <div 
                      key={index} 
                      className={`flex items-center gap-2 ${
                        success ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {success ? (
                        <CheckCircle2 size={14} />
                      ) : (
                        <XCircle size={14} />
                      )}
                      分段{index + 1} {success ? '生成成功' : '生成失败'}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={onClose} className="flex-1">
                  取消
                </Button>
                <Button onClick={handleStartCompose} className="flex-1">
                  <VideoIcon size={16} className="mr-2" />
                  开始合成
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};