import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Zap, 
  FileText, 
  Rocket, 
  Clock, 
  Lock, 
  Search,
  Building2,
  User,
  Check,
  Layers,
  Sparkles,
  Info,
  Image
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Template {
  id: number;
  title: string;
  type: 'team' | 'personal';
  durationMode: 'flexible' | 'fixed';
  duration: string;
  segments: number;
  tags: string[];
  color: string;
}

const TEMPLATES: Template[] = [
  { id: 1, title: '带货混剪_快节奏', type: 'team', durationMode: 'fixed', duration: '15s', segments: 5, tags: ['高转化', '快闪'], color: 'bg-orange-100' },
  { id: 2, title: '风景Vlog_舒缓', type: 'team', durationMode: 'flexible', duration: '30s', segments: 3, tags: ['卡点', '空镜'], color: 'bg-emerald-100' },
  { id: 3, title: '口播_知识科普', type: 'team', durationMode: 'flexible', duration: '60s', segments: 8, tags: ['字幕大', '安全区'], color: 'bg-blue-100' },
  { id: 4, title: '我的专用_英铁', type: 'personal', durationMode: 'fixed', duration: '20s', segments: 4, tags: ['个人'], color: 'bg-purple-100' },
  { id: 5, title: '产品展示_简约', type: 'team', durationMode: 'flexible', duration: '45s', segments: 6, tags: ['简约', '产品'], color: 'bg-pink-100' },
  { id: 6, title: '剧情短片_悬疑', type: 'team', durationMode: 'fixed', duration: '90s', segments: 10, tags: ['剧情', '悬疑'], color: 'bg-indigo-100' },
];

