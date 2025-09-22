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
  FileText
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Project {
  id: string;
  name: string;
  thumbnail: string;
  duration: string;
  segments: number;
  status: 'draft' | 'completed' | 'processing';
  lastModified: string;
  template?: boolean;
}

const ProjectLibrary = () => {
  const navigate = useNavigate();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);

  const [projects, setProjects] = useState<Project[]>([
    {
      id: '1',
      name: '西班牙火车旅行',
      thumbnail: '/placeholder.svg',
      duration: '45.6s',
      segments: 5,
      status: 'completed',
      lastModified: '2024-01-15 14:30'
    },
    {
      id: '2',
      name: '产品介绍视频',
      thumbnail: '/placeholder.svg',
      duration: '32.4s',
      segments: 4,
      status: 'draft',
      lastModified: '2024-01-14 16:45'
    },
    {
      id: '3',
      name: '品牌宣传片',
      thumbnail: '/placeholder.svg',
      duration: '58.2s',
      segments: 6,
      status: 'processing',
      lastModified: '2024-01-13 09:20'
    },
    {
      id: '4',
      name: '教程视频模板',
      thumbnail: '/placeholder.svg',
      duration: '40.0s',
      segments: 4,
      status: 'completed',
      lastModified: '2024-01-12 11:15',
      template: true
    }
  ]);

  const templates = [
    { id: 't1', name: '产品介绍模板', segments: 4, description: '适合产品特性介绍的节奏结构' },
    { id: 't2', name: '教程讲解模板', segments: 6, description: '步骤清晰的教学视频结构' },
    { id: 't3', name: '营销推广模板', segments: 5, description: '吸引眼球的营销视频节奏' },
  ];

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

  const handleCreateProject = (type: 'blank' | 'template') => {
    if (type === 'template') {
      setTemplateDialogOpen(true);
    } else {
      navigate('/editor/new');
    }
    setCreateDialogOpen(false);
  };

  const handleSelectTemplate = (templateId: string) => {
    navigate(`/editor/new?template=${templateId}`);
    setTemplateDialogOpen(false);
  };

  const handleCopyProject = (projectId: string) => {
    const originalProject = projects.find(p => p.id === projectId);
    if (originalProject) {
      const now = new Date();
      const timestamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      
      const newProject: Project = {
        ...originalProject,
        id: Date.now().toString(), // Generate unique ID
        name: `${originalProject.name}副本`,
        lastModified: timestamp, // Today's date with time
        status: 'draft' // New copy starts as draft
      };
      
      // Add the new project at the beginning of the list
      setProjects(prev => [newProject, ...prev]);
    }
  };

  const handleDeleteProject = (projectId: string) => {
    if (confirm('确定要删除这个项目吗？此操作无法撤销。')) {
      setProjects(prev => prev.filter(p => p.id !== projectId));
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            项目库
          </h1>
          <p className="text-muted-foreground mt-2">管理您的视频项目和模板</p>
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
          />
        </div>
        
        <Select defaultValue="all">
          <SelectTrigger className="w-40">
            <Filter size={16} className="mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部项目</SelectItem>
            <SelectItem value="completed">已完成</SelectItem>
            <SelectItem value="draft">草稿</SelectItem>
            <SelectItem value="template">模板</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {projects.map((project) => (
          <Card key={project.id} className="hover:shadow-card transition-all group">
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
                {project.template && (
                  <Badge className="absolute top-2 right-2 bg-primary">模板</Badge>
                )}
              </div>
            </CardHeader>
            
            <CardContent className="p-4">
              <CardTitle className="text-base font-semibold truncate mb-2">
                {project.name}
              </CardTitle>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock size={14} />
                    <span>{project.duration}</span>
                  </div>
                  <span>{project.segments} 分段</span>
                </div>
                
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Calendar size={14} />
                  <span>{project.lastModified}</span>
                </div>
                
                {getStatusBadge(project.status)}
              </div>
            </CardContent>

            <CardFooter className="p-4 pt-0">
              <div className="flex gap-2 w-full">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => handleCopyProject(project.id)}
                >
                  <Copy size={14} className="mr-1" />
                  复制
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                  onClick={() => handleDeleteProject(project.id)}
                >
                  <Trash2 size={14} />
                </Button>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>

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
                        {template.description}
                      </p>
                    </div>
                    <Badge variant="outline">
                      {template.segments} 分段
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