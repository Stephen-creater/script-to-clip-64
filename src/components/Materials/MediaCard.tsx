import { useState, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  FileVideo,
  FileImage,
  FileAudio,
  CheckCircle,
  XCircle,
  Loader2,
  User,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Material } from "@/hooks/useMaterials";

interface MediaCardProps {
  material: Material;
  isSelected: boolean;
  onSelect: (id: string, checked: boolean) => void;
  onClick?: () => void;
  reviewStatus?: 'machine_review' | 'pending_human' | 'rejected' | 'approved';
  rejectionReason?: string;
  getMaterialUrl: (material: Material) => string;
}

const MediaCard = ({
  material,
  isSelected,
  onSelect,
  onClick,
  reviewStatus = 'approved',
  rejectionReason,
  getMaterialUrl,
}: MediaCardProps) => {
  const [isHovering, setIsHovering] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleMouseEnter = () => {
    setIsHovering(true);
    if (videoRef.current && material.file_type === 'video') {
      videoRef.current.play().catch(() => {});
    }
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return "";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case 'video':
        return <FileVideo size={24} className="text-blue-500" />;
      case 'image':
        return <FileImage size={24} className="text-green-500" />;
      case 'audio':
        return <FileAudio size={24} className="text-purple-500" />;
      default:
        return <FileVideo size={24} />;
    }
  };

  const renderStatusBadge = () => {
    switch (reviewStatus) {
      case 'machine_review':
        return (
          <Badge className="bg-warning/90 text-warning-foreground border-0 text-xs gap-1">
            <Loader2 size={10} className="animate-spin" />
            机审中
          </Badge>
        );
      case 'pending_human':
        return (
          <Badge className="bg-info/90 text-info-foreground border-0 text-xs gap-1">
            <User size={10} />
            待人审
          </Badge>
        );
      case 'rejected':
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge className="bg-destructive/90 text-destructive-foreground border-0 text-xs gap-1 cursor-help">
                  <XCircle size={10} />
                  已驳回
                </Badge>
              </TooltipTrigger>
              <TooltipContent className="bg-destructive text-destructive-foreground">
                <p>{rejectionReason || "审核未通过"}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      case 'approved':
        return (
          <Badge className="bg-success/90 text-success-foreground border-0 text-xs gap-1">
            <CheckCircle size={10} />
            已入库
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <div
      className={cn(
        "group bg-card border border-border rounded-lg overflow-hidden transition-all hover:shadow-card cursor-pointer",
        isSelected && "ring-2 ring-primary"
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
    >
      {/* Thumbnail Area */}
      <div className="relative aspect-video bg-muted">
        {/* Checkbox */}
        <div className="absolute top-2 left-2 z-10">
          <Checkbox
            checked={isSelected}
            onCheckedChange={(checked) => onSelect(material.id, !!checked)}
            onClick={(e) => e.stopPropagation()}
            className="bg-background/80 border-border"
          />
        </div>

        {/* Status Badge */}
        <div className="absolute top-2 right-2 z-10">
          {renderStatusBadge()}
        </div>

        {/* Thumbnail / Video Preview */}
        {material.file_type === 'video' ? (
          <>
            {isHovering ? (
              <video
                ref={videoRef}
                src={getMaterialUrl(material)}
                className="w-full h-full object-cover"
                muted
                loop
                playsInline
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                {getFileIcon(material.file_type)}
              </div>
            )}
          </>
        ) : material.file_type === 'image' ? (
          <img
            src={getMaterialUrl(material)}
            alt={material.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            {getFileIcon(material.file_type)}
          </div>
        )}

        {/* Duration Badge */}
        {material.duration && (
          <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded flex items-center gap-1">
            <Clock size={10} />
            {formatDuration(material.duration)}
          </div>
        )}
      </div>

      {/* Info Area */}
      <div className="p-3">
        {/* File Name */}
        <h4 className="text-sm font-medium truncate mb-2" title={material.name}>
          {material.name}
        </h4>

        {/* Tags */}
        {material.tags && material.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {material.tags.slice(0, 3).map((tag) => (
              <Badge
                key={tag}
                variant="outline"
                className="text-xs px-1.5 py-0 bg-muted/50"
              >
                #{tag}
              </Badge>
            ))}
            {material.tags.length > 3 && (
              <Badge variant="outline" className="text-xs px-1.5 py-0 bg-muted/50">
                +{material.tags.length - 3}
              </Badge>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MediaCard;
