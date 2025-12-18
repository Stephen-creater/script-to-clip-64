import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  FileVideo,
  FileImage,
  FileAudio,
  CheckCircle,
  XCircle,
  Loader2,
  User,
  Clock,
  Calendar,
  Tag,
  AlertTriangle,
} from "lucide-react";
import { Material } from "@/hooks/useMaterials";
import { cn } from "@/lib/utils";

interface MaterialPreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  material: Material | null;
  reviewStatus?: 'machine_review' | 'pending_human' | 'rejected' | 'approved';
  rejectionReason?: string;
  getMaterialUrl: (material: Material) => string;
}

const MaterialPreviewModal = ({
  open,
  onOpenChange,
  material,
  reviewStatus = 'approved',
  rejectionReason,
  getMaterialUrl,
}: MaterialPreviewModalProps) => {
  if (!material) return null;

  const formatDuration = (seconds?: number) => {
    if (!seconds) return "未知";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const getStatusInfo = () => {
    switch (reviewStatus) {
      case 'machine_review':
        return {
          label: '机审中',
          icon: <Loader2 size={14} className="animate-spin" />,
          className: 'bg-warning/90 text-warning-foreground',
        };
      case 'pending_human':
        return {
          label: '待人审',
          icon: <User size={14} />,
          className: 'bg-info/90 text-info-foreground',
        };
      case 'rejected':
        return {
          label: '已驳回',
          icon: <XCircle size={14} />,
          className: 'bg-destructive/90 text-destructive-foreground',
        };
      case 'approved':
        return {
          label: '已入库',
          icon: <CheckCircle size={14} />,
          className: 'bg-success/90 text-success-foreground',
        };
      default:
        return null;
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            素材预览
            {statusInfo && (
              <Badge className={cn("text-xs gap-1", statusInfo.className)}>
                {statusInfo.icon}
                {statusInfo.label}
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Preview Area */}
            <div className="space-y-4">
              <div className="bg-muted rounded-lg overflow-hidden aspect-video flex items-center justify-center">
                {material.file_type === 'video' ? (
                  <video
                    src={getMaterialUrl(material)}
                    controls
                    className="w-full h-full object-contain"
                  />
                ) : material.file_type === 'image' ? (
                  <img
                    src={getMaterialUrl(material)}
                    alt={material.name}
                    className="w-full h-full object-contain"
                  />
                ) : material.file_type === 'audio' ? (
                  <div className="flex flex-col items-center gap-4 p-6">
                    <FileAudio size={64} className="text-purple-500" />
                    <audio
                      src={getMaterialUrl(material)}
                      controls
                      className="w-full"
                    />
                  </div>
                ) : (
                  <FileVideo size={64} className="text-muted-foreground" />
                )}
              </div>
            </div>

            {/* Info Area */}
            <div className="space-y-4">
              {/* Rejection Reason Alert */}
              {reviewStatus === 'rejected' && rejectionReason && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="text-destructive mt-0.5" size={20} />
                    <div>
                      <h4 className="font-medium text-destructive mb-1">驳回原因</h4>
                      <p className="text-sm text-destructive/80">{rejectionReason}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* File Info */}
              <div className="bg-card border border-border rounded-lg p-4 space-y-3">
                <h4 className="font-medium">文件信息</h4>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">文件名</span>
                    <span className="font-medium truncate ml-2 max-w-[200px]" title={material.name}>
                      {material.name}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">文件类型</span>
                    <span className="capitalize">{material.file_type}</span>
                  </div>
                  
                  {material.duration && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Clock size={12} /> 时长
                      </span>
                      <span>{formatDuration(material.duration)}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Calendar size={12} /> 上传时间
                    </span>
                    <span>{material.created_at ? new Date(material.created_at).toLocaleDateString() : '未知'}</span>
                  </div>
                </div>
              </div>

              {/* Tags */}
              {material.tags && material.tags.length > 0 && (
                <div className="bg-card border border-border rounded-lg p-4 space-y-3">
                  <h4 className="font-medium flex items-center gap-2">
                    <Tag size={14} />
                    标签
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {material.tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="outline"
                        className="text-xs"
                      >
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
                  关闭
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MaterialPreviewModal;
