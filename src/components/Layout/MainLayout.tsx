import { useState, useRef, useEffect } from "react";
import { Outlet, useLocation, Link, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { 
  Video, 
  FolderOpen, 
  Play,
  Download,
  Save,
  Menu,
  X,
  Film,
  ArrowLeft,
  Edit2,
  ListTodo,
  FileText,
  Scissors,
  ChevronDown,
  ChevronRight
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
  const [materialSubMenuOpen, setMaterialSubMenuOpen] = useState(true);
  const [configuration, setConfiguration] = useState({
    isAudioGenerated: false,
    isGlobalSubtitleConfigured: false,
    isBgmConfigured: false,
  });
  const location = useLocation();
  const inputRef = useRef<HTMLInputElement>(null);
  const { projects } = useProjects();
  const { toast } = useToast();
  
  // 从URL路径中提取项目ID
  const projectId = location.pathname.match(/\/editor\/(\d+)/)?.[1];

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

  // Navigation structure with sub-items
  const navigation = [
    { 
      name: "素材管理", 
      subtitle: "素材上传和初剪",
      icon: Video,
      hasSubItems: true,
      subItems: [
        { name: "素材预处理", href: "/material-preprocessing", icon: Scissors },
        { name: "素材库", href: "/materials", icon: FolderOpen },
      ]
    },
    { name: "任务管理", subtitle: "从这里创建混剪任务", href: "/", icon: ListTodo },
    { name: "模板管理", subtitle: "在这里使用优秀剪辑模板", href: "/templates", icon: FileText },
    { name: "成片管理", subtitle: "从这里看成片", href: "/video-library", icon: Film },
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
        "bg-sidebar border-r border-sidebar-border transition-all duration-300 ease-in-out",
        sidebarOpen ? "w-64" : "w-20"
      )}>
        <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
          <h1 className={cn(
            "text-heading-2 bg-gradient-primary bg-clip-text text-transparent transition-opacity duration-300",
            sidebarOpen ? "opacity-100" : "opacity-0 w-0"
          )}>
            智能混剪平台
          </h1>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-sidebar-foreground hover:bg-sidebar-accent transition-transform duration-200 hover:scale-110"
          >
            {sidebarOpen ? <X size={16} /> : <Menu size={16} />}
          </Button>
        </div>

        <nav className="p-4 space-y-2">
          {navigation.map((item) => {
            // Check if this item or any of its sub-items is active
            const isActive = item.href ? location.pathname === item.href : false;
            const hasActiveSubItem = item.subItems?.some(sub => location.pathname === sub.href);

            if (item.hasSubItems && item.subItems) {
              return (
                <div key={item.name}>
                  {/* Parent item with sub-menu */}
                  <button
                    onClick={() => setMaterialSubMenuOpen(!materialSubMenuOpen)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200",
                      hasActiveSubItem
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                    )}
                    title={!sidebarOpen ? item.name : undefined}
                  >
                    <item.icon size={20} className="flex-shrink-0" />
                    <div className={cn(
                      "flex-1 text-left transition-all duration-300",
                      sidebarOpen ? "opacity-100" : "opacity-0 w-0 overflow-hidden"
                    )}>
                      <div>{item.name}</div>
                      {item.subtitle && (
                        <div className="text-xs text-muted-foreground font-normal">{item.subtitle}</div>
                      )}
                    </div>
                    {sidebarOpen && (
                      materialSubMenuOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />
                    )}
                  </button>
                  
                  {/* Sub-items */}
                  {materialSubMenuOpen && sidebarOpen && (
                    <div className="ml-6 mt-1 space-y-1">
                      {item.subItems.map((subItem) => {
                        const subIsActive = location.pathname === subItem.href;
                        return (
                          <Link
                            key={subItem.name}
                            to={subItem.href}
                            className={cn(
                              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200",
                              subIsActive
                                ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                                : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                            )}
                          >
                            <subItem.icon size={16} className="flex-shrink-0" />
                            <span>{subItem.name}</span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <Link
                key={item.name}
                to={item.href!}
                className={cn(
                  "flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                )}
                title={!sidebarOpen ? item.name : undefined}
              >
                <item.icon size={20} className="flex-shrink-0" />
                <div className={cn(
                  "transition-all duration-300",
                  sidebarOpen ? "opacity-100 w-auto" : "opacity-0 w-0 overflow-hidden"
                )}>
                  <div>{item.name}</div>
                  {item.subtitle && sidebarOpen && (
                    <div className="text-xs text-muted-foreground font-normal">{item.subtitle}</div>
                  )}
                </div>
              </Link>
            );
          })}
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
                  <h2 className="text-heading-3 text-foreground">{projectName}</h2>
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
                合成视频
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
        projectId={projectId || ''}
        exportPath=""
        quantity={1}
      />
    </div>
  );
};

export default MainLayout;