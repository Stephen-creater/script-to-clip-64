import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward,
  Volume2,
  Maximize2,
  Check,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TrimModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoThumbnail: string;
  originalDuration: number; // in seconds
  requiredDuration: number; // duration needed based on script
  onConfirm: (inPoint: number, outPoint: number) => void;
}

// Generate filmstrip frames from video
const generateFilmstripFrames = (thumbnail: string, count: number = 12) => {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    src: thumbnail,
    time: i * (45 / count) // Distribute across 45 seconds
  }));
};

export const TrimModal = ({
  isOpen,
  onClose,
  videoThumbnail,
  originalDuration = 45,
  requiredDuration = 3.5,
  onConfirm
}: TrimModalProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(80);
  const [inPoint, setInPoint] = useState(0);
  const [outPoint, setOutPoint] = useState(requiredDuration);
  const [isDraggingLeft, setIsDraggingLeft] = useState(false);
  const [isDraggingRight, setIsDraggingRight] = useState(false);
  const [isDraggingSelection, setIsDraggingSelection] = useState(false);
  const timelineRef = useRef<HTMLDivElement>(null);
  const playIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const filmstripFrames = generateFilmstripFrames(videoThumbnail);
  const selectedDuration = outPoint - inPoint;

  // Simulate playback
  useEffect(() => {
    if (isPlaying) {
      playIntervalRef.current = setInterval(() => {
        setCurrentTime(prev => {
          if (prev >= outPoint) {
            setIsPlaying(false);
            return inPoint;
          }
          return prev + 0.1;
        });
      }, 100);
    } else {
      if (playIntervalRef.current) {
        clearInterval(playIntervalRef.current);
      }
    }
    return () => {
      if (playIntervalRef.current) {
        clearInterval(playIntervalRef.current);
      }
    };
  }, [isPlaying, inPoint, outPoint]);

  const handleTimelineMouseDown = (e: React.MouseEvent, type: 'left' | 'right' | 'selection') => {
    e.preventDefault();
    if (type === 'left') setIsDraggingLeft(true);
    else if (type === 'right') setIsDraggingRight(true);
    else setIsDraggingSelection(true);
  };

  const handleTimelineMouseMove = (e: React.MouseEvent) => {
    if (!timelineRef.current || (!isDraggingLeft && !isDraggingRight && !isDraggingSelection)) return;

    const rect = timelineRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, x / rect.width));
    const time = percentage * originalDuration;

    if (isDraggingLeft) {
      const newInPoint = Math.min(time, outPoint - 1);
      setInPoint(Math.max(0, newInPoint));
    } else if (isDraggingRight) {
      const newOutPoint = Math.max(time, inPoint + 1);
      setOutPoint(Math.min(originalDuration, newOutPoint));
    } else if (isDraggingSelection) {
      const duration = outPoint - inPoint;
      const center = time;
      let newInPoint = center - duration / 2;
      let newOutPoint = center + duration / 2;
      
      if (newInPoint < 0) {
        newInPoint = 0;
        newOutPoint = duration;
      }
      if (newOutPoint > originalDuration) {
        newOutPoint = originalDuration;
        newInPoint = originalDuration - duration;
      }
      
      setInPoint(newInPoint);
      setOutPoint(newOutPoint);
    }
  };

  const handleTimelineMouseUp = () => {
    setIsDraggingLeft(false);
    setIsDraggingRight(false);
    setIsDraggingSelection(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 10);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms}`;
  };

  const handleConfirm = () => {
    onConfirm(inPoint, outPoint);
    onClose();
  };

  const inPointPercent = (inPoint / originalDuration) * 100;
  const outPointPercent = (outPoint / originalDuration) * 100;
  const currentTimePercent = (currentTime / originalDuration) * 100;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl bg-zinc-900 border-zinc-800 text-white p-0 gap-0">
        <DialogHeader className="p-4 pb-2 border-b border-zinc-800">
          <DialogTitle className="text-base font-medium">截取素材片段</DialogTitle>
        </DialogHeader>

        <div className="p-4 space-y-4">
          {/* Video Preview */}
          <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
            <img 
              src={videoThumbnail} 
              alt="Video preview"
              className="w-full h-full object-cover"
            />
            
            {/* Playback Controls Overlay */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
              <div className="flex items-center gap-3">
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 text-white hover:bg-white/20"
                  onClick={() => setCurrentTime(inPoint)}
                >
                  <SkipBack size={16} />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-10 w-10 text-white hover:bg-white/20 rounded-full bg-white/10"
                  onClick={() => setIsPlaying(!isPlaying)}
                >
                  {isPlaying ? <Pause size={20} /> : <Play size={20} className="ml-0.5" />}
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 text-white hover:bg-white/20"
                  onClick={() => setCurrentTime(outPoint)}
                >
                  <SkipForward size={16} />
                </Button>
                
                <div className="flex-1 text-center">
                  <span className="text-sm font-mono text-white/80">
                    {formatTime(currentTime)} / {formatTime(originalDuration)}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Volume2 size={16} className="text-white/60" />
                  <Slider
                    value={[volume]}
                    onValueChange={(v) => setVolume(v[0])}
                    max={100}
                    className="w-20"
                  />
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 text-white hover:bg-white/20"
                >
                  <Maximize2 size={16} />
                </Button>
              </div>
            </div>

            {/* Current Time Indicator */}
            <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm px-2 py-1 rounded text-xs font-mono">
              选取: {formatTime(inPoint)} - {formatTime(outPoint)}
            </div>
          </div>

          {/* Filmstrip Timeline */}
          <div 
            ref={timelineRef}
            className="relative h-20 bg-zinc-800 rounded-lg overflow-hidden cursor-pointer select-none"
            onMouseMove={handleTimelineMouseMove}
            onMouseUp={handleTimelineMouseUp}
            onMouseLeave={handleTimelineMouseUp}
          >
            {/* Filmstrip Frames */}
            <div className="absolute inset-0 flex">
              {filmstripFrames.map((frame) => (
                <div 
                  key={frame.id}
                  className="flex-1 border-r border-zinc-700 last:border-r-0 overflow-hidden"
                >
                  <img 
                    src={frame.src} 
                    alt={`Frame ${frame.id}`}
                    className="w-full h-full object-cover opacity-60"
                  />
                </div>
              ))}
            </div>

            {/* Dimmed areas outside selection */}
            <div 
              className="absolute inset-y-0 left-0 bg-black/70"
              style={{ width: `${inPointPercent}%` }}
            />
            <div 
              className="absolute inset-y-0 right-0 bg-black/70"
              style={{ width: `${100 - outPointPercent}%` }}
            />

            {/* Selection Box */}
            <div 
              className="absolute inset-y-0 border-2 border-amber-400 bg-amber-400/10 cursor-move"
              style={{ 
                left: `${inPointPercent}%`, 
                width: `${outPointPercent - inPointPercent}%` 
              }}
              onMouseDown={(e) => handleTimelineMouseDown(e, 'selection')}
            >
              {/* Left Handle */}
              <div 
                className="absolute left-0 top-0 bottom-0 w-3 bg-amber-400 cursor-ew-resize flex items-center justify-center hover:bg-amber-300 transition-colors"
                onMouseDown={(e) => { e.stopPropagation(); handleTimelineMouseDown(e, 'left'); }}
              >
                <div className="w-0.5 h-8 bg-amber-600 rounded-full" />
              </div>
              
              {/* Right Handle */}
              <div 
                className="absolute right-0 top-0 bottom-0 w-3 bg-amber-400 cursor-ew-resize flex items-center justify-center hover:bg-amber-300 transition-colors"
                onMouseDown={(e) => { e.stopPropagation(); handleTimelineMouseDown(e, 'right'); }}
              >
                <div className="w-0.5 h-8 bg-amber-600 rounded-full" />
              </div>

              {/* Duration Label */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-amber-400 text-amber-900 text-xs font-bold px-2 py-0.5 rounded">
                {selectedDuration.toFixed(1)}s
              </div>
            </div>

            {/* Current Time Playhead */}
            <div 
              className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg pointer-events-none z-10"
              style={{ left: `${currentTimePercent}%` }}
            >
              <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-white rotate-45" />
            </div>

            {/* Time Markers */}
            <div className="absolute bottom-0 left-0 right-0 h-4 flex items-end">
              {[0, 0.25, 0.5, 0.75, 1].map((percent) => (
                <div 
                  key={percent}
                  className="absolute text-[9px] text-white/40 font-mono"
                  style={{ left: `${percent * 100}%`, transform: 'translateX(-50%)' }}
                >
                  {formatTime(percent * originalDuration)}
                </div>
              ))}
            </div>
          </div>

          {/* Info & Actions */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-zinc-500">选取时长:</span>
                <span className="font-mono text-amber-400">{selectedDuration.toFixed(1)}s</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-zinc-500">原始时长:</span>
                <span className="font-mono text-white/70">{formatTime(originalDuration)}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-zinc-500">需要时长:</span>
                <span className={cn(
                  "font-mono",
                  Math.abs(selectedDuration - requiredDuration) < 0.5 
                    ? "text-emerald-400" 
                    : "text-amber-400"
                )}>
                  ~{requiredDuration.toFixed(1)}s
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                onClick={onClose}
                className="text-zinc-400 hover:text-white hover:bg-zinc-800"
              >
                <X size={16} className="mr-1" />
                取消
              </Button>
              <Button
                onClick={handleConfirm}
                className="bg-amber-500 hover:bg-amber-600 text-black font-medium"
              >
                <Check size={16} className="mr-1" />
                确认裁剪
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TrimModal;