const StartCreation: React.FC = () => {
  const navigate = useNavigate();
  
  // Form state
  const [taskName, setTaskName] = useState('');
  const [durationMode, setDurationMode] = useState<'flexible' | 'fixed'>('flexible');
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  
  // Template modal state
  const [templateModalOpen, setTemplateModalOpen] = useState(false);
  const [templateTab, setTemplateTab] = useState<'team' | 'personal'>('team');
  const [searchQuery, setSearchQuery] = useState('');
  const [tempSelectedTemplate, setTempSelectedTemplate] = useState<Template | null>(null);

  const filteredTemplates = useMemo(() => {
    return TEMPLATES.filter(template => {
      const matchesTab = template.type === templateTab;
      const matchesSearch = template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesTab && matchesSearch;
    });
  }, [templateTab, searchQuery]);

  const handleOpenTemplateModal = () => {
    setTempSelectedTemplate(selectedTemplate);
    setTemplateModalOpen(true);
  };

  const handleConfirmTemplate = () => {
    if (tempSelectedTemplate) {
      setSelectedTemplate(tempSelectedTemplate);
      setDurationMode(tempSelectedTemplate.durationMode);
      setTaskName(tempSelectedTemplate.title + '_副本');
      toast.success(`已引用模板: ${tempSelectedTemplate.title}`);
    }
    setTemplateModalOpen(false);
  };

  const handleClearTemplate = () => {
    setSelectedTemplate(null);
  };

  const handleCreateTask = () => {
    if (!taskName.trim()) {
      toast.error("请输入任务名称");
      return;
    }
    
    toast.success("任务创建成功！");
    const params = new URLSearchParams({
      taskName: taskName.trim(),
      durationMode
    });
    if (selectedTemplate?.id) {
      params.set('templateId', selectedTemplate.id.toString());
    }
    navigate(`/editor?${params.toString()}`);
  };

  return (
    <div className="h-screen flex flex-row overflow-hidden bg-background">
      {/* Left Panel - Configuration Console */}
      <div className="w-[420px] flex-shrink-0 bg-card border-r border-border shadow-xl z-10 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Zap className="w-5 h-5 text-primary" />
              </div>
              <h1 className="text-2xl font-bold text-foreground">开始创作</h1>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={handleOpenTemplateModal}
            >
              <FileText size={14} />
              引用模板
            </Button>
          </div>
          <p className="text-muted-foreground text-sm">配置参数，一键启动流水线</p>
        </div>

        {/* Mode Switcher - Segmented Control */}
        <div className="px-6 py-4 border-b border-border">
          <div className="flex p-1 bg-muted rounded-lg">
            <button
              onClick={() => setDurationMode('flexible')}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-md text-sm font-medium transition-all duration-300",
                durationMode === 'flexible'
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Sparkles size={16} className={durationMode === 'flexible' ? "text-blue-500" : ""} />
              灵活时长
            </button>
            <button
              onClick={() => setDurationMode('fixed')}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-md text-sm font-medium transition-all duration-300",
                durationMode === 'fixed'
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Clock size={16} className={durationMode === 'fixed' ? "text-orange-500" : ""} />
              固定时长
            </button>
          </div>
        </div>

        {/* Scrollable Form Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Info Banner */}
          <div className={cn(
            "p-3 rounded-lg flex items-start gap-3 transition-all duration-300",
            durationMode === 'flexible' 
              ? "bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800" 
              : "bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800"
          )}>
            <Info size={16} className={cn(
              "mt-0.5 flex-shrink-0",
              durationMode === 'flexible' ? "text-blue-500" : "text-orange-500"
            )} />
            <p className={cn(
              "text-sm",
              durationMode === 'flexible' ? "text-blue-700 dark:text-blue-300" : "text-orange-700 dark:text-orange-300"
            )}>
              {durationMode === 'flexible' 
                ? "画面将跟随口播长度自动伸缩，适合内容驱动型视频"
                : "画面将强制锁定为预设时长，适合节奏感强的剪辑"
              }
            </p>
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

          {/* Selected Template Info */}
          {selectedTemplate && (
            <div className="space-y-3">
              <label className="text-sm font-medium text-foreground">已引用模板</label>
              <div className="p-4 rounded-xl bg-muted/50 border border-border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center",
                      selectedTemplate.color
                    )}>
                      <FileText size={18} className="text-foreground/70" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{selectedTemplate.title}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{selectedTemplate.segments} 个分段</span>
                        <span>·</span>
                        <Badge variant="outline" className="text-xs px-1.5 py-0">
                          {selectedTemplate.durationMode === 'flexible' ? '灵活' : '固定'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-destructive"
                    onClick={handleClearTemplate}
                  >
                    清除
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Placeholder for additional config options */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-foreground">更多配置</label>
            <div className="p-8 rounded-xl border-2 border-dashed border-border bg-muted/20">
              <p className="text-sm text-muted-foreground text-center">
                其他配置项将在此处显示...
              </p>
            </div>
          </div>
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

      {/* Right Panel - Preview Area */}
      <div className="flex-1 flex flex-col bg-muted/30 overflow-hidden">
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center max-w-md">
            <div className="w-24 h-24 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-6">
              <Image size={40} className="text-muted-foreground/50" />
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">等待配置...</h2>
            <p className="text-muted-foreground">
              完成左侧参数配置后，这里将显示视频分段预览
            </p>
          </div>
        </div>
      </div>

      {/* Template Selection Modal */}
      <Dialog open={templateModalOpen} onOpenChange={setTemplateModalOpen}>
        <DialogContent className="max-w-5xl h-[80vh] flex flex-col p-0">
          <DialogHeader className="p-6 pb-4 border-b border-border flex-shrink-0">
            <DialogTitle className="text-xl">选择模板</DialogTitle>
            <div className="flex items-center justify-between gap-4 mt-4">
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
          </DialogHeader>

          {/* Template Grid */}
          <div className="flex-1 overflow-y-auto p-6">
            {filteredTemplates.length > 0 ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredTemplates.map((template) => {
                  const isSelected = tempSelectedTemplate?.id === template.id;
                  return (
                    <button
                      key={template.id}
                      onClick={() => setTempSelectedTemplate(template)}
                      className={cn(
                        "group relative bg-card rounded-xl border-2 overflow-hidden text-left transition-all duration-200 hover:shadow-lg",
                        isSelected
                          ? "border-primary shadow-md ring-2 ring-primary/20"
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
                        "h-20 flex items-center justify-center gap-2 relative",
                        template.color
                      )}>
                        <Badge variant="secondary" className="bg-white/80 text-foreground gap-1">
                          {template.durationMode === 'flexible' ? <Sparkles size={12} /> : <Lock size={12} />}
                          {template.durationMode === 'flexible' ? '灵活' : '固定'}
                        </Badge>
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

          {/* Modal Footer */}
          <div className="p-4 border-t border-border bg-muted/30 flex items-center justify-between flex-shrink-0">
            <div className="text-sm text-muted-foreground">
              {tempSelectedTemplate ? (
                <span>已选择: <span className="font-medium text-foreground">{tempSelectedTemplate.title}</span></span>
              ) : (
                <span>请选择一个模板</span>
              )}
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setTemplateModalOpen(false)}>
                取消
              </Button>
              <Button 
                onClick={handleConfirmTemplate}
                disabled={!tempSelectedTemplate}
                className="gap-2"
              >
                <Check size={16} />
                确认选择
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StartCreation;
