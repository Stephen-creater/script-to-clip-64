import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Search, 
  Play, 
  Download, 
  MoreHorizontal,
  Calendar,
  Clock
} from "lucide-react";
import FolderSidebar, { FolderItem } from "@/components/FolderManagement/FolderSidebar";

interface VideoItem {
  id: string;
  name: string;
  duration: string;
  size: string;
  createdAt: string;
  thumbnail: string;
}

const VideoLibrary = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFolder, setSelectedFolder] = useState('all');
  const [expandedFolders, setExpandedFolders] = useState<string[]>(['recent']);
  const [folders, setFolders] = useState<FolderItem[]>([
    { id: 'all', name: '全部视频', count: 2 },
    { id: 'recent', name: '最近导出', count: 2, hasChildren: true, children: [
      { id: 'project1', name: '西班牙项目', count: 2, parentId: 'recent' },
      { id: 'project2', name: '法国项目', count: 0, parentId: 'recent' }
    ]},
    { id: 'archived', name: '已归档', count: 0 },
  ]);
  
  const [videos] = useState<VideoItem[]>([
    {
      id: "1",
      name: "西班牙-脚本1_导出版本1",
      duration: "45.6秒",
      size: "12.5MB",
      createdAt: "2024-01-15",
      thumbnail: ""
    },
    {
      id: "2", 
      name: "西班牙-脚本1_导出版本2",
      duration: "43.2秒",
      size: "11.8MB",
      createdAt: "2024-01-14",
      thumbnail: ""
    }
  ]);

  const filteredVideos = videos.filter(video =>
    video.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleFolderCreate = (name: string, parentId?: string) => {
    const newFolder: FolderItem = {
      id: Date.now().toString(),
      name,
      count: 0,
      parentId
    };

    if (parentId) {
      // Add as child folder
      setFolders(prev => prev.map(folder => {
        if (folder.id === parentId) {
          return {
            ...folder,
            hasChildren: true,
            children: [...(folder.children || []), newFolder]
          };
        }
        if (folder.children) {
          return {
            ...folder,
            children: folder.children.map(child => 
              child.id === parentId ? {
                ...child,
                hasChildren: true,
                children: [...(child.children || []), newFolder]
              } : child
            )
          };
        }
        return folder;
      }));
    } else {
      // Add as root folder
      setFolders(prev => [...prev, newFolder]);
    }
  };

  const handleFolderRename = (folderId: string, newName: string) => {
    const updateFolder = (folders: FolderItem[]): FolderItem[] => {
      return folders.map(folder => {
        if (folder.id === folderId) {
          return { ...folder, name: newName };
        }
        if (folder.children) {
          return { ...folder, children: updateFolder(folder.children) };
        }
        return folder;
      });
    };
    setFolders(updateFolder);
  };

  const handleFolderDelete = (folderId: string) => {
    const removeFolder = (folders: FolderItem[]): FolderItem[] => {
      return folders.filter(folder => {
        if (folder.id === folderId) {
          return false;
        }
        if (folder.children) {
          folder.children = removeFolder(folder.children);
        }
        return true;
      });
    };
    setFolders(removeFolder);
    if (selectedFolder === folderId) {
      setSelectedFolder('all');
    }
  };

  const handleFolderToggle = (folderId: string) => {
    if (expandedFolders.includes(folderId)) {
      setExpandedFolders(expandedFolders.filter(id => id !== folderId));
    } else {
      setExpandedFolders([...expandedFolders, folderId]);
    }
  };

  return (
    <div className="flex h-full">
      <FolderSidebar
        folders={folders}
        selectedFolder={selectedFolder}
        expandedFolders={expandedFolders}
        onFolderSelect={setSelectedFolder}
        onFolderToggle={handleFolderToggle}
        onFolderCreate={handleFolderCreate}
        onFolderRename={handleFolderRename}
        onFolderDelete={handleFolderDelete}
        title="视频文件夹"
      />

      <div className="flex-1 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">成片库</h1>
            <p className="text-muted-foreground mt-1">管理您导出的视频文件</p>
          </div>
        </div>

      {/* Search Bar */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
        <Input
          placeholder="搜索视频..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">总视频数</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{videos.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">总大小</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24.3MB</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">本月导出</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
          </CardContent>
        </Card>
      </div>

      {/* Video Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredVideos.map((video) => (
          <Card key={video.id} className="group hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              {/* Video Thumbnail */}
              <div className="aspect-video bg-muted rounded-lg mb-3 flex items-center justify-center relative overflow-hidden">
                <div className="text-muted-foreground">
                  <Play size={32} />
                </div>
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <Button size="sm" variant="secondary">
                    <Play size={16} className="mr-2" />
                    播放
                  </Button>
                </div>
              </div>

              {/* Video Info */}
              <div className="space-y-2">
                <h3 className="font-medium text-sm truncate" title={video.name}>
                  {video.name}
                </h3>
                
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock size={12} />
                    {video.duration}
                  </div>
                  <span>{video.size}</span>
                </div>

                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Calendar size={12} />
                  {video.createdAt}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button size="sm" variant="outline" className="flex-1">
                    <Download size={14} className="mr-1" />
                    下载
                  </Button>
                  <Button size="sm" variant="outline">
                    <MoreHorizontal size={14} />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

        {/* Empty State */}
        {filteredVideos.length === 0 && (
          <div className="text-center py-12">
            <div className="text-muted-foreground mb-2">
              <Play size={48} className="mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">暂无视频文件</p>
              <p className="text-sm">导出您的第一个视频作品吧</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoLibrary;