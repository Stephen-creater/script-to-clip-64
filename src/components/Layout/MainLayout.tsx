import { useState, useRef, useEffect } from "react";
import { Outlet, useLocation, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { 
  Video, 
  FolderOpen, 
  Settings, 
  Play,
  Download,
  Save,
  Menu,
  X,
  Film,
  ArrowLeft,
  Edit2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ExportVideoModal } from "@/components/Editor/ExportVideoModal";
import { useProjects } from "@/hooks/useProjects";

const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [projectName, setProjectName] = useState(""); // Will be set based on creation type
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempProjectName, setTempProjectName] = useState("");
  const [configuration, setConfiguration] = useState({
    isAudioGenerated: false,
    isGlobalSubtitleConfigured: false,
    isBgmConfigured: false,
  });
  const location = useLocation();
  const inputRef = useRef<HTMLInputElement>(null);
  const { projects } = useProjects();
  const { toast } = useToast();

  // Set default project name based on creation type
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const templateId = urlParams.get('template');
    
    if (templateId && projects.length > 0) {
      // From template creation - find template name and add "副本"
      const template = projects.find(p => p.id === templateId);
      if (template) {
        setProjectName(`${template.name}副本`);
      } else {
        setProjectName("模板副本");
      }
    } else if (location.pathname.includes('editor')) {
      // From blank creation or existing project
      const pathSegments = location.pathname.split('/');
      if (pathSegments[2] === 'new' || !projectName) {
        setProjectName("请命名");
      }
    }
  }, [location, projects]);

  // Update tempProjectName when projectName changes
  useEffect(() => {
    setTempProjectName(projectName);
  }, [projectName]);

  const navigation = [
    { name: "项目库", href: "/", icon: FolderOpen },
    { name: "素材库", href: "/materials", icon: Video },
    { name: "成片库", href: "/video-library", icon: Film },
    { name: "设置", href: "/settings", icon: Settings },
  ];

  const isEditor = location.pathname.startsWith('/editor');

  const handleConfigurationChange = (config: {
    isAudioGenerated: boolean;
    isGlobalSubtitleConfigured: boolean;
    isBgmConfigured: boolean;
  }) => {
    setConfiguration(config);
  };

  const handleExportClick = () => {
    const missingConfigs = [];
    
    if (!configuration.isAudioGenerated) {
      missingConfigs.push("一键生成音频");
    }
    if (!configuration.isGlobalSubtitleConfigured) {
      missingConfigs.push("字幕全局设置");
    }
    if (!configuration.isBgmConfigured) {
      missingConfigs.push("BGM配乐");
    }
    
    if (missingConfigs.length > 0) {
      toast({
        title: "配置未完成",
        description: `请先完成以下配置：${missingConfigs.join("、")}`,
        variant: "destructive"
      });
      return;
    }
    
    // All configurations are complete, proceed with export
    setExportModalOpen(true);
  };

  const handleTitleClick = () => {
    setIsEditingTitle(true);
    setTempProjectName(projectName);
  };

  const handleTitleSave = () => {
    if (tempProjectName.trim()) {
      setProjectName(tempProjectName.trim());
    }
    setIsEditingTitle(false);
  };

  const handleTitleCancel = () => {
    setTempProjectName(projectName);
    setIsEditingTitle(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleTitleSave();
    } else if (e.key === 'Escape') {
      handleTitleCancel();
    }
  };

  // Focus input when editing starts
  useEffect(() => {
    if (isEditingTitle && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditingTitle]);

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className={cn(
        "bg-sidebar border-r border-sidebar-border transition-all duration-300",
        sidebarOpen ? "w-64" : "w-16"
      )}>
        <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
          <h1 className={cn(
            "text-xl font-bold bg-gradient-primary bg-clip-text text-transparent transition-opacity",
            sidebarOpen ? "opacity-100" : "opacity-0"
          )}>
            智能混剪平台
          </h1>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-sidebar-foreground hover:bg-sidebar-accent"
          >
            {sidebarOpen ? <X size={16} /> : <Menu size={16} />}
          </Button>
        </div>

        <nav className="p-4 space-y-2">
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                location.pathname === item.href
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50"
              )}
            >
              <item.icon size={20} />
              {sidebarOpen && <span>{item.name}</span>}
            </Link>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Header */}
        {isEditor && (
          <div className="bg-card border-b border-border px-6 py-3 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-4">
              {isEditingTitle ? (
                <div className="flex items-center gap-2">
                  <Input
                    ref={inputRef}
                    value={tempProjectName}
                    onChange={(e) => setTempProjectName(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onBlur={handleTitleSave}
                    className="text-lg font-semibold bg-background"
                    style={{ width: Math.max(tempProjectName.length * 12, 120) + 'px' }}
                  />
                </div>
              ) : (
                <div 
                  className="flex items-center gap-2 cursor-pointer hover:bg-accent/50 px-2 py-1 rounded group"
                  onClick={handleTitleClick}
                >
                  <h2 className="text-lg font-semibold text-foreground">{projectName}</h2>
                  <Edit2 size={14} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              )}
              <Button variant="outline" size="sm">
                <Save size={16} className="mr-2" />
                保存
              </Button>
              <Link to="/">
                <Button variant="outline" size="sm">
                  <ArrowLeft size={16} className="mr-2" />
                  返回
                </Button>
              </Link>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant={previewOpen ? "default" : "outline"} 
                size="sm"
                onClick={() => setPreviewOpen(!previewOpen)}
              >
                <Play size={16} className="mr-2" />
                预览
              </Button>
              <Button size="sm" className="bg-gradient-primary" onClick={handleExportClick}>
                <Download size={16} className="mr-2" />
                导出视频
              </Button>
            </div>
          </div>
        )}

        {/* Content Area */}
        <div className="flex-1 overflow-auto min-h-0">
          <Outlet context={{ previewOpen, onConfigurationChange: handleConfigurationChange }} />
        </div>
      </div>

      {/* Export Video Modal */}
      <ExportVideoModal 
        isOpen={exportModalOpen} 
        onClose={() => setExportModalOpen(false)} 
      />
    </div>
  );
};

export default MainLayout;