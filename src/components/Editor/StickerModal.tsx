import { useState, useMemo, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Plus, Folder, Music, Image } from "lucide-react";
import { useMaterials } from "@/hooks/useMaterials";
import { useFolders } from "@/hooks/useFolders";
import { AudioSelectionModal } from "./AudioSelectionModal";

interface StickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  segmentId: string;
}

export const StickerModal = ({ isOpen, onClose, segmentId }: StickerModalProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStickers, setSelectedStickers] = useState<string[]>([]);
  const [sharedSoundEffect, setSharedSoundEffect] = useState<{folder: string, file: string, volume: string}>({folder: '', file: '', volume: '50'});
  const [selectedRootFolder, setSelectedRootFolder] = useState(""); // 选择的根文件夹
  const [selectedSubfolder, setSelectedSubfolder] = useState(""); // 选择的子文件夹
  const [isAudioModalOpen, setIsAudioModalOpen] = useState(false);
  
  const { materials, getMaterialUrl, getMaterialsByCategory } = useMaterials();
  const { folders } = useFolders();

  // 仅图片素材（贴纸）
  const imageMaterials = useMemo(() => {
    return materials.filter(material => material.file_type === 'image');
  }, [materials]);

  // 获取根文件夹列表
  const rootFolders = useMemo(() => {
    return folders.filter((f) => !f.parent_id).map(root => {
      const children = folders.filter((f) => f.parent_id === root.id);
      return {
        ...root,
        children,
        hasChildren: children.length > 0
      };
    });
  }, [folders]);

  // 获取当前选中根文件夹的子文件夹
  const currentSubfolders = useMemo(() => {
    if (!selectedRootFolder) return [];
    const root = rootFolders.find(f => f.id === selectedRootFolder);
    return root?.children || [];
  }, [selectedRootFolder, rootFolders]);

  // 初始化选择图片素材根文件夹
  useEffect(() => {
    if (!selectedRootFolder && rootFolders.length > 0) {
      const imageRoot = rootFolders.find(f => f.name === '图片素材');
      if (imageRoot) {
        setSelectedRootFolder(imageRoot.id);
      }
    }
  }, [rootFolders, selectedRootFolder]);

  // 当根文件夹改变时，清空子文件夹选择
  useEffect(() => {
    setSelectedSubfolder("");
  }, [selectedRootFolder]);

  const handleStickerSelect = (stickerId: string) => {
    setSelectedStickers(prev => {
      return prev.includes(stickerId) 
        ? prev.filter(id => id !== stickerId)
        : [...prev, stickerId];
    });
  };

  const updateSharedSoundEffect = (field: 'folder' | 'file' | 'volume', value: string) => {
    setSharedSoundEffect(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAudioSelect = (folderId: string, folderName: string, fileId?: string, fileName?: string) => {
    updateSharedSoundEffect('folder', folderName);
    if (fileName) {
      updateSharedSoundEffect('file', fileName);
    }
  };

  const handleSubmit = () => {
    console.log("Selected stickers:", selectedStickers);
    console.log("Shared sound effect:", sharedSoundEffect);
    onClose();
  };

  // Get filtered materials based on selected category and search query
  const getFilteredMaterials = () => {
    // 只有选择了具体的子文件夹才显示素材
    if (!selectedSubfolder) return [];

    const subfolder = currentSubfolders.find(f => f.id === selectedSubfolder);
    if (!subfolder) return [];

    const rootFolder = rootFolders.find(f => f.id === selectedRootFolder);
    if (!rootFolder) return [];

    let filtered: typeof imageMaterials = [];

    // 根据根文件夹类型筛选素材
    if (rootFolder.name === '图片素材') {
      filtered = getMaterialsByCategory('图片素材', subfolder.name);
    } else if (rootFolder.name === '视频素材') {
      filtered = materials.filter(m => m.category === '视频素材' && m.subcategory === subfolder.name);
    } else if (rootFolder.name === '音频素材') {
      filtered = materials.filter(m => m.category === '音频素材' && m.subcategory === subfolder.name);
    }

    // 应用搜索过滤
    if (searchQuery) {
      filtered = filtered.filter(material => 
        material.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (material.original_name && material.original_name.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    return filtered;
  };

  const filteredMaterials = getFilteredMaterials();

  const StickerGrid = ({ stickers }: { stickers: typeof imageMaterials }) => (
    <div className="grid grid-cols-5 gap-4">
      {stickers.map(sticker => (
        <div
          key={sticker.id}
          className={`relative cursor-pointer border-2 rounded-lg p-2 transition-colors ${
            selectedStickers.includes(sticker.id) 
              ? 'border-primary bg-primary/10' 
              : 'border-border hover:border-primary/50'
          }`}
          onClick={() => handleStickerSelect(sticker.id)}
        >
          <div className="aspect-square bg-muted rounded flex items-center justify-center mb-2">
            <img 
              src={getMaterialUrl(sticker)} 
              alt={sticker.name}
              className="w-full h-full object-cover rounded"
            />
          </div>
          <p className="text-xs text-center truncate">{sticker.name}</p>
        </div>
      ))}
    </div>
  );

  // If no folders available, show empty state
  if (rootFolders.length === 0) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>选择贴纸</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <Image size={48} className="mb-4" />
            <p>暂无贴纸素材</p>
            <p className="text-sm">请上传您的第一张贴纸素材</p>
          </div>
          <div className="flex justify-end">
            <Button variant="outline" onClick={onClose}>关闭</Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[900px] h-[80vh] flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                导出尺寸: 1080*1920
              </span>
            </div>
          </div>
        </DialogHeader>
        
        <div className="flex-1 min-h-0">
          <ScrollArea className="h-full pr-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Select value={selectedRootFolder} onValueChange={setSelectedRootFolder}>
                    <SelectTrigger className="w-[160px]">
                      <SelectValue placeholder="选择文件夹类型" />
                    </SelectTrigger>
                    <SelectContent className="z-50 bg-popover">
                      {rootFolders.map((folder) => (
                        <SelectItem key={folder.id} value={folder.id}>
                          <div className="flex items-center gap-2">
                            <Folder size={16} />
                            <span>{folder.name}</span>
                            {folder.hasChildren && <span className="text-xs text-muted-foreground">▶</span>}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  {currentSubfolders.length > 0 && (
                    <Select value={selectedSubfolder} onValueChange={setSelectedSubfolder}>
                      <SelectTrigger className="w-[160px]">
                        <SelectValue placeholder="选择具体分类" />
                      </SelectTrigger>
                      <SelectContent className="z-50 bg-popover">
                        {currentSubfolders.map((subfolder) => {
                          const count = selectedRootFolder === rootFolders.find(f => f.name === '图片素材')?.id 
                            ? getMaterialsByCategory('图片素材', subfolder.name).length
                            : materials.filter(m => m.category === rootFolders.find(f => f.id === selectedRootFolder)?.name && m.subcategory === subfolder.name).length;
                          
                          return (
                            <SelectItem key={subfolder.id} value={subfolder.id}>
                              <div className="flex items-center gap-2">
                                <Folder size={16} />
                                <span>{subfolder.name} ({count})</span>
                              </div>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  )}
                </div>
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Enter搜索"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-[200px]"
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  {selectedSubfolder ? (
                    filteredMaterials.length > 0 ? (
                      <StickerGrid stickers={filteredMaterials} />
                    ) : (
                      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                        <Image size={48} className="mb-4" />
                        <p>暂无素材</p>
                        <p className="text-sm">此分类下暂无素材文件</p>
                      </div>
                    )
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                      <Folder size={48} className="mb-4" />
                      <p>请选择具体分类</p>
                      <p className="text-sm">请从上方下拉框中选择具体的素材分类</p>
                    </div>
                  )}
                </div>
                {selectedStickers.length > 0 && (
                  <div className="w-48 border-l border-border pl-4">
                    <h4 className="text-sm font-medium mb-3">预览</h4>
                    <div className="relative bg-black rounded-lg" style={{ aspectRatio: '9/16', height: '200px' }}>
                      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-gray-700 rounded-lg">
                        {selectedStickers.map((stickerId, index) => {
                          const sticker = imageMaterials.find(s => s.id === stickerId);
                          if (!sticker) return null;
                          return (
                            <div 
                              key={stickerId}
                              className="absolute bg-white/20 border border-white/30 rounded px-2 py-1 text-xs text-white"
                              style={{
                                top: `${20 + index * 15}%`,
                                right: `${10 + index * 5}%`,
                                transform: `rotate(${index * 5 - 10}deg)`
                              }}
                            >
                              贴纸{index + 1}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-muted-foreground">
                      已选择 {selectedStickers.length} 个贴纸
                    </div>
                  </div>
                )}
              </div>

              {selectedStickers.length > 0 && (
                <div className="space-y-4 border-t border-border pt-4">
                  <h4 className="text-sm font-medium">贴纸音效配置</h4>
                  <div className="space-y-3 p-4 border border-border rounded-lg">
                    <Label className="text-sm font-medium">贴纸音效</Label>
                    
                    <div className="space-y-2">
                      <Label htmlFor="soundEffect">音效选择</Label>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          className="flex-1 justify-start"
                          onClick={() => setIsAudioModalOpen(true)}
                        >
                          <Music className="mr-2 h-4 w-4" />
                          {sharedSoundEffect.file || sharedSoundEffect.folder || "选择音频素材"}
                        </Button>
                      </div>
                      {sharedSoundEffect.folder && (
                        <div className="text-xs text-muted-foreground">
                          文件夹: {sharedSoundEffect.folder}
                          {sharedSoundEffect.file && ` / 文件: ${sharedSoundEffect.file}`}
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="volume">音量</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          id="volume"
                          type="number"
                          min="0"
                          max="100"
                          value={sharedSoundEffect.volume}
                          onChange={(e) => updateSharedSoundEffect('volume', e.target.value)}
                          className="flex-1"
                        />
                        <span className="text-sm text-muted-foreground">%</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-2 p-3 bg-muted rounded-lg">
                    <Music size={16} className="text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-muted-foreground">
                      <p className="font-medium mb-1">音效说明：</p>
                      <p>• 所有贴纸共享同一音效配置</p>
                      <p>• 音效出现时间与贴纸出现时间同步</p>
                      <p>• 音效播放时长为音效文件本身的时长</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        <div className="flex justify-between items-center pt-4 border-t border-border">
          <div className="text-sm text-muted-foreground">
            支持多选贴纸，可重叠显示
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose}>
              取消
            </Button>
            <Button onClick={handleSubmit} className="bg-accent text-accent-foreground">
              确定
            </Button>
          </div>
        </div>

        <AudioSelectionModal
          isOpen={isAudioModalOpen}
          onClose={() => setIsAudioModalOpen(false)}
          onSelect={handleAudioSelect}
        />
      </DialogContent>
    </Dialog>
  );
};