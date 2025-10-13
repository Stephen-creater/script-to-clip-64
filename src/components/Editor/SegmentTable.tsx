import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  GripVertical, 
  Plus, 
  Upload, 
  Wand2, 
  Settings2,
  FileText,
  Volume2,
  Music
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AnimatedTextModal } from "./AnimatedTextModal";
import { GlobalSubtitleModal } from "./GlobalSubtitleModal";
import { StickerModal } from "./StickerModal";
import { DigitalHumanModal } from "./DigitalHumanModal";
import { BgmModal } from "./BgmModal";
import { AudioGenerationModal } from "./AudioGenerationModal";
import { MaterialSelectionModal } from "./MaterialSelectionModal";
import { VoiceSelectionModal } from "./VoiceSelectionModal";

interface Segment {
  id: string;
  name: string;
  type: string;
  video: string;
  script: string;
  animatedText: string;
  sticker: string;
  digitalHuman: string;
  audio: string;
  audioTimestamp?: string;
}

interface SegmentTableProps {
  onSegmentsChange?: (segments: Segment[]) => void;
  onConfigurationChange?: (config: {
    isAudioGenerated: boolean;
    isGlobalSubtitleConfigured: boolean;
    isBgmConfigured: boolean;
  }) => void;
}

const SegmentTable = ({ onSegmentsChange, onConfigurationChange }: SegmentTableProps) => {
  const [segments, setSegments] = useState<Segment[]>([
    {
      id: "1",
      name: "分段1",
      type: "口播",
      video: "",
      script: "1",
      animatedText: "未设置",
      sticker: "未设置",
      digitalHuman: "未设置",
      audio: ""
    },
    {
      id: "2",
      name: "分段2",
      type: "口播",
      video: "",
      script: "2",
      animatedText: "未设置",
      sticker: "未设置",
      digitalHuman: "未设置",
      audio: ""
    },
    {
      id: "3",
      name: "分段3",
      type: "口播",
      video: "",
      script: "3",
      animatedText: "未设置",
      sticker: "未设置",
      digitalHuman: "未设置",
      audio: ""
    },
    {
      id: "4",
      name: "分段4",
      type: "口播",
      video: "",
      script: "4",
      animatedText: "未设置",
      sticker: "未设置",
      digitalHuman: "未设置",
      audio: ""
    },
    {
      id: "5",
      name: "分段5",
      type: "口播",
      video: "",
      script: "5",
      animatedText: "未设置",
      sticker: "未设置",
      digitalHuman: "未设置",
      audio: ""
    }
  ]);

  const [selectedSegments, setSelectedSegments] = useState<string[]>([]);
  const [activeModal, setActiveModal] = useState<{
    type: 'animatedText' | 'sticker' | 'digitalHuman' | 'globalSubtitle' | 'bgm' | 'audioGeneration' | 'materialSelection' | 'voiceSelection' | null;
    segmentId: string | null;
  }>({ type: null, segmentId: null });
  
  const [selectedVoiceId, setSelectedVoiceId] = useState<string>("");
  
  const [isAudioGenerated, setIsAudioGenerated] = useState(false);
  const [isGlobalSubtitleConfigured, setIsGlobalSubtitleConfigured] = useState(false);
  const [isBgmConfigured, setIsBgmConfigured] = useState(false);
  const [selectedBgm, setSelectedBgm] = useState<{name: string, type: string, id?: string} | null>(null);

  // Notify parent component when segments change
  useEffect(() => {
    onSegmentsChange?.(segments);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [segments]);

  // Notify parent component when configuration changes
  useEffect(() => {
    onConfigurationChange?.({
      isAudioGenerated,
      isGlobalSubtitleConfigured,
      isBgmConfigured,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAudioGenerated, isGlobalSubtitleConfigured, isBgmConfigured]);

  const handleSelectSegment = (segmentId: string, checked: boolean) => {
    if (checked) {
      setSelectedSegments([...selectedSegments, segmentId]);
    } else {
      setSelectedSegments(selectedSegments.filter(id => id !== segmentId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedSegments(segments.map(s => s.id));
    } else {
      setSelectedSegments([]);
    }
  };

  const handleGenerateAudio = () => {
    // Open voice selection modal first
    setActiveModal({ type: 'voiceSelection', segmentId: null });
  };

  const handleVoiceSelected = (voiceId: string) => {
    setSelectedVoiceId(voiceId);
    // After voice selection, open audio generation modal
    setActiveModal({ type: 'audioGeneration', segmentId: null });
  };

  const handleAudioGenerationComplete = () => {
    // Generate timestamps for all segments with scripts
    let currentTime = 0;
    const updatedSegments = segments.map(segment => {
      if (segment.script) {
        const duration = Math.random() * 3 + 1; // Random duration between 1-4 seconds
        const startTime = currentTime;
        const endTime = currentTime + duration;
        currentTime = endTime;
        
        return {
          ...segment,
          audio: `audio_${segment.id}.mp3`,
          audioTimestamp: `${startTime.toFixed(1)}~${endTime.toFixed(1)}s`
        };
      }
      return segment;
    });
    setSegments(updatedSegments);
    setIsAudioGenerated(true);
  };


  const renumberSegments = (segmentList: Segment[]) => {
    return segmentList.map((segment, index) => ({
      ...segment,
      name: `分段${index + 1}`
    }));
  };

  const handleAddNewSegment = () => {
    const newSegment: Segment = {
      id: Date.now().toString(), // Use timestamp for unique ID
      name: `分段${segments.length + 1}`,
      type: "口播",
        video: "",
        script: "",
        animatedText: "未设置",
        sticker: "未设置",
        digitalHuman: "未设置",
        audio: ""
    };
    const newSegments = renumberSegments([...segments, newSegment]);
    setSegments(newSegments);
  };

  const handleImportScript = () => {
    const scriptText = prompt("请粘贴要导入的文案（每行一个分段）:");
    if (scriptText) {
      const lines = scriptText.split('\n').filter(line => line.trim());
      const newSegments = lines.map((line, index) => ({
        id: (Date.now() + index).toString(), // Use timestamp + index for unique IDs
        name: `分段${segments.length + index + 1}`,
        type: "口播",
        video: "",
        script: line.trim(),
        animatedText: "未设置",
        sticker: "未设置",
        digitalHuman: "未设置",
        audio: ""
      }));
      const allSegments = renumberSegments([...segments, ...newSegments]);
      setSegments(allSegments);
    }
  };

  const handleBatchDelete = () => {
    if (selectedSegments.length === 0) return;
    const filteredSegments = segments.filter(segment => !selectedSegments.includes(segment.id));
    const renumberedSegments = renumberSegments(filteredSegments);
    setSegments(renumberedSegments);
    setSelectedSegments([]);
  };

  const openModal = (type: 'animatedText' | 'sticker' | 'digitalHuman' | 'globalSubtitle' | 'bgm' | 'materialSelection', segmentId?: string) => {
    setActiveModal({ type, segmentId: segmentId || null });
  };

  const closeModal = () => {
    setActiveModal({ type: null, segmentId: null });
  };

  const updateSegmentAnimatedText = (segmentId: string, data: any) => {
    setSegments(prevSegments => 
      prevSegments.map(segment => 
        segment.id === segmentId 
          ? { 
              ...segment, 
              animatedText: data.content || "未设置"
            }
          : segment
      )
    );
  };

  const updateSegmentScript = (segmentId: string, script: string) => {
    setSegments(prevSegments => 
      prevSegments.map(segment => 
        segment.id === segmentId 
          ? { ...segment, script }
          : segment
      )
    );
  };

  const updateSegmentName = (segmentId: string, name: string) => {
    setSegments(prevSegments => 
      prevSegments.map(segment => 
        segment.id === segmentId 
          ? { ...segment, name }
          : segment
      )
    );
  };

  const updateSegmentVideo = (segmentId: string, material: {
    id: string;
    name: string;
    type: string;
    url: string;
    thumbnail?: string;
  }) => {
    setSegments(prevSegments => 
      prevSegments.map(segment => 
        segment.id === segmentId 
          ? { ...segment, video: material.name }
          : segment
      )
    );
  };

  return (
    <div className="flex-1 bg-background p-6 flex flex-col h-full">
      {/* Action Buttons */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={handleAddNewSegment}>
            <Plus size={16} className="mr-2" />
            添加新分段
          </Button>
          <Button variant="outline" size="sm" onClick={handleImportScript}>
            <FileText size={16} className="mr-2" />
            导入文案
          </Button>
        </div>
        
        {selectedSegments.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              已选择 {selectedSegments.length} 个分段
            </span>
            <Button variant="destructive" size="sm" onClick={handleBatchDelete}>
              批量删除
            </Button>
          </div>
        )}
      </div>

      {/* Table with ScrollArea */}
      <div className="flex-1 bg-card rounded-lg border border-border overflow-hidden shadow-card">
        <div className="bg-editor-grid border-b border-border">
          <table className="w-full">
            <thead>
              <tr>
                <th className="w-12 p-4 text-left">
                  <Checkbox
                    checked={selectedSegments.length === segments.length}
                    onCheckedChange={handleSelectAll}
                  />
                </th>
                <th className="w-8 p-4"></th>
                <th className="min-w-[160px] p-4 text-left text-body-small font-semibold text-foreground">分段名称</th>
                <th className="min-w-[180px] p-4 text-left text-body-small font-semibold text-foreground">画面</th>
                <th className="min-w-[320px] p-4 text-left text-body-small font-semibold text-foreground">文案</th>
                <th className="min-w-[100px] p-4 text-left text-body-small font-semibold text-foreground">花字</th>
                <th className="min-w-[100px] p-4 text-left text-body-small font-semibold text-foreground">视频贴纸</th>
                <th className="min-w-[100px] p-4 text-left text-body-small font-semibold text-foreground">数字人</th>
                <th className="min-w-[120px] p-4 text-left text-body-small font-semibold text-foreground">
                  {isAudioGenerated ? (
                    <span>
                      音频（<span className="text-info">已生成，请预览</span>）
                    </span>
                  ) : (
                    "音频"
                  )}
                </th>
              </tr>
            </thead>
          </table>
        </div>
        <ScrollArea className="h-[calc(100vh-300px)]">
          <div className="overflow-x-auto">
            <table className="w-full">
              <tbody>
                {segments.map((segment, index) => (
                  <tr 
                    key={segment.id}
                    className={cn(
                      "border-b border-border hover:bg-editor-hover transition-colors",
                      selectedSegments.includes(segment.id) && "bg-editor-selected/10"
                    )}
                  >
                    <td className="w-12 p-4 border-r border-border/50">
                      <Checkbox
                        checked={selectedSegments.includes(segment.id)}
                        onCheckedChange={(checked) => handleSelectSegment(segment.id, !!checked)}
                      />
                    </td>
                    <td className="w-8 p-4 border-r border-border/50">
                      <GripVertical size={16} className="text-muted-foreground cursor-grab" />
                    </td>
                     <td className="min-w-[160px] p-4 border-r border-border/50">
                       <Input
                         value={segment.name}
                         onChange={(e) => updateSegmentName(segment.id, e.target.value)}
                         className="text-sm border-0 bg-transparent p-1 font-medium focus:border-border focus:bg-background/50"
                         placeholder="分段名称"
                       />
                     </td>
                     <td className="min-w-[180px] p-4 border-r border-border/50">
                       <Button 
                         variant="outline" 
                         size="sm" 
                         className="w-full justify-start"
                         onClick={() => openModal('materialSelection', segment.id)}
                       >
                         <Upload size={14} className="mr-2" />
                         {segment.video || "选择素材"}
                       </Button>
                     </td>
                    <td className="min-w-[320px] p-4 border-r border-border/50">
                      <Textarea
                        value={segment.script}
                        onChange={(e) => updateSegmentScript(segment.id, e.target.value)}
                        className="min-h-[80px] text-sm resize-none border-0 bg-transparent p-1 focus:border-border focus:bg-background/50"
                        placeholder="请输入文案内容"
                      />
                    </td>
                    <td className="min-w-[100px] p-4 border-r border-border/50">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full justify-start"
                        onClick={() => openModal('animatedText', segment.id)}
                      >
                        <Wand2 size={14} className="mr-2" />
                        {segment.animatedText}
                      </Button>
                    </td>
                    <td className="min-w-[100px] p-4 border-r border-border/50">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full justify-start"
                        onClick={() => openModal('sticker', segment.id)}
                      >
                        <Settings2 size={14} className="mr-2" />
                        {segment.sticker}
                      </Button>
                    </td>
                    <td className="min-w-[100px] p-4 border-r border-border/50">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full justify-start"
                        onClick={() => openModal('digitalHuman', segment.id)}
                      >
                        <Settings2 size={14} className="mr-2" />
                        {segment.digitalHuman}
                      </Button>
                    </td>
                     <td className="min-w-[120px] p-4">
                       {segment.audioTimestamp ? (
                         <div className="text-sm font-medium text-center py-2">
                           {segment.audioTimestamp}
                         </div>
                       ) : (
                         <div className="text-xs text-muted-foreground text-center py-2">
                           未生成
                         </div>
                       )}
                     </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ScrollArea>
      </div>

      {/* Workflow Buttons at Bottom Left */}
      <div className="mt-6 flex items-center gap-3">
        <Button 
          variant="outline" 
          size="sm" 
          className={isAudioGenerated ? "bg-info/10 text-info border-info/20 hover:bg-info/20" : "hover:bg-primary/10 hover:text-primary hover:border-primary/20"} 
          onClick={handleGenerateAudio}
        >
          <Volume2 size={16} className="mr-2" />
          {isAudioGenerated ? "重新生成音频" : "一键生成音频"}
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          className={isGlobalSubtitleConfigured ? "bg-info/10 text-info border-info/20 hover:bg-info/20" : "hover:bg-primary/10 hover:text-primary hover:border-primary/20"}
          onClick={() => openModal('globalSubtitle')}
        >
          <Settings2 size={16} className="mr-2" />
          字幕全局设置
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          className={isBgmConfigured ? "bg-info/10 text-info border-info/20 hover:bg-info/20" : "hover:bg-primary/10 hover:text-primary hover:border-primary/20"}
          onClick={() => openModal('bgm')}
        >
          <Music size={16} className="mr-2" />
          BGM配乐
        </Button>
      </div>

      {/* Modals */}
      {activeModal.type === 'animatedText' && (
        <AnimatedTextModal
          isOpen={true}
          onClose={closeModal}
          segmentId={activeModal.segmentId!}
          onSubmit={updateSegmentAnimatedText}
        />
      )}
      
      {activeModal.type === 'globalSubtitle' && (
        <GlobalSubtitleModal
          isOpen={true}
          onClose={closeModal}
          onComplete={() => {
            setIsGlobalSubtitleConfigured(true);
          }}
        />
      )}
      
      {activeModal.type === 'sticker' && (
        <StickerModal
          isOpen={true}
          onClose={closeModal}
          segmentId={activeModal.segmentId!}
        />
      )}
      
      {activeModal.type === 'digitalHuman' && (
        <DigitalHumanModal
          isOpen={true}
          onClose={closeModal}
          segmentId={activeModal.segmentId!}
        />
      )}
      
      {activeModal.type === 'bgm' && (
        <BgmModal
          isOpen={true}
          onClose={closeModal}
          selectedBgm={selectedBgm}
          onSelect={(bgm) => {
            console.log("BGM选择:", bgm);
            if (bgm.cancelled) {
              setIsBgmConfigured(false);
              setSelectedBgm(null);
            } else if (bgm.name && bgm.url) {
              setIsBgmConfigured(true);
              const matchedAudio = [
                { id: "1", name: "轻松愉悦" },
                { id: "2", name: "激励节拍" },
                { id: "3", name: "温馨时光" },
                { id: "4", name: "商务专业" },
                { id: "5", name: "科技未来" },
                { id: "6", name: "浪漫情调" }
              ].find(audio => audio.name === bgm.name);
              setSelectedBgm({ 
                name: bgm.name, 
                type: bgm.type, 
                id: matchedAudio?.id 
              });
            }
            // Handle BGM selection here
          }}
        />
      )}
      
      {activeModal.type === 'voiceSelection' && (
        <VoiceSelectionModal
          isOpen={true}
          onClose={closeModal}
          onConfirm={handleVoiceSelected}
        />
      )}

      {activeModal.type === 'audioGeneration' && (
        <AudioGenerationModal
          isOpen={true}
          onClose={closeModal}
          onComplete={handleAudioGenerationComplete}
          segmentCount={segments.filter(s => s.script).length}
        />
      )}
      
      {activeModal.type === 'materialSelection' && (
        <MaterialSelectionModal
          isOpen={true}
          onClose={closeModal}
          onSelect={(folderId, folderName) => {
            if (activeModal.segmentId) {
              // Create a mock material object based on folder selection
              const mockMaterial = {
                id: folderId,
                name: folderName,
                type: 'folder',
                url: '/placeholder.svg',
                thumbnail: '/placeholder.svg'
              };
              updateSegmentVideo(activeModal.segmentId, mockMaterial);
            }
            closeModal();
          }}
        />
      )}
    </div>
  );
};

export default SegmentTable;