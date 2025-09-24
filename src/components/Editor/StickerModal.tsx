import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Plus, Folder, Music, Image } from "lucide-react";

interface StickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  segmentId: string;
}

// Mock materials data from materials library
const mockMaterials = [
  // Marketing materials (营销类)
  { id: '1', name: '9月17日.png', type: 'image' as const, folderId: '2-1-1', thumbnail: '/placeholder.svg' },
  { id: '2', name: '9月17日(1).png', type: 'image' as const, folderId: '2-1-1', thumbnail: '/placeholder.svg' },
  { id: '3', name: 'TREN95(6).png', type: 'image' as const, folderId: '2-1-2', thumbnail: '/placeholder.svg' },
  { id: '4', name: 'TREN95(4).png', type: 'image' as const, folderId: '2-1-2', thumbnail: '/placeholder.svg' },
  { id: '5', name: 'TREN95(7).png', type: 'image' as const, folderId: '2-1-3', thumbnail: '/placeholder.svg' },
  
  // Decorative materials (装饰类)
  { id: '6', name: 'TREN95(6).png', type: 'image' as const, folderId: '2-2', thumbnail: '/placeholder.svg' },
  { id: '7', name: 'ave10版.jpeg', type: 'image' as const, folderId: '2-2', thumbnail: '/placeholder.svg' },
  { id: '8', name: '9月10日 (1).png', type: 'image' as const, folderId: '2-2', thumbnail: '/placeholder.svg' },
  { id: '9', name: '载屏2025 0.png', type: 'image' as const, folderId: '2-2', thumbnail: '/placeholder.svg' },
  { id: '10', name: '9月10日(7).png', type: 'image' as const, folderId: '2-2', thumbnail: '/placeholder.svg' },
];

// Mock folder structure for navigation
const imageFolders = [
  { 
    id: '2-1', 
    name: '营销类', 
    subfolders: [
      { id: '2-1-1', name: '品牌+符号' },
      { id: '2-1-2', name: '促销生活' },
      { id: '2-1-3', name: '优惠码' },
    ]
  },
  { id: '2-2', name: '装饰类', subfolders: [] }
];

export const StickerModal = ({ isOpen, onClose, segmentId }: StickerModalProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStickers, setSelectedStickers] = useState<string[]>([]);
  const [stickerSoundEffects, setStickerSoundEffects] = useState<{[key: string]: {folder: string, volume: string}}>({});
  const [selectedCategory, setSelectedCategory] = useState("2-1"); // Default to 营销类
  const [selectedSubfolder, setSelectedSubfolder] = useState(""); // For filtering by subfolder

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

  // Get filtered materials based on selected category and subfolder
  const getFilteredMaterials = () => {
    let filtered = mockMaterials.filter(material => {
      // Filter by category (营销类 or 装饰类)
      if (selectedCategory === "2-1") {
        return material.folderId?.startsWith("2-1");
      } else if (selectedCategory === "2-2") {
        return material.folderId === "2-2";
      }
      return false;
    });

    // Further filter by subfolder if selected
    if (selectedSubfolder) {
      filtered = filtered.filter(material => material.folderId === selectedSubfolder);
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(material => 
        material.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  };

  const currentFolder = imageFolders.find(folder => folder.id === selectedCategory);
  const marketingMaterials = getFilteredMaterials();

  const StickerGrid = ({ stickers }: { stickers: typeof mockMaterials }) => (
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
              src={sticker.thumbnail} 
              alt={sticker.name}
              className="w-full h-full object-cover rounded"
            />
          </div>
          <p className="text-xs text-center truncate">{sticker.name}</p>
        </div>
      ))}
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[900px] max-h-[80vh] flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                导出尺寸: 1080*1920
              </span>
            </div>
          </div>
        </DialogHeader>
        
        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-4">
            <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
              <div className="flex items-center justify-between mb-4">
                <TabsList>
                  <TabsTrigger value="2-1">
                    营销类({mockMaterials.filter(m => m.folderId?.startsWith("2-1")).length})
                  </TabsTrigger>
                  <TabsTrigger value="2-2">
                    装饰类({mockMaterials.filter(m => m.folderId === "2-2").length})
                  </TabsTrigger>
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

              <div className="flex gap-4 mb-4">
                <Button 
                  variant={selectedSubfolder === '' ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setSelectedSubfolder('')}
                >
                  全部
                </Button>
                {currentFolder?.subfolders.map(subfolder => (
                  <Button 
                    key={subfolder.id}
                    variant={selectedSubfolder === subfolder.id ? "default" : "outline"} 
                    size="sm"
                    onClick={() => setSelectedSubfolder(subfolder.id)}
                  >
                    {subfolder.name}
                  </Button>
                ))}
              </div>

              <TabsContent value="2-1" className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-1">
                    {marketingMaterials.length > 0 ? (
                      <StickerGrid stickers={marketingMaterials} />
                    ) : (
                      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                        <Image size={48} className="mb-4" />
                        <p>暂无贴纸素材</p>
                        <p className="text-sm">请上传图片素材到素材库</p>
                      </div>
                    )}
                  </div>
                  {selectedStickers.length > 0 && (
                    <div className="w-48 border-l border-border pl-4">
                      <h4 className="text-sm font-medium mb-3">预览</h4>
                      <div className="relative bg-black rounded-lg" style={{ aspectRatio: '9/16', height: '200px' }}>
                        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-gray-700 rounded-lg">
                          {selectedStickers.map((stickerId, index) => {
                            const sticker = mockMaterials.find(s => s.id === stickerId);
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
              
              <TabsContent value="2-2" className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-1">
                    {marketingMaterials.length > 0 ? (
                      <StickerGrid stickers={marketingMaterials} />
                    ) : (
                      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                        <Image size={48} className="mb-4" />
                        <p>暂无贴纸素材</p>
                        <p className="text-sm">请上传图片素材到素材库</p>
                      </div>
                    )}
                  </div>
                  {selectedStickers.length > 0 && (
                    <div className="w-48 border-l border-border pl-4">
                      <h4 className="text-sm font-medium mb-3">预览</h4>
                      <div className="relative bg-black rounded-lg" style={{ aspectRatio: '9/16', height: '200px' }}>
                        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-gray-700 rounded-lg">
                          {selectedStickers.map((stickerId, index) => {
                            const sticker = mockMaterials.find(s => s.id === stickerId);
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
            </Tabs>

            {selectedStickers.length > 0 && (
              <div className="space-y-4 border-t border-border pt-4">
                <h4 className="text-sm font-medium">贴纸音效设置</h4>
                {selectedStickers.slice(0, 2).map((stickerId, index) => {
                  const stickerName = mockMaterials.find(s => s.id === stickerId)?.name || `贴纸${index + 1}`;
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