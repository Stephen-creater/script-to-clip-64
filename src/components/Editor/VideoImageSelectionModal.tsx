import { useState, useMemo, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, ChevronDown, Folder, FileVideo, FileImage } from "lucide-react";
import { useFolders } from "@/hooks/useFolders";
import { useMaterials } from "@/hooks/useMaterials";

interface VideoImageSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (folderId: string, folderName: string, fileId?: string, fileName?: string) => void;
}

interface FolderItem {
  id: string;
  name: string;
  count: number;
  parentId: string | null;
  children: FolderItem[];
  type?: 'video' | 'image' | 'audio';
}

// 根据文件夹名称推断类型
const getFolderType = (name: string): 'video' | 'image' | 'audio' | undefined => {
  if (name.includes('视频')) return 'video';
  if (name.includes('图片')) return 'image';
  if (name.includes('音频') || name.includes('音效')) return 'audio';
  return undefined;
};

// 构建文件夹层级结构
const buildFolderHierarchy = (folders: any[]): FolderItem[] => {
  const folderMap = new Map<string, FolderItem>();
  
  // 第一遍：创建所有文件夹节点
  folders.forEach(folder => {
    folderMap.set(folder.id, {
      id: folder.id,
      name: folder.name,
      count: 0,
      parentId: folder.parent_id || null,
      children: [],
      type: getFolderType(folder.name)
    });
  });

  // 第二遍：建立父子关系，并继承父文件夹类型
  const roots: FolderItem[] = [];
  folderMap.forEach(folder => {
    if (folder.parentId) {
      const parent = folderMap.get(folder.parentId);
      if (parent) {
        parent.children.push(folder);
        // 如果子文件夹没有类型，继承父文件夹类型
        if (!folder.type && parent.type) {
          folder.type = parent.type;
        }
      }
    } else {
      roots.push(folder);
    }
  });

  return roots;
};

// 筛选指定类型的文件夹（视频或图片）
const filterFoldersByTypes = (folders: FolderItem[], types: ('video' | 'image')[]): FolderItem[] => {
  return folders.reduce((acc: FolderItem[], folder) => {
    const filteredChildren = filterFoldersByTypes(folder.children, types);
    
    if (types.includes(folder.type as 'video' | 'image') || filteredChildren.length > 0) {
      acc.push({
        ...folder,
        children: filteredChildren
      });
    }
    
    return acc;
  }, []);
};

// 获取最近添加的文件夹（递归扁平化）
const getRecentlyAddedFolders = (folders: FolderItem[]): FolderItem[] => {
  const flatFolders: FolderItem[] = [];
  
  const flatten = (items: FolderItem[]) => {
    items.forEach(item => {
      flatFolders.push(item);
      if (item.children.length > 0) {
        flatten(item.children);
      }
    });
  };
  
  flatten(folders);
  return flatFolders.slice(-5);
};

