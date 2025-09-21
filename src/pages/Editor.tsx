import { useState } from "react";
import SegmentTable from "@/components/Editor/SegmentTable";
import { Button } from "@/components/ui/button";
import { Play, Pause } from "lucide-react";

interface Segment {
  id: string;
  name: string;
  type: string;
  video: string;
  script: string;
  animatedText: string;
  subtitleStyle: string;
  sticker: string;
  audio: string;
}

const Editor = () => {
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [segments, setSegments] = useState<Segment[]>([]);
  const [currentSegmentIndex, setCurrentSegmentIndex] = useState(0);

  const handleSegmentsChange = (newSegments: Segment[]) => {
    setSegments(newSegments);
  };

  const togglePreview = () => {
    setIsPreviewMode(!isPreviewMode);
    if (!isPreviewMode) {
      setCurrentSegmentIndex(0);
    }
  };

  const renderPreviewOverlays = () => {
    if (!isPreviewMode || segments.length === 0) return null;
    
    const currentSegment = segments[currentSegmentIndex];
    if (!currentSegment) return null;

    return (
      <div className="absolute inset-0 pointer-events-none z-10">
        {/* Subtitle */}
        {currentSegment.script && (
          <div 
            className="absolute left-1/2 transform -translate-x-1/2 bg-black/80 text-white px-4 py-2 rounded text-sm max-w-[90%] text-center"
            style={{ bottom: '15%' }}
          >
            {currentSegment.script}
          </div>
        )}
        
        {/* Animated Text */}
        {currentSegment.animatedText && currentSegment.animatedText !== "未设置" && (
          <div 
            className="absolute left-1/2 top-1/4 transform -translate-x-1/2 -translate-y-1/2 text-yellow-400 font-bold text-xl animate-pulse"
          >
            {currentSegment.animatedText}
          </div>
        )}
        
        {/* Sticker */}
        {currentSegment.sticker && currentSegment.sticker !== "未设置" && (
          <div 
            className="absolute right-4 top-4 bg-blue-500/20 border border-blue-500 text-blue-400 px-2 py-1 rounded text-xs"
          >
            贴纸: {currentSegment.sticker}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex h-full">
      {/* Video Preview */}
      <div className="w-1/3 bg-preview-bg border-r border-border p-6">
        <div className="relative bg-black rounded-lg aspect-video flex items-center justify-center overflow-hidden">
          {!isPreviewMode ? (
            <div className="text-white/60 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-white/10 rounded-full flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-white/60">
                  <path d="M8 5v14l11-7L8 5z" fill="currentColor"/>
                </svg>
              </div>
              <p className="text-sm">视频预览区域</p>
              <p className="text-xs mt-2 text-white/40">点击预览按钮查看效果</p>
            </div>
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-900 to-gray-700 flex items-center justify-center">
              <div className="text-white/40 text-center">
                <p className="text-sm mb-2">预览模式</p>
                <p className="text-xs">分段 {currentSegmentIndex + 1}/{segments.length}</p>
                <p className="text-xs mt-1">{segments[currentSegmentIndex]?.name}</p>
              </div>
            </div>
          )}
          
          {renderPreviewOverlays()}
        </div>
        
        {/* Preview Controls */}
        <div className="mt-6 space-y-4">
          <div className="flex gap-2">
            <Button
              variant={isPreviewMode ? "default" : "outline"}
              size="sm"
              onClick={togglePreview}
              className="flex-1"
            >
              {isPreviewMode ? <Pause size={16} /> : <Play size={16} />}
              {isPreviewMode ? "停止预览" : "开始预览"}
            </Button>
          </div>
          
          {isPreviewMode && segments.length > 0 && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentSegmentIndex(Math.max(0, currentSegmentIndex - 1))}
                disabled={currentSegmentIndex === 0}
              >
                上一段
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentSegmentIndex(Math.min(segments.length - 1, currentSegmentIndex + 1))}
                disabled={currentSegmentIndex >= segments.length - 1}
              >
                下一段
              </Button>
            </div>
          )}
        </div>
        
        <div className="bg-card p-4 rounded-lg border border-border">
          <h3 className="text-sm font-medium mb-3">项目信息</h3>
          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex justify-between">
              <span>总时长:</span>
              <span>45.6秒</span>
            </div>
            <div className="flex justify-between">
              <span>分段数:</span>
              <span>{segments.length}个</span>
            </div>
            <div className="flex justify-between">
              <span>分辨率:</span>
              <span>1920x1080</span>
            </div>
          </div>
        </div>
      </div>

      {/* Segment Table */}
      <SegmentTable onSegmentsChange={handleSegmentsChange} />
    </div>
  );
};

export default Editor;