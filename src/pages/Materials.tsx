import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
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
  Sparkles,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import FilterPanel, { FilterState } from "@/components/Materials/FilterPanel";
import MediaCard from "@/components/Materials/MediaCard";
import PreprocessingWorkbench from "@/components/Materials/PreprocessingWorkbench";
import MaterialPreviewModal from "@/components/Materials/MaterialPreviewModal";
import BatchMoveModal from "@/components/Materials/BatchMoveModal";
import { useMaterials, Material } from "@/hooks/useMaterials";
import { useToast } from "@/hooks/use-toast";

// AI Search mock results for train-related queries
const AI_SEARCH_MOCK_RESULTS: (Material & { matchScore: number; aiTags: string[] })[] = [
  {
    id: 'ai-1',
    name: '火车进站_高清素材.mp4',
    original_name: '火车进站_高清素材.mp4',
    file_path: '/videos/train-station-1.mp4',
    file_type: 'video',
    file_size: 45000000,
    mime_type: 'video/mp4',
    duration: 15,
    tags: ['火车', '车站', '交通'],
    category: '视频素材',
    user_id: 'user-1',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    matchScore: 98,
    aiTags: ['#火车', '#车站'],
  },
  {
    id: 'ai-2',
    name: '高铁穿越山洞.mp4',
    original_name: '高铁穿越山洞.mp4',
    file_path: '/videos/train-tunnel.mp4',
    file_type: 'video',
    file_size: 32000000,
    mime_type: 'video/mp4',
    duration: 12,
    tags: ['高铁', '山洞', '风景'],
    category: '视频素材',
    user_id: 'user-1',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    matchScore: 95,
    aiTags: ['#高铁', '#隧道'],
  },
  {
    id: 'ai-3',
    name: '夕阳下的车站.mp4',
    original_name: '夕阳下的车站.mp4',
    file_path: '/videos/sunset-station.mp4',
    file_type: 'video',
    file_size: 28000000,
    mime_type: 'video/mp4',
    duration: 20,
    tags: ['夕阳', '车站', '氛围'],
    category: '视频素材',
    user_id: 'user-1',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    matchScore: 92,
    aiTags: ['#夕阳', '#车站'],
  },
  {
    id: 'ai-4',
    name: '列车车窗风景.mp4',
    original_name: '列车车窗风景.mp4',
    file_path: '/videos/train-window.mp4',
    file_type: 'video',
    file_size: 38000000,
    mime_type: 'video/mp4',
    duration: 25,
    tags: ['车窗', '风景', '旅途'],
    category: '视频素材',
    user_id: 'user-1',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    matchScore: 88,
    aiTags: ['#车窗', '#风景'],
  },
];

