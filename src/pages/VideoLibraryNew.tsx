import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { 
  Search, 
  Calendar,
  Filter,
  User,
  ArrowLeft,
  Video,
  Zap,
  Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import BatchDownloadModal from "@/components/VideoLibrary/BatchDownloadModal";
import AIVideoCard, { VideoWithAI } from "@/components/VideoLibrary/AIVideoCard";
import TieredVideoList from "@/components/VideoLibrary/TieredVideoList";
import FloatingActionBar from "@/components/VideoLibrary/FloatingActionBar";

interface TaskWithVideos {
  id: string;
  name: string;
  creator: string;
  group: string;
  videoCount: number;
  createdAt: string;
  videos: VideoWithAI[];
}

// Helper to generate AI scores
const generateAIData = (baseScore: number): Pick<VideoWithAI, 'aiScore' | 'aiGrade' | 'aiDetails'> => {
  const score = Math.min(100, Math.max(0, baseScore + Math.floor(Math.random() * 10) - 5));
  let grade: 'S' | 'A' | 'B' | 'C';
  if (score >= 90) grade = 'S';
  else if (score >= 75) grade = 'A';
  else if (score >= 60) grade = 'B';
  else grade = 'C';

  const issues: string[] = [];
  if (score < 70) {
    const possibleIssues = ['素材重复', '遮挡', '画面模糊', '节奏不佳', '音画不同步'];
    const numIssues = Math.floor(Math.random() * 2) + 1;
    for (let i = 0; i < numIssues; i++) {
      const issue = possibleIssues[Math.floor(Math.random() * possibleIssues.length)];
      if (!issues.includes(issue)) issues.push(issue);
    }
  }

  return {
    aiScore: score,
    aiGrade: grade,
    aiDetails: {
      scriptMatch: score >= 85 ? '高' : score >= 65 ? '中' : '低',
      visualRichness: score >= 80 ? '高' : score >= 55 ? '中' : '低',
      issues
    }
  };
};

const VideoLibraryNew = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTime, setFilterTime] = useState('all');
  const [filterGroup, setFilterGroup] = useState('all');
  const [selectedTask, setSelectedTask] = useState<TaskWithVideos | null>(null);
  const [selectedVideos, setSelectedVideos] = useState<string[]>([]);
  const [batchDownloadModalOpen, setBatchDownloadModalOpen] = useState(false);
  const [superMode, setSuperMode] = useState(false);

  // Get today's date
  const today = new Date();
  const dateStr = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}`;

  // Demo tasks with videos - including AI scores
  const [tasks] = useState<TaskWithVideos[]>([
    {
      id: '1',
      name: `英铁1组-小熊-${dateStr}`,
      creator: '英铁1组-小熊',
      group: '英铁1组',
      videoCount: 6,
      createdAt: '2024-12-17 09:30',
      videos: [
        { id: 'v1', name: '英铁混剪_版本1', duration: '45.6秒', size: '12.5MB', createdAt: '2024-12-17 10:30', ...generateAIData(95) },
        { id: 'v2', name: '英铁混剪_版本2', duration: '43.2秒', size: '11.8MB', createdAt: '2024-12-17 10:35', ...generateAIData(88) },
        { id: 'v3', name: '英铁混剪_版本3', duration: '44.1秒', size: '12.1MB', createdAt: '2024-12-17 10:40', ...generateAIData(78) },
        { id: 'v4', name: '英铁混剪_版本4', duration: '42.8秒', size: '11.5MB', createdAt: '2024-12-17 10:45', ...generateAIData(65) },
        { id: 'v5', name: '英铁混剪_版本5', duration: '46.3秒', size: '12.9MB', createdAt: '2024-12-17 10:50', ...generateAIData(92) },
        { id: 'v6', name: '英铁混剪_版本6', duration: '41.9秒', size: '11.2MB', createdAt: '2024-12-17 10:55', ...generateAIData(55) },
      ]
    },
    {
      id: '2',
      name: `西班牙旅行混剪-${dateStr}`,
      creator: '内容组-小明',
      group: '内容组',
      videoCount: 4,
      createdAt: '2024-12-16 14:20',
      videos: [
        { id: 'v7', name: '西班牙旅行_版本1', duration: '52.3秒', size: '14.2MB', createdAt: '2024-12-16 15:00', ...generateAIData(91) },
        { id: 'v8', name: '西班牙旅行_版本2', duration: '51.8秒', size: '13.9MB', createdAt: '2024-12-16 15:05', ...generateAIData(82) },
        { id: 'v9', name: '西班牙旅行_版本3', duration: '53.1秒', size: '14.5MB', createdAt: '2024-12-16 15:10', ...generateAIData(70) },
        { id: 'v10', name: '西班牙旅行_版本4', duration: '50.9秒', size: '13.6MB', createdAt: '2024-12-16 15:15', ...generateAIData(58) },
      ]
    },
    {
      id: '3',
      name: `产品介绍视频-${dateStr}`,
      creator: '市场组-小红',
      group: '市场组',
      videoCount: 2,
      createdAt: '2024-12-17 10:15',
      videos: [
        { id: 'v11', name: '产品介绍_版本1', duration: '38.5秒', size: '10.2MB', createdAt: '2024-12-17 11:00', ...generateAIData(97) },
        { id: 'v12', name: '产品介绍_版本2', duration: '39.2秒', size: '10.5MB', createdAt: '2024-12-17 11:05', ...generateAIData(76) },
      ]
    }
  ]);

  // Get unique groups
  const groups = [...new Set(tasks.map(t => t.group))];

  // Filter tasks
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = 
      task.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.creator.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesGroup = filterGroup === 'all' || task.group === filterGroup;
    
    let matchesTime = true;
    if (filterTime === 'today') {
      matchesTime = task.createdAt.startsWith('2024-12-17');
    }

    return matchesSearch && matchesGroup && matchesTime;
  });

  const handleVideoSelect = (videoId: string) => {
    setSelectedVideos(prev => 
      prev.includes(videoId) 
        ? prev.filter(id => id !== videoId)
        : [...prev, videoId]
    );
  };

  const handleSelectAll = () => {
    if (!selectedTask) return;
    if (selectedVideos.length === selectedTask.videos.length) {
      setSelectedVideos([]);
    } else {
      setSelectedVideos(selectedTask.videos.map(v => v.id));
    }
  };

  const handleBatchDownload = () => {
    setBatchDownloadModalOpen(true);
  };

  const handleBatchDelete = () => {
    toast({
      title: "删除成功",
      description: `已删除 ${selectedVideos.length} 个视频`,
    });
    setSelectedVideos([]);
  };

  const handleDistribute = () => {
    toast({
      title: "分发任务已创建",
      description: `${selectedVideos.length} 个视频将分发到矩阵账号`,
    });
    setSelectedVideos([]);
  };

  // Handle select by grade
  const handleSelectGrade = (grade: 'S' | 'A' | 'B' | 'C') => {
    if (!selectedTask) return;
    const gradeVideos = selectedTask.videos.filter(v => 
      grade === 'B' ? (v.aiGrade === 'B' || v.aiGrade === 'C') : v.aiGrade === grade
    );
    const gradeIds = gradeVideos.map(v => v.id);
    const allSelected = gradeIds.every(id => selectedVideos.includes(id));
    
    if (allSelected) {
      setSelectedVideos(prev => prev.filter(id => !gradeIds.includes(id)));
    } else {
      setSelectedVideos(prev => [...new Set([...prev, ...gradeIds])]);
    }
  };

  // Calculate grade counts for selected videos
  const getSelectedGradeCounts = () => {
    if (!selectedTask) return { S: 0, A: 0, B: 0, C: 0 };
    return selectedTask.videos.reduce((acc, video) => {
      if (selectedVideos.includes(video.id)) {
        acc[video.aiGrade]++;
      }
      return acc;
    }, { S: 0, A: 0, B: 0, C: 0 });
  };

  // Calculate stats for current task
  const getTaskStats = () => {
    if (!selectedTask) return { total: 0, sCount: 0, aCount: 0 };
    const sCount = selectedTask.videos.filter(v => v.aiGrade === 'S').length;
    const aCount = selectedTask.videos.filter(v => v.aiGrade === 'A').length;
    return { total: selectedTask.videos.length, sCount, aCount };
  };

  const taskStats = getTaskStats();

  return (
    <div className="p-6 max-w-7xl mx-auto min-h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-display bg-gradient-primary bg-clip-text text-transparent">
            成片管理
          </h1>
          <p className="text-body-small text-muted-foreground mt-1">从这里看成片</p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
          <Input 
            placeholder="搜索任务名、创建人..." 
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <Select value={filterTime} onValueChange={setFilterTime}>
          <SelectTrigger className="w-32">
            <Calendar size={14} className="mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部时间</SelectItem>
            <SelectItem value="today">今天</SelectItem>
            <SelectItem value="week">本周</SelectItem>
            <SelectItem value="month">本月</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterGroup} onValueChange={setFilterGroup}>
          <SelectTrigger className="w-32">
            <Filter size={14} className="mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">所有组</SelectItem>
            {groups.map(group => (
              <SelectItem key={group} value={group}>{group}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Task List - Horizontal Cards */}
      <div className="space-y-4">
        {filteredTasks.map((task) => (
          <Card 
            key={task.id} 
            className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5"
            onClick={() => setSelectedTask(task)}
          >
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                {/* Left: Task Info */}
                <div className="flex items-center gap-6 flex-1">
                  {/* Task Name */}
                  <div className="min-w-[200px]">
                    <h3 className="font-semibold text-foreground truncate">{task.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{task.createdAt}</p>
                  </div>

                  {/* Video Count */}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Video size={14} />
                    <span>{task.videoCount} 个视频</span>
                  </div>

                  {/* Creator */}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <User size={14} />
                    <span>{task.creator}</span>
                  </div>
                </div>

                {/* Right: Badge */}
                <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                  已完成
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredTasks.length === 0 && (
        <div className="text-center py-12">
          <div className="text-muted-foreground mb-4">
            <Video size={48} className="mx-auto mb-4 opacity-50" />
            <p className="text-heading-3">暂无成片</p>
            <p className="text-body-small">
              {searchTerm ? '没有找到匹配的任务' : '还没有生成的视频'}
            </p>
          </div>
        </div>
      )}

      {/* Video Detail Dialog */}
      <Dialog open={!!selectedTask} onOpenChange={(open) => {
        if (!open) {
          setSelectedTask(null);
          setSelectedVideos([]);
          setSuperMode(false);
        }
      }}>
        <DialogContent className="max-w-5xl max-h-[85vh] overflow-auto">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => {
                  setSelectedTask(null);
                  setSelectedVideos([]);
                  setSuperMode(false);
                }}
              >
                <ArrowLeft size={16} />
              </Button>
              <DialogTitle>{selectedTask?.name}</DialogTitle>
            </div>
          </DialogHeader>

          {selectedTask && (
            <div className="space-y-4">
              {/* AI Super Mode Control Bar */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-primary/5 via-purple-500/5 to-primary/5 border border-primary/10">
                <div className="flex items-center gap-4">
                  {/* Super Mode Toggle */}
                  <div 
                    className={cn(
                      "flex items-center gap-3 px-4 py-2 rounded-full cursor-pointer transition-all duration-300",
                      superMode 
                        ? "bg-gradient-to-r from-primary to-purple-500 text-white shadow-lg shadow-primary/25" 
                        : "bg-muted hover:bg-muted/80"
                    )}
                    onClick={() => setSuperMode(!superMode)}
                  >
                    <Zap className={cn("w-4 h-4", superMode && "animate-pulse")} />
                    <span className="font-medium text-sm">
                      {superMode ? "超级推荐已开启" : "开启超级推荐模式"}
                    </span>
                    <Switch 
                      checked={superMode} 
                      onCheckedChange={setSuperMode}
                      className="ml-1"
                    />
                  </div>
                </div>

                {/* Data Overview */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Sparkles className="w-4 h-4 text-yellow-500" />
                  <span>
                    本批次共 <span className="font-semibold text-foreground">{taskStats.total}</span> 个视频，
                    其中 <span className="font-semibold text-yellow-500">S级 {taskStats.sCount}</span> 个，
                    <span className="font-semibold text-green-500">A级 {taskStats.aCount}</span> 个
                  </span>
                </div>
              </div>

              {/* Video Display - Conditional Rendering */}
              {superMode ? (
                // Tiered View with Accordion
                <TieredVideoList
                  videos={selectedTask.videos}
                  selectedVideos={selectedVideos}
                  onVideoSelect={handleVideoSelect}
                  onSelectGrade={handleSelectGrade}
                  superMode={superMode}
                />
              ) : (
                // Default Grid View
                <>
                  {/* Select All */}
                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <Checkbox
                      checked={selectedVideos.length === selectedTask.videos.length && selectedTask.videos.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                    <span className="text-sm text-muted-foreground">全选</span>
                  </div>

                  {/* Video Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {selectedTask.videos.map((video) => (
                      <AIVideoCard
                        key={video.id}
                        video={video}
                        isSelected={selectedVideos.includes(video.id)}
                        onSelect={handleVideoSelect}
                        superMode={superMode}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Floating Action Bar */}
      <FloatingActionBar
        selectedCount={selectedVideos.length}
        selectedGrades={getSelectedGradeCounts()}
        onDownload={handleBatchDownload}
        onDistribute={handleDistribute}
        onDelete={handleBatchDelete}
        onClear={() => setSelectedVideos([])}
      />

      {/* Batch Download Modal */}
      <BatchDownloadModal
        isOpen={batchDownloadModalOpen}
        onClose={() => {
          setBatchDownloadModalOpen(false);
          setSelectedVideos([]);
        }}
        selectedFiles={selectedTask?.videos
          .filter(video => selectedVideos.includes(video.id))
          .map(video => ({
            id: video.id,
            name: video.name,
            size: video.size
          })) || []
        }
      />
    </div>
  );
};

export default VideoLibraryNew;
