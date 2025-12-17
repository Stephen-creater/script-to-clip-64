import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Play,
  Clock,
  Layers,
  FileText
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
}

const TemplateManagement = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');

  // Demo templates
  const [templates] = useState<Template[]>([
    {
      id: '1',
      name: '产品展示模板',
      description: '适合产品介绍类视频，包含开场、特点展示、总结三个部分',
      segmentsCount: 5,
      duration: 60,
      category: '产品',
      createdAt: '2024-12-15'
    },
    {
      id: '2',
      name: '旅行Vlog模板',
      description: '旅行记录类视频模板，包含目的地介绍、行程安排、精彩瞬间',
      segmentsCount: 8,
      duration: 120,
      category: '旅行',
      createdAt: '2024-12-10'
    },
    {
      id: '3',
      name: '教程讲解模板',
      description: '适合教学类视频，包含问题引入、步骤讲解、总结回顾',
      segmentsCount: 6,
      duration: 90,
      category: '教程',
      createdAt: '2024-12-08'
    }
  ]);

  // Filter templates
  const filteredTemplates = templates.filter(template =>
    template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    template.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}秒`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return secs > 0 ? `${mins}分${secs}秒` : `${mins}分钟`;
  };

  const handleUseTemplate = (templateId: string) => {
    navigate(`/editor/new?template=${templateId}`);
    toast({
      title: "模板已应用",
      description: "正在基于模板创建新任务"
    });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto min-h-full">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-display bg-gradient-primary bg-clip-text text-transparent">
          模板管理
        </h1>
        <p className="text-body-small text-muted-foreground mt-1">在这里使用优秀剪辑模板</p>
      </div>

      {/* Search */}
      <div className="relative max-w-md mb-6">
        <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
        <Input 
          placeholder="搜索模板..." 
          className="pl-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Template Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((template) => (
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
      {filteredTemplates.length === 0 && (
        <div className="text-center py-12">
          <div className="text-muted-foreground mb-4">
            <FileText size={48} className="mx-auto mb-4 opacity-50" />
            <p className="text-heading-3">暂无模板</p>
            <p className="text-body-small">
              {searchTerm ? '没有找到匹配的模板' : '还没有可用的模板'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default TemplateManagement;