// Recommended category tags for empty state
const RECOMMENDED_TAGS = [
  { label: '交通工具', icon: '🚂' },
  { label: '风景', icon: '🌄' },
  { label: '人物', icon: '👤' },
  { label: '建筑', icon: '🏛️' },
  { label: '美食', icon: '🍜' },
  { label: '动物', icon: '🐾' },
  { label: '科技', icon: '💻' },
  { label: '运动', icon: '⚽' },
];

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
  const navigate = useNavigate();
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
  
  // AI Search states
  const [aiSearchTerm, setAiSearchTerm] = useState("");
  const [aiSearchLoading, setAiSearchLoading] = useState(false);
  const [aiSearchResults, setAiSearchResults] = useState<(Material & { matchScore: number; aiTags: string[] })[] | null>(null);
  const [aiSearchActive, setAiSearchActive] = useState(false);

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

  // AI Search handler
  const handleAiSearch = (query: string) => {
    if (!query.trim()) return;
    
    setAiSearchLoading(true);
    setAiSearchActive(true);
    
    // Simulate AI processing delay
    setTimeout(() => {
      // Check if query contains train-related keywords
      const trainKeywords = ['火车', 'train', '列车', '高铁', '车站', 'station', '铁路'];
      const isTrainQuery = trainKeywords.some(keyword => 
        query.toLowerCase().includes(keyword.toLowerCase())
      );
      
      if (isTrainQuery) {
        setAiSearchResults(AI_SEARCH_MOCK_RESULTS);
      } else {
        // Return empty for non-train queries in mock
        setAiSearchResults([]);
      }
      setAiSearchLoading(false);
    }, 1500);
  };

  const handleAiSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleAiSearch(aiSearchTerm);
    }
  };

  const clearAiSearch = () => {
    setAiSearchTerm("");
    setAiSearchResults(null);
    setAiSearchActive(false);
  };

  const handleTagClick = (tag: string) => {
    setAiSearchTerm(tag);
    handleAiSearch(tag);
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
        {/* AI Search Section */}
        <div className="p-4 border-b border-border bg-gradient-to-r from-purple-50 to-blue-50">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles size={18} className="text-purple-600" />
            <span className="font-semibold text-purple-900">AI 智能搜索</span>
            <Badge variant="secondary" className="bg-purple-100 text-purple-700 text-xs">
              Beta
            </Badge>
          </div>
          
          <div className="relative">
            <Sparkles size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-500" />
            <Input
              placeholder="搜索画面内容（例如：'火车进站'、'夕阳下的车站'）..."
              className="pl-10 pr-10 bg-white border-purple-200 focus:border-purple-400 focus:ring-purple-400 rounded-xl"
              value={aiSearchTerm}
              onChange={(e) => setAiSearchTerm(e.target.value)}
              onKeyDown={handleAiSearchKeyDown}
            />
            {aiSearchTerm && (
              <button
                onClick={clearAiSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Recommended Tags - Empty State */}
          {!aiSearchActive && (
            <div className="mt-3">
              <p className="text-xs text-muted-foreground mb-2">推荐分类：</p>
              <div className="flex flex-wrap gap-2">
                {RECOMMENDED_TAGS.map((tag) => (
                  <Badge
                    key={tag.label}
                    variant="outline"
                    className="cursor-pointer hover:bg-purple-100 hover:border-purple-300 transition-colors"
                    onClick={() => handleTagClick(tag.label)}
                  >
                    {tag.icon} {tag.label}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* AI Search Results Info */}
          {aiSearchActive && aiSearchResults && !aiSearchLoading && (
            <div className="mt-3 flex items-center justify-between">
              <p className="text-sm text-purple-700">
                找到 <span className="font-semibold">{aiSearchResults.length}</span> 个匹配结果
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAiSearch}
                className="text-purple-600 hover:text-purple-800"
              >
                清除搜索
              </Button>
            </div>
          )}
        </div>

        {/* Top Action Bar */}
        <div className="p-4 border-b border-border bg-card">
          <div className="flex items-center justify-between gap-4">
            {/* Primary Actions */}
            <div className="flex items-center gap-3">
              <Button
                size="lg"
                className="bg-gradient-primary gap-2"
                onClick={() => navigate("/material-preprocessing")}
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
                  placeholder="精确搜索素材..."
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
          {/* AI Search Loading State - Skeleton */}
          {aiSearchLoading && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles size={16} className="text-purple-500 animate-pulse" />
                <span className="text-sm text-purple-600">AI 正在分析画面内容...</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="aspect-video rounded-lg bg-gradient-to-r from-purple-100 via-blue-100 to-purple-100 animate-[shimmer_2s_infinite]" />
                    <Skeleton className="h-4 w-3/4" />
                    <div className="flex gap-1">
                      <Skeleton className="h-5 w-12 rounded-full" />
                      <Skeleton className="h-5 w-12 rounded-full" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AI Search Results */}
          {aiSearchActive && aiSearchResults && !aiSearchLoading && (
            <div className="mb-6">
              {aiSearchResults.length > 0 ? (
                <>
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles size={16} className="text-purple-500" />
                    <span className="text-sm font-medium text-purple-700">AI 搜索结果</span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {aiSearchResults.map((material) => (
                      <Card
                        key={material.id}
                        className="group cursor-pointer hover:shadow-lg transition-all border-purple-200 hover:border-purple-400 overflow-hidden"
                        onClick={() => handleMaterialClick(material)}
                      >
                        <div className="relative aspect-video bg-muted">
                          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                            <span className="text-xs">视频预览</span>
                          </div>
                          {/* Match Score Badge */}
                          <div className="absolute top-2 right-2 bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                            {material.matchScore}% 匹配
                          </div>
                        </div>
                        <CardContent className="p-3">
                          <p className="font-medium text-sm truncate">{material.name}</p>
                          {/* AI Tags */}
                          <div className="flex gap-1 mt-2 flex-wrap">
                            {material.aiTags.map((tag) => (
                              <Badge
                                key={tag}
                                variant="secondary"
                                className="text-xs bg-purple-100 text-purple-700"
                              >
                                {tag}
                              </Badge>
                            ))}
                          </div>
                          <p className="text-xs text-muted-foreground mt-2">
                            时长: {material.duration}s
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-12">
                  <Sparkles size={48} className="mx-auto text-purple-300 mb-4" />
                  <p className="text-muted-foreground">未找到匹配的画面内容</p>
                  <p className="text-sm text-muted-foreground mt-1">试试其他关键词，如"火车"、"风景"</p>
                </div>
              )}
            </div>
          )}

          {/* Regular Materials List - Only show when not in AI search mode or after AI results */}
          {!aiSearchLoading && (
            <>
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
              {filteredMaterials.length === 0 && !aiSearchActive && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                    <Search size={24} className="text-muted-foreground" />
                  </div>
                  <h3 className="font-medium text-foreground mb-2">暂无素材</h3>
                  <p className="text-body-small text-muted-foreground mb-4">
                    上传素材或调整筛选条件
                  </p>
                </div>
              )}
            </>
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
