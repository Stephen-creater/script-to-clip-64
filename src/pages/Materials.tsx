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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Upload,
  Search,
  Grid,
  List,
  Trash2,
  Download,
  Settings2,
  Scissors,
  FolderInput,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import FilterPanel, { FilterState } from "@/components/Materials/FilterPanel";
import MediaCard from "@/components/Materials/MediaCard";
import PreprocessingWorkbench from "@/components/Materials/PreprocessingWorkbench";
import MaterialPreviewModal from "@/components/Materials/MaterialPreviewModal";
import BatchMoveModal from "@/components/Materials/BatchMoveModal";
import { useMaterials, Material } from "@/hooks/useMaterials";
import { useToast } from "@/hooks/use-toast";

// Mock review statuses and rejection reasons
const mockReviewData: Record<string, { status: 'machine_review' | 'pending_human' | 'rejected' | 'approved'; reason?: string }> = {
  'video-1': { status: 'machine_review' },
  'video-2': { status: 'pending_human' },
  'video-3': { status: 'rejected', reason: '背景音乐侵权' },
  'video-4': { status: 'approved' },
  'video-5': { status: 'rejected', reason: '画面模糊不清晰' },
  'video-6': { status: 'pending_human' },
  'video-7': { status: 'approved' },
};

const Materials = () => {
  const { toast } = useToast();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [workbenchOpen, setWorkbenchOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [batchMoveOpen, setBatchMoveOpen] = useState(false);
  const [previewMaterial, setPreviewMaterial] = useState<Material | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filter state
  const [filters, setFilters] = useState<FilterState>({
    aspectRatio: { vertical: false, horizontal: false },
    durationRange: [0, 120],
    reviewStatus: { machineReview: false, pendingHuman: false, rejected: false, approved: false },
    uploadDateRange: { from: undefined, to: undefined },
    uploader: "",
    uploadGroup: "",
    folder: null,
  });

  const {
    materials,
    loading,
    uploading,
    uploadProgress,
    uploadMaterial,
    deleteMaterial,
    getMaterialUrl,
  } = useMaterials();

  // Folder structure for filter panel
  const folderStructure = [
    {
      id: 'video',
      name: '视频素材',
      count: materials.filter(m => m.file_type === 'video').length,
      children: [
        { id: 'window-scenery', name: '车窗外风景', count: 5 },
        { id: 'station-interior', name: '车站内', count: 3 },
      ],
    },
    {
      id: 'images',
      name: '图片素材',
      count: materials.filter(m => m.file_type === 'image').length,
      children: [
        { id: 'emotion', name: '表情类', count: 8 },
        { id: 'decorative', name: '装饰类', count: 4 },
      ],
    },
    {
      id: 'audio',
      name: '音频素材',
      count: materials.filter(m => m.file_type === 'audio').length,
      children: [
        { id: 'bgm', name: 'BGM', count: 6 },
        { id: 'sound-effects', name: '音效', count: 10 },
      ],
    },
  ];

  // Get review status for a material
  const getReviewData = (materialId: string) => {
    return mockReviewData[materialId] || { status: 'approved' as const };
  };

  // Filter materials
  const getFilteredMaterials = () => {
    let filtered = materials;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(material =>
        material.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        material.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Aspect ratio filter
    if (filters.aspectRatio.vertical || filters.aspectRatio.horizontal) {
      filtered = filtered.filter(material => {
        // Mock aspect ratio check - in real app, would check actual dimensions
        if (filters.aspectRatio.vertical && material.file_type === 'video') return true;
        if (filters.aspectRatio.horizontal && material.file_type === 'image') return true;
        return false;
      });
    }

    // Duration range filter
    const [minDuration, maxDuration] = filters.durationRange;
    if (minDuration > 0 || maxDuration < 120) {
      filtered = filtered.filter(material => {
        if (!material.duration) return true;
        return material.duration >= minDuration && material.duration <= maxDuration;
      });
    }

    // Review status filter
    const statusFilters = filters.reviewStatus;
    const hasStatusFilter = statusFilters.machineReview || statusFilters.pendingHuman ||
      statusFilters.rejected || statusFilters.approved;

    if (hasStatusFilter) {
      filtered = filtered.filter(material => {
        const status = getReviewData(material.id).status;
        if (statusFilters.machineReview && status === 'machine_review') return true;
        if (statusFilters.pendingHuman && status === 'pending_human') return true;
        if (statusFilters.rejected && status === 'rejected') return true;
        if (statusFilters.approved && status === 'approved') return true;
        return false;
      });
    }

    // Folder filter
    if (filters.folder) {
      filtered = filtered.filter(material => {
        // Mock folder matching
        if (filters.folder === 'video') return material.file_type === 'video';
        if (filters.folder === 'images') return material.file_type === 'image';
        if (filters.folder === 'audio') return material.file_type === 'audio';
        return true;
      });
    }

    return filtered;
  };

  const filteredMaterials = getFilteredMaterials();

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

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  // Generate auto-naming based on folder + uploader + sequence
  const generateAutoName = (originalName: string, folderName: string, uploaderName: string, index: number) => {
    const extension = originalName.substring(originalName.lastIndexOf('.'));
    const sequenceNum = String(index + 1).padStart(2, '0');
    return `${folderName}_${uploaderName}_${sequenceNum}${extension}`;
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length > 0) {
      // Get current folder name and uploader name
      const currentFolderName = filters.folder 
        ? folderStructure.flatMap(f => [f, ...(f.children || [])]).find(f => f.id === filters.folder)?.name || '未分类'
        : '未分类';
      const uploaderName = '熊浩成'; // In real app, get from auth context
      
      files.forEach((file, index) => {
        const autoName = generateAutoName(file.name, currentFolderName, uploaderName, index);
        // Create a new file with the auto-generated name
        const renamedFile = new File([file], autoName, { type: file.type });
        uploadMaterial(renamedFile, '视频素材');
      });
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClipsSubmit = (clips: any[]) => {
    toast({
      title: "素材入库成功",
      description: `${clips.length} 个片段已添加到素材库`,
    });
  };

  const handleMaterialClick = (material: Material) => {
    setPreviewMaterial(material);
    setPreviewOpen(true);
  };

  const handleBatchMove = (folderId: string) => {
    toast({
      title: "移动成功",
      description: `已将 ${selectedItems.length} 个文件移动到目标文件夹`,
    });
    setSelectedItems([]);
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
      {/* Left Filter Panel */}
      <FilterPanel
        filters={filters}
        onFiltersChange={setFilters}
        folders={folderStructure}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Action Bar */}
        <div className="p-4 border-b border-border bg-card">
          <div className="flex items-center justify-between gap-4">
            {/* Primary Actions */}
            <div className="flex items-center gap-3">
              <Button
                size="lg"
                className="bg-gradient-primary gap-2"
                onClick={() => setWorkbenchOpen(true)}
              >
                <Scissors size={18} />
                上传并粗剪
              </Button>

              <Button
                variant="outline"
                onClick={handleUploadClick}
                disabled={uploading}
              >
                <Upload size={16} className="mr-2" />
                {uploading ? '上传中...' : '直接上传'}
              </Button>

              <div className="h-8 w-px bg-border" />

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    disabled={selectedItems.length === 0}
                  >
                    <Settings2 size={16} className="mr-2" />
                    批量管理
                    <ChevronDown size={14} className="ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={handleBatchDelete}>
                    <Trash2 size={14} className="mr-2" />
                    批量删除
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setBatchMoveOpen(true)}>
                    <FolderInput size={14} className="mr-2" />
                    移动到文件夹
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button
                variant="outline"
                disabled={selectedItems.length === 0}
              >
                <Download size={16} className="mr-2" />
                下载
              </Button>
            </div>

            {/* Search and View Toggle */}
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
        </div>

        {/* Upload Progress */}
        {uploading && (
          <div className="px-4 pt-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Upload size={16} className="text-primary animate-pulse" />
                  <div className="flex-1">
                    <p className="text-body-small font-medium">正在上传...</p>
                    <Progress value={uploadProgress} className="h-2 mt-2" />
                    <p className="text-caption text-muted-foreground mt-1">{uploadProgress}% 完成</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Selection Bar */}
        {selectedItems.length > 0 && (
          <div className="px-4 pt-4">
            <div className="flex items-center justify-between p-4 bg-primary/10 rounded-lg border border-primary/20">
              <span className="text-body-small font-medium">已选择 {selectedItems.length} 个文件</span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setBatchMoveOpen(true)}
                >
                  <FolderInput size={16} className="mr-2" />
                  移动
                </Button>
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
          </div>
        )}

        {/* Materials Grid/List */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* Select All */}
          <div className="flex items-center gap-2 mb-4">
            <Checkbox
              checked={selectedItems.length === filteredMaterials.length && filteredMaterials.length > 0}
              onCheckedChange={handleSelectAll}
            />
            <span className="text-sm text-muted-foreground">
              全选 ({filteredMaterials.length} 个素材)
            </span>
          </div>

          {viewMode === 'grid' ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filteredMaterials.map((material) => {
                const reviewData = getReviewData(material.id);
                return (
                  <MediaCard
                    key={material.id}
                    material={material}
                    isSelected={selectedItems.includes(material.id)}
                    onSelect={handleSelectItem}
                    onClick={() => handleMaterialClick(material)}
                    reviewStatus={reviewData.status}
                    rejectionReason={reviewData.reason}
                    getMaterialUrl={getMaterialUrl}
                  />
                );
              })}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredMaterials.map((material) => {
                const reviewData = getReviewData(material.id);
                return (
                  <div
                    key={material.id}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 cursor-pointer border border-border",
                      selectedItems.includes(material.id) && "bg-primary/10 border-primary/30"
                    )}
                    onClick={() => handleMaterialClick(material)}
                  >
                    <Checkbox
                      checked={selectedItems.includes(material.id)}
                      onCheckedChange={(checked) => handleSelectItem(material.id, !!checked)}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div className="w-20 h-12 bg-muted rounded overflow-hidden flex items-center justify-center">
                      {material.file_type === 'image' ? (
                        <img
                          src={getMaterialUrl(material)}
                          alt={material.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-xs text-muted-foreground">{material.file_type}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{material.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        {material.tags?.slice(0, 2).map(tag => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            #{tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <Badge
                      className={cn(
                        "text-xs",
                        reviewData.status === 'approved' && "bg-success/90 text-success-foreground",
                        reviewData.status === 'rejected' && "bg-destructive/90 text-destructive-foreground",
                        reviewData.status === 'pending_human' && "bg-info/90 text-info-foreground",
                        reviewData.status === 'machine_review' && "bg-warning/90 text-warning-foreground"
                      )}
                    >
                      {reviewData.status === 'approved' && '已入库'}
                      {reviewData.status === 'rejected' && '已驳回'}
                      {reviewData.status === 'pending_human' && '待人审'}
                      {reviewData.status === 'machine_review' && '机审中'}
                    </Badge>
                  </div>
                );
              })}
            </div>
          )}

          {/* Empty State */}
          {filteredMaterials.length === 0 && !loading && (
            <div className="text-center py-12">
              <div className="text-muted-foreground mb-4">
                <Upload size={48} className="mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">暂无素材文件</p>
                <p className="text-sm">点击"上传并粗剪"开始添加素材</p>
              </div>
              <Button onClick={() => setWorkbenchOpen(true)} className="mt-4 bg-gradient-primary">
                <Scissors size={16} className="mr-2" />
                上传并粗剪
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        multiple
        accept="video/*,image/*,audio/*"
        onChange={handleFileSelect}
      />

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

      {/* Preprocessing Workbench Modal */}
      <PreprocessingWorkbench
        open={workbenchOpen}
        onOpenChange={setWorkbenchOpen}
        onClipsSubmit={handleClipsSubmit}
      />

      {/* Material Preview Modal */}
      <MaterialPreviewModal
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        material={previewMaterial}
        reviewStatus={previewMaterial ? getReviewData(previewMaterial.id).status : 'approved'}
        rejectionReason={previewMaterial ? getReviewData(previewMaterial.id).reason : undefined}
        getMaterialUrl={getMaterialUrl}
      />

      {/* Batch Move Modal */}
      <BatchMoveModal
        open={batchMoveOpen}
        onOpenChange={setBatchMoveOpen}
        selectedCount={selectedItems.length}
        folders={folderStructure}
        onConfirm={handleBatchMove}
      />
    </div>
  );
};

export default Materials;
