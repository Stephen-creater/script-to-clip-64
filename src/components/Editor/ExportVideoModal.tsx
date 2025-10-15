import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronLeft, Video } from "lucide-react";
import { SubtitleModal } from "./SubtitleModal";
import { useFolders } from "@/hooks/useFolders";
import { toast } from "@/hooks/use-toast";

interface ExportVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExportVideoModal = ({ isOpen, onClose }: ExportVideoModalProps) => {
  const navigate = useNavigate();
  const { folders: allFolders } = useFolders();
  const [step, setStep] = useState<'main' | 'settings' | 'folderSelect'>('main');
  const [exportPath, setExportPath] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [newFolderName, setNewFolderName] = useState("");
  
  // 获取视频文件夹下的所有子文件夹
  const videoFolders = useMemo(() => {
    const videoLibraryFolder = allFolders.find(f => f.name === '视频文件夹');
    if (!videoLibraryFolder) return [];
    
    return allFolders
      .filter(f => f.parent_id === videoLibraryFolder.id)
      .map(f => ({
        id: f.id,
        name: f.name,
        videoCount: 0 // TODO: 从实际数据计算视频数量
      }));
  }, [allFolders]);

  // 设置默认导出路径为第一个文件夹
  useEffect(() => {
    if (videoFolders.length > 0 && !exportPath) {
      setExportPath(videoFolders[0].name);
    }
  }, [videoFolders, exportPath]);

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
    // Show toast notification
    toast({
      title: "正在为你生成，请耐心等待",
      description: `正在生成 ${quantity} 个视频，已提交到后台处理`,
    });
    
    // Close modal and navigate to project library
    onClose();
    navigate('/');
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
                  {videoFolders.length > 0 ? (
                    videoFolders.map((folder) => (
                      <div key={folder.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent cursor-pointer" onClick={() => handleSelectFolder(folder.name)}>
                        <div>
                          <p className="font-medium">{folder.name}</p>
                          <p className="text-xs text-muted-foreground">{folder.videoCount} 个视频</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-muted-foreground text-center py-4">
                      暂无视频文件夹
                    </div>
                  )}
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