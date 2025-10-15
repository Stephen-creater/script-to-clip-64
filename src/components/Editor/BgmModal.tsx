import { useState, useEffect, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Music, Play, Pause, Folder, Volume2, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMaterials } from "@/hooks/useMaterials";

interface BgmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect?: (bgm: { type: 'upload' | 'library', file?: File, url?: string, name: string, volume?: number, cancelled?: boolean }) => void;
  selectedBgm?: { name: string, type: string, id?: string, volume?: number } | null;
}

interface FolderStructure {
  id: string;
  name: string;
  category: string;
  subcategory?: string;
  children?: FolderStructure[];
}

// 音频文件夹结构
const audioFolderStructure: FolderStructure[] = [
  {
    id: 'audio',
    name: '音乐素材',
    category: 'audio',
    children: [
      { id: 'audio-bgm', name: 'BGM', category: 'audio', subcategory: 'BGM' },
      { id: 'audio-sound', name: '音效素材', category: 'audio', subcategory: '音效' },
    ]
  }
];

export const BgmModal = ({ isOpen, onClose, onSelect, selectedBgm }: BgmModalProps) => {
  const { materials, getMaterialsByCategory } = useMaterials();
  const [selectedFolder, setSelectedFolder] = useState<FolderStructure | null>(null);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['audio']));
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  const [confirmedAudio, setConfirmedAudio] = useState<string | null>(null);
  const [volume, setVolume] = useState<number>(50);

  // Initialize folder and audio selection
  useEffect(() => {
    if (isOpen) {
      const rootFolder = audioFolderStructure[0];
      setSelectedFolder(rootFolder);
      setExpandedFolders(new Set(['audio']));
      
      if (selectedBgm && selectedBgm.type === 'library') {
        const matchedAudio = materials.find(m => m.name === selectedBgm.name && m.category === 'audio');
        if (matchedAudio) {
          setConfirmedAudio(matchedAudio.id);
          setVolume(selectedBgm.volume || 50);
        }
      } else {
        setConfirmedAudio(null);
        setVolume(50);
      }
    }
  }, [selectedBgm, isOpen, materials]);

  // Get filtered audio materials
  const filteredMaterials = useMemo(() => {
    if (!selectedFolder) return [];
    
    if (selectedFolder.subcategory) {
      return getMaterialsByCategory('audio', selectedFolder.subcategory);
    } else {
      return getMaterialsByCategory('audio');
    }
  }, [selectedFolder, getMaterialsByCategory]);

  const handleFolderClick = (folder: FolderStructure) => {
    setSelectedFolder(folder);
    
    if (folder.children && folder.children.length > 0) {
      setExpandedFolders(prev => {
        const newSet = new Set(prev);
        if (newSet.has(folder.id)) {
          newSet.delete(folder.id);
        } else {
          newSet.add(folder.id);
        }
        return newSet;
      });
    }
  };

  const handleLibrarySelect = (materialId: string) => {
    if (confirmedAudio === materialId) {
      setConfirmedAudio(null);
    } else {
      setConfirmedAudio(materialId);
    }
  };

  const handleConfirm = () => {
    if (confirmedAudio) {
      const selectedAudio = materials.find(m => m.id === confirmedAudio);
      if (selectedAudio) {
        onSelect?.({ 
          type: 'library', 
          url: selectedAudio.file_path, 
          name: selectedAudio.name, 
          volume 
        });
      }
    } else {
      onSelect?.({ type: 'library', url: '', name: '', cancelled: true });
    }
    onClose();
  };

  const togglePlay = (materialId: string) => {
    if (playingAudio === materialId) {
      setPlayingAudio(null);
    } else {
      setPlayingAudio(materialId);
      setTimeout(() => setPlayingAudio(null), 3000);
    }
  };

  const getTotalCount = (folder: FolderStructure): number => {
    if (folder.subcategory) {
      return getMaterialsByCategory(folder.category, folder.subcategory).length;
    } else {
      return getMaterialsByCategory(folder.category).length;
    }
  };

  const renderFolderTree = (folders: FolderStructure[], level = 0) => {
    return folders.map((folder) => {
      const isExpanded = expandedFolders.has(folder.id);
      const isSelected = selectedFolder?.id === folder.id;
      const hasChildren = folder.children && folder.children.length > 0;
      const count = getTotalCount(folder);

      return (
        <div key={folder.id}>
          <div
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-md cursor-pointer transition-colors",
              isSelected 
                ? "bg-primary text-primary-foreground shadow-sm" 
                : "hover:bg-secondary/80",
              level > 0 && "ml-4"
            )}
            onClick={() => handleFolderClick(folder)}
          >
            {hasChildren && (
              <ChevronRight 
                size={14} 
                className={cn(
                  "transition-transform flex-shrink-0",
                  isExpanded && "rotate-90"
                )}
              />
            )}
            {!hasChildren && <div className="w-3.5 flex-shrink-0" />}
            <Folder size={14} className="flex-shrink-0" />
            <span className="text-sm flex-1 truncate">{folder.name}</span>
            <span className="text-xs opacity-70 flex-shrink-0">{count}</span>
          </div>
          
          {hasChildren && isExpanded && (
            <div className="mt-1">
              {renderFolderTree(folder.children, level + 1)}
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[85vh] p-0 gap-0 flex flex-col">
        <DialogHeader className="px-6 py-4 border-b flex-shrink-0">
          <DialogTitle className="text-xl font-semibold">选择BGM配乐</DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-1 overflow-hidden min-h-0">
          {/* Left Sidebar - Folder Navigation */}
          <div className="w-56 border-r bg-muted/30 p-4 flex-shrink-0 overflow-y-auto">
            <h3 className="text-sm font-medium mb-3 text-muted-foreground">素材分类</h3>
            <div className="space-y-1">
              {renderFolderTree(audioFolderStructure)}
            </div>
          </div>

          {/* Main Content - Audio List */}
          <div className="flex-1 flex flex-col min-h-0 min-w-0">
            <ScrollArea className="flex-1">
              <div className="p-6 space-y-3">
                <div className="flex items-center gap-2 mb-4">
                  <Music size={16} className="text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {selectedFolder?.name || "全部音频"} ({filteredMaterials.length} 个文件)
                  </span>
                </div>
                
                {filteredMaterials.map((audio) => (
                  <div
                    key={audio.id}
                    className={cn(
                      "flex items-center justify-between p-4 rounded-lg border transition-all",
                      confirmedAudio === audio.id 
                        ? "border-primary bg-primary/5" 
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          togglePlay(audio.id);
                        }}
                      >
                        {playingAudio === audio.id ? (
                          <Pause size={16} />
                        ) : (
                          <Play size={16} />
                        )}
                      </Button>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{audio.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {audio.file_size ? `${(audio.file_size / 1024 / 1024).toFixed(1)} MB` : ''} 
                          {audio.duration ? ` · ${audio.duration}` : ''}
                        </div>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant={confirmedAudio === audio.id ? "default" : "outline"}
                      className={cn(
                        "flex-shrink-0",
                        confirmedAudio === audio.id && "bg-red-500 text-white border-red-500 hover:bg-red-600"
                      )}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLibrarySelect(audio.id);
                      }}
                    >
                      {confirmedAudio === audio.id ? "取消" : "选择"}
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>
        
        {/* Volume Control */}
        {confirmedAudio && (
          <div className="px-6 py-4 border-t flex-shrink-0">
            <div className="flex items-center gap-4">
              <Volume2 size={16} className="text-muted-foreground" />
              <span className="text-sm font-medium">音量调节</span>
              <div className="flex-1 flex items-center gap-3">
                <Slider
                  value={[volume]}
                  onValueChange={(value) => setVolume(value[0])}
                  max={100}
                  step={1}
                  className="flex-1"
                />
                <span className="text-sm text-muted-foreground w-12">
                  {volume}%
                </span>
              </div>
            </div>
          </div>
        )}
        
        <DialogFooter className="px-6 py-4 border-t flex-shrink-0">
          <Button variant="outline" onClick={onClose}>
            取消
          </Button>
          <Button variant="default" onClick={handleConfirm}>
            确定
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
