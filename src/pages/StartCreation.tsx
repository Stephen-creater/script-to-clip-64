import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Zap, 
  Plus, 
  FileText, 
  Rocket, 
  Clock, 
  Lock, 
  X, 
  Search,
  Building2,
  User,
  Check,
  Layers
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Template {
  id: number;
  title: string;
  type: 'team' | 'personal';
  duration: string;
  segments: number;
  tags: string[];
  color: string;
}

const TEMPLATES: Template[] = [
  { id: 1, title: '带货混剪_快节奏', type: 'team', duration: '15s', segments: 5, tags: ['高转化', '快闪'], color: 'bg-orange-100' },
  { id: 2, title: '风景Vlog_舒缓', type: 'team', duration: '30s', segments: 3, tags: ['卡点', '空镜'], color: 'bg-emerald-100' },
  { id: 3, title: '口播_知识科普', type: 'team', duration: '60s', segments: 8, tags: ['字幕大', '安全区'], color: 'bg-blue-100' },
  { id: 4, title: '我的专用_英铁', type: 'personal', duration: '20s', segments: 4, tags: ['个人'], color: 'bg-purple-100' }
];

const StartCreation: React.FC = () => {
  const navigate = useNavigate();
  
  // Left panel state
  const [sourceMode, setSourceMode] = useState<'blank' | 'template'>('blank');
  const [taskName, setTaskName] = useState('');
  const [durationMode, setDurationMode] = useState<'flexible' | 'fixed'>('flexible');
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  
  // Right panel state
  const [templateTab, setTemplateTab] = useState<'team' | 'personal'>('team');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTemplates = useMemo(() => {
    return TEMPLATES.filter(template => {
      const matchesTab = template.type === templateTab;
      const matchesSearch = template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesTab && matchesSearch;
    });
  }, [templateTab, searchQuery]);

  const handleSelectTemplate = (template: Template) => {
    setSelectedTemplate(template);
    setSourceMode('template');
  };

  const handleClearTemplate = () => {
    setSelectedTemplate(null);
    setSourceMode('blank');
  };

  const handleCreateTask = () => {
    if (!taskName.trim()) {
      toast.error("请输入任务名称");
      return;
    }
    
    toast.success("任务创建成功！");
    navigate('/editor', {
      state: {
        taskName: taskName.trim(),
        templateId: selectedTemplate?.id,
        durationMode
      }
    });
  };

  return (
    <div className="h-screen flex flex-row overflow-hidden bg-background">
      {/* Left Panel - Command Center */}
      <div className="w-[420px] flex-shrink-0 bg-card border-r border-border shadow-xl z-10 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">开始创作</h1>
          </div>
          <p className="text-muted-foreground text-sm">配置参数，一键启动流水线</p>
        </div>

        {/* Scrollable Form Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Source Switch */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-foreground">创作基准</label>
            <div className="flex gap-2">
              <Button
                variant={sourceMode === 'blank' ? 'default' : 'outline'}
                className={cn(
                  "flex-1 justify-center gap-2",
                  sourceMode === 'blank' && "bg-primary text-primary-foreground"
                )}
                onClick={() => {
                  setSourceMode('blank');
                  setSelectedTemplate(null);
                }}
              >
                <Plus size={16} />
                空白创建
              </Button>
              <Button
                variant={sourceMode === 'template' ? 'default' : 'outline'}
                className={cn(
                  "flex-1 justify-center gap-2",
                  sourceMode === 'template' && "bg-primary text-primary-foreground"
                )}
                onClick={() => setSourceMode('template')}
              >
                <FileText size={16} />
                引用模板
              </Button>
            </div>
          </div>

          {/* Task Name */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-foreground">任务名称</label>
            <Input
              placeholder="例如：英铁混剪-2025..."
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
              className="h-11"
            />
          </div>

          {/* Duration Mode - Only show for blank mode */}
          {sourceMode === 'blank' && (
            <div className="space-y-3">
              <label className="text-sm font-medium text-foreground">时长模式</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setDurationMode('flexible')}
                  className={cn(
                    "p-4 rounded-xl border-2 text-left transition-all duration-200",
                    durationMode === 'flexible'
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50 hover:bg-muted/50"
                  )}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Clock size={18} className={durationMode === 'flexible' ? "text-primary" : "text-muted-foreground"} />
                    <span className="font-medium text-foreground">灵活时长</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    画面跟随口播时长自动伸缩
                  </p>
                </button>
                <button
                  onClick={() => setDurationMode('fixed')}
                  className={cn(
                    "p-4 rounded-xl border-2 text-left transition-all duration-200",
                    durationMode === 'fixed'
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50 hover:bg-muted/50"
                  )}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Lock size={18} className={durationMode === 'fixed' ? "text-primary" : "text-muted-foreground"} />
                    <span className="font-medium text-foreground">固定时长</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    强制锁定每个分段的秒数
                  </p>
                </button>
              </div>
            </div>
          )}

          {/* Selected Template Info */}
          {sourceMode === 'template' && selectedTemplate && (
            <div className="space-y-3">
              <label className="text-sm font-medium text-foreground">已选模板</label>
              <div className={cn(
                "p-4 rounded-xl flex items-center justify-between",
                selectedTemplate.color.replace('100', '50')
              )} style={{ backgroundColor: `var(--${selectedTemplate.color.replace('bg-', '').replace('-100', '')}-50, hsl(var(--muted)))` }}>
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center",
                    selectedTemplate.color
                  )}>
                    <FileText size={18} className="text-foreground/70" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{selectedTemplate.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {selectedTemplate.segments} 个分段 · {selectedTemplate.duration}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
                  onClick={handleClearTemplate}
                >
                  <X size={16} />
                </Button>
              </div>
            </div>
          )}

          {/* Prompt to select template */}
          {sourceMode === 'template' && !selectedTemplate && (
            <div className="p-4 rounded-xl border-2 border-dashed border-primary/30 bg-primary/5">
              <p className="text-sm text-muted-foreground text-center">
                👉 请在右侧模板库中选择一个模板
              </p>
            </div>
          )}
        </div>

        {/* Sticky Bottom Action */}
        <div className="p-6 border-t border-border bg-card">
          <Button
            onClick={handleCreateTask}
            className="w-full h-12 text-base font-medium bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
          >
            <Rocket size={18} />
            立即创建任务
          </Button>
        </div>
      </div>

      {/* Right Panel - Resource Pool */}
      <div className="flex-1 flex flex-col bg-slate-50 dark:bg-muted/30 overflow-hidden">
        {/* Sticky Header */}
        <div className="p-4 border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-10">
          <div className="flex items-center justify-between gap-4">
            {/* Tabs */}
            <div className="flex gap-1 p-1 bg-muted rounded-lg">
              <button
                onClick={() => setTemplateTab('team')}
                className={cn(
                  "px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center gap-2",
                  templateTab === 'team'
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Building2 size={16} />
                团队公共库
              </button>
              <button
                onClick={() => setTemplateTab('personal')}
                className={cn(
                  "px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center gap-2",
                  templateTab === 'personal'
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <User size={16} />
                个人专用库
              </button>
            </div>

            {/* Search */}
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="搜索模板..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-10"
              />
            </div>
          </div>
        </div>

        {/* Template Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          {filteredTemplates.length > 0 ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredTemplates.map((template) => {
                const isSelected = selectedTemplate?.id === template.id;
                return (
                  <button
                    key={template.id}
                    onClick={() => handleSelectTemplate(template)}
                    className={cn(
                      "group relative bg-card rounded-xl border-2 overflow-hidden text-left transition-all duration-200 hover:shadow-lg",
                      isSelected
                        ? "border-primary shadow-md"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    {/* Selected Check */}
                    {isSelected && (
                      <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-primary flex items-center justify-center z-10">
                        <Check size={14} className="text-primary-foreground" />
                      </div>
                    )}

                    {/* Color Header */}
                    <div className={cn(
                      "h-20 flex items-center justify-center relative",
                      template.color
                    )}>
                      <Badge variant="secondary" className="bg-white/80 text-foreground gap-1">
                        <Clock size={12} />
                        {template.duration}
                      </Badge>
                    </div>

                    {/* Content */}
                    <div className="p-4 space-y-3">
                      <h3 className="font-semibold text-foreground line-clamp-1">
                        {template.title}
                      </h3>
                      
                      {/* Tags */}
                      <div className="flex flex-wrap gap-1.5">
                        {template.tags.map((tag, idx) => (
                          <Badge 
                            key={idx} 
                            variant="outline" 
                            className="text-xs px-2 py-0.5 text-muted-foreground"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>

                      {/* Segments Info */}
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Layers size={12} />
                        <span>{template.segments} 个分段</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                  <FileText size={24} className="text-muted-foreground" />
                </div>
                <p className="text-muted-foreground">
                  {searchQuery ? '未找到匹配的模板' : '暂无模板'}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StartCreation;
