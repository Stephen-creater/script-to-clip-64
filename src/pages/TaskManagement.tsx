import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { 
  Plus, 
  Search, 
  Filter,
  User,
  Layers,
  Calendar
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface Task {
  id: string;
  name: string;
  segmentsCount: number;
  progress: { completed: number; total: number };
  creator: string;
  group: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: string;
  taskType: 'flexible' | 'fixed';
}

const TaskManagement = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTime, setFilterTime] = useState('all');
  const [filterGroup, setFilterGroup] = useState('all');
  const [taskType, setTaskType] = useState<'flexible' | 'fixed'>('flexible');
  const [taskName, setTaskName] = useState('');

  // Get today's date in format YYYYMMDD
  const today = new Date();
  const dateStr = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}`;

  // Demo tasks
  const [tasks] = useState<Task[]>([
    {
      id: '1',
      name: `英铁1组-小熊-${dateStr}`,
      segmentsCount: 10,
      progress: { completed: 9, total: 10 },
      creator: '英铁1组-小熊',
      group: '英铁1组',
      status: 'processing',
      createdAt: '2024-12-17 09:30',
      taskType: 'flexible'
    },
    {
      id: '2',
      name: `西班牙旅行混剪-${dateStr}`,
      segmentsCount: 8,
      progress: { completed: 8, total: 8 },
      creator: '内容组-小明',
      group: '内容组',
      status: 'completed',
      createdAt: '2024-12-16 14:20',
      taskType: 'fixed'
    },
    {
      id: '3',
      name: `产品介绍视频-${dateStr}`,
      segmentsCount: 5,
      progress: { completed: 0, total: 5 },
      creator: '市场组-小红',
      group: '市场组',
      status: 'pending',
      createdAt: '2024-12-17 10:15',
      taskType: 'flexible'
    }
  ]);

  // Get unique groups for filter
  const groups = [...new Set(tasks.map(t => t.group))];

  // Filter tasks
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = 
      task.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.creator.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesGroup = filterGroup === 'all' || task.group === filterGroup;
    
    // Time filter (simplified for demo)
    let matchesTime = true;
    if (filterTime === 'today') {
      matchesTime = task.createdAt.startsWith('2024-12-17');
    } else if (filterTime === 'week') {
      matchesTime = true; // Simplified
    }

    return matchesSearch && matchesGroup && matchesTime;
  });

  const getStatusBadge = (status: Task['status'], progress: Task['progress']) => {
    switch (status) {
      case 'completed':
        return (
          <Badge variant="outline" className="bg-success/10 text-success border-success/20">
            已完成 {progress.completed}/{progress.total}
          </Badge>
        );
      case 'pending':
        return <Badge variant="secondary">待开始</Badge>;
      case 'processing':
        return (
          <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20">
            生成中 {progress.completed}/{progress.total}
          </Badge>
        );
      case 'failed':
        return (
          <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">
            生成失败
          </Badge>
        );
      default:
        return <Badge variant="secondary">未知</Badge>;
    }
  };

  const handleCreateTask = () => {
    if (!taskName.trim()) {
      toast({
        title: "请填写任务名",
        variant: "destructive"
      });
      return;
    }

    // Navigate to editor with task type
    navigate(`/editor/new?taskType=${taskType}&taskName=${encodeURIComponent(taskName)}`);
    setCreateDialogOpen(false);
    setTaskName('');
    setTaskType('flexible');
  };

  const handleTaskClick = (taskId: string) => {
    navigate(`/editor/${taskId}`);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto min-h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-display bg-gradient-primary bg-clip-text text-transparent">
            任务管理
          </h1>
          <p className="text-body-small text-muted-foreground mt-1">从这里创建混剪任务</p>
        </div>

        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary shadow-tech">
              <Plus size={16} className="mr-2" />
              创建新任务
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>创建新任务</DialogTitle>
              <DialogDescription>
                配置您的混剪任务
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6 py-4">
              {/* Task Type */}
              <div className="space-y-3">
                <Label className="text-base font-medium">任务类型</Label>
                <RadioGroup value={taskType} onValueChange={(v) => setTaskType(v as 'flexible' | 'fixed')}>
                  <div className="flex items-start space-x-3 p-3 rounded-lg border hover:border-primary transition-colors cursor-pointer" onClick={() => setTaskType('flexible')}>
                    <RadioGroupItem value="flexible" id="flexible" className="mt-1" />
                    <div className="flex-1">
                      <Label htmlFor="flexible" className="font-medium cursor-pointer">灵活时长</Label>
                      <p className="text-sm text-muted-foreground mt-1">每个分段的时长由其文案口播的时长决定</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3 p-3 rounded-lg border hover:border-primary transition-colors cursor-pointer" onClick={() => setTaskType('fixed')}>
                    <RadioGroupItem value="fixed" id="fixed" className="mt-1" />
                    <div className="flex-1">
                      <Label htmlFor="fixed" className="font-medium cursor-pointer">固定时长</Label>
                      <p className="text-sm text-muted-foreground mt-1">你可以固定每个分段的时长</p>
                    </div>
                  </div>
                </RadioGroup>
              </div>

              {/* Task Name */}
              <div className="space-y-3">
                <Label className="text-base font-medium">请填写你的任务名</Label>
                <Input 
                  placeholder="输入任务名称..." 
                  value={taskName}
                  onChange={(e) => setTaskName(e.target.value)}
                />
              </div>
            </div>

            <DialogFooter>
              <Button 
                className="w-full bg-gradient-primary" 
                size="lg"
                onClick={handleCreateTask}
              >
                开始创建任务
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
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
            onClick={() => handleTaskClick(task.id)}
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

                  {/* Segments */}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Layers size={14} />
                    <span>{task.segmentsCount} 分段</span>
                  </div>

                  {/* Progress */}
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${(task.progress.completed / task.progress.total) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {task.progress.completed}/{task.progress.total}
                    </span>
                  </div>

                  {/* Creator */}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <User size={14} />
                    <span>{task.creator}</span>
                  </div>
                </div>

                {/* Right: Status */}
                <div className="flex-shrink-0">
                  {getStatusBadge(task.status, task.progress)}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredTasks.length === 0 && (
        <div className="text-center py-12">
          <div className="text-muted-foreground mb-4">
            <Layers size={48} className="mx-auto mb-4 opacity-50" />
            <p className="text-heading-3">暂无任务</p>
            <p className="text-body-small">
              {searchTerm ? '没有找到匹配的任务' : '创建您的第一个混剪任务吧'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskManagement;
