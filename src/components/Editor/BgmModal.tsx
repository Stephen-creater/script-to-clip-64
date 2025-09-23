import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, Music, Play, Pause } from "lucide-react";
import { cn } from "@/lib/utils";

interface BgmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect?: (bgm: { type: 'upload' | 'library', file?: File, url?: string, name: string, cancelled?: boolean }) => void;
  selectedBgm?: { name: string, type: string, id?: string } | null;
}

// Mock audio library data
const audioLibrary = [
  { id: "1", name: "轻松愉悦", duration: "2:30", url: "/audio/happy.mp3", category: "轻音乐" },
  { id: "2", name: "激励节拍", duration: "3:15", url: "/audio/energetic.mp3", category: "动感" },
  { id: "3", name: "温馨时光", duration: "2:45", url: "/audio/warm.mp3", category: "轻音乐" },
  { id: "4", name: "商务专业", duration: "3:00", url: "/audio/corporate.mp3", category: "商务" },
  { id: "5", name: "科技未来", duration: "2:20", url: "/audio/tech.mp3", category: "科技" },
  { id: "6", name: "浪漫情调", duration: "3:30", url: "/audio/romantic.mp3", category: "浪漫" },
];

const categories = ["全部", "轻音乐", "动感", "商务", "科技", "浪漫"];

export const BgmModal = ({ isOpen, onClose, onSelect, selectedBgm }: BgmModalProps) => {
  const [selectedCategory, setSelectedCategory] = useState("全部");
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  const [selectedAudio, setSelectedAudio] = useState<string | null>(null);
  const [confirmedAudio, setConfirmedAudio] = useState<string | null>(null);

  // Initialize confirmed audio based on selectedBgm prop
  useEffect(() => {
    if (selectedBgm && selectedBgm.type === 'library') {
      const matchedAudio = audioLibrary.find(audio => audio.name === selectedBgm.name);
      if (matchedAudio) {
        setConfirmedAudio(matchedAudio.id);
      }
    } else {
      setConfirmedAudio(null);
    }
  }, [selectedBgm, isOpen]);

  const filteredAudio = selectedCategory === "全部" 
    ? audioLibrary 
    : audioLibrary.filter(audio => audio.category === selectedCategory);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onSelect?.({ type: 'upload', file, name: file.name });
      onClose();
    }
  };

  const handleLibrarySelect = (audio: typeof audioLibrary[0]) => {
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
      const selectedAudio = audioLibrary.find(audio => audio.id === confirmedAudio);
      if (selectedAudio) {
        onSelect?.({ type: 'library', url: selectedAudio.url, name: selectedAudio.name });
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
            <div className="flex flex-col h-full">
              {/* Category Filter */}
              <div className="flex gap-2 mb-4 pb-4 border-b">
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category}
                  </Button>
                ))}
              </div>
              
              {/* Audio List */}
              <div className="flex-1 overflow-y-auto space-y-3">
                {filteredAudio.map((audio) => (
                  <div
                    key={audio.id}
                    className={cn(
                      "flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-all",
                      selectedAudio === audio.id 
                        ? "border-primary bg-primary/5" 
                        : "border-border hover:border-primary/50"
                    )}
                    onClick={() => setSelectedAudio(audio.id)}
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
                          {audio.category} · {audio.duration}
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