export const VideoImageSelectionModal = ({ isOpen, onClose, onSelect }: VideoImageSelectionModalProps) => {
  const { folders } = useFolders();
  const { materials, getMaterialUrl } = useMaterials();
  const [selectedFolder, setSelectedFolder] = useState<{ id: string; name: string } | null>(null);
  const [selectedFile, setSelectedFile] = useState<{ id: string; name: string } | null>(null);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());

  // 构建视频和图片文件夹层级结构（排除成片库）
  const videoImageFolders = useMemo(() => {
    // 排除"视频文件夹"（成片库）及其所有子文件夹
    const excludedFolderIds = new Set<string>();
    const videoLibraryFolder = folders.find(f => f.name === '视频文件夹' && !f.parent_id);
    
    if (videoLibraryFolder) {
      excludedFolderIds.add(videoLibraryFolder.id);
      // 收集所有子文件夹ID
      const collectChildrenIds = (parentId: string) => {
        folders.forEach(f => {
          if (f.parent_id === parentId) {
            excludedFolderIds.add(f.id);
            collectChildrenIds(f.id);
          }
        });
      };
      collectChildrenIds(videoLibraryFolder.id);
    }
    
    // 过滤掉成片库文件夹
    const materialFolders = folders.filter(f => !excludedFolderIds.has(f.id));
    const hierarchy = buildFolderHierarchy(materialFolders);
    return filterFoldersByTypes(hierarchy, ['video', 'image']);
  }, [folders]);

  const recentFolders = useMemo(() => {
    return getRecentlyAddedFolders(videoImageFolders);
  }, [videoImageFolders]);

  // 获取当前选中文件夹下的素材文件
  const folderFiles = useMemo(() => {
    if (!selectedFolder) return [];
    
    const folder = folders.find(f => f.id === selectedFolder.id);
    if (!folder) return [];

    // 查找父文件夹以确定类型
    const findRootCategory = (folderId: string): string | null => {
      const f = folders.find(folder => folder.id === folderId);
      if (!f) return null;
      if (!f.parent_id) return f.name;
      return findRootCategory(f.parent_id);
    };

    const rootCategory = findRootCategory(selectedFolder.id);
    
    return materials.filter(m => {
      const matchesCategory = m.category === rootCategory;
      const matchesSubcategory = m.subcategory === selectedFolder.name;
      return matchesCategory && matchesSubcategory;
    });
  }, [selectedFolder, folders, materials]);

  // 重置状态
  useEffect(() => {
    if (isOpen) {
      setSelectedFolder(null);
      setSelectedFile(null);
      
      // 自动展开所有视频和图片文件夹
      const allFolderIds = new Set<string>();
      const collectIds = (items: FolderItem[]) => {
        items.forEach(item => {
          allFolderIds.add(item.id);
          if (item.children.length > 0) {
            collectIds(item.children);
          }
        });
      };
      collectIds(videoImageFolders);
      setExpandedFolders(allFolderIds);
    }
  }, [isOpen, videoImageFolders]);

  const toggleFolder = (folderId: string) => {
    setExpandedFolders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(folderId)) {
        newSet.delete(folderId);
      } else {
        newSet.add(folderId);
      }
      return newSet;
    });
  };

  const handleFolderSelect = (folder: { id: string; name: string }) => {
    setSelectedFolder(folder);
    setSelectedFile(null);
  };

  const handleFileSelect = (file: { id: string; name: string }) => {
    setSelectedFile(file);
  };

  const handleConfirm = () => {
    if (selectedFolder) {
      onSelect(
        selectedFolder.id, 
        selectedFolder.name,
        selectedFile?.id,
        selectedFile?.name
      );
      onClose();
    }
  };

  const renderFolderTree = (items: FolderItem[], level: number = 0) => {
    return items.map(item => {
      const isExpanded = expandedFolders.has(item.id);
      const hasChildren = item.children.length > 0;
      const isSelected = selectedFolder?.id === item.id;

      return (
        <div key={item.id}>
          <div
            className={`flex items-center gap-2 px-3 py-2 rounded-md cursor-pointer transition-colors ${
              isSelected 
                ? 'bg-primary/10 text-primary font-medium' 
                : 'hover:bg-secondary/80'
            }`}
            style={{ paddingLeft: `${level * 16 + 12}px` }}
            onClick={() => {
              if (hasChildren) {
                toggleFolder(item.id);
              }
              handleFolderSelect({ id: item.id, name: item.name });
            }}
          >
            {hasChildren && (
              <span className="flex-shrink-0">
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </span>
            )}
            {!hasChildren && <span className="w-4" />}
            
            {item.type === 'video' ? (
              <FileVideo className="h-4 w-4 text-blue-500 flex-shrink-0" />
            ) : (
              <FileImage className="h-4 w-4 text-green-500 flex-shrink-0" />
            )}
            
            <span className="flex-1 truncate">{item.name}</span>
            
            {item.count > 0 && (
              <Badge variant="secondary" className="text-xs">
                {item.count}
              </Badge>
            )}
          </div>
          
          {hasChildren && isExpanded && (
            <div>
              {renderFolderTree(item.children, level + 1)}
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] p-0 gap-0">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle>选择视频/图片素材文件夹</DialogTitle>
        </DialogHeader>

        <div className="overflow-y-auto px-6 py-4" style={{ maxHeight: 'calc(80vh - 140px)' }}>
          <div className="space-y-4">
            {/* 最近添加 */}
            {recentFolders.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">最近添加</h3>
                <div className="flex flex-wrap gap-2">
                  {recentFolders.map(folder => (
                    <Button
                      key={folder.id}
                      variant="outline"
                      size="sm"
                      className={selectedFolder?.id === folder.id ? 'border-primary bg-primary/10' : ''}
                      onClick={() => handleFolderSelect({ id: folder.id, name: folder.name })}
                    >
                      <Folder className="h-3 w-3 mr-1" />
                      {folder.name}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* 所有文件夹 */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">所有文件夹</h3>
              <div className="border rounded-lg p-2">
                <ScrollArea className="h-[240px]">
                  {videoImageFolders.length > 0 ? (
                    renderFolderTree(videoImageFolders)
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                      <Folder className="h-12 w-12 mb-2" />
                      <p className="text-sm">暂无视频/图片文件夹</p>
                    </div>
                  )}
                </ScrollArea>
              </div>
            </div>

            {/* 文件列表 */}
            {selectedFolder && folderFiles.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">
                  {selectedFolder.name} 中的文件
                </h3>
                <div className="border rounded-lg p-2">
                  <ScrollArea className="h-[180px]">
                    <div className="space-y-1">
                      {folderFiles.map(file => {
                        const isSelected = selectedFile?.id === file.id;
                        const isVideo = file.file_type === 'video';
                        
                        return (
                          <div
                            key={file.id}
                            className={`flex items-center gap-2 px-3 py-2 rounded-md cursor-pointer transition-colors ${
                              isSelected 
                                ? 'bg-primary/10 text-primary font-medium shadow-sm' 
                                : 'hover:bg-secondary/80'
                            }`}
                            onClick={() => handleFileSelect({ id: file.id, name: file.name })}
                          >
                            {isVideo ? (
                              <FileVideo className="h-4 w-4 text-blue-500 flex-shrink-0" />
                            ) : (
                              <FileImage className="h-4 w-4 text-green-500 flex-shrink-0" />
                            )}
                            <span className="flex-1 truncate text-sm">{file.name}</span>
                            {file.duration && (
                              <Badge variant="outline" className="text-xs">
                                {file.duration}s
                              </Badge>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </ScrollArea>
                </div>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="px-6 py-4 border-t">
          <Button variant="outline" onClick={onClose}>
            取消
          </Button>
          <Button 
            onClick={handleConfirm}
            disabled={!selectedFolder}
          >
            确定
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
