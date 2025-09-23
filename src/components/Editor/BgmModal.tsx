import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, Music, Play, Pause, Folder, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface BgmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect?: (bgm: { type: 'upload' | 'library', file?: File, url?: string, name: string, cancelled?: boolean }) => void;
  selectedBgm?: { name: string, type: string, id?: string } | null;
}

interface MaterialItem {
  id: string;
  name: string;
  type: 'video' | 'image' | 'audio';
  thumbnail: string;
  duration?: string;
  size: string;
  date: string;
  folderId: string;
}

interface FolderItem {
  id: string;
  name: string;
  count: number;
  parentId?: string;
  children?: FolderItem[];
}

// 音频素材库数据 - 来自用户上传的文件夹
const audioFolders: FolderItem[] = [
  { id: 'bgm', name: 'BGM', count: 12 },
  { id: 'sound_effects', name: '音效素材', count: 10 },
];

const audioMaterials: MaterialItem[] = [
  {
    id: '3',
    name: '轻松愉悦.mp3',
    type: 'audio',
    thumbnail: '/placeholder.svg',
    duration: '02:30',
    size: '3.8 MB',
    date: '2024-01-13',
    folderId: 'bgm'
  },
  {
    id: '9',
    name: '激励节拍.mp3',
    type: 'audio',
    thumbnail: '/placeholder.svg',
    duration: '03:15',
    size: '4.2 MB',
    date: '2024-01-12',
    folderId: 'bgm'
  },
  {
    id: '12',
    name: '温馨时光.mp3',
    type: 'audio',
    thumbnail: '/placeholder.svg',
    duration: '02:45',
    size: '4.1 MB',
    date: '2024-01-11',
    folderId: 'bgm'
  },
  {
    id: '13',
    name: '商务专业.mp3',
    type: 'audio',
    thumbnail: '/placeholder.svg',
    duration: '03:00',
    size: '4.5 MB',
    date: '2024-01-10',
    folderId: 'bgm'
  },
  {
    id: '10',
    name: '搞笑音效.mp3',
    type: 'audio',
    thumbnail: '/placeholder.svg',
    duration: '00:02',
    size: '0.5 MB',
    date: '2024-01-11',
    folderId: 'sound_effects'
  },
  {
    id: '11',
    name: '动作音效.mp3',
    type: 'audio',
    thumbnail: '/placeholder.svg',
    duration: '00:01',
    size: '0.3 MB',
    date: '2024-01-10',
    folderId: 'sound_effects'
  },
];

export const BgmModal = ({ isOpen, onClose, onSelect, selectedBgm }: BgmModalProps) => {
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  const [confirmedAudio, setConfirmedAudio] = useState<string | null>(null);

  // Initialize confirmed audio based on selectedBgm prop
  useEffect(() => {
    if (selectedBgm && selectedBgm.type === 'library') {
      const matchedAudio = audioMaterials.find(audio => audio.name === selectedBgm.name);
      if (matchedAudio) {
        setConfirmedAudio(matchedAudio.id);
      }
    } else {
      setConfirmedAudio(null);
    }
  }, [selectedBgm, isOpen]);

  // Get filtered audio materials based on selected folder
  const getFilteredAudio = () => {
    if (!selectedFolder) {
      return audioMaterials;
    }
    return audioMaterials.filter(audio => audio.folderId === selectedFolder);
  };

  const filteredAudio = getFilteredAudio();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onSelect?.({ type: 'upload', file, name: file.name });
      onClose();
    }
  };

  const handleLibrarySelect = (audio: MaterialItem) => {
    if (confirmedAudio === audio.id) {
      // Cancel selection
      setConfirmedAudio(null);
    } else {
      // Confirm selection
      setConfirmedAudio(audio.id);
    }
  };

  const handleConfirm = () => {
    if (confirmedAudio) {
      const selectedAudio = audioMaterials.find(audio => audio.id === confirmedAudio);
      if (selectedAudio) {
        onSelect?.({ type: 'library', url: `/materials/${selectedAudio.name}`, name: selectedAudio.name });
      }
    } else {
      // No audio selected, send cancellation
      onSelect?.({ type: 'library', url: '', name: '', cancelled: true });
    }
    onClose();
  };

  const togglePlay = (audioId: string) => {
    if (playingAudio === audioId) {
      setPlayingAudio(null);
    } else {
      setPlayingAudio(audioId);
      // In a real app, you would actually play the audio here
      setTimeout(() => setPlayingAudio(null), 3000); // Mock play duration
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">选择BGM配乐</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="library" className="h-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="library">素材库</TabsTrigger>
            <TabsTrigger value="upload">本地上传</TabsTrigger>
          </TabsList>
          
          <TabsContent value="library" className="mt-6 h-[500px] overflow-hidden">
            <div className="flex h-full gap-4">
              {/* Folder Navigation */}
              <div className="w-48 border-r pr-4">
                <h3 className="text-sm font-medium mb-3 text-muted-foreground">音频文件夹</h3>
                <div className="space-y-2">
                  <Button
                    variant={selectedFolder === null ? "default" : "ghost"}
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => setSelectedFolder(null)}
                  >
                    <Folder size={16} className="mr-2" />
                    全部音频
                  </Button>
                  {audioFolders.map((folder) => (
                    <Button
                      key={folder.id}
                      variant={selectedFolder === folder.id ? "default" : "ghost"}
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => setSelectedFolder(folder.id)}
                    >
                      <Folder size={16} className="mr-2" />
                      {folder.name}
                      <span className="ml-auto text-xs text-muted-foreground">
                        {folder.count}
                      </span>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Audio List */}
              <div className="flex-1 overflow-hidden">
                <div className="flex items-center gap-2 mb-4">
                  <Music size={16} className="text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {selectedFolder ? audioFolders.find(f => f.id === selectedFolder)?.name : "全部音频"} 
                    ({filteredAudio.length} 个文件)
                  </span>
                </div>
                
                <div className="h-[400px] overflow-y-auto space-y-3">
                  {filteredAudio.map((audio) => (
                    <div
                      key={audio.id}
                      className={cn(
                        "flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-all",
                        confirmedAudio === audio.id 
                          ? "border-primary bg-primary/5" 
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      <div className="flex items-center gap-4">
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
                        <div>
                          <div className="font-medium">{audio.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {audio.size} · {audio.duration}
                          </div>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant={confirmedAudio === audio.id ? "default" : "outline"}
                        className={confirmedAudio === audio.id ? "bg-red-500 text-white border-red-500 hover:bg-red-600" : ""}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLibrarySelect(audio);
                        }}
                      >
                        {confirmedAudio === audio.id ? "取消" : "选择"}
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="upload" className="mt-6">
            <div className="flex flex-col items-center justify-center h-[400px] border-2 border-dashed border-border rounded-lg">
              <div className="text-center space-y-4">
                <Upload size={48} className="mx-auto text-muted-foreground" />
                <div>
                  <h3 className="text-lg font-semibold mb-2">上传音频文件</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    支持 MP3、WAV、AAC 等格式，最大 50MB
                  </p>
                </div>
                <div>
                  <input
                    type="file"
                    accept="audio/*"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="bgm-file-input"
                  />
                  <label htmlFor="bgm-file-input">
                    <Button asChild>
                      <span className="cursor-pointer">
                        <Upload size={16} className="mr-2" />
                        选择文件
                      </span>
                    </Button>
                  </label>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            取消
          </Button>
          <Button 
            variant="default"
            onClick={handleConfirm}
          >
            确定
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};