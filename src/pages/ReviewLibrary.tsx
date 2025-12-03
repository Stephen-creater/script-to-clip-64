import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { 
  Upload, 
  Search, 
  Grid,
  List,
  FileVideo,
  FileImage,
  FileAudio,
  Trash2,
  Folder,
  CheckCircle,
  Clock,
  Eye
} from "lucide-react";
import { cn } from "@/lib/utils";
import FolderSidebar, { FolderItem } from "@/components/FolderManagement/FolderSidebar";
import { useMaterials, Material } from "@/hooks/useMaterials";
import { useToast } from "@/hooks/use-toast";

// Extended material with review status
interface ReviewMaterial extends Material {
  reviewStatus: 'pending' | 'reviewed';
}

const ReviewLibrary = () => {
  const { toast } = useToast();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [selectedFolder, setSelectedFolder] = useState('all');
  const [expandedFolders, setExpandedFolders] = useState<string[]>(['all', 'images', 'audio']);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [previewMaterial, setPreviewMaterial] = useState<ReviewMaterial | null>(null);
  const [reviewStatuses, setReviewStatuses] = useState<Record<string, 'pending' | 'reviewed'>>({});
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

  // Convert materials to ReviewMaterial with status
  const reviewMaterials: ReviewMaterial[] = materials.map(m => ({
    ...m,
    reviewStatus: reviewStatuses[m.id] || 'pending'
  }));
  
  // Dynamic folder structure with correct counts
  const getDynamicFolders = (): FolderItem[] => [
    { 
      id: 'all', 
      name: '视频素材', 
      count: reviewMaterials.filter(m => m.file_type === 'video').length,
      type: 'video',
      hasChildren: true,
      children: [
        { id: 'window-scenery', name: '车窗外风景', count: getMaterialsByCategory('视频素材', '车窗外风景').length, parentId: 'all', type: 'video' },
        { id: 'station-interior', name: '车站内', count: getMaterialsByCategory('视频素材', '车站内').length, parentId: 'all', type: 'video' },
      ]
    },
    { 
      id: 'images', 
      name: '图片素材', 
      count: reviewMaterials.filter(m => m.file_type === 'image').length,
      type: 'image',
      hasChildren: true,
      children: [
        { id: 'emotion', name: '表情类', count: getMaterialsByCategory('图片素材', '表情类').length, parentId: 'images', type: 'image' },
        { id: 'decorative', name: '装饰类', count: getMaterialsByCategory('图片素材', '装饰类').length, parentId: 'images', type: 'image' },
        { id: 'marketing', name: '营销类', count: getMaterialsByCategory('图片素材', '营销类').length, parentId: 'images', type: 'image' },
      ]
    },
    { 
      id: 'audio', 
      name: '音频素材', 
      count: reviewMaterials.filter(m => m.file_type === 'audio').length,
      type: 'audio',
      hasChildren: true,
      children: [
        { id: 'bgm', name: 'BGM', count: getMaterialsByCategory('音频素材', 'BGM').length, parentId: 'audio', type: 'audio' },
        { id: 'sound-effects', name: '音效素材', count: getMaterialsByCategory('音频素材', '音效素材').length, parentId: 'audio', type: 'audio' },
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

  // Check if folder has children
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
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  // Get filtered materials
  const getFilteredMaterials = () => {
    if (hasSubfolders(selectedFolder)) {
      return [];
    }

    let filtered = reviewMaterials;
    
    if (selectedFolder !== 'all') {
      if (selectedFolder === 'window-scenery') {
        filtered = reviewMaterials.filter(m => getMaterialsByCategory('视频素材', '车窗外风景').some(mat => mat.id === m.id));
      } else if (selectedFolder === 'station-interior') {
        filtered = reviewMaterials.filter(m => getMaterialsByCategory('视频素材', '车站内').some(mat => mat.id === m.id));
      } else if (selectedFolder === 'emotion') {
        filtered = reviewMaterials.filter(m => getMaterialsByCategory('图片素材', '表情类').some(mat => mat.id === m.id));
      } else if (selectedFolder === 'decorative') {
        filtered = reviewMaterials.filter(m => getMaterialsByCategory('图片素材', '装饰类').some(mat => mat.id === m.id));
      } else if (selectedFolder === 'marketing') {
        filtered = reviewMaterials.filter(m => getMaterialsByCategory('图片素材', '营销类').some(mat => mat.id === m.id));
      } else if (selectedFolder === 'bgm') {
        filtered = reviewMaterials.filter(m => getMaterialsByCategory('音频素材', 'BGM').some(mat => mat.id === m.id));
      } else if (selectedFolder === 'sound-effects') {
        filtered = reviewMaterials.filter(m => getMaterialsByCategory('音频素材', '音效素材').some(mat => mat.id === m.id));
      } else if (selectedFolder === 'all') {
        filtered = reviewMaterials.filter(m => m.file_type === 'video');
      } else if (selectedFolder === 'audio') {
        filtered = reviewMaterials.filter(m => m.file_type === 'audio');
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

  const pendingCount = filteredMaterials.filter(m => m.reviewStatus === 'pending').length;
  const reviewedCount = filteredMaterials.filter(m => m.reviewStatus === 'reviewed').length;

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

  // Preview and review handlers
  const handlePreview = (material: ReviewMaterial) => {
    setPreviewMaterial(material);
    setPreviewDialogOpen(true);
  };

  const handleMarkAsReviewed = () => {
    if (previewMaterial) {
      setReviewStatuses(prev => ({
        ...prev,
        [previewMaterial.id]: 'reviewed'
      }));
      toast({
        title: "审核通过",
        description: `素材 "${previewMaterial.name}" 已标记为已审核`,
      });
      setPreviewDialogOpen(false);
      setPreviewMaterial(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-body-small text-muted-foreground">加载审核库...</p>
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
        onFolderCreate={(name: string, type: 'video' | 'image' | 'audio') => {
          toast({
            title: "提示",
            description: `文件夹 "${name}" (${type === 'video' ? '视频' : type === 'image' ? '图片' : '音频'}) 创建功能即将上线`,
          });
        }}
        onFolderRename={() => {}}
        onFolderDelete={() => {}}
        title="审核文件夹"
      />

      {/* Main Content */}
      <div className="flex-1 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <h1 className="text-display">审核库</h1>
            <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20">
              演示模式
            </Badge>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-orange-500/10 text-orange-500 border-orange-500/20">
                <Clock size={12} className="mr-1" />
                待审核 {pendingCount}
              </Badge>
              <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                <CheckCircle size={12} className="mr-1" />
                已审核 {reviewedCount}
              </Badge>
            </div>
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

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="video/*,image/*,audio/*"
          className="hidden"
          onChange={handleFileSelect}
        />

        {/* Show subfolders or materials */}
        {shouldShowSubfolders ? (
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
                    "bg-card border border-border rounded-lg p-3 hover:shadow-card transition-all cursor-pointer relative",
                    selectedItems.includes(material.id) && "ring-2 ring-primary"
                  )}
                  onClick={() => handlePreview(material)}
                >
                  <div className="relative mb-2">
                    <Checkbox
                      className="absolute top-2 left-2 z-10"
                      checked={selectedItems.includes(material.id)}
                      onCheckedChange={(checked) => {
                        handleSelectItem(material.id, !!checked);
                      }}
                      onClick={(e) => e.stopPropagation()}
                    />
                    {/* Review status badge */}
                    <div className="absolute top-2 right-2 z-10">
                      {material.reviewStatus === 'reviewed' ? (
                        <Badge className="bg-green-500 text-white text-xs px-1.5 py-0.5">
                          <CheckCircle size={10} className="mr-0.5" />
                          已审核
                        </Badge>
                      ) : (
                        <Badge className="bg-orange-500 text-white text-xs px-1.5 py-0.5">
                          <Clock size={10} className="mr-0.5" />
                          待审核
                        </Badge>
                      )}
                    </div>
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
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-4">
              <Checkbox
                checked={selectedItems.length === filteredMaterials.length && filteredMaterials.length > 0}
                onCheckedChange={handleSelectAll}
              />
              <span className="text-sm text-muted-foreground">全选</span>
            </div>
            {filteredMaterials.map((material) => (
              <div
                key={material.id}
                className={cn(
                  "flex items-center gap-4 p-3 bg-card border border-border rounded-lg hover:shadow-card transition-all cursor-pointer",
                  selectedItems.includes(material.id) && "ring-2 ring-primary"
                )}
                onClick={() => handlePreview(material)}
              >
                <Checkbox
                  checked={selectedItems.includes(material.id)}
                  onCheckedChange={(checked) => handleSelectItem(material.id, !!checked)}
                  onClick={(e) => e.stopPropagation()}
                />
                <div className="w-16 h-10 bg-muted rounded flex items-center justify-center overflow-hidden">
                  {material.file_type === 'image' ? (
                    <img 
                      src={getMaterialUrl(material)}
                      alt={material.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    getFileIcon(material.file_type)
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium truncate">{material.name}</h3>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(material.file_size)} {material.duration && `• ${material.duration}s`}
                  </p>
                </div>
                {material.reviewStatus === 'reviewed' ? (
                  <Badge className="bg-green-500 text-white">
                    <CheckCircle size={12} className="mr-1" />
                    已审核
                  </Badge>
                ) : (
                  <Badge className="bg-orange-500 text-white">
                    <Clock size={12} className="mr-1" />
                    待审核
                  </Badge>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!shouldShowSubfolders && filteredMaterials.length === 0 && (
          <div className="text-center py-12">
            <div className="text-muted-foreground mb-4">
              <FileVideo size={48} className="mx-auto opacity-50" />
            </div>
            <h3 className="text-lg font-medium mb-2">暂无素材</h3>
            <p className="text-muted-foreground mb-4">点击上传按钮添加素材</p>
            <Button onClick={handleUploadClick}>
              <Upload size={16} className="mr-2" />
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
            <AlertDialogAction onClick={confirmBatchDelete} className="bg-destructive text-destructive-foreground">
              删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Preview and Review Dialog */}
      <Dialog open={previewDialogOpen} onOpenChange={setPreviewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye size={20} />
              素材预览
            </DialogTitle>
          </DialogHeader>
          {previewMaterial && (
            <div className="space-y-4">
              <div className="aspect-video bg-muted rounded-lg flex items-center justify-center overflow-hidden">
                {previewMaterial.file_type === 'image' ? (
                  <img 
                    src={getMaterialUrl(previewMaterial)}
                    alt={previewMaterial.name}
                    className="max-w-full max-h-full object-contain"
                  />
                ) : previewMaterial.file_type === 'video' ? (
                  <video 
                    src={getMaterialUrl(previewMaterial)}
                    controls
                    className="max-w-full max-h-full"
                  />
                ) : previewMaterial.file_type === 'audio' ? (
                  <div className="flex flex-col items-center gap-4 p-8">
                    <FileAudio size={64} className="text-purple-500" />
                    <audio 
                      src={getMaterialUrl(previewMaterial)}
                      controls
                      className="w-full"
                    />
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    {getFileIcon(previewMaterial.file_type)}
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">{previewMaterial.name}</h3>
                  {previewMaterial.reviewStatus === 'reviewed' ? (
                    <Badge className="bg-green-500 text-white">
                      <CheckCircle size={12} className="mr-1" />
                      已审核
                    </Badge>
                  ) : (
                    <Badge className="bg-orange-500 text-white">
                      <Clock size={12} className="mr-1" />
                      待审核
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  文件大小: {formatFileSize(previewMaterial.file_size)}
                  {previewMaterial.duration && ` • 时长: ${previewMaterial.duration}s`}
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setPreviewDialogOpen(false)}>
              关闭
            </Button>
            {previewMaterial?.reviewStatus === 'pending' && (
              <Button className="bg-green-500 hover:bg-green-600" onClick={handleMarkAsReviewed}>
                <CheckCircle size={16} className="mr-2" />
                标记为通过
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ReviewLibrary;
