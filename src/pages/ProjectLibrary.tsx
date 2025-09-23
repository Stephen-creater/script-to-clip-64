import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Plus, 
  Search, 
  Filter,
  Play,
  Copy,
  Trash2,
  Calendar,
  Clock,
  Video,
  FileText,
  Star
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useProjects } from "@/hooks/useProjects";

const ProjectLibrary = () => {
  const navigate = useNavigate();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const { 
    projects, 
    loading, 
    createProject, 
    deleteProject, 
    copyProject, 
    toggleTemplate,
    isSupabaseConfigured 
  } = useProjects();

  const templates = projects.filter(p => p.is_template);

  // Filter projects based on selected filter
  const filteredProjects = projects.filter(project => {
    // Apply status filter
    let matchesFilter = true;
    switch (filterStatus) {
      case 'completed':
        matchesFilter = project.status === 'completed';
        break;
      case 'draft':
        matchesFilter = project.status === 'draft';
        break;
      case 'processing':
        matchesFilter = project.status === 'processing';
        break;
      case 'template':
        matchesFilter = project.is_template === true;
        break;
      default:
        matchesFilter = true; // Show all projects
    }

    // Apply search filter
    if (searchTerm && matchesFilter) {
      matchesFilter = project.name.toLowerCase().includes(searchTerm.toLowerCase());
    }

    return matchesFilter;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default" className="bg-green-500">已完成</Badge>;
      case 'draft':
        return <Badge variant="secondary">草稿</Badge>;
      case 'processing':
        return <Badge variant="outline" className="border-yellow-500 text-yellow-600">处理中</Badge>;
      default:
        return null;
    }
  };

  const handleCreateProject = async (type: 'blank' | 'template') => {
    if (type === 'template') {
      setTemplateDialogOpen(true);
    } else {
      try {
        const newProject = await createProject({
          name: '新项目',
          status: 'draft',
          duration: 0,
          segments_count: 0,
          is_template: false,
          data: { segments: [] }
        });
        navigate(`/editor/${newProject.id}`);
      } catch (error) {
        console.error('Failed to create project:', error);
      }
    }
    setCreateDialogOpen(false);
  };

  const handleSelectTemplate = (templateId: string) => {
    navigate(`/editor/new?template=${templateId}`);
    setTemplateDialogOpen(false);
  };

  const handleCopyProject = async (projectId: string) => {
    await copyProject(projectId);
  };

  const handleDeleteProject = async (projectId: string) => {
    if (confirm('确定要删除这个项目吗？此操作无法撤销。')) {
      await deleteProject(projectId);
    }
  };

  const handleSaveAsTemplate = async (projectId: string) => {
    await toggleTemplate(projectId);
  };

  const formatDuration = (seconds: number) => {
    if (seconds === 0) return '0s';
    return `${seconds.toFixed(1)}s`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              项目库
            </h1>
            <div className="flex items-center gap-2 mt-2">
              <p className="text-muted-foreground">管理您的视频项目和模板</p>
              <Badge variant="outline" className="text-orange-600 border-orange-200 bg-orange-50">
                演示模式 - 数据不会保存
              </Badge>
            </div>
          </div>

        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary shadow-tech">
              <Plus size={16} className="mr-2" />
              创建新项目
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>创建新项目</DialogTitle>
              <DialogDescription>
                选择创建项目的方式
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
              <Card 
                className="cursor-pointer hover:shadow-tech transition-all border-2 hover:border-primary"
                onClick={() => handleCreateProject('blank')}
              >
                <CardHeader className="text-center">
                  <Video size={48} className="mx-auto mb-2 text-primary" />
                  <CardTitle className="text-lg">从空白创建</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground text-center">
                    从零开始创建全新的视频项目
                  </p>
                </CardContent>
              </Card>

              <Card 
                className="cursor-pointer hover:shadow-tech transition-all border-2 hover:border-primary"
                onClick={() => handleCreateProject('template')}
              >
                <CardHeader className="text-center">
                  <FileText size={48} className="mx-auto mb-2 text-primary" />
                  <CardTitle className="text-lg">从模板创建</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground text-center">
                    使用预设的节奏结构快速开始
                  </p>
                </CardContent>
              </Card>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filter */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <Input 
            placeholder="搜索项目..." 
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <Select defaultValue="all" onValueChange={setFilterStatus}>
          <SelectTrigger className="w-40">
            <Filter size={16} className="mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部项目</SelectItem>
            <SelectItem value="completed">已完成</SelectItem>
            <SelectItem value="draft">草稿</SelectItem>
            <SelectItem value="processing">处理中</SelectItem>
            <SelectItem value="template">模板</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>加载项目库...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Projects Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProjects.map((project) => (
          <Card key={project.id} className="hover:shadow-card transition-all group flex flex-col">
            <CardHeader className="p-0">
              <div className="relative">
                <div className="aspect-video bg-muted rounded-t-lg flex items-center justify-center">
                  <Video size={32} className="text-muted-foreground" />
                </div>
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-t-lg flex items-center justify-center">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => navigate(`/editor/${project.id}`)}
                  >
                    <Play size={16} className="mr-2" />
                    编辑
                  </Button>
                </div>
                {project.is_template && (
                  <Badge className="absolute top-2 right-2 bg-primary">模板</Badge>
                )}
              </div>
            </CardHeader>
            
            <CardContent className="p-4 flex-1">
              <CardTitle className="text-base font-semibold truncate mb-2">
                {project.name}
              </CardTitle>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock size={14} />
                    <span>{formatDuration(project.duration)}</span>
                  </div>
                  <span>{project.segments_count} 分段</span>
                </div>
                
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Calendar size={14} />
                  <span>{formatDate(project.updated_at)}</span>
                </div>
                
                {getStatusBadge(project.status)}
              </div>
            </CardContent>

            <CardFooter className="p-4 pt-0 mt-auto">
              <div className="flex gap-1 w-full">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1 text-xs"
                  onClick={() => handleCopyProject(project.id)}
                >
                  <Copy size={12} className="mr-1" />
                  复制
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1 text-xs"
                  onClick={() => handleSaveAsTemplate(project.id)}
                >
                  <Star size={12} className="mr-1" />
                  存为模板
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1 text-xs text-destructive hover:bg-destructive hover:text-destructive-foreground"
                  onClick={() => handleDeleteProject(project.id)}
                >
                  <Trash2 size={12} className="mr-1" />
                  删除
                </Button>
              </div>
            </CardFooter>
            </Card>
            ))}
          </div>

          {/* Empty State */}
          {filteredProjects.length === 0 && !loading && (
            <div className="text-center py-12">
              <div className="text-muted-foreground mb-4">
                <Video size={48} className="mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">暂无项目</p>
                <p className="text-sm">
                  {searchTerm ? '没有找到匹配的项目' : '创建您的第一个视频项目吧'}
                </p>
              </div>
            </div>
          )}
        </>
      )}

      {/* Template Selection Dialog */}
      <Dialog open={templateDialogOpen} onOpenChange={setTemplateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>选择模板</DialogTitle>
            <DialogDescription>
              选择一个节奏模板来快速创建新项目
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {templates.map((template) => (
              <Card 
                key={template.id}
                className="cursor-pointer hover:shadow-tech transition-all border-2 hover:border-primary"
                onClick={() => handleSelectTemplate(template.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{template.name}</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        时长: {formatDuration(template.duration)} • 最后修改: {formatDate(template.updated_at)}
                      </p>
                    </div>
                    <Badge variant="outline">
                      {template.segments_count} 分段
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTemplateDialogOpen(false)}>
              取消
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </div>
    );
  };

  export default ProjectLibrary;