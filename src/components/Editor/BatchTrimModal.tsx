import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { SkipBack, Shrink, SkipForward, Shuffle } from "lucide-react";

interface BatchTrimModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTrim: (settings: { mode: string; duration: number }) => void;
}

const trimModes = [
  { id: "start", label: "取前段", icon: SkipBack, iconStyle: "rotate-0" },
  { id: "middle", label: "取中段", icon: Shrink, iconStyle: "" },
  { id: "end", label: "取后段", icon: SkipForward, iconStyle: "" },
  { id: "random", label: "随机", icon: Shuffle, iconStyle: "" },
];

export const BatchTrimModal = ({ isOpen, onClose, onTrim }: BatchTrimModalProps) => {
  const [selectedMode, setSelectedMode] = useState("start");
  const [duration, setDuration] = useState(0.04);

  const handleTrim = () => {
    onTrim({ mode: selectedMode, duration });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[480px] bg-neutral-900 border-neutral-700 text-white p-0">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle className="text-lg font-semibold text-white">批量裁剪</DialogTitle>
        </DialogHeader>

        <div className="px-6 pb-6 space-y-6">
          {/* Warning Banner */}
          <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg px-4 py-3">
            <p className="text-orange-400 text-sm">
              此操作会同步改变所有分段的视频截取逻辑
            </p>
          </div>

          {/* Trim Mode Selection */}
          <div className="space-y-3">
            <label className="text-sm text-neutral-400">选取方式</label>
            <div className="grid grid-cols-4 gap-3">
              {trimModes.map((mode) => {
                const Icon = mode.icon;
                return (
                  <button
                    key={mode.id}
                    onClick={() => setSelectedMode(mode.id)}
                    className={cn(
                      "flex flex-col items-center justify-center gap-2 p-4 rounded-lg border transition-all",
                      selectedMode === mode.id
                        ? "bg-blue-600/20 border-blue-500 text-blue-400"
                        : "bg-neutral-800 border-neutral-700 text-neutral-400 hover:bg-neutral-700 hover:border-neutral-600"
                    )}
                  >
                    <Icon size={20} className={mode.iconStyle} />
                    <span className="text-xs font-medium">{mode.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Duration Slider */}
          <div className="space-y-3">
            <label className="text-sm text-neutral-400">选取时长</label>
            <div className="flex items-center gap-4">
              <span className="text-sm text-neutral-500 w-12">{duration.toFixed(2)}s</span>
              <Slider
                value={[duration]}
                onValueChange={(value) => setDuration(value[0])}
                min={0.01}
                max={10}
                step={0.01}
                className="flex-1"
              />
              <Input
                type="number"
                value={duration}
                onChange={(e) => setDuration(parseFloat(e.target.value) || 0)}
                min={0.01}
                max={10}
                step={0.01}
                className="w-20 bg-neutral-800 border-neutral-700 text-white text-center"
              />
            </div>
          </div>

          {/* Action Button */}
          <Button
            onClick={handleTrim}
            className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium"
          >
            立即裁剪
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BatchTrimModal;
