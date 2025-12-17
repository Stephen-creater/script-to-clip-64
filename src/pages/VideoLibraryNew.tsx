import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  Search, 
  Play, 
  Download, 
  Trash2,
  Calendar,
  Clock,
  Filter,
  User,
  ArrowLeft,
  Video
} from "lucide-react";
import BatchDownloadModal from "@/components/VideoLibrary/BatchDownloadModal";

interface VideoItem {
  id: string;
  name: string;
  duration: string;
  size: string;
  createdAt: string;
}

interface TaskWithVideos {
  id: string;
  name: string;
  creator: string;
  group: string;
  videoCount: number;
  createdAt: string;
  videos: VideoItem[];
}

const VideoLibraryNew = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTime, setFilterTime] = useState('all');
  const [filterGroup, setFilterGroup] = useState('all');
  const [selectedTask, setSelectedTask] = useState<TaskWithVideos | null>(null);
  const [selectedVideos, setSelectedVideos] = useState<string[]>([]);
  const [batchDownloadModalOpen, setBatchDownloadModalOpen] = useState(false);

  // Get today's date
  const today = new Date();
  const dateStr = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}`;

  // Demo tasks with videos
  const [tasks] = useState<TaskWithVideos[]>([
    {
      id: '1',
      name: `英铁1组-小熊-${dateStr}`,
      creator: '英铁1组-小熊',
      group: '英铁1组',
      videoCount: 6,
      createdAt: '2024-12-17 09:30',
      videos: [
        { id: 'v1', name: '英铁混剪_版本1', duration: '45.6秒', size: '12.5MB', createdAt: '2024-12-17 10:30' },
        { id: 'v2', name: '英铁混剪_版本2', duration: '43.2秒', size: '11.8MB', createdAt: '2024-12-17 10:35' },
        { id: 'v3', name: '英铁混剪_版本3', duration: '44.1秒', size: '12.1MB', createdAt: '2024-12-17 10:40' },
        { id: 'v4', name: '英铁混剪_版本4', duration: '42.8秒', size: '11.5MB', createdAt: '2024-12-17 10:45' },
        { id: 'v5', name: '英铁混剪_版本5', duration: '46.3秒', size: '12.9MB', createdAt: '2024-12-17 10:50' },
        { id: 'v6', name: '英铁混剪_版本6', duration: '41.9秒', size: '11.2MB', createdAt: '2024-12-17 10:55' },
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
        { id: 'v7', name: '西班牙旅行_版本1', duration: '52.3秒', size: '14.2MB', createdAt: '2024-12-16 15:00' },
        { id: 'v8', name: '西班牙旅行_版本2', duration: '51.8秒', size: '13.9MB', createdAt: '2024-12-16 15:05' },
        { id: 'v9', name: '西班牙旅行_版本3', duration: '53.1秒', size: '14.5MB', createdAt: '2024-12-16 15:10' },
        { id: 'v10', name: '西班牙旅行_版本4', duration: '50.9秒', size: '13.6MB', createdAt: '2024-12-16 15:15' },
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
        { id: 'v11', name: '产品介绍_版本1', duration: '38.5秒', size: '10.2MB', createdAt: '2024-12-17 11:00' },
        { id: 'v12', name: '产品介绍_版本2', duration: '39.2秒', size: '10.5MB', createdAt: '2024-12-17 11:05' },
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
    console.log('Delete videos:', selectedVideos);
    setSelectedVideos([]);
  };

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
      <Dialog open={!!selectedTask} onOpenChange={(open) => !open && setSelectedTask(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setSelectedTask(null)}
              >
                <ArrowLeft size={16} />
              </Button>
              <DialogTitle>{selectedTask?.name}</DialogTitle>
            </div>
          </DialogHeader>

          {selectedTask && (
            <div className="space-y-4">
              {/* Batch Actions */}
              {selectedVideos.length > 0 && (
                <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                  <span className="text-sm text-muted-foreground">
                    已选择 {selectedVideos.length} 个视频
                  </span>
                  <div className="flex-1" />
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={handleBatchDelete}
                  >
                    <Trash2 size={14} className="mr-1" />
                    批量删除
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleBatchDownload}
                  >
                    <Download size={14} className="mr-1" />
                    批量下载
                  </Button>
                </div>
              )}

              {/* Select All */}
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <Checkbox
                  checked={selectedVideos.length === selectedTask.videos.length}
                  onCheckedChange={handleSelectAll}
                />
                <span className="text-sm text-muted-foreground">全选</span>
              </div>

              {/* Video Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {selectedTask.videos.map((video) => (
                  <Card key={video.id} className="group">
                    <CardContent className="p-4">
                      {/* Checkbox */}
                      <div className="flex items-center justify-between mb-3">
                        <Checkbox
                          checked={selectedVideos.includes(video.id)}
                          onCheckedChange={() => handleVideoSelect(video.id)}
                        />
                      </div>

                      {/* Video Thumbnail */}
                      <div className="aspect-video bg-muted rounded-lg mb-3 flex items-center justify-center relative overflow-hidden">
                        <Play size={32} className="text-muted-foreground" />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                          <Button size="sm" variant="secondary">
                            <Play size={16} className="mr-2" />
                            预览
                          </Button>
                        </div>
                      </div>

                      {/* Video Info */}
                      <div className="space-y-2">
                        <h3 className="font-medium text-sm truncate">{video.name}</h3>
                        
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock size={12} />
                            {video.duration}
                          </div>
                          <span>{video.size}</span>
                        </div>

                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar size={12} />
                          {video.createdAt}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 pt-2">
                          <Button size="sm" variant="outline" className="flex-1">
                            <Download size={14} className="mr-1" />
                            下载
                          </Button>
                          <Button size="sm" variant="outline">
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

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
