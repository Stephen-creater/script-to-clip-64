import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, Download, Upload } from "lucide-react";
import { SubtitleModal } from "./SubtitleModal";

interface ExportVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExportVideoModal = ({ isOpen, onClose }: ExportVideoModalProps) => {
  const [step, setStep] = useState<'main' | 'settings'>('main');
  const [exportPath, setExportPath] = useState("0918");
  const [quantity, setQuantity] = useState("1");
  
  // Global style settings
  const [globalSettings, setGlobalSettings] = useState({
    subtitle: "未设置",
    bgm: "未选择"
  });
  
  const [bgmFile, setBgmFile] = useState<File | null>(null);

  // Modal states for global settings
  const [activeModal, setActiveModal] = useState<{
    type: 'subtitle' | null;
  }>({ type: null });

  const handleBack = () => {
    if (step === 'settings') {
      setStep('main');
    }
  };

  const handleSettingsClick = () => {
    setStep('settings');
  };

  const handleExport = () => {
    // Handle export logic here
    console.log("Exporting video with settings:", { exportPath, quantity, globalSettings });
    onClose();
  };

  const openGlobalModal = (type: 'subtitle') => {
    setActiveModal({ type });
  };

  const handleBgmUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setBgmFile(file);
      setGlobalSettings(prev => ({
        ...prev,
        bgm: file.name
      }));
    }
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
              {step === 'settings' && (
                <Button variant="ghost" size="sm" onClick={handleBack}>
                  <ChevronLeft size={16} />
                </Button>
              )}
              <DialogTitle>
                {step === 'main' ? '导出' : '全局样式设置'}
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
                  <Button variant="outline" className="bg-teal-500 text-white hover:bg-teal-600">
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

              {/* Import Copy and Settings Buttons */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    导入文案
                  </Button>
                  <Button 
                    variant="default"
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={() => openGlobalModal('subtitle')}
                  >
                    字幕全局设置
                  </Button>
                  <div className="flex items-center">
                    <input
                      type="file"
                      accept="audio/*"
                      onChange={handleBgmUpload}
                      className="hidden"
                      id="bgm-upload"
                    />
                    <label htmlFor="bgm-upload">
                      <Button variant="default" size="sm" asChild className="bg-blue-600 hover:bg-blue-700 text-white">
                        <span className="cursor-pointer">
                          <Upload size={14} className="mr-1" />
                          BGM配乐
                        </span>
                      </Button>
                    </label>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button variant="outline" onClick={onClose} className="flex-1">
                  取消
                </Button>
                <Button onClick={handleExport} className="flex-1 bg-blue-600 hover:bg-blue-700">
                  <Download size={16} className="mr-2" />
                  导出
                </Button>
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