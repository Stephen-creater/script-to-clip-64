import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Plus,
  Clock,
  Layers,
  FileText,
  BarChart3,
  Search,
  Rocket,
  Check,
  Building2,
  User
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

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
  ownerType: 'team' | 'personal';
  coverImage?: string;
}

const StartCreation = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [creationMode, setCreationMode] = useState<'template' | 'blank'>('template');
  const [taskType, setTaskType] = useState<'flexible' | 'fixed'>('flexible');
  const [taskName, setTaskName] = useState('');
  const [templateSearch, setTemplateSearch] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [templateTab, setTemplateTab] = useState<'all' | 'team' | 'personal'>('all');

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
      owner: '运营1组-小王',
      ownerType: 'team'
    },
    {
      id: '2',
      name: '旅行Vlog通用模板',
      description: '旅行记录类视频模板，包含目的地介绍、行程安排、精彩瞬间',
      segmentsCount: 8,
      duration: 120,
      category: '旅行',
      createdAt: '2024-12-10',
      usageCount: 86,
      owner: '内容2组-小李',
      ownerType: 'team'
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
      owner: '培训组-小张',
      ownerType: 'team'
    },
    {
      id: '4',
      name: '我的日常Vlog',
      description: '个人日常记录模板，轻松风格',
      segmentsCount: 4,
      duration: 45,
      category: '生活',
      createdAt: '2024-12-12',
      usageCount: 32,
      owner: '我',
      ownerType: 'personal'
    },
    {
      id: '5',
      name: '美食探店模板',
      description: '餐厅探店专用，包含环境、菜品、点评',
      segmentsCount: 6,
      duration: 75,
      category: '美食',
      createdAt: '2024-12-14',
      usageCount: 156,
      owner: '内容1组-小刘',
      ownerType: 'team'
    },
    {
      id: '6',
      name: '个人作品集',
      description: '作品展示专用模板',
      segmentsCount: 5,
      duration: 60,
      category: '作品',
      createdAt: '2024-12-11',
      usageCount: 18,
      owner: '我',
      ownerType: 'personal'
    }
  ]);

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(templateSearch.toLowerCase());
    const matchesTab = templateTab === 'all' || 
      (templateTab === 'team' && template.ownerType === 'team') ||
      (templateTab === 'personal' && template.ownerType === 'personal');
    return matchesSearch && matchesTab;
  });

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return secs > 0 ? `${mins}m${secs}s` : `${mins}m`;
  };

  const handleCreateTask = () => {
    if (!taskName.trim()) {
      toast({
        title: "请填写任务名",
        variant: "destructive"
      });
      return;
    }

    if (creationMode === 'template' && !selectedTemplate) {
      toast({
        title: "请选择一个模板",
        variant: "destructive"
      });
      return;
    }

    if (creationMode === 'template' && selectedTemplate) {
      navigate(`/editor/new?template=${selectedTemplate.id}&taskName=${encodeURIComponent(taskName)}&taskType=${taskType}`);
    } else {
      navigate(`/editor/new?taskType=${taskType}&taskName=${encodeURIComponent(taskName)}`);
    }
    
    toast({
      title: "任务创建成功",
      description: creationMode === 'template' ? "正在基于模板创建新任务" : "正在创建空白项目"
    });
  };

  const handleSelectTemplate = (template: Template) => {
    setSelectedTemplate(template);
    // Auto-set duration mode based on template (demo logic)
    if (template.duration > 60) {
      setTaskType('flexible');
    }
  };

  return (
    <div className="flex h-full min-h-screen">
      {/* Left Panel - Configuration */}
      <div className="w-[400px] flex-shrink-0 bg-white border-r flex flex-col">
        <div className="flex-1 p-6 space-y-6 overflow-y-auto">
          {/* Title */}
          <div>
            <h1 className="text-2xl font-bold text-foreground">创建新任务</h1>
            <p className="text-sm text-muted-foreground mt-1">配置您的混剪逻辑</p>
          </div>

          {/* Creation Mode */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">创作方式</Label>
            <div className="grid grid-cols-2 gap-3">
              {/* Template Mode Card */}
              <div
                className={cn(
                  "relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-200",
                  creationMode === 'template'
                    ? "border-emerald-500 bg-emerald-50/50"
                    : "border-border hover:border-muted-foreground/50"
                )}
                onClick={() => setCreationMode('template')}
              >
                {creationMode === 'template' && (
                  <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                    <Check size={12} className="text-white" />
                  </div>
                )}
                <div className="text-center space-y-2">
                  <div className="w-10 h-10 mx-auto rounded-lg bg-emerald-100 flex items-center justify-center">
                    <FileText size={20} className="text-emerald-600" />
                  </div>
                  <div className="font-medium text-sm">使用模板</div>
                  <p className="text-xs text-muted-foreground">复用 SOP 快速生产</p>
                </div>
              </div>

              {/* Blank Mode Card */}
              <div
                className={cn(
                  "relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-200",
                  creationMode === 'blank'
                    ? "border-emerald-500 bg-emerald-50/50"
                    : "border-border hover:border-muted-foreground/50"
                )}
                onClick={() => setCreationMode('blank')}
              >
                {creationMode === 'blank' && (
                  <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                    <Check size={12} className="text-white" />
                  </div>
                )}
                <div className="text-center space-y-2">
                  <div className="w-10 h-10 mx-auto rounded-lg bg-slate-100 flex items-center justify-center">
                    <Plus size={20} className="text-slate-600" />
                  </div>
                  <div className="font-medium text-sm">从空项目开始</div>
                  <p className="text-xs text-muted-foreground">从零搭建分段逻辑</p>
                </div>
              </div>
            </div>
          </div>

          {/* Task Name */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">任务名称</Label>
            <Input 
              placeholder="请输入任务名..." 
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
              className="h-11"
            />
          </div>

          {/* Duration Mode */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">时长模式</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={taskType === 'flexible' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTaskType('flexible')}
                className={cn(
                  "flex-1",
                  taskType === 'flexible' && "bg-emerald-500 hover:bg-emerald-600"
                )}
              >
                灵活时长
              </Button>
              <Button
                type="button"
                variant={taskType === 'fixed' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTaskType('fixed')}
                className={cn(
                  "flex-1",
                  taskType === 'fixed' && "bg-emerald-500 hover:bg-emerald-600"
                )}
              >
                固定时长
              </Button>
            </div>
          </div>

          {/* Selected Template Info */}
          {creationMode === 'template' && selectedTemplate && (
            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200">
              <div className="flex items-center gap-2">
                <Check size={16} className="text-emerald-600" />
                <span className="text-sm font-medium text-emerald-800">
                  已选模板：{selectedTemplate.name}
                </span>
              </div>
              <p className="text-xs text-emerald-600 mt-1 ml-6">
                {selectedTemplate.segmentsCount} 个分段 · {formatDuration(selectedTemplate.duration)}
              </p>
            </div>
          )}
        </div>

        {/* Sticky Bottom Button */}
        <div className="p-6 border-t bg-white">
          <Button 
            className="w-full h-12 text-base bg-emerald-500 hover:bg-emerald-600" 
            size="lg"
            onClick={handleCreateTask}
          >
            <Rocket size={18} className="mr-2" />
            立即创建任务
          </Button>
        </div>
      </div>

      {/* Right Panel - Template Gallery */}
      <div className="flex-1 bg-slate-50 flex flex-col overflow-hidden">
        {creationMode === 'blank' ? (
          /* Empty State for Blank Mode */
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
            <div className="w-24 h-24 rounded-full bg-slate-200 flex items-center justify-center mb-4">
              <Plus size={40} className="text-slate-400" />
            </div>
            <p className="text-lg font-medium text-slate-500">自定义模式无需选择模板</p>
            <p className="text-sm text-slate-400 mt-1">将从空白项目开始创建</p>
          </div>
        ) : (
          <>
            {/* Filter Bar */}
            <div className="p-4 bg-white border-b flex items-center gap-4">
              <Tabs value={templateTab} onValueChange={(v) => setTemplateTab(v as 'all' | 'team' | 'personal')}>
                <TabsList className="bg-slate-100">
                  <TabsTrigger value="all" className="text-sm">全部</TabsTrigger>
                  <TabsTrigger value="team" className="text-sm">
                    <Building2 size={14} className="mr-1" />
                    团队公共库
                  </TabsTrigger>
                  <TabsTrigger value="personal" className="text-sm">
                    <User size={14} className="mr-1" />
                    个人专用库
                  </TabsTrigger>
                </TabsList>
              </Tabs>
              <div className="flex-1 relative max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="搜索模板名称..."
                  value={templateSearch}
                  onChange={(e) => setTemplateSearch(e.target.value)}
                  className="pl-9 h-9"
                />
              </div>
            </div>

            {/* Template Grid */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="grid grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
                {filteredTemplates.map((template) => {
                  const isSelected = selectedTemplate?.id === template.id;
                  return (
                    <div
                      key={template.id}
                      className={cn(
                        "group bg-white rounded-xl overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-lg",
                        isSelected
                          ? "ring-2 ring-emerald-500 shadow-lg"
                          : "border border-slate-200 hover:border-slate-300"
                      )}
                      onClick={() => handleSelectTemplate(template)}
                    >
                      {/* Cover Image */}
                      <div className="relative h-32 bg-gradient-to-br from-slate-100 to-slate-200">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <FileText size={32} className="text-slate-300" />
                        </div>
                        {/* Selected Checkmark */}
                        {isSelected && (
                          <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center shadow-md">
                            <Check size={14} className="text-white" />
                          </div>
                        )}
                        {/* Owner Badge */}
                        <div className="absolute bottom-2 left-2">
                          <Badge 
                            variant="secondary" 
                            className={cn(
                              "text-xs",
                              template.ownerType === 'team' 
                                ? "bg-blue-100 text-blue-700" 
                                : "bg-slate-100 text-slate-600"
                            )}
                          >
                            {template.ownerType === 'team' ? '团队' : '个人'}
                          </Badge>
                        </div>
                      </div>

                      {/* Info */}
                      <div className="p-3 space-y-2">
                        <h3 className="font-semibold text-sm text-foreground truncate">
                          {template.name}
                        </h3>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Layers size={12} />
                            <span>{template.segmentsCount}个分段</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock size={12} />
                            <span>{formatDuration(template.duration)}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <BarChart3 size={12} />
                          <span>已使用 {template.usageCount} 次</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Empty State */}
              {filteredTemplates.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16">
                  <FileText size={48} className="text-slate-300 mb-3" />
                  <p className="text-sm text-muted-foreground">
                    {templateSearch ? '未找到匹配的模板' : '暂无可用模板'}
                  </p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default StartCreation;
