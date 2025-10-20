import { useState, useMemo, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Search, Folder, Music, Image, ChevronRight, Move } from "lucide-react";
import { useMaterials } from "@/hooks/useMaterials";
import { useFolders } from "@/hooks/useFolders";
import { AudioSelectionModal } from "./AudioSelectionModal";

interface StickerPosition {
  id: string;
  x: number;
  y: number;
  scale: number;
}

interface StickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  segmentId: string;
}

export const StickerModal = ({ isOpen, onClose, segmentId }: StickerModalProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStickers, setSelectedStickers] = useState<StickerPosition[]>([]);
  const [sharedSoundEffect, setSharedSoundEffect] = useState<{folder: string, file: string, volume: string}>({folder: '', file: '', volume: '50'});
  const [selectedFolderId, setSelectedFolderId] = useState<string>("");
  const [isAudioModalOpen, setIsAudioModalOpen] = useState(false);
  const [activeStickerIndex, setActiveStickerIndex] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ scale: 1, mouseY: 0 });
  const previewRef = useRef<HTMLDivElement>(null);
  
  const { materials, getMaterialUrl } = useMaterials();
  const { folders } = useFolders();

  // 构建文件夹层级结构，筛选视频和图片素材
  const folderHierarchy = useMemo(() => {
    const videoImageFolders = folders.filter(f => 
      !f.parent_id && (f.name === '视频素材' || f.name === '图片素材')
    );
    
    return videoImageFolders.map(root => {
      const children = folders
        .filter(f => f.parent_id === root.id)
        .map(child => ({
          ...child,
          materialCount: materials.filter(m => 
            m.category === root.name && 
            m.subcategory === child.name &&
            (m.file_type === 'video' || m.file_type === 'image')
          ).length
        }));
      
      return {
        ...root,
        children
      };
    });
  }, [folders, materials]);

  // 初始化选择第一个根文件夹
  useEffect(() => {
    if (!selectedFolderId && folderHierarchy.length > 0) {
      setSelectedFolderId(folderHierarchy[0].id);
    }
  }, [folderHierarchy, selectedFolderId]);

  const handleStickerSelect = (stickerId: string) => {
    setSelectedStickers(prev => {
      const exists = prev.find(s => s.id === stickerId);
      if (exists) {
        return prev.filter(s => s.id !== stickerId);
      } else {
        const newSticker: StickerPosition = {
          id: stickerId,
          x: 50 + prev.length * 5,
          y: 30 + prev.length * 10,
          scale: 1
        };
        return [...prev, newSticker];
      }
    });
  };

  const handleStickerMouseDown = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    setActiveStickerIndex(index);
    setIsDragging(true);
    if (!previewRef.current) return;
    const rect = previewRef.current.getBoundingClientRect();
    const sticker = selectedStickers[index];
    setDragStart({
      x: e.clientX - (rect.width * sticker.x / 100),
      y: e.clientY - (rect.height * sticker.y / 100)
    });
  };

  const handleResizeMouseDown = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    setActiveStickerIndex(index);
    setIsResizing(true);
    setResizeStart({
      scale: selectedStickers[index].scale,
      mouseY: e.clientY
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (activeStickerIndex === null) return;

    if (isDragging && !isResizing && previewRef.current) {
      const rect = previewRef.current.getBoundingClientRect();
      const newX = ((e.clientX - dragStart.x) / rect.width) * 100;
      const newY = ((e.clientY - dragStart.y) / rect.height) * 100;
      
      setSelectedStickers(prev => prev.map((sticker, idx) => 
        idx === activeStickerIndex
          ? { ...sticker, x: Math.max(0, Math.min(100, newX)), y: Math.max(0, Math.min(100, newY)) }
          : sticker
      ));
    } else if (isResizing) {
      const deltaY = resizeStart.mouseY - e.clientY;
      const newScale = resizeStart.scale + deltaY * 0.003;
      
      setSelectedStickers(prev => prev.map((sticker, idx) => 
        idx === activeStickerIndex
          ? { ...sticker, scale: Math.max(0.3, Math.min(3, newScale)) }
          : sticker
      ));
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
    setActiveStickerIndex(null);
  };

  useEffect(() => {
    if (isDragging || isResizing) {
      document.addEventListener('mouseup', handleMouseUp as any);
      return () => document.removeEventListener('mouseup', handleMouseUp as any);
    }
  }, [isDragging, isResizing]);

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

  // 获取筛选后的素材
  const filteredMaterials = useMemo(() => {
    if (!selectedFolderId) return [];

    // 查找选中的文件夹是根文件夹还是子文件夹
    const rootFolder = folderHierarchy.find(r => r.id === selectedFolderId);
    
    if (rootFolder) {
      // 选中的是根文件夹，返回该分类下的所有素材
      let filtered = materials.filter(m => 
        m.category === rootFolder.name &&
        (m.file_type === 'video' || m.file_type === 'image')
      );

      // 应用搜索过滤
      if (searchQuery) {
        filtered = filtered.filter(material => 
          material.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (material.original_name && material.original_name.toLowerCase().includes(searchQuery.toLowerCase()))
        );
      }

      return filtered;
    }

    // 查找是否为子文件夹
    let selectedFolder = null;
    let parentFolder = null;
    for (const root of folderHierarchy) {
      const found = root.children?.find(c => c.id === selectedFolderId);
      if (found) {
        selectedFolder = found;
        parentFolder = root;
        break;
      }
    }

    if (!selectedFolder || !parentFolder) return [];

    // 筛选该子分类下的素材
    let filtered = materials.filter(m => 
      m.category === parentFolder.name && 
      m.subcategory === selectedFolder.name &&
      (m.file_type === 'video' || m.file_type === 'image')
    );

    // 应用搜索过滤
    if (searchQuery) {
      filtered = filtered.filter(material => 
        material.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (material.original_name && material.original_name.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    return filtered;
  }, [selectedFolderId, folderHierarchy, materials, searchQuery]);

  const StickerGrid = ({ stickers }: { stickers: typeof materials }) => (
    <div className="grid grid-cols-4 gap-3">
      {stickers.map(sticker => (
        <div
          key={sticker.id}
          className={`relative cursor-pointer border-2 rounded-lg p-2 transition-all ${
            selectedStickers.find(s => s.id === sticker.id)
              ? 'border-primary bg-primary/10 shadow-sm' 
              : 'border-border hover:border-primary/50 hover:shadow-sm'
          }`}
          onClick={() => handleStickerSelect(sticker.id)}
        >
          <div className="aspect-square bg-muted rounded flex items-center justify-center mb-2">
            {sticker.file_type === 'video' ? (
              <video 
                src={getMaterialUrl(sticker)} 
                className="w-full h-full object-cover rounded"
                muted
              />
            ) : (
              <img 
                src={getMaterialUrl(sticker)} 
                alt={sticker.name}
                className="w-full h-full object-cover rounded"
              />
            )}
          </div>
          <p className="text-xs text-center truncate">{sticker.name}</p>
          <Badge variant="secondary" className="absolute top-1 right-1 text-[10px] px-1 py-0">
            {sticker.file_type === 'video' ? '视频' : '图片'}
          </Badge>
        </div>
      ))}
    </div>
  );

  // If no folders available, show empty state
  if (folderHierarchy.length === 0) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>选择视频贴纸</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <Image size={48} className="mb-4" />
            <p>暂无视频/图片素材</p>
            <p className="text-sm">请先上传视频或图片素材</p>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>关闭</Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[85vh] p-0 gap-0 flex flex-col">
        <DialogHeader className="px-6 py-4 border-b flex-shrink-0">
          <DialogTitle>选择视频贴纸</DialogTitle>
          <p className="text-sm text-muted-foreground mt-1">导出尺寸: 1080*1920</p>
        </DialogHeader>
        
        <div className="flex flex-1 overflow-hidden min-h-0">
          {/* 左侧文件夹列表 */}
          <div className="w-64 border-r bg-muted/30 flex-shrink-0">
            <ScrollArea className="h-full">
              <div className="p-4 space-y-2">
                {folderHierarchy.map(root => {
                  const isRootOpen = selectedFolderId === root.id || root.children?.some(c => c.id === selectedFolderId);
                  const rootMaterialCount = materials.filter(m => 
                    m.category === root.name && 
                    (m.file_type === 'video' || m.file_type === 'image')
                  ).length;
                  
                  return (
                    <div key={root.id} className="space-y-1">
                      <div
                        onClick={() => setSelectedFolderId(root.id)}
                        className={`flex items-center justify-between gap-2 px-3 py-2 rounded-md cursor-pointer transition-all text-sm ${
                          selectedFolderId === root.id
                            ? 'bg-primary text-primary-foreground shadow-sm'
                            : 'hover:bg-secondary/80'
                        }`}
                      >
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <ChevronRight 
                            size={14} 
                            className={`flex-shrink-0 transition-transform ${isRootOpen ? 'rotate-90' : ''}`}
                          />
                          <Folder size={16} className="flex-shrink-0" />
                          <span className="truncate font-medium">{root.name}</span>
                        </div>
                        <Badge 
                          variant={selectedFolderId === root.id ? "secondary" : "outline"} 
                          className="text-xs"
                        >
                          {rootMaterialCount}
                        </Badge>
                      </div>
                      {isRootOpen && root.children?.map(child => (
                        <div
                          key={child.id}
                          onClick={() => setSelectedFolderId(child.id)}
                          className={`flex items-center justify-between gap-2 px-3 py-2 rounded-md cursor-pointer transition-all text-sm ml-4 ${
                            selectedFolderId === child.id
                              ? 'bg-primary text-primary-foreground shadow-sm'
                              : 'hover:bg-secondary/80'
                          }`}
                        >
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <Folder size={14} className="flex-shrink-0" />
                            <span className="truncate">{child.name}</span>
                          </div>
                          <Badge 
                            variant={selectedFolderId === child.id ? "secondary" : "outline"} 
                            className="text-xs"
                          >
                            {child.materialCount}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </div>

          {/* 右侧内容区域 */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* 搜索栏 */}
            <div className="px-6 py-3 border-b">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Enter搜索"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* 素材网格和预览 */}
            <div className="flex-1 overflow-y-auto min-h-0">
              <div className="p-6">
                <div className="flex gap-6 h-full">
                  <div className="flex-1 min-w-0">
                    {filteredMaterials.length > 0 ? (
                      <StickerGrid stickers={filteredMaterials} />
                    ) : (
                      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                        <Image size={48} className="mb-4 opacity-50" />
                        <p className="font-medium">暂无素材</p>
                        <p className="text-sm">此分类下暂无素材文件</p>
                      </div>
                    )}
                  </div>
                  
                  {selectedStickers.length > 0 && (
                    <div className="w-48 flex-shrink-0">
                      <h4 className="text-sm font-medium mb-3">预览 (9:16)</h4>
                      <div 
                        ref={previewRef}
                        className="relative rounded-lg overflow-hidden w-full cursor-crosshair" 
                        style={{ 
                          aspectRatio: '9/16',
                          background: 'repeating-linear-gradient(45deg, hsl(var(--muted)) 0px, hsl(var(--muted)) 10px, hsl(var(--muted) / 0.7) 10px, hsl(var(--muted) / 0.7) 20px)'
                        }}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseUp}
                      >
                        <div className="absolute inset-0">
                          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/50 text-xs">
                            拖拽/缩放
                          </div>
                          {selectedStickers.map((sticker, index) => {
                            const material = materials.find(m => m.id === sticker.id);
                            return (
                              <div
                                key={sticker.id}
                                className="absolute select-none group"
                                style={{
                                  left: `${sticker.x}%`,
                                  top: `${sticker.y}%`,
                                  transform: `translate(-50%, -50%) scale(${sticker.scale})`,
                                  zIndex: activeStickerIndex === index ? 20 : 10 + index
                                }}
                              >
                                {/* 贴纸内容 */}
                                <div
                                  className="cursor-move relative bg-white/20 border border-white/30 rounded px-3 py-2 text-xs text-white backdrop-blur-sm"
                                  onMouseDown={(e) => handleStickerMouseDown(e, index)}
                                >
                                  <div className="flex items-center gap-1">
                                    <Move size={10} className="opacity-50" />
                                    <span>贴纸{index + 1}</span>
                                  </div>
                                </div>
                                
                                {/* 缩放控制点 */}
                                <div className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-primary rounded-full border border-background cursor-nwse-resize opacity-0 group-hover:opacity-100 transition-opacity"
                                  onMouseDown={(e) => handleResizeMouseDown(e, index)}
                                />
                                <div className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-primary rounded-full border border-background cursor-nesw-resize opacity-0 group-hover:opacity-100 transition-opacity"
                                  onMouseDown={(e) => handleResizeMouseDown(e, index)}
                                />
                                <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-primary rounded-full border border-background cursor-nesw-resize opacity-0 group-hover:opacity-100 transition-opacity"
                                  onMouseDown={(e) => handleResizeMouseDown(e, index)}
                                />
                                <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-primary rounded-full border border-background cursor-nwse-resize opacity-0 group-hover:opacity-100 transition-opacity"
                                  onMouseDown={(e) => handleResizeMouseDown(e, index)}
                                />
                              </div>
                            );
                          })}
                        </div>
                      </div>
                      <div className="mt-2 text-xs text-muted-foreground text-center">
                        已选择 {selectedStickers.length} 个贴纸
                      </div>
                      <div className="mt-1 text-xs text-muted-foreground text-center">
                        💡 拖拽调整位置 • 边角调整大小
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 音效配置区域 */}
        {selectedStickers.length > 0 && (
          <div className="border-t bg-muted/20 flex-shrink-0">
            <ScrollArea className="h-[240px]">
              <div className="px-6 py-4 space-y-4">
                <h4 className="text-sm font-medium">贴纸音效配置</h4>
                <div className="space-y-3 p-4 border rounded-lg bg-background">
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
                
                <div className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg">
                  <Music size={16} className="text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-muted-foreground">
                    <p className="font-medium mb-1">音效说明：</p>
                    <p>• 所有贴纸共享同一音效配置</p>
                    <p>• 音效出现时间与贴纸出现时间同步</p>
                    <p>• 音效播放时长为音效文件本身的时长</p>
                  </div>
                </div>
              </div>
            </ScrollArea>
          </div>
        )}

        {/* 底部按钮 */}
        <div className="flex justify-between items-center px-6 py-4 border-t flex-shrink-0">
          <div className="text-sm text-muted-foreground">
            支持多选贴纸，可重叠显示
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              取消
            </Button>
            <Button onClick={handleSubmit}>
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