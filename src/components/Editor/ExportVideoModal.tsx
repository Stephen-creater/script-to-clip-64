import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, Download } from "lucide-react";
import { AnimatedTextModal } from "./AnimatedTextModal";
import { SubtitleModal } from "./SubtitleModal";
import { StickerModal } from "./StickerModal";

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
    animatedText: "未设置", 
    sticker: "未设置"
  });

  // Modal states for global settings
  const [activeModal, setActiveModal] = useState<{
    type: 'animatedText' | 'subtitle' | 'sticker' | null;
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

  const openGlobalModal = (type: 'animatedText' | 'subtitle' | 'sticker') => {
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

              {/* Global Settings Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">全局样式配置</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">字幕样式</span>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className={globalSettings.subtitle !== "未设置" ? "border-teal-500 text-teal-600" : ""}
                      onClick={() => openGlobalModal('subtitle')}
                    >
                      {globalSettings.subtitle}
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">花字</span>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className={globalSettings.animatedText !== "未设置" ? "border-gray-400" : ""}
                      onClick={() => openGlobalModal('animatedText')}
                    >
                      {globalSettings.animatedText}
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">贴纸</span>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className={globalSettings.sticker !== "未设置" ? "border-gray-400" : ""}
                      onClick={() => openGlobalModal('sticker')}
                    >
                      {globalSettings.sticker}
                    </Button>
                  </div>
                </CardContent>
              </Card>

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
      {activeModal.type === 'animatedText' && (
        <AnimatedTextModal
          isOpen={true}
          onClose={closeGlobalModal}
          segmentId="global"
          onSubmit={(id, data) => {
            updateGlobalSetting('animatedText', data);
            closeGlobalModal();
          }}
        />
      )}
      
      {activeModal.type === 'subtitle' && (
        <SubtitleModal
          isOpen={true}
          onClose={closeGlobalModal}
          segmentId="global"
        />
      )}
      
      {activeModal.type === 'sticker' && (
        <StickerModal
          isOpen={true}
          onClose={closeGlobalModal}
          segmentId="global"
        />
      )}
    </>
  );
};