import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Search, 
  Play, 
  Download, 
  Trash2,
  Calendar,
  Clock,
  MoveRight
} from "lucide-react";
import FolderSidebar, { FolderItem } from "@/components/FolderManagement/FolderSidebar";
import BatchDownloadModal from "@/components/VideoLibrary/BatchDownloadModal";
import BatchMoveModal from "@/components/VideoLibrary/BatchMoveModal";

interface VideoItem {
  id: string;
  name: string;
  duration: string;
  size: string;
  createdAt: string;
  thumbnail: string;
  folderId: string;
}

const VideoLibrary = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFolder, setSelectedFolder] = useState('all');
  const [expandedFolders, setExpandedFolders] = useState<string[]>(['recent']);
  const [selectedVideos, setSelectedVideos] = useState<string[]>([]);
  const [editingVideo, setEditingVideo] = useState<string | null>(null);
  const [tempVideoName, setTempVideoName] = useState('');
  const [batchDownloadModalOpen, setBatchDownloadModalOpen] = useState(false);
  const [batchMoveModalOpen, setBatchMoveModalOpen] = useState(false);
  const [folders, setFolders] = useState<FolderItem[]>([
    { id: 'all', name: '西班牙火车旅行_成片', count: 2 },
    { id: 'recent', name: '最近导出', count: 2, hasChildren: true, children: [
      { id: 'project1', name: '西班牙项目', count: 2, parentId: 'recent' },
      { id: 'project2', name: '法国项目', count: 0, parentId: 'recent' }
    ]}
  ]);
  
  const [videos, setVideos] = useState<VideoItem[]>([
    {
      id: "1",
      name: "西班牙-脚本1_导出版本1",
      duration: "45.6秒",
      size: "12.5MB",
      createdAt: "2024-01-15 14:30",
      thumbnail: "",
      folderId: "project1"
    },
    {
      id: "2", 
      name: "西班牙-脚本1_导出版本2",
      duration: "43.2秒",
      size: "11.8MB",
      createdAt: "2024-01-14 16:45",
      thumbnail: "",
      folderId: "project1"
    }
  ]);

  // Filter videos based on selected folder
  const getFilteredVideos = () => {
    let folderFilteredVideos = videos;
    
    if (selectedFolder !== 'all') {
      if (selectedFolder === 'recent') {
        // Show all videos from recent export subfolders
        folderFilteredVideos = videos.filter(v => ['project1', 'project2'].includes(v.folderId));
      } else {
        // Show videos from specific folder
        folderFilteredVideos = videos.filter(v => v.folderId === selectedFolder);
      }
    }
    
    // Apply search filter
    return folderFilteredVideos.filter(video =>
      video.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const filteredVideos = getFilteredVideos();

  const handleVideoSelect = (videoId: string) => {
    setSelectedVideos(prev => 
      prev.includes(videoId) 
        ? prev.filter(id => id !== videoId)
        : [...prev, videoId]
    );
  };

  const handleSelectAll = () => {
    if (selectedVideos.length === filteredVideos.length) {
      setSelectedVideos([]);
    } else {
      setSelectedVideos(filteredVideos.map(video => video.id));
    }
  };

  const handleBatchDelete = () => {
    // TODO: Implement batch delete logic
    console.log('Delete videos:', selectedVideos);
    setSelectedVideos([]);
  };

  const handleBatchDownload = () => {
    setBatchDownloadModalOpen(true);
  };

  const handleBatchMove = () => {
    setBatchMoveModalOpen(true);
  };

  const handleMoveComplete = (targetFolderId: string) => {
    // Update videos' folderId
    setVideos(prev => prev.map(video => 
      selectedVideos.includes(video.id) 
        ? { ...video, folderId: targetFolderId }
        : video
    ));
    setSelectedVideos([]);
    setBatchMoveModalOpen(false);
  };

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

  const handleStartVideoRename = (videoId: string, currentName: string) => {
    setEditingVideo(videoId);
    setTempVideoName(currentName);
  };

  const handleSaveVideoRename = (videoId: string) => {
    if (tempVideoName.trim() && tempVideoName !== videos.find(v => v.id === videoId)?.name) {
      setVideos(prev => prev.map(video => 
        video.id === videoId ? { ...video, name: tempVideoName.trim() } : video
      ));
    }
    setEditingVideo(null);
    setTempVideoName('');
  };

  const handleCancelVideoRename = () => {
    setEditingVideo(null);
    setTempVideoName('');
  };

  const handleVideoKeyDown = (e: React.KeyboardEvent, videoId: string) => {
    if (e.key === 'Enter') {
      handleSaveVideoRename(videoId);
    } else if (e.key === 'Escape') {
      handleCancelVideoRename();
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
            <h1 className="text-display text-foreground">成片库</h1>
            <p className="text-body-small text-muted-foreground mt-1">管理您导出的视频文件</p>
          </div>
          
          {/* Batch Actions - Top Right */}
          {selectedVideos.length > 0 && (
            <div className="flex items-center gap-2">
              <Button 
                variant="destructive" 
                size="sm"
                onClick={handleBatchDelete}
              >
                <Trash2 size={14} className="mr-1" />
                批量删除
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleBatchMove}
              >
                <MoveRight size={14} className="mr-1" />
                批量移动
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleBatchDownload}
              >
                <Download size={14} className="mr-1" />
                批量下载
              </Button>
            </div>
          )}
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

      {/* Selection Controls */}
      {filteredVideos.length > 0 && (
        <div className="flex items-center justify-start mb-6 p-3 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-3">
            <Checkbox
              checked={selectedVideos.length === filteredVideos.length}
              onCheckedChange={handleSelectAll}
            />
            <span className="text-sm text-muted-foreground">
              {selectedVideos.length > 0 ? `已选择 ${selectedVideos.length} 个视频` : "全选"}
            </span>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-body-small text-muted-foreground">总视频数</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-heading-1">{videos.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-body-small text-muted-foreground">总大小</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-heading-1">24.3MB</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-body-small text-muted-foreground">本月导出</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-heading-1">2</div>
          </CardContent>
        </Card>
      </div>

      {/* Video Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredVideos.map((video) => (
          <Card key={video.id} className="group hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              {/* Checkbox */}
              <div className="flex items-center justify-between mb-3">
                <Checkbox
                  checked={selectedVideos.includes(video.id)}
                  onCheckedChange={() => handleVideoSelect(video.id)}
                />
              </div>

              {/* Video Thumbnail */}
              <div className="aspect-video bg-muted rounded-lg mb-3 flex items-center justify-center relative overflow-hidden">
                <div className="text-muted-foreground">
                  <Play size={32} />
                </div>
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <Button size="sm" variant="secondary">
                    <Play size={16} className="mr-2" />
                    预览
                  </Button>
                </div>
              </div>

              {/* Video Info */}
              <div className="space-y-2">
                <div>
                  {editingVideo === video.id ? (
                    <Input
                      value={tempVideoName}
                      onChange={(e) => setTempVideoName(e.target.value)}
                      onBlur={() => handleSaveVideoRename(video.id)}
                      onKeyDown={(e) => handleVideoKeyDown(e, video.id)}
                      className="font-medium text-sm h-auto p-1 border-primary"
                      autoFocus
                      maxLength={100}
                    />
                  ) : (
                    <h3 
                      className="font-medium text-sm truncate cursor-pointer hover:text-primary transition-colors" 
                      title={`${video.name} (点击编辑)`}
                      onClick={() => handleStartVideoRename(video.id, video.name)}
                    >
                      {video.name}
                    </h3>
                  )}
                </div>
                
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
                <div className="flex items-center gap-2 pt-2">
                  <Button size="sm" variant="outline" className="flex-1">
                    <Download size={14} className="mr-1" />
                    下载
                  </Button>
                  <Button size="sm" variant="outline">
                    <Trash2 size={14} className="mr-1" />
                    删除
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

      {/* Batch Download Modal */}
      <BatchDownloadModal
        isOpen={batchDownloadModalOpen}
        onClose={() => {
          setBatchDownloadModalOpen(false);
          setSelectedVideos([]); // Clear selection after download
        }}
        selectedFiles={videos
          .filter(video => selectedVideos.includes(video.id))
          .map(video => ({
            id: video.id,
            name: video.name,
            size: video.size
          }))
        }
      />

      {/* Batch Move Modal */}
      <BatchMoveModal
        isOpen={batchMoveModalOpen}
        onClose={() => setBatchMoveModalOpen(false)}
        selectedFiles={videos
          .filter(video => selectedVideos.includes(video.id))
          .map(video => ({
            id: video.id,
            name: video.name
          }))
        }
        folders={folders}
        onMoveComplete={handleMoveComplete}
      />
    </div>
  );
};

export default VideoLibrary;