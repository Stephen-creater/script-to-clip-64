import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { FolderOpen, ChevronRight, ChevronDown, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface MaterialSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (folderId: string, folderName: string) => void;
}

interface FolderItem {
  id: string;
  name: string;
  count: number;
  parentId?: string;
  children?: FolderItem[];
  addedDate?: string;
}

// Mock folder structure matching Materials page structure
const mockFolders: FolderItem[] = [
  {
    id: "all",
    name: "视频素材",
    count: 0,
    addedDate: "2024-01-15",
    children: [
      { id: "window-scenery", name: "车窗外风景", count: 0, parentId: "all", addedDate: "2024-01-14" },
      { id: "station-interior", name: "车站内", count: 0, parentId: "all", addedDate: "2024-01-13" },
    ]
  },
  {
    id: "images",
    name: "图片素材",
    count: 0,
    addedDate: "2024-01-14",
    children: [
      {
        id: "marketing",
        name: "营销类",
        count: 0,
        parentId: "images",
        addedDate: "2024-01-13",
        children: [
          { id: "brand", name: "品牌+符号", count: 0, parentId: "marketing", addedDate: "2024-01-12" },
          { id: "promo", name: "促销生活", count: 0, parentId: "marketing", addedDate: "2024-01-11" },
          { id: "coupon", name: "优惠码", count: 0, parentId: "marketing", addedDate: "2024-01-10" },
        ]
      },
      { id: "decorative", name: "装饰类", count: 0, parentId: "images", addedDate: "2024-01-09" },
    ]
  },
  {
    id: "audio",
    name: "音频素材",
    count: 0,
    addedDate: "2024-01-08",
    children: [
      { id: "bgm", name: "BGM", count: 0, parentId: "audio", addedDate: "2024-01-07" },
      { id: "sound-effects", name: "音效素材", count: 0, parentId: "audio", addedDate: "2024-01-06" },
    ]
  }
];

// Get recently added folders (last 5)
const getRecentlyAddedFolders = (folders: FolderItem[]): FolderItem[] => {
  const allFolders: FolderItem[] = [];
  
  const flattenFolders = (folders: FolderItem[]) => {
    folders.forEach(folder => {
      if (folder.id !== "all") { // Exclude "全部素材"
        allFolders.push(folder);
      }
      if (folder.children) {
        flattenFolders(folder.children);
      }
    });
  };
  
  flattenFolders(folders);
  
  return allFolders
    .sort((a, b) => new Date(b.addedDate || '').getTime() - new Date(a.addedDate || '').getTime())
    .slice(0, 5);
};


export const MaterialSelectionModal = ({ isOpen, onClose, onSelect }: MaterialSelectionModalProps) => {
  const [selectedFolder, setSelectedFolder] = useState<string>("");
  const [expandedFolders, setExpandedFolders] = useState<string[]>(["all", "images", "audio"]);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedFolder("");
    }
  }, [isOpen]);

  const recentlyAddedFolders = getRecentlyAddedFolders(mockFolders);

  const handleFolderSelect = (folderId: string, folderName: string) => {
    setSelectedFolder(folderId);
  };

  const handleConfirm = () => {
    if (selectedFolder) {
      const folder = findFolderById(mockFolders, selectedFolder);
      if (folder) {
        onSelect(selectedFolder, folder.name);
      }
    }
    onClose();
  };

  const findFolderById = (folders: FolderItem[], id: string): FolderItem | null => {
    for (const folder of folders) {
      if (folder.id === id) return folder;
      if (folder.children) {
        const found = findFolderById(folder.children, id);
        if (found) return found;
      }
    }
    return null;
  };

  const toggleFolder = (folderId: string) => {
    setExpandedFolders(prev => 
      prev.includes(folderId) 
        ? prev.filter(id => id !== folderId)
        : [...prev, folderId]
    );
  };

  const renderFolderTree = (folders: FolderItem[], level = 0) => {
    return folders.map(folder => {
      const isExpanded = expandedFolders.includes(folder.id);
      const isSelected = selectedFolder === folder.id;
      const hasChildren = folder.children && folder.children.length > 0;

      return (
        <div key={folder.id}>
          <div
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-md cursor-pointer transition-colors hover:bg-muted/50",
              isSelected && "bg-primary/10 text-primary"
            )}
            style={{ paddingLeft: `${level * 16 + 12}px` }}
            onClick={() => handleFolderSelect(folder.id, folder.name)}
          >
            <div className="w-4 flex justify-center">
              {hasChildren && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFolder(folder.id);
                  }}
                  className="p-0 hover:bg-muted rounded-sm"
                >
                  {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </button>
              )}
            </div>
            <FolderOpen size={16} />
            <span className="text-sm flex-1">{folder.name}</span>
          </div>
          {hasChildren && isExpanded && (
            <div className="mt-1">
              {renderFolderTree(folder.children!, level + 1)}
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[70vh] flex flex-col">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <DialogTitle>请选择分组</DialogTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X size={16} />
          </Button>
        </DialogHeader>
        
        <div className="flex-1 space-y-4">
          {/* Recently Added Section */}
          <div>
            <h3 className="text-sm font-medium mb-3 text-muted-foreground">最近添加</h3>
            <div className="flex flex-wrap gap-2">
              {recentlyAddedFolders.map((folder) => (
                <Badge
                  key={folder.id}
                  variant={selectedFolder === folder.id ? "default" : "secondary"}
                  className={cn(
                    "cursor-pointer px-3 py-1 text-sm",
                    selectedFolder === folder.id && "bg-primary text-primary-foreground"
                  )}
                  onClick={() => handleFolderSelect(folder.id, folder.name)}
                >
                  {folder.name}
                </Badge>
              ))}
            </div>
          </div>

          {/* All Folders Section */}
          <div className="flex-1">
            <ScrollArea className="h-[300px]">
              <div className="space-y-1">
                {renderFolderTree(mockFolders)}
              </div>
            </ScrollArea>
          </div>
        </div>
        
        {/* Footer */}
        <div className="flex justify-end pt-4 border-t border-border">
          <Button 
            onClick={handleConfirm}
            disabled={!selectedFolder}
            className="bg-teal-500 hover:bg-teal-600 text-white"
          >
            确定
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};