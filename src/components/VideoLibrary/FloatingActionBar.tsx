import { Button } from "@/components/ui/button";
import { Download, Rocket, Trash2, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface FloatingActionBarProps {
  selectedCount: number;
  selectedGrades: { S: number; A: number; B: number; C: number };
  onDownload: () => void;
  onDistribute: () => void;
  onDelete: () => void;
  onClear: () => void;
}

const FloatingActionBar = ({
  selectedCount,
  selectedGrades,
  onDownload,
  onDistribute,
  onDelete,
  onClear
}: FloatingActionBarProps) => {
  if (selectedCount === 0) return null;

  // Build grade summary
  const gradeSummary = [];
  if (selectedGrades.S > 0) gradeSummary.push(`S级 ${selectedGrades.S}`);
  if (selectedGrades.A > 0) gradeSummary.push(`A级 ${selectedGrades.A}`);
  if (selectedGrades.B > 0 || selectedGrades.C > 0) {
    gradeSummary.push(`其他 ${selectedGrades.B + selectedGrades.C}`);
  }

  return (
    <div 
      className={cn(
        "fixed bottom-6 left-1/2 -translate-x-1/2 z-50",
        "bg-neutral-900/95 backdrop-blur-sm text-white",
        "rounded-2xl shadow-2xl border border-white/10",
        "px-6 py-4 flex items-center gap-6",
        "animate-in slide-in-from-bottom-4 fade-in duration-300"
      )}
    >
      {/* Left: Selection Info */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-white/60 hover:text-white hover:bg-white/10"
          onClick={onClear}
        >
          <X size={16} />
        </Button>
        <div>
          <p className="font-semibold">
            已选 {selectedCount} 个视频
          </p>
          {gradeSummary.length > 0 && (
            <p className="text-xs text-white/60">
              {gradeSummary.join(' · ')}
            </p>
          )}
        </div>
      </div>

      {/* Divider */}
      <div className="h-10 w-px bg-white/20" />

      {/* Right: Actions */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          className="text-white hover:bg-white/10"
          onClick={onDownload}
        >
          <Download size={16} className="mr-2" />
          批量下载
        </Button>
        
        <Button
          className="bg-gradient-to-r from-primary to-purple-500 hover:from-primary/90 hover:to-purple-500/90 text-white"
          onClick={onDistribute}
        >
          <Rocket size={16} className="mr-2" />
          一键分发到矩阵
        </Button>
        
        <Button
          variant="ghost"
          className="text-destructive hover:bg-destructive/10"
          onClick={onDelete}
        >
          <Trash2 size={16} />
        </Button>
      </div>
    </div>
  );
};

export default FloatingActionBar;
