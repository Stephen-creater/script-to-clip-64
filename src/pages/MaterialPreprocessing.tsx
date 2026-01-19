import { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  Upload, 
  Sparkles, 
  Scissors, 
  HelpCircle,
  X,
  Play,
  Download,
  RotateCcw,
  Trash2,
  Check,
  AlertCircle,
  FileVideo,
  Eye,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// Types
interface VideoSegment {
  id: string;
  startTime: number;
  endTime: number;
  thumbnail?: string;
  downloadUrl?: string;
}

interface TaskResult {
  originalResolution?: string;
  outputResolution?: string;
  originalSize?: number;
  outputSize?: number;
  removedItems?: {
    watermarks: number;
    subtitles: number;
  };
  repairQuality?: 'excellent' | 'good' | 'fair';
  segments?: VideoSegment[];
}

interface VideoTask {
  id: string;
  filename: string;
  duration: number;
  size: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress?: number;
  estimatedTime?: number;
  processingTime?: number;
  result?: TaskResult;
  error?: string;
  uploadTime: Date;
  // Module 2 specific config
  removeConfig?: {
    mode: 'auto' | 'manual';
    items: ('watermark' | 'subtitle' | 'logo')[];
  };
  // Module 3 specific config
  segmentConfig?: {
    mode: 'scene' | 'fixed' | 'keyframe';
    sensitivity: number;
    minDuration: number;
  };
}

interface Module {
  id: 'enhance' | 'remove' | 'segment';
  name: string;
  icon: React.ElementType;
  description: string;
  helpText: string[];
  tasks: VideoTask[];
}

// Initial mock data
const createInitialModules = (): Module[] => [
  {
    id: 'enhance',
    name: '视频变清晰',
    icon: Sparkles,
    description: 'AI 智能提升画质至高清',
    helpText: [
      '建议上传 720p 及以下视频',
      '处理时间约为视频时长的 2-3 倍',
      '支持最高输出 4K'
    ],
    tasks: [
      {
        id: 'e1',
        filename: 'beach_sunset.mp4',
        duration: 52,
        size: 45,
        status: 'completed',
        processingTime: 92,
        result: {
          originalResolution: '720p',
          outputResolution: '1080p',
          originalSize: 45,
          outputSize: 68
        },
        uploadTime: new Date()
      },
      {
        id: 'e2',
        filename: 'forest_walk.mp4',
        duration: 80,
        size: 62,
        status: 'completed',
        processingTime: 135,
        result: {
          originalResolution: '480p',
          outputResolution: '1080p',
          originalSize: 62,
          outputSize: 95
        },
        uploadTime: new Date()
      },
      {
        id: 'e3',
        filename: 'mountain_scene.mp4',
        duration: 45,
        size: 38,
        status: 'processing',
        progress: 65,
        estimatedTime: 30,
        uploadTime: new Date()
      },
      {
        id: 'e4',
        filename: 'night_city.mp4',
        duration: 130,
        size: 89,
        status: 'failed',
        error: '视频格式不支持',
        uploadTime: new Date()
      }
    ]
  },
  {
    id: 'remove',
    name: '去水印/字幕',
    icon: Scissors,
    description: 'AI 智能移除水印和字幕',
    helpText: [
      '水印面积不超过画面 20% 效果最佳',
      '复杂背景可能影响修复质量',
      '建议预览确认效果'
    ],
    tasks: [
      {
        id: 'r1',
        filename: 'promo_video.mp4',
        duration: 65,
        size: 52,
        status: 'completed',
        processingTime: 125,
        result: {
          removedItems: { watermarks: 2, subtitles: 1 },
          repairQuality: 'excellent'
        },
        uploadTime: new Date()
      }
    ]
  },
  {
    id: 'segment',
    name: '智能分镜',
    icon: Scissors,
    description: 'AI 自动识别场景切换',
    helpText: [
      '建议视频时长 30秒 - 10分钟',
      '场景变化明显时效果最佳',
      '可手动调整分镜点'
    ],
    tasks: [
      {
        id: 's1',
        filename: 'city_tour.mp4',
        duration: 180,
        size: 125,
        status: 'completed',
        processingTime: 45,
        result: {
          segments: [
            { id: 'seg1', startTime: 0, endTime: 5, thumbnail: 'bg-blue-200' },
            { id: 'seg2', startTime: 5, endTime: 12, thumbnail: 'bg-emerald-200' },
            { id: 'seg3', startTime: 12, endTime: 18, thumbnail: 'bg-orange-200' },
            { id: 'seg4', startTime: 18, endTime: 25, thumbnail: 'bg-purple-200' },
            { id: 'seg5', startTime: 25, endTime: 32, thumbnail: 'bg-pink-200' },
            { id: 'seg6', startTime: 32, endTime: 38, thumbnail: 'bg-cyan-200' },
            { id: 'seg7', startTime: 38, endTime: 45, thumbnail: 'bg-yellow-200' },
            { id: 'seg8', startTime: 45, endTime: 52, thumbnail: 'bg-red-200' },
            { id: 'seg9', startTime: 52, endTime: 60, thumbnail: 'bg-indigo-200' },
            { id: 'seg10', startTime: 60, endTime: 68, thumbnail: 'bg-teal-200' },
            { id: 'seg11', startTime: 68, endTime: 75, thumbnail: 'bg-lime-200' },
            { id: 'seg12', startTime: 75, endTime: 82, thumbnail: 'bg-amber-200' },
          ]
        },
        uploadTime: new Date()
      }
    ]
  }
];

// Helper functions
const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const getQualityLabel = (quality: 'excellent' | 'good' | 'fair'): string => {
  const labels = { excellent: '优秀', good: '良好', fair: '一般' };
  return labels[quality];
};

// Module Card Component
interface ModuleCardProps {
  module: Module;
  onUpload: (files: FileList, moduleId: string) => void;
  onStartProcess: (taskId: string, moduleId: string) => void;
  onStartAll: (moduleId: string) => void;
  onCancel: (taskId: string, moduleId: string) => void;
  onDelete: (taskId: string, moduleId: string) => void;
  onRetry: (taskId: string, moduleId: string) => void;
  onDownload: (taskId: string, moduleId: string) => void;
  onDownloadAll: (moduleId: string) => void;
  onBatchUpload: (moduleId: string) => void;
  onConfigTask: (task: VideoTask, moduleId: string) => void;
}

const ModuleCard = ({
  module,
  onUpload,
  onStartProcess,
  onStartAll,
  onCancel,
  onDelete,
  onRetry,
  onDownload,
  onDownloadAll,
  onBatchUpload,
  onConfigTask
}: ModuleCardProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const pendingTasks = module.tasks.filter(t => t.status === 'pending');
  const processingTasks = module.tasks.filter(t => t.status === 'processing');
  const completedTasks = module.tasks.filter(t => t.status === 'completed');
  const failedTasks = module.tasks.filter(t => t.status === 'failed');

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files.length > 0) {
      onUpload(e.dataTransfer.files, module.id);
    }
  }, [onUpload, module.id]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onUpload(e.target.files, module.id);
    }
  };

  const Icon = module.icon;

  return (
    <div className="bg-card border border-border rounded-lg flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon size={18} className="text-primary" />
          <h3 className="font-medium text-foreground">{module.name}</h3>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onBatchUpload(module.id)}
          >
            批量上传
          </Button>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <HelpCircle size={16} className="text-muted-foreground" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="max-w-xs">
              <ul className="text-xs space-y-1">
                {module.helpText.map((text, i) => (
                  <li key={i}>• {text}</li>
                ))}
              </ul>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Upload Area - Show when no tasks */}
        {module.tasks.length === 0 && (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
              isDragging 
                ? "border-primary bg-primary/5" 
                : "border-border hover:border-muted-foreground"
            )}
          >
            <Upload size={32} className="mx-auto text-muted-foreground mb-3" />
            <p className="text-sm font-medium text-foreground mb-1">
              点击上传或拖拽视频
            </p>
            <p className="text-xs text-muted-foreground">
              支持格式：MP4, MOV, AVI · 最大 500MB
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              multiple
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
        )}

        {/* Small upload button when has tasks */}
        {module.tasks.length > 0 && (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              "border border-dashed rounded-lg p-3 text-center cursor-pointer transition-colors flex items-center justify-center gap-2",
              isDragging 
                ? "border-primary bg-primary/5" 
                : "border-border hover:border-muted-foreground"
            )}
          >
            <Upload size={16} className="text-muted-foreground" />
            <span className="text-xs text-muted-foreground">点击或拖拽上传</span>
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              multiple
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
        )}

        {/* Pending Tasks */}
        {pendingTasks.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">
                待处理 ({pendingTasks.length})
              </span>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onStartAll(module.id)}
              >
                全部开始处理
              </Button>
            </div>
            <div className="space-y-2">
              {pendingTasks.map(task => (
                <div 
                  key={task.id}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <FileVideo size={16} className="text-muted-foreground flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm text-foreground truncate">{task.filename}</p>
                      <p className="text-xs text-muted-foreground">{formatDuration(task.duration)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {(module.id === 'remove' || module.id === 'segment') && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => onConfigTask(task, module.id)}
                      >
                        配置
                      </Button>
                    )}
                    <Button 
                      variant="default" 
                      size="sm"
                      onClick={() => onStartProcess(task.id, module.id)}
                    >
                      开始处理
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => onDelete(task.id, module.id)}
                    >
                      <X size={14} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Processing Tasks */}
        {processingTasks.length > 0 && (
          <div className="space-y-2">
            <span className="text-sm font-medium text-blue-600">
              处理中 ({processingTasks.length})
            </span>
            <div className="space-y-2">
              {processingTasks.map(task => (
                <div 
                  key={task.id}
                  className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <Loader2 size={14} className="text-blue-600 animate-spin flex-shrink-0" />
                      <span className="text-sm text-foreground truncate">{task.filename}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{formatDuration(task.duration)}</span>
                  </div>
                  <Progress value={task.progress || 0} className="h-2 mb-2" />
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      预计剩余 {task.estimatedTime} 秒
                    </span>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="h-6 text-xs"
                      onClick={() => onCancel(task.id, module.id)}
                    >
                      取消
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Completed Tasks */}
        {completedTasks.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-emerald-600">
                已完成 ({completedTasks.length})
              </span>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onDownloadAll(module.id)}
              >
                全部下载
              </Button>
            </div>
            <div className="space-y-2">
              {completedTasks.map(task => (
                <CompletedTaskItem 
                  key={task.id}
                  task={task}
                  moduleId={module.id}
                  onDownload={onDownload}
                  onDelete={onDelete}
                />
              ))}
            </div>
          </div>
        )}

        {/* Failed Tasks */}
        {failedTasks.length > 0 && (
          <div className="space-y-2">
            <span className="text-sm font-medium text-red-600">
              失败 ({failedTasks.length})
            </span>
            <div className="space-y-2">
              {failedTasks.map(task => (
                <div 
                  key={task.id}
                  className="p-3 bg-red-50 dark:bg-red-950/30 rounded-lg border border-red-200 dark:border-red-800"
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2 min-w-0">
                      <AlertCircle size={14} className="text-red-600 flex-shrink-0" />
                      <span className="text-sm text-foreground truncate">{task.filename}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{formatDuration(task.duration)}</span>
                  </div>
                  <p className="text-xs text-red-600 mb-2 ml-6">错误：{task.error}</p>
                  <div className="flex items-center gap-2 justify-end">
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="h-6 text-xs"
                      onClick={() => onRetry(task.id, module.id)}
                    >
                      <RotateCcw size={12} className="mr-1" />
                      重试
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="h-6 text-xs"
                      onClick={() => onDelete(task.id, module.id)}
                    >
                      <Trash2 size={12} className="mr-1" />
                      删除
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty state for queue */}
        {module.tasks.length === 0 && (
          <div className="text-center py-4">
            <p className="text-xs text-muted-foreground">暂无处理任务</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Completed Task Item Component
interface CompletedTaskItemProps {
  task: VideoTask;
  moduleId: string;
  onDownload: (taskId: string, moduleId: string) => void;
  onDelete: (taskId: string, moduleId: string) => void;
}

const CompletedTaskItem = ({ task, moduleId, onDownload, onDelete }: CompletedTaskItemProps) => {
  const [showSegments, setShowSegments] = useState(false);

  return (
    <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg border border-emerald-200 dark:border-emerald-800">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <Check size={14} className="text-emerald-600 flex-shrink-0" />
          <span className="text-sm text-foreground truncate">{task.filename}</span>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Button 
            variant="outline" 
            size="sm"
            className="h-6 text-xs"
            onClick={() => onDownload(task.id, moduleId)}
          >
            <Download size={12} className="mr-1" />
            下载
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            className="h-6 text-xs"
          >
            <Eye size={12} className="mr-1" />
            预览
          </Button>
        </div>
      </div>
      
      {/* Result details based on module type */}
      <div className="ml-6 text-xs text-muted-foreground space-y-0.5">
        <p>处理时间: {Math.floor((task.processingTime || 0) / 60)}分{(task.processingTime || 0) % 60}秒</p>
        
        {/* Enhance module results */}
        {moduleId === 'enhance' && task.result && (
          <p>画质提升: {task.result.originalResolution} → {task.result.outputResolution}</p>
        )}
        
        {/* Remove module results */}
        {moduleId === 'remove' && task.result?.removedItems && (
          <>
            <p>
              移除: {task.result.removedItems.watermarks}个水印
              {task.result.removedItems.subtitles > 0 && `, ${task.result.removedItems.subtitles}处字幕`}
            </p>
            <p>修复质量: {getQualityLabel(task.result.repairQuality || 'good')}</p>
          </>
        )}
        
        {/* Segment module results */}
        {moduleId === 'segment' && task.result?.segments && (
          <>
            <p>分镜数量: {task.result.segments.length}个片段</p>
            <div className="flex items-center gap-2 mt-2">
              <Button 
                variant="outline" 
                size="sm"
                className="h-6 text-xs"
                onClick={() => setShowSegments(!showSegments)}
              >
                {showSegments ? '收起分镜' : '查看所有分镜'}
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                className="h-6 text-xs"
              >
                批量下载
              </Button>
            </div>
            
            {showSegments && (
              <div className="grid grid-cols-3 gap-2 mt-3">
                {task.result.segments.slice(0, 6).map((segment, idx) => (
                  <div 
                    key={segment.id}
                    className={cn(
                      "aspect-video rounded relative overflow-hidden",
                      segment.thumbnail || "bg-slate-200"
                    )}
                  >
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 hover:opacity-100 transition-opacity">
                      <Play size={16} className="text-white" />
                    </div>
                    <div className="absolute bottom-1 left-1 right-1 flex items-center justify-between">
                      <span className="text-[10px] text-white bg-black/60 px-1 rounded">
                        片段{idx + 1}
                      </span>
                      <span className="text-[10px] text-white bg-black/60 px-1 rounded">
                        {formatTime(segment.startTime)}-{formatTime(segment.endTime)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {showSegments && task.result.segments.length > 6 && (
              <p className="text-center text-xs text-muted-foreground mt-2">
                还有 {task.result.segments.length - 6} 个片段...
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
};

// Batch Upload Dialog
interface BatchUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  moduleId: string;
  onConfirm: (files: File[], autoStart: boolean) => void;
}

const BatchUploadDialog = ({ open, onOpenChange, moduleId, onConfirm }: BatchUploadDialogProps) => {
  const [files, setFiles] = useState<File[]>([]);
  const [autoStart, setAutoStart] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(prev => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const handleRemoveFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const totalSize = files.reduce((acc, f) => acc + f.size, 0) / (1024 * 1024);

  const handleConfirm = () => {
    onConfirm(files, autoStart);
    setFiles([]);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>批量上传视频</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-muted-foreground transition-colors"
          >
            <Upload size={24} className="mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">拖拽多个文件到此处</p>
            <p className="text-sm text-muted-foreground mb-2">或</p>
            <Button variant="outline" size="sm">选择文件</Button>
            {files.length > 0 && (
              <p className="text-sm text-primary mt-2">已选择 {files.length} 个文件</p>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              multiple
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          {files.length > 0 && (
            <>
              <div className="max-h-40 overflow-y-auto space-y-2">
                {files.map((file, idx) => (
                  <div 
                    key={idx}
                    className="flex items-center justify-between p-2 bg-muted rounded"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <Checkbox checked={true} />
                      <span className="text-sm truncate">{file.name}</span>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-xs text-muted-foreground">
                        {(file.size / (1024 * 1024)).toFixed(1)} MB
                      </span>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => handleRemoveFile(idx)}
                      >
                        <X size={12} />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <p className="text-sm text-muted-foreground">
                总大小: {totalSize.toFixed(1)} MB
              </p>

              <div className="space-y-2">
                <p className="text-sm font-medium">处理完成后:</p>
                <RadioGroup 
                  value={autoStart ? 'auto' : 'manual'}
                  onValueChange={(v) => setAutoStart(v === 'auto')}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="auto" id="auto" />
                    <Label htmlFor="auto" className="text-sm">自动开始处理</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="manual" id="manual" />
                    <Label htmlFor="manual" className="text-sm">手动确认后处理</Label>
                  </div>
                </RadioGroup>
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>取消</Button>
          <Button onClick={handleConfirm} disabled={files.length === 0}>
            确认上传
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Remove Config Dialog
interface RemoveConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: VideoTask | null;
  onConfirm: (config: VideoTask['removeConfig']) => void;
}

const RemoveConfigDialog = ({ open, onOpenChange, task, onConfirm }: RemoveConfigDialogProps) => {
  const [mode, setMode] = useState<'auto' | 'manual'>('auto');
  const [items, setItems] = useState<('watermark' | 'subtitle' | 'logo')[]>(['watermark', 'subtitle']);

  const toggleItem = (item: 'watermark' | 'subtitle' | 'logo') => {
    setItems(prev => 
      prev.includes(item) 
        ? prev.filter(i => i !== item)
        : [...prev, item]
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>去水印/字幕配置</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
            <FileVideo size={16} className="text-muted-foreground" />
            <span className="text-sm">{task?.filename}</span>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">检测模式:</p>
            <RadioGroup 
              value={mode}
              onValueChange={(v) => setMode(v as 'auto' | 'manual')}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="auto" id="auto-detect" />
                <Label htmlFor="auto-detect" className="text-sm">自动检测</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="manual" id="manual-mark" />
                <Label htmlFor="manual-mark" className="text-sm">手动标记</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">去除内容:</p>
            <div className="flex items-center gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="watermark" 
                  checked={items.includes('watermark')}
                  onCheckedChange={() => toggleItem('watermark')}
                />
                <Label htmlFor="watermark" className="text-sm">水印</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="subtitle" 
                  checked={items.includes('subtitle')}
                  onCheckedChange={() => toggleItem('subtitle')}
                />
                <Label htmlFor="subtitle" className="text-sm">字幕</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="logo" 
                  checked={items.includes('logo')}
                  onCheckedChange={() => toggleItem('logo')}
                />
                <Label htmlFor="logo" className="text-sm">Logo</Label>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>取消</Button>
          <Button onClick={() => {
            onConfirm({ mode, items });
            onOpenChange(false);
          }}>
            开始处理
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Segment Config Dialog
interface SegmentConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: VideoTask | null;
  onConfirm: (config: VideoTask['segmentConfig']) => void;
}

const SegmentConfigDialog = ({ open, onOpenChange, task, onConfirm }: SegmentConfigDialogProps) => {
  const [mode, setMode] = useState<'scene' | 'fixed' | 'keyframe'>('scene');
  const [sensitivity, setSensitivity] = useState([50]);
  const [minDuration, setMinDuration] = useState('3');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>智能分镜配置</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
            <FileVideo size={16} className="text-muted-foreground" />
            <span className="text-sm">{task?.filename}</span>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">分镜模式:</p>
            <RadioGroup 
              value={mode}
              onValueChange={(v) => setMode(v as 'scene' | 'fixed' | 'keyframe')}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="scene" id="scene-mode" />
                <Label htmlFor="scene-mode" className="text-sm">场景切换</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="fixed" id="fixed-mode" />
                <Label htmlFor="fixed-mode" className="text-sm">固定时长</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="keyframe" id="keyframe-mode" />
                <Label htmlFor="keyframe-mode" className="text-sm">关键帧</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">敏感度:</p>
              <span className="text-xs text-muted-foreground">{sensitivity[0]}%</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground">低</span>
              <Slider 
                value={sensitivity}
                onValueChange={setSensitivity}
                max={100}
                step={1}
                className="flex-1"
              />
              <span className="text-xs text-muted-foreground">高</span>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">最小片段时长:</p>
            <div className="flex items-center gap-2">
              <Input 
                type="number"
                value={minDuration}
                onChange={(e) => setMinDuration(e.target.value)}
                className="w-20"
                min={1}
              />
              <span className="text-sm text-muted-foreground">秒</span>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>取消</Button>
          <Button onClick={() => {
            onConfirm({ 
              mode, 
              sensitivity: sensitivity[0], 
              minDuration: parseInt(minDuration) || 3 
            });
            onOpenChange(false);
          }}>
            开始处理
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Main Component
const MaterialPreprocessing = () => {
  const navigate = useNavigate();
  const [modules, setModules] = useState<Module[]>(createInitialModules);
  
  // Dialog states
  const [batchUploadOpen, setBatchUploadOpen] = useState(false);
  const [batchUploadModuleId, setBatchUploadModuleId] = useState<string>('');
  const [removeConfigOpen, setRemoveConfigOpen] = useState(false);
  const [segmentConfigOpen, setSegmentConfigOpen] = useState(false);
  const [configTask, setConfigTask] = useState<VideoTask | null>(null);

  // Handlers
  const handleUpload = (files: FileList, moduleId: string) => {
    const newTasks: VideoTask[] = Array.from(files).map((file, idx) => ({
      id: `${moduleId}-${Date.now()}-${idx}`,
      filename: file.name,
      duration: Math.floor(Math.random() * 180) + 30,
      size: Math.floor(file.size / (1024 * 1024)),
      status: 'pending' as const,
      uploadTime: new Date()
    }));

    setModules(prev => prev.map(m => 
      m.id === moduleId 
        ? { ...m, tasks: [...m.tasks, ...newTasks] }
        : m
    ));
    toast.success(`已添加 ${files.length} 个文件到队列`);
  };

  const handleBatchUpload = (moduleId: string) => {
    setBatchUploadModuleId(moduleId);
    setBatchUploadOpen(true);
  };

  const handleBatchUploadConfirm = (files: File[], autoStart: boolean) => {
    const newTasks: VideoTask[] = files.map((file, idx) => ({
      id: `${batchUploadModuleId}-${Date.now()}-${idx}`,
      filename: file.name,
      duration: Math.floor(Math.random() * 180) + 30,
      size: Math.floor(file.size / (1024 * 1024)),
      status: autoStart ? 'processing' as const : 'pending' as const,
      progress: autoStart ? 0 : undefined,
      estimatedTime: autoStart ? Math.floor(Math.random() * 60) + 30 : undefined,
      uploadTime: new Date()
    }));

    setModules(prev => prev.map(m => 
      m.id === batchUploadModuleId 
        ? { ...m, tasks: [...m.tasks, ...newTasks] }
        : m
    ));
    toast.success(`已添加 ${files.length} 个文件${autoStart ? '并开始处理' : ''}`);
  };

  const handleStartProcess = (taskId: string, moduleId: string) => {
    setModules(prev => prev.map(m => 
      m.id === moduleId 
        ? {
            ...m,
            tasks: m.tasks.map(t => 
              t.id === taskId 
                ? { 
                    ...t, 
                    status: 'processing' as const,
                    progress: 0,
                    estimatedTime: Math.floor(Math.random() * 60) + 30
                  }
                : t
            )
          }
        : m
    ));
    
    // Simulate progress
    simulateProgress(taskId, moduleId);
  };

  const handleStartAll = (moduleId: string) => {
    const module = modules.find(m => m.id === moduleId);
    const pendingTasks = module?.tasks.filter(t => t.status === 'pending') || [];
    
    pendingTasks.forEach((task, idx) => {
      setTimeout(() => {
        handleStartProcess(task.id, moduleId);
      }, idx * 500);
    });
  };

  const simulateProgress = (taskId: string, moduleId: string) => {
    const interval = setInterval(() => {
      setModules(prev => {
        const module = prev.find(m => m.id === moduleId);
        const task = module?.tasks.find(t => t.id === taskId);
        
        if (!task || task.status !== 'processing') {
          clearInterval(interval);
          return prev;
        }

        const newProgress = (task.progress || 0) + Math.floor(Math.random() * 15) + 5;
        
        if (newProgress >= 100) {
          clearInterval(interval);
          return prev.map(m => 
            m.id === moduleId 
              ? {
                  ...m,
                  tasks: m.tasks.map(t => 
                    t.id === taskId 
                      ? { 
                          ...t, 
                          status: 'completed' as const,
                          progress: 100,
                          processingTime: Math.floor(Math.random() * 120) + 30,
                          result: generateMockResult(moduleId)
                        }
                      : t
                  )
                }
              : m
          );
        }

        return prev.map(m => 
          m.id === moduleId 
            ? {
                ...m,
                tasks: m.tasks.map(t => 
                  t.id === taskId 
                    ? { 
                        ...t, 
                        progress: newProgress,
                        estimatedTime: Math.max(0, (t.estimatedTime || 30) - 5)
                      }
                    : t
                )
              }
            : m
        );
      });
    }, 1000);
  };

  const generateMockResult = (moduleId: string): TaskResult => {
    switch (moduleId) {
      case 'enhance':
        return {
          originalResolution: ['480p', '720p'][Math.floor(Math.random() * 2)],
          outputResolution: '1080p',
          originalSize: Math.floor(Math.random() * 50) + 30,
          outputSize: Math.floor(Math.random() * 80) + 50
        };
      case 'remove':
        return {
          removedItems: {
            watermarks: Math.floor(Math.random() * 3) + 1,
            subtitles: Math.floor(Math.random() * 2)
          },
          repairQuality: ['excellent', 'good', 'fair'][Math.floor(Math.random() * 3)] as 'excellent' | 'good' | 'fair'
        };
      case 'segment':
        const segmentCount = Math.floor(Math.random() * 10) + 5;
        const colors = ['bg-blue-200', 'bg-emerald-200', 'bg-orange-200', 'bg-purple-200', 'bg-pink-200', 'bg-cyan-200'];
        return {
          segments: Array.from({ length: segmentCount }, (_, i) => ({
            id: `seg-${i}`,
            startTime: i * 5,
            endTime: (i + 1) * 5,
            thumbnail: colors[i % colors.length]
          }))
        };
      default:
        return {};
    }
  };

  const handleCancel = (taskId: string, moduleId: string) => {
    setModules(prev => prev.map(m => 
      m.id === moduleId 
        ? {
            ...m,
            tasks: m.tasks.map(t => 
              t.id === taskId 
                ? { ...t, status: 'pending' as const, progress: undefined }
                : t
            )
          }
        : m
    ));
    toast.info('已取消处理');
  };

  const handleDelete = (taskId: string, moduleId: string) => {
    setModules(prev => prev.map(m => 
      m.id === moduleId 
        ? { ...m, tasks: m.tasks.filter(t => t.id !== taskId) }
        : m
    ));
    toast.success('已删除');
  };

  const handleRetry = (taskId: string, moduleId: string) => {
    handleStartProcess(taskId, moduleId);
  };

  const handleDownload = (taskId: string, moduleId: string) => {
    toast.success('开始下载');
  };

  const handleDownloadAll = (moduleId: string) => {
    toast.success('开始批量下载');
  };

  const handleConfigTask = (task: VideoTask, moduleId: string) => {
    setConfigTask(task);
    if (moduleId === 'remove') {
      setRemoveConfigOpen(true);
    } else if (moduleId === 'segment') {
      setSegmentConfigOpen(true);
    }
  };

  const handleRemoveConfigConfirm = (config: VideoTask['removeConfig']) => {
    if (configTask) {
      setModules(prev => prev.map(m => 
        m.id === 'remove' 
          ? {
              ...m,
              tasks: m.tasks.map(t => 
                t.id === configTask.id 
                  ? { ...t, removeConfig: config }
                  : t
              )
            }
          : m
      ));
      handleStartProcess(configTask.id, 'remove');
    }
  };

  const handleSegmentConfigConfirm = (config: VideoTask['segmentConfig']) => {
    if (configTask) {
      setModules(prev => prev.map(m => 
        m.id === 'segment' 
          ? {
              ...m,
              tasks: m.tasks.map(t => 
                t.id === configTask.id 
                  ? { ...t, segmentConfig: config }
                  : t
              )
            }
          : m
      ));
      handleStartProcess(configTask.id, 'segment');
    }
  };

  const handleExportAll = () => {
    toast.success('开始导出全部结果');
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="flex-shrink-0 border-b border-border bg-card px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => navigate("/materials")}
            >
              <ArrowLeft size={20} />
            </Button>
            <h1 className="text-lg font-semibold text-foreground">素材预处理</h1>
          </div>
          <Button onClick={handleExportAll}>
            <Download size={16} className="mr-2" />
            导出全部结果
          </Button>
        </div>
      </div>

      {/* Main Content - Three Modules */}
      <div className="flex-1 overflow-hidden p-6">
        <div className="h-full grid grid-cols-3 gap-6 min-w-[1200px]">
          {modules.map(module => (
            <ModuleCard
              key={module.id}
              module={module}
              onUpload={handleUpload}
              onStartProcess={handleStartProcess}
              onStartAll={handleStartAll}
              onCancel={handleCancel}
              onDelete={handleDelete}
              onRetry={handleRetry}
              onDownload={handleDownload}
              onDownloadAll={handleDownloadAll}
              onBatchUpload={handleBatchUpload}
              onConfigTask={handleConfigTask}
            />
          ))}
        </div>
      </div>

      {/* Dialogs */}
      <BatchUploadDialog
        open={batchUploadOpen}
        onOpenChange={setBatchUploadOpen}
        moduleId={batchUploadModuleId}
        onConfirm={handleBatchUploadConfirm}
      />

      <RemoveConfigDialog
        open={removeConfigOpen}
        onOpenChange={setRemoveConfigOpen}
        task={configTask}
        onConfirm={handleRemoveConfigConfirm}
      />

      <SegmentConfigDialog
        open={segmentConfigOpen}
        onOpenChange={setSegmentConfigOpen}
        task={configTask}
        onConfirm={handleSegmentConfigConfirm}
      />
    </div>
  );
};

export default MaterialPreprocessing;
