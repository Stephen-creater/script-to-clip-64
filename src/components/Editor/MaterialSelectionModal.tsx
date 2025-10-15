import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { FolderOpen, ChevronRight, ChevronDown, X, FileVideo, Folder } from "lucide-react";
import { cn } from "@/lib/utils";
import { useFolders } from "@/hooks/useFolders";

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
  type?: 'video' | 'image' | 'audio';
  hasChildren?: boolean;
}

// Determine folder type based on name
const getFolderType = (folderName: string): 'video' | 'image' | 'audio' | undefined => {
  if (folderName === '视频素材' || folderName.includes('视频')) return 'video';
  if (folderName === '图片素材' || folderName.includes('图片')) return 'image';
  if (folderName === '音频素材' || folderName.includes('音频')) return 'audio';
  return undefined;
};

// Build folder hierarchy with type inheritance
const buildFolderHierarchy = (folders: any[]): FolderItem[] => {
  const folderMap = new Map<string, FolderItem>();
  const rootFolders: FolderItem[] = [];

  // First pass: create all folder items
  folders.forEach(folder => {
    const folderType = getFolderType(folder.name);
    folderMap.set(folder.id, {
      id: folder.id,
      name: folder.name,
      count: 3, // Mock count for display
      parentId: folder.parent_id,
      type: folderType,
      hasChildren: false,
      children: []
    });
  });

  // Second pass: build hierarchy and inherit types
  folders.forEach(folder => {
    const currentFolder = folderMap.get(folder.id)!;
    
    if (folder.parent_id) {
      const parentFolder = folderMap.get(folder.parent_id);
      if (parentFolder) {
        // Inherit type from parent if current folder has no type
        if (!currentFolder.type && parentFolder.type) {
          currentFolder.type = parentFolder.type;
        }
        parentFolder.children = parentFolder.children || [];
        parentFolder.children.push(currentFolder);
        parentFolder.hasChildren = true;
      }
    } else {
      rootFolders.push(currentFolder);
    }
  });

  return rootFolders;
};

// Filter folders by type (video only for material selection)
const filterFoldersByType = (folders: FolderItem[], type: 'video' | 'image' | 'audio'): FolderItem[] => {
  return folders
    .filter(folder => folder.type === type)
    .map(folder => ({
      ...folder,
      children: folder.children ? filterFoldersByType(folder.children, type) : undefined
    }));
};

// Get recently added folders (last 5) - for video folders only
const getRecentlyAddedFolders = (folders: FolderItem[]): FolderItem[] => {
  const allFolders: FolderItem[] = [];
  
  const flattenFolders = (folders: FolderItem[]) => {
    folders.forEach(folder => {
      allFolders.push(folder);
      if (folder.children) {
        flattenFolders(folder.children);
      }
    });
  };
  
  flattenFolders(folders);
  
  // Sort by most recent (using reverse order since we don't have actual dates)
  return allFolders.slice(0, 5);
};

export const MaterialSelectionModal = ({ isOpen, onClose, onSelect }: MaterialSelectionModalProps) => {
  const { folders, loading } = useFolders();
  const [selectedFolder, setSelectedFolder] = useState<string>("");
  const [expandedFolders, setExpandedFolders] = useState<string[]>([]);

  // Build hierarchy and filter to show only video type folders
  const allFolders = buildFolderHierarchy(folders);
  const videoFolders = filterFoldersByType(allFolders, 'video');
  
  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedFolder("");
      // Auto-expand all video folders
      const allVideoFolderIds = videoFolders.map(f => f.id);
      setExpandedFolders(allVideoFolderIds);
    }
  }, [isOpen, videoFolders]);

  const recentlyAddedFolders = getRecentlyAddedFolders(videoFolders);

  const handleFolderSelect = (folderId: string, folderName: string) => {
    setSelectedFolder(folderId);
  };

  const handleConfirm = () => {
    if (selectedFolder) {
      const folder = findFolderById(videoFolders, selectedFolder);
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

  const getFolderIcon = (folder: FolderItem, isExpanded: boolean) => {
    if (folder.type === 'video') {
      return <FileVideo size={16} className="text-blue-500" />;
    }
    return isExpanded ? <FolderOpen size={16} /> : <Folder size={16} />;
  };

  const renderFolderTree = (folders: FolderItem[], level = 0) => {
    return folders.map(folder => {
      const isExpanded = expandedFolders.includes(folder.id);
      const isSelected = selectedFolder === folder.id;
      const hasChildren = folder.hasChildren || (folder.children && folder.children.length > 0);

      return (
        <div key={folder.id}>
          <div
            className={cn(
              "group flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-colors",
              isSelected
                ? "bg-primary text-primary-foreground"
                : "hover:bg-secondary"
            )}
            style={{ marginLeft: level * 20 }}
            onClick={() => {
              if (hasChildren) {
                toggleFolder(folder.id);
              }
              handleFolderSelect(folder.id, folder.name);
            }}
          >
            <div className="flex items-center gap-2 flex-1">
              <div className="w-[14px] flex justify-center">
                {hasChildren && (
                  isExpanded ? 
                    <ChevronDown size={14} /> : 
                    <ChevronRight size={14} />
                )}
              </div>
              {getFolderIcon(folder, isExpanded)}
              <span className="text-sm">{folder.name}</span>
            </div>
            <span className="text-xs text-muted-foreground">{folder.count}</span>
          </div>
          {hasChildren && isExpanded && (
            <div>
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
              {loading ? (
                <div className="text-center text-sm text-muted-foreground py-4">
                  加载中...
                </div>
              ) : videoFolders.length === 0 ? (
                <div className="text-center text-sm text-muted-foreground py-4">
                  暂无视频文件夹
                </div>
              ) : (
                <div className="space-y-1">
                  {renderFolderTree(videoFolders)}
                </div>
              )}
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