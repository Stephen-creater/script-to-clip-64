import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { FileText, Image, Video, Music, FolderOpen, Square, CheckSquare } from "lucide-react";
import { useMaterials } from "@/hooks/useMaterials";

interface MaterialSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (materials: {
    id: string;
    name: string;
    type: string;
    url: string;
    thumbnail?: string;
  }[]) => void;
  multiSelect?: boolean;
}

interface FolderItem {
  id: string;
  name: string;
  count: number;
  parentId?: string;
  children?: FolderItem[];
}

// Mock folder structure for demo
const mockFolders: FolderItem[] = [
  {
    id: "all",
    name: "全部素材",
    count: 128
  },
  {
    id: "video",
    name: "视频素材",
    count: 45,
    children: [
      { id: "video-nature", name: "自然风光", count: 12 },
      { id: "video-city", name: "城市生活", count: 18 },
      { id: "video-people", name: "人物视频", count: 15 }
    ]
  },
  {
    id: "image", 
    name: "图片素材",
    count: 67,
    children: [
      { id: "image-bg", name: "背景图片", count: 25 },
      { id: "image-icon", name: "图标素材", count: 30 },
      { id: "image-photo", name: "照片素材", count: 12 }
    ]
  },
  {
    id: "audio",
    name: "音频素材", 
    count: 16,
    children: [
      { id: "audio-bgm", name: "背景音乐", count: 8 },
      { id: "audio-effect", name: "音效", count: 8 }
    ]
  }
];

// Mock materials data
const mockMaterials = [
  {
    id: "1",
    name: "自然风光视频1",
    type: "video",
    category: "video-nature",
    thumbnail: "/placeholder.svg",
    duration: "00:15",
    size: "12.5MB",
    date: "2024-01-15"
  },
  {
    id: "2", 
    name: "城市夜景",
    type: "video",
    category: "video-city",
    thumbnail: "/placeholder.svg",
    duration: "00:20",
    size: "18.3MB",
    date: "2024-01-14"
  },
  {
    id: "3",
    name: "商务人士",
    type: "video", 
    category: "video-people",
    thumbnail: "/placeholder.svg",
    duration: "00:12",
    size: "9.8MB",
    date: "2024-01-13"
  },
  {
    id: "4",
    name: "科技背景",
    type: "image",
    category: "image-bg", 
    thumbnail: "/placeholder.svg",
    size: "2.1MB",
    date: "2024-01-12"
  },
  {
    id: "5",
    name: "设置图标",
    type: "image",
    category: "image-icon",
    thumbnail: "/placeholder.svg", 
    size: "256KB",
    date: "2024-01-11"
  }
];

