import { useState } from "react";
import { Outlet, useLocation, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
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
  ArrowLeft
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ExportVideoModal } from "@/components/Editor/ExportVideoModal";

const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [configuration, setConfiguration] = useState({
    isAudioGenerated: false,
    isGlobalSubtitleConfigured: false,
    isBgmConfigured: false,
  });
  const location = useLocation();

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
    if (!configuration.isAudioGenerated) {
      alert("请先生成音频");
      return;
    }
    if (!configuration.isGlobalSubtitleConfigured) {
      alert("请先配置字幕全局设置");
      return;
    }
    if (!configuration.isBgmConfigured) {
      alert("请先配置BGM配乐");
      return;
    }
    
    // All configurations are complete, proceed with export
    setExportModalOpen(true);
  };

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
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        {isEditor && (
          <div className="bg-card border-b border-border px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h2 className="text-lg font-semibold text-foreground">西班牙-脚本1</h2>
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
        <div className="flex-1 overflow-hidden">
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