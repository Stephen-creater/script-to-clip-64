import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface StickerAudioBgmModalProps {
  open: boolean;
  onClose: () => void;
  onSelectSticker: () => void;
  onSelectAudio: () => void;
  onSelectBgm: () => void;
  onSubmit: () => void;
  segmentName?: string;
}

type SectionType = 'sticker' | 'audio' | 'bgm';

const StickerAudioBgmModal: React.FC<StickerAudioBgmModalProps> = ({
  open,
  onClose,
  onSelectSticker,
  onSelectAudio,
  onSelectBgm,
  onSubmit,
  segmentName
}) => {
  const [activeSection, setActiveSection] = useState<SectionType>('sticker');

  const navItems: { id: SectionType; label: string }[] = [
    { id: 'sticker', label: '贴纸设置' },
    { id: 'audio', label: '音频设置' },
    { id: 'bgm', label: 'BGM 设置' },
  ];

  const scrollToSection = (sectionId: SectionType) => {
    setActiveSection(sectionId);
    const element = document.getElementById(`section-${sectionId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl p-0 gap-0">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle className="text-base font-medium">
            贴纸/音频/BGM 设置 {segmentName && <span className="text-muted-foreground">- {segmentName}</span>}
          </DialogTitle>
        </DialogHeader>

        <div className="flex min-h-[400px]">
          {/* Left Navigation */}
          <div className="w-32 border-r bg-muted/30 p-4">
            <div className="text-sm text-muted-foreground mb-3">目录</div>
            <nav className="space-y-1">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={cn(
                    "w-full text-left px-3 py-2 text-sm rounded-md transition-colors",
                    activeSection === item.id
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  {item.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Right Content */}
          <div className="flex-1 p-6 space-y-8 overflow-y-auto">
            {/* 贴纸设置 Section */}
            <div id="section-sticker" className="space-y-3">
              <div>
                <h3 className="text-base font-medium">贴纸设置</h3>
                <p className="text-sm text-muted-foreground">可选择一个视频素材</p>
              </div>
              <Button 
                onClick={onSelectSticker}
                className="w-full bg-primary hover:bg-primary/90"
              >
                选择视频贴纸
              </Button>
            </div>

            {/* 音频设置 Section */}
            <div id="section-audio" className="space-y-3">
              <div>
                <h3 className="text-base font-medium">音频设置</h3>
                <p className="text-sm text-muted-foreground">可选择一个音频素材</p>
              </div>
              <Button 
                onClick={onSelectAudio}
                className="w-full bg-primary hover:bg-primary/90"
              >
                选择音频
              </Button>
            </div>

            {/* BGM 设置 Section */}
            <div id="section-bgm" className="space-y-3">
              <div>
                <h3 className="text-base font-medium">BGM 设置</h3>
                <p className="text-sm text-muted-foreground">可选择多个音频素材或一个文件夹</p>
              </div>
              <Button 
                onClick={onSelectBgm}
                className="w-full bg-primary hover:bg-primary/90"
              >
                选择 BGM
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter className="px-6 py-4 border-t">
          <Button variant="outline" onClick={onClose}>
            取消
          </Button>
          <Button onClick={onSubmit}>
            确认
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default StickerAudioBgmModal;
