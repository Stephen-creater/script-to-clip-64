import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  FolderPlus, 
  Upload, 
  Search, 
  Filter,
  Grid,
  List,
  MoreVertical,
  Folder,
  FileVideo,
  FileImage,
  FileAudio,
  Trash2,
  Move
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MaterialItem {
  id: string;
  name: string;
  type: 'video' | 'image' | 'audio';
  thumbnail: string;
  duration?: string;
  size: string;
  date: string;
}

const Materials = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [selectedFolder, setSelectedFolder] = useState('all');

  const folders = [
    { id: 'all', name: '全部素材', count: 156 },
    { id: 'videos', name: '视频素材', count: 89 },
    { id: 'images', name: '图片素材', count: 45 },
    { id: 'audio', name: '音频素材', count: 22 },
    { id: 'spain', name: '西班牙风景', count: 12 },
    { id: 'trains', name: '火车素材', count: 8 },
    { id: 'intro', name: '开头素材', count: 6 },
  ];

  const materials: MaterialItem[] = [
    {
      id: '1',
      name: '西班牙火车站.mp4',
      type: 'video',
      thumbnail: '/placeholder.svg',
      duration: '00:15',
      size: '45.2 MB',
      date: '2024-01-15'
    },
    {
      id: '2',
      name: '马德里风景.jpg',
      type: 'image',
      thumbnail: '/placeholder.svg',
      size: '2.3 MB',
      date: '2024-01-14'
    },
    {
      id: '3',
      name: '背景音乐.mp3',
      type: 'audio',
      thumbnail: '/placeholder.svg',
      duration: '02:30',
      size: '3.8 MB',
      date: '2024-01-13'
    },
    {
      id: '4',
      name: '火车内部.mp4',
      type: 'video',
      thumbnail: '/placeholder.svg',
      duration: '00:08',
      size: '28.5 MB',
      date: '2024-01-12'
    },
    {
      id: '5',
      name: '巴塞罗那街景.mp4',
      type: 'video',
      thumbnail: '/placeholder.svg',
      duration: '00:20',
      size: '67.8 MB',
      date: '2024-01-11'
    },
    {
      id: '6',
      name: '旅行海报.png',
      type: 'image',
      thumbnail: '/placeholder.svg',
      size: '1.8 MB',
      date: '2024-01-10'
    }
  ];

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'video': return <FileVideo size={16} className="text-blue-500" />;
      case 'image': return <FileImage size={16} className="text-green-500" />;
      case 'audio': return <FileAudio size={16} className="text-purple-500" />;
      default: return <FileVideo size={16} />;
    }
  };

  const handleSelectItem = (itemId: string, checked: boolean) => {
    if (checked) {
      setSelectedItems([...selectedItems, itemId]);
    } else {
      setSelectedItems(selectedItems.filter(id => id !== itemId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems(materials.map(m => m.id));
    } else {
      setSelectedItems([]);
    }
  };

  return (
    <div className="flex h-full">
      {/* Left Sidebar - Folders */}
      <div className="w-64 bg-card border-r border-border p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">文件夹</h2>
          <Button variant="ghost" size="sm">
            <FolderPlus size={16} />
          </Button>
        </div>

        <div className="space-y-1">
          {folders.map((folder) => (
            <div
              key={folder.id}
              className={cn(
                "flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-colors",
                selectedFolder === folder.id
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-secondary"
              )}
              onClick={() => setSelectedFolder(folder.id)}
            >
              <div className="flex items-center gap-2">
                <Folder size={16} />
                <span className="text-sm">{folder.name}</span>
              </div>
              <span className="text-xs text-muted-foreground">{folder.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold">素材库</h1>
            <Button className="bg-gradient-primary">
              <Upload size={16} className="mr-2" />
              上传素材
            </Button>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <Input 
                placeholder="搜索素材..." 
                className="pl-10 w-64"
              />
            </div>
            
            <Select defaultValue="all">
              <SelectTrigger className="w-40">
                <Filter size={16} className="mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部类型</SelectItem>
                <SelectItem value="video">视频</SelectItem>
                <SelectItem value="image">图片</SelectItem>
                <SelectItem value="audio">音频</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex bg-secondary rounded-lg p-1">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid size={16} />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List size={16} />
              </Button>
            </div>
          </div>
        </div>

        {/* Selection Bar */}
        {selectedItems.length > 0 && (
          <div className="flex items-center justify-between p-4 bg-primary/10 rounded-lg mb-4">
            <span className="text-sm">已选择 {selectedItems.length} 个文件</span>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Move size={16} className="mr-2" />
                移动到...
              </Button>
              <Button variant="destructive" size="sm">
                <Trash2 size={16} className="mr-2" />
                删除
              </Button>
            </div>
          </div>
        )}

        {/* Materials Grid/List */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {materials.map((material) => (
              <div
                key={material.id}
                className={cn(
                  "bg-card border border-border rounded-lg p-3 hover:shadow-card transition-all cursor-pointer",
                  selectedItems.includes(material.id) && "ring-2 ring-primary"
                )}
              >
                <div className="relative mb-2">
                  <Checkbox
                    className="absolute top-2 left-2 z-10"
                    checked={selectedItems.includes(material.id)}
                    onCheckedChange={(checked) => handleSelectItem(material.id, !!checked)}
                  />
                  <div className="aspect-video bg-muted rounded flex items-center justify-center">
                    {getFileIcon(material.type)}
                  </div>
                  {material.duration && (
                    <span className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-1 rounded">
                      {material.duration}
                    </span>
                  )}
                </div>
                <h3 className="text-sm font-medium truncate">{material.name}</h3>
                <p className="text-xs text-muted-foreground">{material.size}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-card rounded-lg border border-border overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="w-12 p-3 text-left">
                    <Checkbox
                      checked={selectedItems.length === materials.length}
                      onCheckedChange={handleSelectAll}
                    />
                  </th>
                  <th className="p-3 text-left">名称</th>
                  <th className="p-3 text-left">类型</th>
                  <th className="p-3 text-left">大小</th>
                  <th className="p-3 text-left">时长</th>
                  <th className="p-3 text-left">日期</th>
                  <th className="w-12 p-3"></th>
                </tr>
              </thead>
              <tbody>
                {materials.map((material) => (
                  <tr
                    key={material.id}
                    className={cn(
                      "border-b border-border hover:bg-muted/50",
                      selectedItems.includes(material.id) && "bg-primary/10"
                    )}
                  >
                    <td className="p-3">
                      <Checkbox
                        checked={selectedItems.includes(material.id)}
                        onCheckedChange={(checked) => handleSelectItem(material.id, !!checked)}
                      />
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        {getFileIcon(material.type)}
                        <span className="text-sm">{material.name}</span>
                      </div>
                    </td>
                    <td className="p-3 text-sm text-muted-foreground capitalize">
                      {material.type}
                    </td>
                    <td className="p-3 text-sm text-muted-foreground">{material.size}</td>
                    <td className="p-3 text-sm text-muted-foreground">
                      {material.duration || '-'}
                    </td>
                    <td className="p-3 text-sm text-muted-foreground">{material.date}</td>
                    <td className="p-3">
                      <Button variant="ghost" size="sm">
                        <MoreVertical size={16} />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Materials;