import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, FolderOpen, MoveRight } from "lucide-react";

interface BatchMoveModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedFiles: Array<{
    id: string;
    name: string;
  }>;
  folders: Array<{
    id: string;
    name: string;
    children?: Array<{
      id: string;
      name: string;
    }>;
  }>;
  onMoveComplete: (targetFolderId: string) => void;
}

const BatchMoveModal = ({ isOpen, onClose, selectedFiles, folders, onMoveComplete }: BatchMoveModalProps) => {
  const [selectedFolder, setSelectedFolder] = useState<string>("");
  const [isMoving, setIsMoving] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const handleMove = async () => {
    if (!selectedFolder) return;

    setIsMoving(true);
    setProgress(0);

    // Simulate move progress
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          setIsComplete(true);
          setTimeout(() => {
            onMoveComplete(selectedFolder);
            handleClose();
          }, 1000);
          return 100;
        }
        return prev + 33.33; // 3 second simulation
      });
    }, 1000);
  };

  const handleClose = () => {
    setSelectedFolder("");
    setIsMoving(false);
    setProgress(0);
    setIsComplete(false);
    onClose();
  };

  const getAllFolderOptions = () => {
    const options: Array<{ id: string; name: string; level: number }> = [];
    
    folders.forEach(folder => {
      if (folder.id !== 'all') {
        options.push({ id: folder.id, name: folder.name, level: 0 });
        
        if (folder.children) {
          folder.children.forEach(child => {
            options.push({ id: child.id, name: child.name, level: 1 });
          });
        }
      }
    });
    
    return options;
  };

  const folderOptions = getAllFolderOptions();

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MoveRight size={20} />
            批量移动文件
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {!isMoving && !isComplete && (
            <>
              <div>
                <p className="text-sm text-muted-foreground mb-2">
                  已选择 {selectedFiles.length} 个文件
                </p>
                <div className="max-h-32 overflow-y-auto space-y-1">
                  {selectedFiles.map((file) => (
                    <div key={file.id} className="text-xs p-2 bg-muted rounded text-muted-foreground">
                      {file.name}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">选择目标文件夹</label>
                <Select value={selectedFolder} onValueChange={setSelectedFolder}>
                  <SelectTrigger>
                    <SelectValue placeholder="请选择文件夹" />
                  </SelectTrigger>
                  <SelectContent>
                    {folderOptions.map((option) => (
                      <SelectItem key={option.id} value={option.id}>
                        <div className="flex items-center gap-2">
                          <FolderOpen size={14} />
                          <span style={{ marginLeft: `${option.level * 16}px` }}>
                            {option.name}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={handleClose}>
                  取消
                </Button>
                <Button 
                  onClick={handleMove}
                  disabled={!selectedFolder}
                >
                  <MoveRight size={14} className="mr-2" />
                  开始移动
                </Button>
              </div>
            </>
          )}

          {isMoving && !isComplete && (
            <div className="text-center py-6">
              <div className="mb-4">
                <MoveRight size={32} className="mx-auto text-primary animate-pulse" />
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                正在移动文件到目标文件夹...
              </p>
              <Progress value={progress} className="w-full" />
              <p className="text-xs text-muted-foreground mt-2">
                {Math.round(progress)}%
              </p>
            </div>
          )}

          {isComplete && (
            <div className="text-center py-6">
              <CheckCircle size={48} className="mx-auto text-green-500 mb-4" />
              <p className="text-lg font-medium text-green-600 mb-2">移动完成</p>
              <p className="text-sm text-muted-foreground">
                已成功移动 {selectedFiles.length} 个文件
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BatchMoveModal;