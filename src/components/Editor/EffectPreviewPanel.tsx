import React, { useState } from "react";
import { X, Play, Image } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { CoverEditorModal } from "./CoverEditorModal";

interface PreviewItem {
  id: string;
  type: 'sticker' | 'animatedText' | 'material';
  content: string;
  position?: { x: number; y: number };
}

interface Segment {
  id: string;
  name: string;
  video?: string;
  script?: string;
  animatedText?: string;
  sticker?: string;
}

interface EffectPreviewPanelProps {
  isOpen: boolean;
  onClose: () => void;
  currentSegmentIndex: number;
  totalSegments: number;
  segment?: Segment;
  previewItems?: PreviewItem[];
}

export const EffectPreviewPanel: React.FC<EffectPreviewPanelProps> = ({
  isOpen,
  onClose,
  currentSegmentIndex,
  totalSegments,
  segment,
  previewItems = []
}) => {
  const [currentTime, setCurrentTime] = useState(0);
  const [totalTime] = useState(3); // 模拟3秒预览
  const [showCoverEditor, setShowCoverEditor] = useState(false);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCoverSave = (thumbnailUrl: string) => {
    console.log('Cover saved:', thumbnailUrl);
    // In real implementation, update the segment's thumbnail
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="w-[340px] flex-shrink-0 bg-card border-l border-border flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <h3 className="text-sm font-medium">效果预览 (9:16 竖屏)</h3>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onClose}>
            <X size={14} />
          </Button>
        </div>

        {/* Preview Area */}
        <div className="flex-1 p-4 flex flex-col">
          {/* Phone Screen Preview */}
          <div 
            className="relative mx-auto w-full rounded-lg overflow-hidden"
            style={{ 
              aspectRatio: '9/16',
              maxHeight: '400px',
              background: 'linear-gradient(135deg, hsl(250, 80%, 60%) 0%, hsl(280, 70%, 50%) 100%)'
            }}
          >
            {/* Grid Overlay */}
            <div 
              className="absolute inset-0 pointer-events-none"
              style={{
                backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
                backgroundSize: '20px 20px'
              }}
            />

            {/* TikTok Safe Zone Overlay */}
            <div className="absolute inset-0 pointer-events-none z-20">
              {/* Top Zone - TikTok Header Area */}
              <div 
                className="absolute top-0 left-0 right-0 bg-black/20"
                style={{ height: '12%' }}
              >
                <div className="absolute bottom-0 left-0 right-0 border-b border-dashed border-white/30" />
              </div>
              
              {/* Bottom Zone - TikTok Caption/Controls Area */}
              <div 
                className="absolute bottom-0 left-0 right-0 bg-black/20"
                style={{ height: '25%' }}
              >
                <div className="absolute top-0 left-0 right-0 border-t border-dashed border-white/30" />
              </div>
              
              {/* Right Side - TikTok Action Buttons Area */}
              <div 
                className="absolute right-0 bg-black/20"
                style={{ 
                  top: '12%',
                  bottom: '25%',
                  width: '15%'
                }}
              >
                <div className="absolute top-0 left-0 bottom-0 border-l border-dashed border-white/30" />
                {/* Mock TikTok buttons */}
                <div className="flex flex-col items-center justify-center h-full gap-3 py-4">
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                    <span className="text-white/60 text-xs">❤️</span>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                    <span className="text-white/60 text-xs">💬</span>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                    <span className="text-white/60 text-xs">↗️</span>
                  </div>
                </div>
              </div>

              {/* Safe Zone Indicator */}
              <div 
                className="absolute border-2 border-dashed border-green-400/50 rounded"
                style={{
                  top: '12%',
                  left: '3%',
                  right: '18%',
                  bottom: '25%'
                }}
              >
                <span className="absolute top-1 left-1 text-green-400/80 text-[8px] bg-black/30 px-1 rounded">安全区域</span>
              </div>

              {/* 字幕/操作安全区 Label */}
              <div 
                className="absolute text-white/60 text-[8px] bg-black/30 px-1 rounded"
                style={{ bottom: '26%', left: '3%' }}
              >
                字幕/操作安全区
              </div>
            </div>

            {/* Preview Content - Show segment content */}
            <div className="absolute inset-0 z-10 pointer-events-none">
              {/* Animated Text Display */}
              {segment?.animatedText && segment.animatedText !== "未设置" && (
                <div 
                  className="absolute left-4 right-16 top-1/4 text-yellow-400 font-bold text-lg text-center"
                  style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}
                >
                  {segment.animatedText}
                </div>
              )}
              
              {/* Sticker Display */}
              {segment?.sticker && segment.sticker !== "未设置" && (
                <div 
                  className="absolute left-4 top-[35%] bg-blue-500/30 border border-blue-400/50 text-white px-2 py-1 rounded text-xs"
                >
                  📍 {segment.sticker}
                </div>
              )}

              {/* Subtitle Display */}
              {segment?.script && (
                <div 
                  className="absolute left-3 right-14 bg-black/60 text-white px-2 py-1 rounded text-xs text-center"
                  style={{ bottom: '28%' }}
                >
                  {segment.script.length > 30 ? segment.script.substring(0, 30) + '...' : segment.script}
                </div>
              )}

              {/* Material Thumbnail Placeholder */}
              {segment?.video && (
                <div className="absolute top-[15%] left-4 bg-white/10 border border-white/20 rounded px-2 py-1 text-white/80 text-[10px]">
                  🎬 {segment.video}
                </div>
              )}
            </div>

            {/* Center Play Button Indicator (when no content) */}
            {!segment?.animatedText && !segment?.sticker && !segment?.script && (
              <div className="absolute inset-0 flex items-center justify-center z-5">
                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                  <Play size={20} className="text-white/40 ml-0.5" />
                </div>
              </div>
            )}
          </div>

          {/* Timeline Controls */}
          <div className="mt-4 bg-muted/50 rounded-lg p-3 space-y-3">
            {/* Segment Info */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">分段</span>
              <span className="font-medium">{currentSegmentIndex + 1} / {totalSegments || 0}</span>
            </div>

            {/* Segment Timeline */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{formatTime(0)}</span>
                <span>{formatTime(totalTime)}</span>
              </div>
              <Slider
                value={[currentTime]}
                onValueChange={(value) => setCurrentTime(value[0])}
                max={totalTime}
                step={0.01}
                className="w-full"
              />
            </div>

            {/* Total Progress */}
            <div className="pt-2 border-t border-border">
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-muted-foreground">总进度</span>
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{formatTime(0)}</span>
                <span>{formatTime(0)}</span>
              </div>
              <Slider
                value={[0]}
                max={100}
                step={1}
                className="w-full"
                disabled
              />
            </div>

            {/* Play Button */}
            <div className="flex justify-center pt-2">
              <Button variant="outline" size="icon" className="h-8 w-8 rounded-full">
                <Play size={14} className="ml-0.5" />
              </Button>
            </div>
          </div>

          {/* Cover Action Bar */}
          <div className="mt-4 pt-3 border-t border-border">
            <Button
              variant="outline"
              className="w-full h-10 gap-2 bg-background border-border text-foreground hover:bg-muted"
              onClick={() => setShowCoverEditor(true)}
            >
              <Image size={16} className="text-muted-foreground" />
              <span>制作封面</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Cover Editor Modal */}
      <CoverEditorModal
        isOpen={showCoverEditor}
        onClose={() => setShowCoverEditor(false)}
        onSave={handleCoverSave}
      />
    </>
  );
};

export default EffectPreviewPanel;
