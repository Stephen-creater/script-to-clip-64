import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft, Download, Upload, Video } from "lucide-react";
import { SubtitleModal } from "./SubtitleModal";

interface ExportVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExportVideoModal = ({ isOpen, onClose }: ExportVideoModalProps) => {
  const [step, setStep] = useState<'main' | 'settings' | 'folderSelect'>('main');
  const [exportPath, setExportPath] = useState("0918");
  const [quantity, setQuantity] = useState("1");
  const [isComposing, setIsComposing] = useState(false);
  const [composingProgress, setComposingProgress] = useState(0);
  
  const [newFolderName, setNewFolderName] = useState("");
  
  // Mock folder data - in real app this would come from API
  const [folders] = useState([
    { id: 1, name: "0918", videoCount: 12 },
    { id: 2, name: "中秋节活动", videoCount: 8 },
    { id: 3, name: "国庆推广", videoCount: 5 }
  ]);

  // Global style settings
  const [globalSettings, setGlobalSettings] = useState({
    subtitle: "未设置"
  });

  // Modal states for global settings
  const [activeModal, setActiveModal] = useState<{
    type: 'subtitle' | null;
  }>({ type: null });

  const handleBack = () => {
    if (step === 'settings') {
      setStep('main');
    } else if (step === 'folderSelect') {
      setStep('main');
    }
  };

  const handleSettingsClick = () => {
    setStep('settings');
  };

  const handleFolderSelect = () => {
    setStep('folderSelect');
  };

  const handleSelectFolder = (folderName: string) => {
    setExportPath(folderName);
    setStep('main');
  };

  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      setExportPath(newFolderName);
      setNewFolderName("");
      setStep('main');
    }
  };

  const handleExport = () => {
    setIsComposing(true);
    setComposingProgress(0);
    
    // Simulate composing progress for 2 seconds
    const progressInterval = setInterval(() => {
      setComposingProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          setTimeout(() => {
            setIsComposing(false);
            setComposingProgress(0);
            onClose();
          }, 100);
          return 100;
        }
        return prev + 5; // Increase by 5% every 100ms to complete in 2s
      });
    }, 100);
  };

  const openGlobalModal = (type: 'subtitle') => {
    setActiveModal({ type });
  };

  const closeGlobalModal = () => {
    setActiveModal({ type: null });
  };

  const updateGlobalSetting = (type: string, data: any) => {
    setGlobalSettings(prev => ({
      ...prev,
      [type]: data.content || data.style || "已设置"
    }));
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2">
              {(step === 'settings' || step === 'folderSelect') && (
                <Button variant="ghost" size="sm" onClick={handleBack}>
                  <ChevronLeft size={16} />
                </Button>
              )}
              <DialogTitle>
                {step === 'main' ? '合成视频' : step === 'folderSelect' ? '选择文件夹' : '全局样式设置'}
              </DialogTitle>
            </div>
          </DialogHeader>

          {step === 'main' ? (
            <div className="space-y-6">
              {/* Export Path */}
              <div className="space-y-2">
                <Label className="text-sm text-red-500">* 导出成片路径</Label>
                <div className="flex gap-2">
                  <Input 
                    value={exportPath}
                    onChange={(e) => setExportPath(e.target.value)}
                    className="flex-1"
                  />
                  <Button 
                    variant="outline" 
                    className="bg-teal-500 text-white hover:bg-teal-600"
                    onClick={handleFolderSelect}
                  >
                    选择
                  </Button>
                </div>
              </div>

              {/* Quantity */}
              <div className="space-y-2">
                <Label className="text-sm text-red-500">* 生成数量</Label>
                <Input 
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  type="number"
                  min="1"
                />
              </div>


              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button variant="outline" onClick={onClose} className="flex-1">
                  取消
                </Button>
                <Button onClick={handleExport} className="flex-1 bg-blue-600 hover:bg-blue-700">
                  <Video size={16} className="mr-2" />
                  开始合成
                </Button>
              </div>
            </div>
          ) : step === 'folderSelect' ? (
            <div className="space-y-4">
              {/* Existing Folders */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">现有文件夹</Label>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {folders.map((folder) => (
                    <div key={folder.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent cursor-pointer" onClick={() => handleSelectFolder(folder.name)}>
                      <div>
                        <p className="font-medium">{folder.name}</p>
                        <p className="text-xs text-muted-foreground">{folder.videoCount} 个视频</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Create New Folder */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">新建文件夹</Label>
                <div className="flex gap-2">
                  <Input 
                    placeholder="输入文件夹名称"
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    className="flex-1"
                  />
                  <Button 
                    onClick={handleCreateFolder}
                    disabled={!newFolderName.trim()}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    创建
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            // Settings step content would go here if needed
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">全局样式设置页面</p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Composing Progress Modal */}
      <Dialog open={isComposing} onOpenChange={() => {}}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-center">正在合成视频</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex justify-center">
              <Video size={48} className="text-blue-600 animate-pulse" />
            </div>
            <Progress value={composingProgress} className="h-2" />
            <p className="text-center text-sm text-muted-foreground">
              合成进度: {composingProgress.toFixed(0)}%
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Global Style Modals */}
      {activeModal.type === 'subtitle' && (
        <SubtitleModal
          isOpen={true}
          onClose={closeGlobalModal}
          segmentId="global"
        />
      )}
    </>
  );
};