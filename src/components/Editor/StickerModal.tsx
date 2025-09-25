import { useState, useMemo, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Plus, Folder, Music, Image } from "lucide-react";
import { useMaterials } from "@/hooks/useMaterials";
import { useFolders } from "@/hooks/useFolders";

interface StickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  segmentId: string;
}

// Interface for folder structure
interface Folder {
  id: string;
  name: string;
  subfolders: { id: string; name: string }[];
}

export const StickerModal = ({ isOpen, onClose, segmentId }: StickerModalProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStickers, setSelectedStickers] = useState<string[]>([]);
  const [stickerSoundEffects, setStickerSoundEffects] = useState<{[key: string]: {folder: string, volume: string}}>({});
  const [selectedFolder, setSelectedFolder] = useState(""); // Selected folder ID
  const [selectedSubfolder, setSelectedSubfolder] = useState(""); // For filtering by subfolder
  
  const { materials, getMaterialUrl } = useMaterials();
  const { getFolderHierarchy } = useFolders();

  // Get image materials only (for stickers)
  const imageMaterials = useMemo(() => {
    return materials.filter(material => material.file_type === 'image');
  }, [materials]);

  // Extract folder structure from folders hook
  const folderHierarchy = useMemo(() => {
    return getFolderHierarchy();
  }, [getFolderHierarchy]);

  // Set default selected folder when folders are available
  useEffect(() => {
    if (folderHierarchy.length > 0 && !selectedFolder) {
      setSelectedFolder(folderHierarchy[0].id);
    }
  }, [folderHierarchy, selectedFolder]);

  const handleStickerSelect = (stickerId: string) => {
    setSelectedStickers(prev => {
      const newSelected = prev.includes(stickerId) 
        ? prev.filter(id => id !== stickerId)
        : [...prev, stickerId];
      
      // Clean up sound effects for unselected stickers
      if (prev.includes(stickerId)) {
        setStickerSoundEffects(prevEffects => {
          const newEffects = { ...prevEffects };
          delete newEffects[stickerId];
          return newEffects;
        });
      }
      
      return newSelected;
    });
  };

  const updateStickerSoundEffect = (stickerId: string, field: 'folder' | 'volume', value: string) => {
    setStickerSoundEffects(prev => ({
      ...prev,
      [stickerId]: {
        ...prev[stickerId],
        folder: field === 'folder' ? value : (prev[stickerId]?.folder || ''),
        volume: field === 'volume' ? value : (prev[stickerId]?.volume || '50')
      }
    }));
  };

  const handleSubmit = () => {
    console.log("Selected stickers:", selectedStickers);
    console.log("Sticker sound effects:", stickerSoundEffects);
    onClose();
  };

  // Get filtered materials based on selected folder and search query
  const getFilteredMaterials = () => {
    let filtered = imageMaterials;

    // Filter by selected folder
    if (selectedFolder) {
      filtered = filtered.filter(material => material.folder_id === selectedFolder);
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(material => 
        material.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (material.original_name && material.original_name.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    return filtered;
  };

  const currentFolder = folderHierarchy.find(folder => folder.id === selectedFolder);
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
  if (folderHierarchy.length === 0) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>选择贴纸</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <Folder size={48} className="mb-4" />
            <p>暂无贴纸文件夹</p>
            <p className="text-sm">请在素材库中创建文件夹并上传图片素材</p>
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
              <Tabs value={selectedFolder} onValueChange={setSelectedFolder} className="w-full">
                <div className="flex items-center justify-between mb-4">
                  <TabsList>
                    {folderHierarchy.map(folder => {
                      const folderMaterialCount = imageMaterials.filter(m => m.folder_id === folder.id).length;
                      return (
                        <TabsTrigger key={folder.id} value={folder.id}>
                          {folder.name}({folderMaterialCount})
                        </TabsTrigger>
                      );
                    })}
                  </TabsList>
                  
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

                {folderHierarchy.map(folder => (
                  <TabsContent key={folder.id} value={folder.id} className="space-y-4">
                    <div className="flex gap-4">
                      <div className="flex-1">
                        {filteredMaterials.length > 0 ? (
                          <StickerGrid stickers={filteredMaterials} />
                        ) : (
                          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                            <Image size={48} className="mb-4" />
                            <p>暂无贴纸素材</p>
                            <p className="text-sm">请上传图片素材到此文件夹</p>
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
                  </TabsContent>
                ))}
              </Tabs>

              {selectedStickers.length > 0 && (
                <div className="space-y-4 border-t border-border pt-4">
                  <h4 className="text-sm font-medium">贴纸音效设置</h4>
                  {selectedStickers.map((stickerId, index) => {
                    const stickerName = imageMaterials.find(s => s.id === stickerId)?.name || `贴纸${index + 1}`;
                    const currentEffect = stickerSoundEffects[stickerId];
                    
                    return (
                      <div key={stickerId} className="space-y-3 p-4 border border-border rounded-lg">
                        <Label className="text-sm font-medium">贴纸{index + 1} ({stickerName}) 音效</Label>
                        
                        <div className="space-y-2">
                          <Label htmlFor={`soundEffect-${stickerId}`}>音效选择</Label>
                          <Select 
                            value={currentEffect?.folder || ''} 
                            onValueChange={(value) => updateStickerSoundEffect(stickerId, 'folder', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="请选择音效文件夹" />
                            </SelectTrigger>
                             <SelectContent>
                               <SelectItem value="funny">
                                 <div className="flex items-center gap-2">
                                   <Folder size={16} />
                                   <span>搞笑音效</span>
                                 </div>
                               </SelectItem>
                               <SelectItem value="transition">
                                 <div className="flex items-center gap-2">
                                   <Folder size={16} />
                                   <span>转场音效</span>
                                 </div>
                               </SelectItem>
                               <SelectItem value="environment">
                                 <div className="flex items-center gap-2">
                                   <Folder size={16} />
                                   <span>环境音效</span>
                                 </div>
                               </SelectItem>
                               <SelectItem value="special">
                                 <div className="flex items-center gap-2">
                                   <Folder size={16} />
                                   <span>特效音效</span>
                                 </div>
                               </SelectItem>
                             </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`volume-${stickerId}`}>音量</Label>
                          <div className="flex items-center gap-2">
                            <Input
                              id={`volume-${stickerId}`}
                              type="number"
                              min="0"
                              max="100"
                              value={currentEffect?.volume || '50'}
                              onChange={(e) => updateStickerSoundEffect(stickerId, 'volume', e.target.value)}
                              className="flex-1"
                            />
                            <span className="text-sm text-muted-foreground">%</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  
                  <div className="flex items-start gap-2 p-3 bg-muted rounded-lg">
                    <Music size={16} className="text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-muted-foreground">
                      <p className="font-medium mb-1">音效说明：</p>
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
      </DialogContent>
    </Dialog>
  );
};