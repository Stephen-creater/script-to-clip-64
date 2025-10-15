import { useState, useEffect, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { FolderOpen, ChevronRight, ChevronDown, X, FileAudio, Folder, Music } from "lucide-react";
import { cn } from "@/lib/utils";
import { useFolders } from "@/hooks/useFolders";
import { useMaterials } from "@/hooks/useMaterials";

interface AudioSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (fileId: string, fileName: string, folderId?: string) => void;
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

interface AudioFile {
  id: string;
  name: string;
  duration?: number;
  folderId?: string;
}

// Determine folder type based on name
const getFolderType = (folderName: string): 'video' | 'image' | 'audio' | undefined => {
  if (folderName === '视频素材' || folderName.includes('视频')) return 'video';
  if (folderName === '图片素材' || folderName.includes('图片')) return 'image';
  if (folderName === '音频素材' || folderName.includes('音频')) return 'audio';
  return undefined;
};

// Build folder hierarchy with type inheritance
const buildFolderHierarchy = (folders: any[], materials: any[]): FolderItem[] => {
  const folderMap = new Map<string, FolderItem>();
  const rootFolders: FolderItem[] = [];

  // First pass: create all folder items
  folders.forEach(folder => {
    const folderType = getFolderType(folder.name);
    const materialCount = materials.filter(m => m.folder_id === folder.id).length;
    
    folderMap.set(folder.id, {
      id: folder.id,
      name: folder.name,
      count: materialCount,
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

// Filter folders by type (audio only)
const filterFoldersByType = (folders: FolderItem[], type: 'video' | 'image' | 'audio'): FolderItem[] => {
  return folders
    .filter(folder => folder.type === type)
    .map(folder => ({
      ...folder,
      children: folder.children ? filterFoldersByType(folder.children, type) : undefined
    }));
};

// Get recently added folders (last 5)
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
  
  return allFolders.slice(0, 5);
};

export const AudioSelectionModal = ({ isOpen, onClose, onSelect }: AudioSelectionModalProps) => {
  const { folders, loading: foldersLoading } = useFolders();
  const { materials, loading: materialsLoading } = useMaterials();
  const [selectedFolder, setSelectedFolder] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<string>("");
  const [expandedFolders, setExpandedFolders] = useState<string[]>([]);

  // Build hierarchy and filter to show only audio type folders (memoized to prevent re-renders)
  const audioFolders = useMemo(() => {
    const allFolders = buildFolderHierarchy(folders, materials);
    return filterFoldersByType(allFolders, 'audio');
  }, [folders, materials]);

  // Get audio files for selected folder
  const audioFiles = useMemo(() => {
    if (!selectedFolder) return [];
    return materials
      .filter(m => m.folder_id === selectedFolder && m.file_type === 'audio')
      .map(m => ({
        id: m.id,
        name: m.name,
        duration: m.duration,
        folderId: m.folder_id
      }));
  }, [materials, selectedFolder]);
  
  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedFolder("");
      setSelectedFile("");
      // Auto-expand all audio folders
      const allAudioFolderIds: string[] = [];
      const collectIds = (folders: FolderItem[]) => {
        folders.forEach(f => {
          allAudioFolderIds.push(f.id);
          if (f.children) collectIds(f.children);
        });
      };
      collectIds(audioFolders);
      setExpandedFolders(allAudioFolderIds);
    }
  }, [isOpen]);

  const recentlyAddedFolders = getRecentlyAddedFolders(audioFolders);

  const handleFolderSelect = (folderId: string, folderName: string) => {
    setSelectedFolder(folderId);
    setSelectedFile(""); // Reset file selection when folder changes
  };

  const handleFileSelect = (fileId: string) => {
    setSelectedFile(fileId);
  };

  const handleConfirm = () => {
    if (selectedFile) {
      const file = audioFiles.find(f => f.id === selectedFile);
      if (file) {
        onSelect(selectedFile, file.name, selectedFolder);
      }
    } else if (selectedFolder) {
      const folder = findFolderById(audioFolders, selectedFolder);
      if (folder) {
        onSelect(selectedFolder, folder.name, selectedFolder);
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
    if (folder.type === 'audio') {
      return <FileAudio size={16} className="text-purple-500" />;
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

  const loading = foldersLoading || materialsLoading;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle className="text-lg font-semibold">请选择音效文件夹</DialogTitle>
        </DialogHeader>
        
        <div className="px-6 py-4 space-y-6 overflow-y-auto" style={{ maxHeight: 'calc(80vh - 140px)' }}>
          {/* Recently Added Section */}
          <div>
            <h3 className="text-sm font-medium mb-3 text-muted-foreground">最近添加</h3>
            <div className="flex flex-wrap gap-2">
              {recentlyAddedFolders.map((folder) => (
                <Badge
                  key={folder.id}
                  variant={selectedFolder === folder.id ? "default" : "secondary"}
                  className={cn(
                    "cursor-pointer px-4 py-1.5 text-sm rounded-full transition-all",
                    selectedFolder === folder.id 
                      ? "bg-primary text-primary-foreground shadow-sm" 
                      : "hover:bg-secondary/80"
                  )}
                  onClick={() => handleFolderSelect(folder.id, folder.name)}
                >
                  {folder.name}
                </Badge>
              ))}
            </div>
          </div>

          {/* All Folders Section */}
          <div>
            <h3 className="text-sm font-medium mb-3 text-muted-foreground">文件夹</h3>
            <div className="border rounded-lg">
              <ScrollArea className="h-[240px]">
                {loading ? (
                  <div className="text-center text-sm text-muted-foreground py-8">
                    加载中...
                  </div>
                ) : audioFolders.length === 0 ? (
                  <div className="text-center text-sm text-muted-foreground py-8">
                    暂无音频文件夹
                  </div>
                ) : (
                  <div className="space-y-0.5 p-2">
                    {renderFolderTree(audioFolders)}
                  </div>
                )}
              </ScrollArea>
            </div>
          </div>

          {/* Audio Files Section - Show when folder is selected */}
          {selectedFolder && audioFiles.length > 0 && (
            <div>
              <h3 className="text-sm font-medium mb-3 text-muted-foreground">文件列表</h3>
              <div className="border rounded-lg">
                <ScrollArea className="h-[180px]">
                  <div className="space-y-0.5 p-2">
                    {audioFiles.map(file => (
                      <div
                        key={file.id}
                        className={cn(
                          "flex items-center justify-between px-3 py-2.5 rounded-md cursor-pointer transition-all",
                          selectedFile === file.id
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : "hover:bg-secondary/80"
                        )}
                        onClick={() => handleFileSelect(file.id)}
                      >
                        <div className="flex items-center gap-3">
                          <Music size={16} className="shrink-0" />
                          <span className="text-sm font-medium">{file.name}</span>
                        </div>
                        {file.duration && (
                          <span className="text-xs opacity-80 font-mono">
                            {Math.floor(file.duration / 60)}:{(file.duration % 60).toFixed(0).padStart(2, '0')}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t bg-muted/30">
          <Button 
            variant="outline"
            onClick={onClose}
          >
            取消
          </Button>
          <Button 
            onClick={handleConfirm}
            disabled={!selectedFolder}
          >
            确定
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};