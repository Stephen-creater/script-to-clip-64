import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { 
  Upload, 
  Search, 
  Filter,
  Grid,
  List,
  FileVideo,
  FileImage,
  FileAudio,
  Trash2,
  Move,
  Eye,
  Download,
  Plus,
  Folder
} from "lucide-react";
import { cn } from "@/lib/utils";
import FolderSidebar, { FolderItem } from "@/components/FolderManagement/FolderSidebar";
import { useMaterials } from "@/hooks/useMaterials";
import { useToast } from "@/hooks/use-toast";

const Materials = () => {
  const { toast } = useToast();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [selectedFolder, setSelectedFolder] = useState('all');
  const [expandedFolders, setExpandedFolders] = useState<string[]>(['all', 'images', 'audio']);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { 
    materials, 
    loading, 
    uploading, 
    uploadProgress,
    uploadMaterial, 
    deleteMaterial, 
    getMaterialsByCategory, 
    getMaterialUrl,
    isSupabaseConfigured 
  } = useMaterials();
  
  // Dynamic folder structure with correct counts
  const getDynamicFolders = (): FolderItem[] => [
    { 
      id: 'all', 
      name: '视频素材', 
      count: materials.filter(m => m.file_type === 'video').length,
      hasChildren: true,
      children: [
        { id: 'window-scenery', name: '车窗外风景', count: getMaterialsByCategory('视频素材', '车窗外风景').length, parentId: 'all' },
        { id: 'station-interior', name: '车站内', count: getMaterialsByCategory('视频素材', '车站内').length, parentId: 'all' },
      ]
    },
    { 
      id: 'images', 
      name: '图片素材', 
      count: materials.filter(m => m.file_type === 'image').length,
      hasChildren: true,
      children: [
        { id: 'emotion', name: '表情类', count: getMaterialsByCategory('图片素材', '表情类').length, parentId: 'images' },
        { id: 'decorative', name: '装饰类', count: getMaterialsByCategory('图片素材', '装饰类').length, parentId: 'images' },
        { id: 'marketing', name: '营销类', count: getMaterialsByCategory('图片素材', '营销类').length, parentId: 'images' },
      ]
    },
    { 
      id: 'audio', 
      name: '音频素材', 
      count: materials.filter(m => m.file_type === 'audio').length,
      hasChildren: true,
      children: [
        { id: 'bgm', name: 'BGM', count: getMaterialsByCategory('音频素材', 'BGM').length, parentId: 'audio' },
        { id: 'sound-effects', name: '音效素材', count: getMaterialsByCategory('音频素材', '音效素材').length, parentId: 'audio' },
      ]
    },
  ];

  const folders = getDynamicFolders();

  // Get category and subcategory from selected folder
  const getFolderInfo = (folderId: string) => {
    if (folderId === 'all' || folderId === 'window-scenery' || folderId === 'station-interior') {
      return { category: '视频素材', subcategory: folderId === 'window-scenery' ? '车窗外风景' : folderId === 'station-interior' ? '车站内' : undefined };
    } else if (folderId === 'images' || folderId === 'emotion' || folderId === 'decorative' || folderId === 'marketing') {
      return { 
        category: '图片素材', 
        subcategory: folderId === 'emotion' ? '表情类' : 
                    folderId === 'decorative' ? '装饰类' :
                    folderId === 'marketing' ? '营销类' : undefined
      };
    } else if (folderId === 'audio' || folderId === 'bgm' || folderId === 'sound-effects') {
      return { 
        category: '音频素材', 
        subcategory: folderId === 'bgm' ? 'BGM' : folderId === 'sound-effects' ? '音效素材' : undefined
      };
    }
    return { category: '视频素材', subcategory: undefined };
  };

  // Check if folder has children (should show subfolders instead of files)
  const hasSubfolders = (folderId: string) => {
    const findFolder = (folders: FolderItem[], id: string): FolderItem | null => {
      for (const folder of folders) {
        if (folder.id === id) return folder;
        if (folder.children) {
          const found = findFolder(folder.children, id);
          if (found) return found;
        }
      }
      return null;
    };
    
    const folder = findFolder(folders, folderId);
    return folder?.hasChildren || (folder?.children && folder.children.length > 0);
  };

  // Get subfolders for parent folders
  const getSubfolders = (folderId: string) => {
    const findFolder = (folders: FolderItem[], id: string): FolderItem | null => {
      for (const folder of folders) {
        if (folder.id === id) return folder;
        if (folder.children) {
          const found = findFolder(folder.children, id);
          if (found) return found;
        }
      }
      return null;
    };
    
    const folder = findFolder(folders, folderId);
    return folder?.children || [];
  };

  // File upload handlers
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length > 0) {
      const { category, subcategory } = getFolderInfo(selectedFolder);
      files.forEach(file => {
        uploadMaterial(file, category, subcategory);
      });
    }
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  // Get filtered materials - only for leaf folders
  const getFilteredMaterials = () => {
    // If folder has subfolders, don't show materials
    if (hasSubfolders(selectedFolder)) {
      return [];
    }

    let filtered = materials;
    
    if (selectedFolder !== 'all') {
      if (selectedFolder === 'window-scenery') {
        filtered = getMaterialsByCategory('视频素材', '车窗外风景');
      } else if (selectedFolder === 'station-interior') {
        filtered = getMaterialsByCategory('视频素材', '车站内');
      } else if (selectedFolder === 'emotion') {
        filtered = getMaterialsByCategory('图片素材', '表情类');
      } else if (selectedFolder === 'decorative') {
        filtered = getMaterialsByCategory('图片素材', '装饰类');
      } else if (selectedFolder === 'marketing') {
        filtered = getMaterialsByCategory('图片素材', '营销类');
      } else if (selectedFolder === 'bgm') {
        filtered = getMaterialsByCategory('音频素材', 'BGM');
      } else if (selectedFolder === 'sound-effects') {
        filtered = getMaterialsByCategory('音频素材', '音效素材');
      } else if (selectedFolder === 'all') {
        filtered = materials.filter(m => m.file_type === 'video');
      } else if (selectedFolder === 'audio') {
        filtered = materials.filter(m => m.file_type === 'audio');
      }
    }

    if (searchTerm) {
      filtered = filtered.filter(material =>
        material.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  };

  const filteredMaterials = getFilteredMaterials();
  const subfolders = hasSubfolders(selectedFolder) ? getSubfolders(selectedFolder) : [];
  const shouldShowSubfolders = hasSubfolders(selectedFolder) && subfolders.length > 0;

  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case 'video': return <FileVideo size={16} className="text-blue-500" />;
      case 'image': return <FileImage size={16} className="text-green-500" />;
      case 'audio': return <FileAudio size={16} className="text-purple-500" />;
      default: return <FileVideo size={16} />;
    }
  };

  const handleSelectItem = (itemId: string, checked: boolean) => {
    if (checked) {
      setSelectedItems([...selectedItems, itemId]);
    } else {
      setSelectedItems(selectedItems.filter(id => id !== itemId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems(filteredMaterials.map(m => m.id));
    } else {
      setSelectedItems([]);
    }
  };

  const handleBatchDelete = async () => {
    if (selectedItems.length === 0) return;
    setDeleteDialogOpen(true);
  };

  const confirmBatchDelete = async () => {
    for (const itemId of selectedItems) {
      await deleteMaterial(itemId);
    }
    toast({
      title: "删除成功",
      description: `已删除 ${selectedItems.length} 个文件`,
    });
    setSelectedItems([]);
    setDeleteDialogOpen(false);
  };

  const handleFolderToggle = (folderId: string) => {
    if (expandedFolders.includes(folderId)) {
      setExpandedFolders(expandedFolders.filter(id => id !== folderId));
    } else {
      setExpandedFolders([...expandedFolders, folderId]);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-body-small text-muted-foreground">加载素材库...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full">
      <FolderSidebar
        folders={folders}
        selectedFolder={selectedFolder}
        expandedFolders={expandedFolders}
        onFolderSelect={setSelectedFolder}
        onFolderToggle={handleFolderToggle}
        onFolderCreate={() => {}}
        onFolderRename={() => {}}
        onFolderDelete={() => {}}
        title="素材文件夹"
      />

      {/* Main Content */}
      <div className="flex-1 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <h1 className="text-display">素材库</h1>
            <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20">
              演示模式
            </Badge>
            <Button 
              className="bg-gradient-primary"
              onClick={handleUploadClick}
              disabled={uploading}
            >
              <Upload size={16} className="mr-2" />
              {uploading ? '上传中...' : '上传素材'}
            </Button>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <Input 
                placeholder="搜索素材..." 
                className="pl-10 w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex bg-secondary rounded-lg p-1">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid size={16} />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List size={16} />
              </Button>
            </div>
          </div>
        </div>

        {/* Upload Progress */}
        {uploading && (
          <Card className="mb-4">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Upload size={16} className="text-primary animate-pulse" />
                <div className="flex-1">
                  <p className="text-body-small font-medium">正在上传到 {getFolderInfo(selectedFolder).category}...</p>
                  <Progress value={uploadProgress} className="h-2 mt-2" />
                  <p className="text-caption text-muted-foreground mt-1">{uploadProgress}% 完成</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Selection Bar */}
        {selectedItems.length > 0 && (
          <div className="flex items-center justify-between p-4 bg-primary/10 rounded-lg mb-4 border border-primary/20">
            <span className="text-body-small font-medium">已选择 {selectedItems.length} 个文件</span>
            <div className="flex items-center gap-2">
              <Button 
                variant="destructive" 
                size="sm"
                onClick={handleBatchDelete}
              >
                <Trash2 size={16} className="mr-2" />
                删除
              </Button>
            </div>
          </div>
        )}

        {/* Show subfolders or materials based on folder type */}
        {shouldShowSubfolders ? (
          // Show subfolders as cards
          <div>
            <div className="mb-4">
              <span className="text-sm text-muted-foreground">子文件夹</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {subfolders.map((subfolder) => (
                <div
                  key={subfolder.id}
                  className="bg-card border border-border rounded-lg p-4 hover:shadow-card transition-all cursor-pointer"
                  onClick={() => setSelectedFolder(subfolder.id)}
                >
                  <div className="flex flex-col items-center text-center">
                    <Folder size={32} className="text-primary mb-2" />
                    <h3 className="text-sm font-medium truncate w-full">{subfolder.name}</h3>
                    <p className="text-xs text-muted-foreground">{subfolder.count} 个文件</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : viewMode === 'grid' ? (
          // Show materials in grid view
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Checkbox
                checked={selectedItems.length === filteredMaterials.length && filteredMaterials.length > 0}
                onCheckedChange={handleSelectAll}
              />
              <span className="text-sm text-muted-foreground">全选</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {filteredMaterials.map((material) => (
                <div
                  key={material.id}
                  className={cn(
                    "bg-card border border-border rounded-lg p-3 hover:shadow-card transition-all cursor-pointer",
                    selectedItems.includes(material.id) && "ring-2 ring-primary"
                  )}
                >
                  <div className="relative mb-2">
                    <Checkbox
                      className="absolute top-2 left-2 z-10"
                      checked={selectedItems.includes(material.id)}
                      onCheckedChange={(checked) => handleSelectItem(material.id, !!checked)}
                    />
                    <div className="aspect-video bg-muted rounded flex items-center justify-center overflow-hidden">
                      {material.file_type === 'image' ? (
                        <img 
                          src={getMaterialUrl(material)}
                          alt={material.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.nextElementSibling?.classList.remove('hidden');
                          }}
                        />
                      ) : null}
                      <div className={material.file_type === 'image' ? 'hidden' : ''}>
                        {getFileIcon(material.file_type)}
                      </div>
                    </div>
                    {material.duration && (
                      <span className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-1 rounded">
                        {material.duration}s
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm font-medium truncate">{material.name}</h3>
                  <p className="text-xs text-muted-foreground">{formatFileSize(material.file_size)}</p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          // List View
          <div className="space-y-2">
            <div className="flex items-center gap-2 p-2 border-b">
              <Checkbox
                checked={selectedItems.length === filteredMaterials.length && filteredMaterials.length > 0}
                onCheckedChange={handleSelectAll}
              />
              <span className="text-sm font-medium">名称</span>
            </div>
            {filteredMaterials.map((material) => (
              <div
                key={material.id}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 cursor-pointer",
                  selectedItems.includes(material.id) && "bg-primary/10"
                )}
              >
                <Checkbox
                  checked={selectedItems.includes(material.id)}
                  onCheckedChange={(checked) => handleSelectItem(material.id, !!checked)}
                />
                {getFileIcon(material.file_type)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{material.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(material.file_size)} • {new Date(material.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="sm">
                    <Eye size={14} />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Download size={14} />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => deleteMaterial(material.id)}
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!shouldShowSubfolders && filteredMaterials.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="text-muted-foreground mb-4">
              <Upload size={48} className="mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">暂无素材文件</p>
              <p className="text-sm">上传您的第一个素材文件吧</p>
            </div>
            <Button onClick={handleUploadClick} className="mt-4">
              <Plus size={16} className="mr-2" />
              上传素材
            </Button>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              确定要删除选中的 {selectedItems.length} 个文件吗？此操作无法撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={confirmBatchDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        accept="image/*,video/*,audio/*"
        onChange={handleFileSelect}
      />
    </div>
  );
};

export default Materials;