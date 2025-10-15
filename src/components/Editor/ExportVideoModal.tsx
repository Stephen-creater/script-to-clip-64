import { useState, useEffect, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft, Download, Upload, Video, CheckCircle2, XCircle } from "lucide-react";
import { SubtitleModal } from "./SubtitleModal";
import { useFolders } from "@/hooks/useFolders";

interface ExportVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExportVideoModal = ({ isOpen, onClose }: ExportVideoModalProps) => {
  const { folders: allFolders } = useFolders();
  const [step, setStep] = useState<'main' | 'settings' | 'folderSelect'>('main');
  const [exportPath, setExportPath] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [isComposing, setIsComposing] = useState(false);
  const [composingProgress, setComposingProgress] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [videoResults, setVideoResults] = useState<boolean[]>([]);
  
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
    const count = parseInt(quantity) || 1;
    
    // Initialize video results with ~15% failure rate
    const results = Array.from({ length: count }, () => Math.random() > 0.15);
    setVideoResults(results);
    
    setIsComposing(true);
    setComposingProgress(0);
    setShowResults(false);
    
    // Simulate composing progress for 2 seconds
    const progressInterval = setInterval(() => {
      setComposingProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          setTimeout(() => {
            setIsComposing(false);
            setShowResults(true);
          }, 100);
          return 100;
        }
        return prev + 5; // Increase by 5% every 100ms to complete in 2s
      });
    }, 100);
  };

  const handleCloseResults = () => {
    setShowResults(false);
    setComposingProgress(0);
    setVideoResults([]);
    onClose();
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

      {/* Results Modal */}
      <Dialog open={showResults} onOpenChange={handleCloseResults}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Video size={20} className="text-primary" />
              视频合成完成
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 text-center">
                <CheckCircle2 size={32} className="text-green-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-green-600">
                  {videoResults.filter(Boolean).length}
                </div>
                <div className="text-xs text-muted-foreground mt-1">合成成功</div>
              </div>
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-center">
                <XCircle size={32} className="text-red-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-red-600">
                  {videoResults.length - videoResults.filter(Boolean).length}
                </div>
                <div className="text-xs text-muted-foreground mt-1">合成失败</div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-4 max-h-[200px] overflow-y-auto">
              <div className="text-sm font-medium mb-2">详细结果:</div>
              <div className="space-y-1 text-xs">
                {videoResults.map((success, index) => (
                  <div 
                    key={index} 
                    className={`flex items-center gap-2 ${
                      success ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {success ? (
                      <CheckCircle2 size={14} />
                    ) : (
                      <XCircle size={14} />
                    )}
                    视频{index + 1} {success ? '合成成功' : '合成失败'}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleCloseResults} className="flex-1">
                确定
              </Button>
            </div>
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