export const MaterialSelectionModal = ({ isOpen, onClose, onSelect, multiSelect = false }: MaterialSelectionModalProps) => {
  const [selectedFolder, setSelectedFolder] = useState<string>("all");
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedFolder("all");
      setSelectedMaterials([]);
    }
  }, [isOpen]);

  const getFilteredMaterials = () => {
    let filtered = mockMaterials;
    
    // Filter by folder
    if (selectedFolder !== "all") {
      filtered = filtered.filter(material => {
        if (selectedFolder.startsWith("video")) {
          return material.type === "video" && (selectedFolder === "video" || material.category === selectedFolder);
        }
        if (selectedFolder.startsWith("image")) {
          return material.type === "image" && (selectedFolder === "image" || material.category === selectedFolder);
        }
        if (selectedFolder.startsWith("audio")) {
          return material.type === "audio" && (selectedFolder === "audio" || material.category === selectedFolder);
        }
        return material.category === selectedFolder;
      });
    }
    
    return filtered;
  };

  const handleMaterialSelect = (materialId: string) => {
    if (multiSelect) {
      setSelectedMaterials(prev => 
        prev.includes(materialId) 
          ? prev.filter(id => id !== materialId)
          : [...prev, materialId]
      );
    } else {
      setSelectedMaterials([materialId]);
    }
  };

  const handleSelectAll = () => {
    const filteredMaterials = getFilteredMaterials();
    const allIds = filteredMaterials.map(m => m.id);
    const allSelected = allIds.every(id => selectedMaterials.includes(id));
    
    if (allSelected) {
      setSelectedMaterials(prev => prev.filter(id => !allIds.includes(id)));
    } else {
      setSelectedMaterials(prev => [...new Set([...prev, ...allIds])]);
    }
  };

  const handleConfirm = () => {
    const materials = mockMaterials.filter(m => selectedMaterials.includes(m.id)).map(material => ({
      id: material.id,
      name: material.name,
      type: material.type,
      url: material.thumbnail,
      thumbnail: material.thumbnail
    }));
    
    if (materials.length > 0) {
      onSelect(materials);
    }
    onClose();
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Video size={16} className="text-blue-500" />;
      case 'image':
        return <Image size={16} className="text-green-500" />;
      case 'audio':
        return <Music size={16} className="text-purple-500" />;
      default:
        return <FileText size={16} className="text-gray-500" />;
    }
  };

  const renderFolderTree = (folders: FolderItem[], level = 0) => {
    return folders.map(folder => (
      <div key={folder.id}>
        <div
          className={`flex items-center gap-2 p-2 rounded cursor-pointer transition-colors hover:bg-muted/50 ${
            selectedFolder === folder.id ? 'bg-primary/10 text-primary border-l-2 border-primary' : ''
          }`}
          style={{ paddingLeft: `${level * 12 + 8}px` }}
          onClick={() => setSelectedFolder(folder.id)}
        >
          <FolderOpen size={16} />
          <span className="text-sm">{folder.name}</span>
          <span className="text-xs text-muted-foreground ml-auto">({folder.count})</span>
        </div>
        {folder.children && renderFolderTree(folder.children, level + 1)}
      </div>
    ));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>选择素材</DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-1 gap-4 min-h-0">
          {/* Left Sidebar - Folders */}
          <div className="w-1/4 border-r border-border pr-4">
            <div className="mb-4">
              <h3 className="text-sm font-medium mb-2">素材分类</h3>
              <ScrollArea className="h-[400px]">
                {renderFolderTree(mockFolders)}
              </ScrollArea>
            </div>
          </div>
          
          {/* Right Content - Materials */}
          <div className="flex-1 flex flex-col min-h-0">
            {/* Selection Controls */}
            {multiSelect && (
              <div className="mb-4 flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSelectAll}
                  className="flex items-center gap-2"
                >
                  {getFilteredMaterials().every(m => selectedMaterials.includes(m.id)) ? (
                    <CheckSquare size={16} />
                  ) : (
                    <Square size={16} />
                  )}
                  全选
                </Button>
                <span className="text-sm text-muted-foreground">
                  已选择 {selectedMaterials.length} 项
                </span>
              </div>
            )}
            
            {/* Materials Grid */}  
            <ScrollArea className="flex-1">
              <div className="grid grid-cols-3 gap-4">
                {getFilteredMaterials().map((material) => (
                  <div
                    key={material.id}
                    className={`relative border border-border rounded-lg p-3 cursor-pointer transition-all hover:bg-muted/30 hover:border-primary/50 ${
                      selectedMaterials.includes(material.id) ? 'border-primary bg-primary/5 ring-1 ring-primary/20' : ''
                    }`}
                    onClick={() => handleMaterialSelect(material.id)}
                  >
                    {multiSelect && (
                      <div className="absolute top-2 right-2 z-10">
                        <Checkbox 
                          checked={selectedMaterials.includes(material.id)}
                          onChange={() => {}} // Handled by parent click
                        />
                      </div>
                    )}
                    <div className="aspect-video bg-muted rounded mb-2 flex items-center justify-center">
                      {getFileIcon(material.type)}
                    </div>
                    <div className="text-sm font-medium truncate mb-1">{material.name}</div>
                    <div className="text-xs text-muted-foreground space-y-1">
                      {material.duration && <div>时长: {material.duration}</div>}
                      <div>大小: {material.size}</div>
                      <div>日期: {material.date}</div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>
        
        {/* Footer */}
        <div className="flex justify-end gap-2 pt-4 border-t border-border">
          <Button variant="outline" onClick={onClose}>
            取消
          </Button>
          <Button 
            onClick={handleConfirm}
            disabled={selectedMaterials.length === 0}
          >
            确认选择 {selectedMaterials.length > 0 && `(${selectedMaterials.length})`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};