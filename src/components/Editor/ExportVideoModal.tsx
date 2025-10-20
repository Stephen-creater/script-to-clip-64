import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronLeft, Video, CheckCircle, XCircle, X } from "lucide-react";
import { SubtitleModal } from "./SubtitleModal";
import { useFolders } from "@/hooks/useFolders";
import { toast } from "@/hooks/use-toast";
import { useProjects } from "@/hooks/useProjects";

interface ExportVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  exportPath: string;
  quantity: number;
}

interface ExportResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  successCount: number;
  failureCount: number;
  exportPath: string;
  projectName: string;
}

// 结果显示对话框 - 右下角通知
const ExportResultModal = ({ isOpen, onClose, successCount, failureCount, exportPath, projectName }: ExportResultModalProps) => {
  const navigate = useNavigate();
  
  const handleGoToVideoLibrary = () => {
    navigate('/video-library');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-6 right-6 w-96 bg-background border border-border rounded-lg shadow-lg z-50 animate-in slide-in-from-bottom-4">
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-lg font-semibold">合成完成</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-6 w-6 p-0 hover:bg-accent"
          >
            <X size={16} />
          </Button>
        </div>
        
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            视频<span className="font-semibold text-foreground">"{projectName}"</span>已经放在成片库的<span className="font-semibold text-foreground">"{exportPath}"</span>文件夹中
          </p>
          
          <div className="flex gap-6">
            <div className="flex items-center gap-2">
              <CheckCircle className="text-green-500" size={20} />
              <div>
                <div className="text-xl font-bold text-green-500">{successCount}</div>
                <div className="text-xs text-muted-foreground">成功</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <XCircle className="text-red-500" size={20} />
              <div>
                <div className="text-xl font-bold text-red-500">{failureCount}</div>
                <div className="text-xs text-muted-foreground">失败</div>
              </div>
            </div>
          </div>

          <Button 
            onClick={handleGoToVideoLibrary}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            前往成片库
          </Button>
        </div>
      </div>
    </div>
  );
};

export const ExportVideoModal = ({ isOpen, onClose, projectId }: ExportVideoModalProps) => {
  const navigate = useNavigate();
  const { folders: allFolders } = useFolders();
  const { updateProject, projects } = useProjects();
  const [step, setStep] = useState<'main' | 'settings' | 'folderSelect'>('main');
  const [exportPath, setExportPath] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [newFolderName, setNewFolderName] = useState("");
  const [showResultModal, setShowResultModal] = useState(false);
  const [exportResult, setExportResult] = useState({ successCount: 0, failureCount: 0, path: "", projectName: "" });
  
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

  const handleExport = async () => {
    const quantityNum = parseInt(quantity);
    
    // 获取项目名称
    const project = projects.find(p => p.id === projectId);
    const projectName = project?.name || "未命名项目";
    
    // 更新项目状态为处理中
    if (projectId) {
      await updateProject(projectId, { status: 'processing' });
    }
    
    // Show toast notification
    toast({
      title: "正在为你生成，请耐心等待",
      description: `正在生成 ${quantityNum} 个视频，已提交到后台处理`,
    });
    
    // Close modal and navigate to project library
    onClose();
    navigate('/');
    
    // 3秒后更新状态为已完成，并显示结果
    setTimeout(async () => {
      if (projectId) {
        await updateProject(projectId, { status: 'completed' });
        
        // 模拟合成结果（demo演示，假设90%成功率）
        const successCount = Math.floor(quantityNum * 0.9);
        const failureCount = quantityNum - successCount;
        
        setExportResult({
          successCount,
          failureCount,
          path: exportPath,
          projectName
        });
        
        setShowResultModal(true);
      }
    }, 3000);
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
      {/* 结果显示通知 */}
      <ExportResultModal
        isOpen={showResultModal}
        onClose={() => setShowResultModal(false)}
        successCount={exportResult.successCount}
        failureCount={exportResult.failureCount}
        exportPath={exportResult.path}
        projectName={exportResult.projectName}
      />
      
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