import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Plus } from "lucide-react";

interface StickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  segmentId: string;
}

// Mock sticker data
const privateStickers = [
  { id: '1', name: '9月17日.png', thumbnail: '/placeholder.svg' },
  { id: '2', name: '9月17日(1)...', thumbnail: '/placeholder.svg' },
  { id: '3', name: 'TREN95(6).p...', thumbnail: '/placeholder.svg' },
  { id: '4', name: 'TREN95(4).p...', thumbnail: '/placeholder.svg' },
  { id: '5', name: 'TREN95(7).p...', thumbnail: '/placeholder.svg' },
];

const publicStickers = [
  { id: '6', name: 'TREN95(6).p...', thumbnail: '/placeholder.svg' },
  { id: '7', name: 'ave10版.jpeg', thumbnail: '/placeholder.svg' },
  { id: '8', name: '9月10日 (1)...', thumbnail: '/placeholder.svg' },
  { id: '9', name: '载屏2025 0...', thumbnail: '/placeholder.svg' },
  { id: '10', name: '9月10日(7)...', thumbnail: '/placeholder.svg' },
];

export const StickerModal = ({ isOpen, onClose, segmentId }: StickerModalProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStickers, setSelectedStickers] = useState<string[]>([]);

  const handleStickerSelect = (stickerId: string) => {
    setSelectedStickers(prev => 
      prev.includes(stickerId) 
        ? prev.filter(id => id !== stickerId)
        : [...prev, stickerId]
    );
  };

  const handleSubmit = () => {
    console.log("Selected stickers:", selectedStickers);
    onClose();
  };

  const StickerGrid = ({ stickers }: { stickers: typeof privateStickers }) => (
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
      <DialogContent className="sm:max-w-[900px] max-h-[80vh]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm">
                <Plus size={16} className="mr-2" />
                分组1
              </Button>
              <span className="text-sm text-muted-foreground">
                导出尺寸: 1080*1920
              </span>
            </div>
          </div>
        </DialogHeader>
        
        <Tabs defaultValue="private" className="w-full">
          <div className="flex items-center justify-between mb-4">
            <TabsList>
              <TabsTrigger value="private">私有贴纸(0)</TabsTrigger>
              <TabsTrigger value="public">公共贴纸(1)</TabsTrigger>
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
            <Button variant={searchQuery === '' ? "default" : "outline"} size="sm">全部</Button>
            <Button variant="outline" size="sm">时间</Button>
            <Button variant="outline" size="sm">七夕</Button>
            <Button variant="outline" size="sm">优惠票</Button>
          </div>

          <TabsContent value="private" className="space-y-4">
            <StickerGrid stickers={privateStickers} />
          </TabsContent>
          
          <TabsContent value="public" className="space-y-4">
            <StickerGrid stickers={publicStickers} />
          </TabsContent>
        </Tabs>

        <div className="flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            0 提示: 组内贴片随机展示
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