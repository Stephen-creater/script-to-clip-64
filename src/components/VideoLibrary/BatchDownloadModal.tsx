import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Folder, Download, Check } from "lucide-react";

interface BatchDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedFiles: Array<{ id: string; name: string; size: string }>;
}

const BatchDownloadModal = ({ isOpen, onClose, selectedFiles }: BatchDownloadModalProps) => {
  const [downloadPath, setDownloadPath] = useState("C:\\Users\\用户\\Downloads");
  const [isDownloading, setIsDownloading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setIsDownloading(false);
      setProgress(0);
      setIsCompleted(false);
    }
  }, [isOpen]);

  const handleStartDownload = () => {
    setIsDownloading(true);
    setProgress(0);
    
    // Simulate 3-second download with progress updates
    const duration = 3000; // 3 seconds
    const interval = 50; // Update every 50ms
    const steps = duration / interval;
    let currentStep = 0;

    const progressInterval = setInterval(() => {
      currentStep++;
      const newProgress = Math.min((currentStep / steps) * 100, 100);
      setProgress(newProgress);

      if (newProgress >= 100) {
        clearInterval(progressInterval);
        setIsCompleted(true);
        setTimeout(() => {
          onClose();
        }, 1500); // Auto close after 1.5s when completed
      }
    }, interval);
  };

  const handleSelectFolder = () => {
    // Simulate folder selection dialog
    const folders = [
      "C:\\Users\\用户\\Downloads",
      "C:\\Users\\用户\\Desktop", 
      "C:\\Users\\用户\\Documents",
      "D:\\Video Downloads"
    ];
    
    const selectedFolder = folders[Math.floor(Math.random() * folders.length)];
    setDownloadPath(selectedFolder);
  };

  const totalSize = selectedFiles.reduce((acc, file) => {
    const sizeValue = parseFloat(file.size);
    return acc + sizeValue;
  }, 0);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>批量下载</DialogTitle>
        </DialogHeader>

        {!isDownloading && !isCompleted && (
          <div className="space-y-4">
            {/* Download Location */}
            <div className="space-y-2">
              <label className="text-sm font-medium">下载位置</label>
              <div className="flex gap-2">
                <Input
                  value={downloadPath}
                  onChange={(e) => setDownloadPath(e.target.value)}
                  className="flex-1"
                />
                <Button variant="outline" size="sm" onClick={handleSelectFolder}>
                  <Folder size={16} />
                </Button>
              </div>
            </div>

            {/* File List */}
            <div className="space-y-2">
              <div className="text-sm font-medium">
                开始下载 {selectedFiles.length} 个文件 (总计 {totalSize.toFixed(1)}MB)
              </div>
              <div className="max-h-32 overflow-y-auto space-y-1 text-sm text-muted-foreground">
                {selectedFiles.map((file) => (
                  <div key={file.id} className="flex justify-between">
                    <span className="truncate flex-1">{file.name}</span>
                    <span className="ml-2">{file.size}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={onClose}>
                取消
              </Button>
              <Button onClick={handleStartDownload}>
                <Download size={16} className="mr-2" />
                开始下载
              </Button>
            </div>
          </div>
        )}

        {isDownloading && !isCompleted && (
          <div className="space-y-4 py-4">
            <div className="text-center">
              <div className="text-lg font-medium">正在下载...</div>
              <div className="text-sm text-muted-foreground mt-1">
                下载到: {downloadPath}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>进度</span>
                <span>{progress.toFixed(0)}%</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>

            <div className="text-sm text-muted-foreground text-center">
              {selectedFiles.length} 个文件 • {totalSize.toFixed(1)}MB
            </div>
          </div>
        )}

        {isCompleted && (
          <div className="space-y-4 py-8 text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <Check size={32} className="text-green-600" />
            </div>
            <div>
              <div className="text-lg font-medium text-green-600">下载完成！</div>
              <div className="text-sm text-muted-foreground mt-1">
                {selectedFiles.length} 个文件已保存到 {downloadPath}
              </div>
            </div>
            <Progress value={100} className="w-full" />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default BatchDownloadModal;