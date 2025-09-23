import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, FileText, Image, Video, Music, FolderOpen } from "lucide-react";
import { useMaterials } from "@/hooks/useMaterials";

interface MaterialSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (material: {
    id: string;
    name: string;
    type: string;
    url: string;
    thumbnail?: string;
  }) => void;
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

export const MaterialSelectionModal = ({ isOpen, onClose, onSelect }: MaterialSelectionModalProps) => {
  const [selectedFolder, setSelectedFolder] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMaterial, setSelectedMaterial] = useState<string | null>(null);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedFolder("all");
      setSearchQuery("");
      setSelectedMaterial(null);
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
    
    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(material => 
        material.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return filtered;
  };

  const handleMaterialSelect = (material: typeof mockMaterials[0]) => {
    setSelectedMaterial(material.id);
  };

  const handleConfirm = () => {
    const material = mockMaterials.find(m => m.id === selectedMaterial);
    if (material) {
      onSelect({
        id: material.id,
        name: material.name,
        type: material.type,
        url: material.thumbnail,
        thumbnail: material.thumbnail
      });
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
          className={`flex items-center gap-2 p-2 rounded cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 ${
            selectedFolder === folder.id ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : ''
          }`}
          style={{ paddingLeft: `${level * 12 + 8}px` }}
          onClick={() => setSelectedFolder(folder.id)}
        >
          <FolderOpen size={16} />
          <span className="text-sm">{folder.name}</span>
          <span className="text-xs text-gray-500 ml-auto">({folder.count})</span>
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
            {/* Search */}
            <div className="mb-4">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="搜索素材..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            {/* Materials Grid */}  
            <ScrollArea className="flex-1">
              <div className="grid grid-cols-3 gap-4">
                {getFilteredMaterials().map((material) => (
                  <div
                    key={material.id}
                    className={`border border-border rounded-lg p-3 cursor-pointer hover:shadow-md transition-all ${
                      selectedMaterial === material.id ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : ''
                    }`}
                    onClick={() => handleMaterialSelect(material)}
                  >
                    <div className="aspect-video bg-gray-100 dark:bg-gray-800 rounded mb-2 flex items-center justify-center">
                      {getFileIcon(material.type)}
                    </div>
                    <div className="text-sm font-medium truncate mb-1">{material.name}</div>
                    <div className="text-xs text-gray-500 space-y-1">
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
            disabled={!selectedMaterial}
          >
            确认选择
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};