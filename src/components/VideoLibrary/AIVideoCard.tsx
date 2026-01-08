import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { Play, Download, Trash2, Clock, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

export interface VideoWithAI {
  id: string;
  name: string;
  duration: string;
  size: string;
  createdAt: string;
  aiScore: number;
  aiGrade: 'S' | 'A' | 'B' | 'C';
  aiDetails: {
    scriptMatch: '高' | '中' | '低';
    visualRichness: '高' | '中' | '低';
    issues: string[];
  };
}

interface AIVideoCardProps {
  video: VideoWithAI;
  isSelected: boolean;
  onSelect: (videoId: string) => void;
  superMode: boolean;
}

const gradeStyles = {
  S: {
    border: "ring-2 ring-yellow-400/50 shadow-[0_0_20px_rgba(250,204,21,0.15)]",
    badge: "bg-gradient-to-r from-yellow-400 to-amber-500 text-black font-bold",
    glow: "after:absolute after:inset-0 after:rounded-lg after:bg-gradient-to-r after:from-yellow-400/10 after:to-amber-500/10 after:opacity-0 group-hover:after:opacity-100 after:transition-opacity"
  },
  A: {
    border: "ring-2 ring-green-400/50",
    badge: "bg-gradient-to-r from-green-400 to-emerald-500 text-white font-bold",
    glow: ""
  },
  B: {
    border: "ring-1 ring-muted-foreground/30 opacity-75",
    badge: "bg-muted text-muted-foreground",
    glow: ""
  },
  C: {
    border: "ring-1 ring-muted-foreground/20 opacity-60",
    badge: "bg-muted text-muted-foreground",
    glow: ""
  }
};

const AIVideoCard = ({ video, isSelected, onSelect, superMode }: AIVideoCardProps) => {
  const style = gradeStyles[video.aiGrade];

  return (
    <Card 
      className={cn(
        "group relative transition-all duration-300",
        superMode && style.border,
        superMode && style.glow
      )}
    >
      <CardContent className="p-4">
        {/* Top: Checkbox + AI Score */}
        <div className="flex items-center justify-between mb-3">
          <Checkbox
            checked={isSelected}
            onCheckedChange={() => onSelect(video.id)}
          />
          
          {superMode && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge className={cn("cursor-help", style.badge)}>
                    {video.aiScore} · {video.aiGrade}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent 
                  side="top" 
                  className="bg-popover border border-border shadow-xl p-3 max-w-xs"
                >
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between gap-4">
                      <span className="text-muted-foreground">脚本匹配度:</span>
                      <span className={cn(
                        "font-medium",
                        video.aiDetails.scriptMatch === '高' && "text-green-500",
                        video.aiDetails.scriptMatch === '中' && "text-yellow-500",
                        video.aiDetails.scriptMatch === '低' && "text-red-500"
                      )}>
                        {video.aiDetails.scriptMatch}
                      </span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span className="text-muted-foreground">画面丰富度:</span>
                      <span className={cn(
                        "font-medium",
                        video.aiDetails.visualRichness === '高' && "text-green-500",
                        video.aiDetails.visualRichness === '中' && "text-yellow-500",
                        video.aiDetails.visualRichness === '低' && "text-red-500"
                      )}>
                        {video.aiDetails.visualRichness}
                      </span>
                    </div>
                    {video.aiDetails.issues.length > 0 ? (
                      <div className="pt-1 border-t border-border">
                        <span className="text-destructive text-xs">
                          问题: {video.aiDetails.issues.join(', ')}
                        </span>
                      </div>
                    ) : (
                      <div className="pt-1 border-t border-border">
                        <span className="text-green-500 text-xs">✓ 无硬伤</span>
                      </div>
                    )}
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>

        {/* Video Thumbnail */}
        <div className="aspect-video bg-muted rounded-lg mb-3 flex items-center justify-center relative overflow-hidden">
          <Play size={32} className="text-muted-foreground" />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
            <Button size="sm" variant="secondary">
              <Play size={16} className="mr-2" />
              预览
            </Button>
          </div>
        </div>

        {/* Video Info */}
        <div className="space-y-2">
          <h3 className="font-medium text-sm truncate">{video.name}</h3>
          
          {/* Issue Tags (Only show in super mode for B/C grade) */}
          {superMode && (video.aiGrade === 'B' || video.aiGrade === 'C') && video.aiDetails.issues.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {video.aiDetails.issues.map((issue, idx) => (
                <Badge 
                  key={idx} 
                  variant="outline" 
                  className="text-xs bg-destructive/10 text-destructive border-destructive/20"
                >
                  {issue}
                </Badge>
              ))}
            </div>
          )}
          
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock size={12} />
              {video.duration}
            </div>
            <span>{video.size}</span>
          </div>

          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar size={12} />
            {video.createdAt}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 pt-2">
            <Button size="sm" variant="outline" className="flex-1">
              <Download size={14} className="mr-1" />
              下载
            </Button>
            <Button size="sm" variant="outline">
              <Trash2 size={14} />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AIVideoCard;
