import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { 
  Plus,
  Play,
  Clock,
  Layers,
  FileText,
  User,
  BarChart3
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface Template {
  id: string;
  name: string;
  description: string;
  segmentsCount: number;
  duration: number;
  category: string;
  createdAt: string;
  usageCount: number;
  owner: string;
}

const StartCreation = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [taskType, setTaskType] = useState<'flexible' | 'fixed'>('flexible');
  const [taskName, setTaskName] = useState('');

  // Demo templates
  const [templates] = useState<Template[]>([
    {
      id: '1',
      name: '产品展示模板',
      description: '适合产品介绍类视频，包含开场、特点展示、总结三个部分',
      segmentsCount: 5,
      duration: 60,
      category: '产品',
      createdAt: '2024-12-15',
      usageCount: 128,
      owner: '运营1组-小王'
    },
    {
      id: '2',
      name: '旅行Vlog模板',
      description: '旅行记录类视频模板，包含目的地介绍、行程安排、精彩瞬间',
      segmentsCount: 8,
      duration: 120,
      category: '旅行',
      createdAt: '2024-12-10',
      usageCount: 86,
      owner: '内容2组-小李'
    },
    {
      id: '3',
      name: '教程讲解模板',
      description: '适合教学类视频，包含问题引入、步骤讲解、总结回顾',
      segmentsCount: 6,
      duration: 90,
      category: '教程',
      createdAt: '2024-12-08',
      usageCount: 215,
      owner: '培训组-小张'
    }
  ]);

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}秒`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return secs > 0 ? `${mins}分${secs}秒` : `${mins}分钟`;
  };

  const handleCreateTask = () => {
    if (!taskName.trim()) {
      toast({
        title: "请填写任务名",
        variant: "destructive"
      });
      return;
    }

    navigate(`/editor/new?taskType=${taskType}&taskName=${encodeURIComponent(taskName)}`);
  };

  const handleUseTemplate = (templateId: string) => {
    navigate(`/editor/new?template=${templateId}`);
    toast({
      title: "模板已应用",
      description: "正在基于模板创建新任务"
    });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto min-h-full space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-display bg-gradient-primary bg-clip-text text-transparent">
          开始创作
        </h1>
        <p className="text-body-small text-muted-foreground mt-1">创建全新任务或使用模板快速开始</p>
      </div>

      {/* Module 1: Create New Task */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus size={20} />
            创建新任务
          </CardTitle>
          <p className="text-sm text-muted-foreground">创建全新任务</p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Task Type */}
          <div className="space-y-3">
            <Label className="text-base font-medium">任务类型</Label>
            <RadioGroup value={taskType} onValueChange={(v) => setTaskType(v as 'flexible' | 'fixed')}>
              <div 
                className="flex items-start space-x-3 p-4 rounded-lg border hover:border-primary transition-colors cursor-pointer" 
                onClick={() => setTaskType('flexible')}
              >
                <RadioGroupItem value="flexible" id="flexible" className="mt-1" />
                <div className="flex-1">
                  <Label htmlFor="flexible" className="font-medium cursor-pointer">灵活时长</Label>
                  <p className="text-sm text-muted-foreground mt-1">每个分段的时长由其文案口播的时长决定</p>
                </div>
              </div>
              <div 
                className="flex items-start space-x-3 p-4 rounded-lg border hover:border-primary transition-colors cursor-pointer" 
                onClick={() => setTaskType('fixed')}
              >
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
              className="max-w-md"
            />
          </div>

          {/* Create Button */}
          <Button 
            className="w-full max-w-md bg-gradient-primary shadow-tech" 
            size="lg"
            onClick={handleCreateTask}
          >
            <Plus size={18} className="mr-2" />
            创建任务
          </Button>
        </CardContent>
      </Card>

      {/* Module 2: Start from Template */}
      <div>
        <h2 className="text-xl font-semibold mb-4">从模板开始创作</h2>
        <p className="text-body-small text-muted-foreground mb-6">使用优秀剪辑模板快速开始</p>
        
        {/* Template Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template) => (
            <Card 
              key={template.id} 
              className="group hover:shadow-lg transition-all duration-200"
            >
              <CardContent className="p-5">
                {/* Thumbnail placeholder */}
                <div className="aspect-video bg-muted rounded-lg mb-4 flex items-center justify-center relative overflow-hidden">
                  <FileText size={32} className="text-muted-foreground" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleUseTemplate(template.id)}
                    >
                      <Play size={16} className="mr-2" />
                      使用模板
                    </Button>
                  </div>
                </div>

                {/* Template Info */}
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-foreground">{template.name}</h3>
                    <Badge variant="outline">{template.category}</Badge>
                  </div>
                  
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {template.description}
                  </p>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Layers size={14} />
                      <span>{template.segmentsCount} 分段</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock size={14} />
                      <span>{formatDuration(template.duration)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <BarChart3 size={14} />
                      <span>使用 {template.usageCount} 次</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <User size={14} />
                      <span>{template.owner}</span>
                    </div>
                  </div>

                  <Button 
                    className="w-full mt-2" 
                    variant="outline"
                    onClick={() => handleUseTemplate(template.id)}
                  >
                    使用此模板
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {templates.length === 0 && (
          <div className="text-center py-12">
            <div className="text-muted-foreground mb-4">
              <FileText size={48} className="mx-auto mb-4 opacity-50" />
              <p className="text-heading-3">暂无模板</p>
              <p className="text-body-small">还没有可用的模板</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StartCreation;
