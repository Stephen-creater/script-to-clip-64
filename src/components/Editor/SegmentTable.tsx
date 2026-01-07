import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Plus, 
  FileText,
  User
} from "lucide-react";
import { DigitalHumanModal } from "./DigitalHumanModal";
import { BgmModal } from "./BgmModal";
import { VoiceSelectionModal } from "./VoiceSelectionModal";
import { AudioSettingsModal } from "./AudioSettingsModal";
import SegmentCard from "./SegmentCard";

interface ScriptVariant {
  id: string;
  content: string;
}

interface DigitalHuman {
  id: string;
  name: string;
  position: { x: number; y: number };
  scale: number;
}

interface AudioSettings {
  voiceId: string;
  voiceName: string;
  voiceAvatar: string;
  voiceStyle: string;
  speed: number;
  ttsVolume: number;
  bgmVolume: number;
  autoDucking: boolean;
  bgmTracks: { id: string; name: string; duration: string }[];
  loopMode: 'loop' | 'shuffle';
}

interface Segment {
  id: string;
  name: string;
  type: string;
  video: string;
  videoDuration?: number;
  script: string;
  scriptVariants?: ScriptVariant[];
  animatedText: string;
  sticker: string;
  enableDigitalHumans?: boolean;
  audio: string;
  audioTimestamp?: string;
  materialWarning?: string;
  audioSettings?: AudioSettings;
}

interface SegmentTableProps {
  onSegmentsChange?: (segments: Segment[]) => void;
  onConfigurationChange?: (config: {
    isAudioGenerated: boolean;
    isGlobalSubtitleConfigured: boolean;
    isBgmConfigured: boolean;
  }) => void;
  globalDigitalHumans: DigitalHuman[];
  onGlobalDigitalHumansChange: (digitalHumans: DigitalHuman[]) => void;
}

const SegmentTable = ({ 
  onSegmentsChange, 
  onConfigurationChange,
  globalDigitalHumans,
  onGlobalDigitalHumansChange 
}: SegmentTableProps) => {
  const [segments, setSegments] = useState<Segment[]>([
    {
      id: "1",
      name: "分段1",
      type: "口播",
      video: "",
      script: "",
      animatedText: "未设置",
      sticker: "未设置",
      audio: ""
    },
    {
      id: "2",
      name: "分段2",
      type: "口播",
      video: "",
      script: "",
      animatedText: "未设置",
      sticker: "未设置",
      audio: ""
    },
    {
      id: "3",
      name: "分段3",
      type: "口播",
      video: "",
      script: "",
      animatedText: "未设置",
      sticker: "未设置",
      audio: ""
    }
  ]);

  const [activeModal, setActiveModal] = useState<{
    type: 'digitalHuman' | 'bgm' | 'voiceSelection' | 'audioSettings' | null;
    segmentId: string | null;
  }>({ type: null, segmentId: null });
  
  const [pendingAudioSettingsSegmentId, setPendingAudioSettingsSegmentId] = useState<string | null>(null);
  
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

  const handleOpenAudioSettings = (segmentId: string) => {
    setActiveModal({ type: 'audioSettings', segmentId });
  };

  const handleVoiceSelectedForSegment = (voiceId: string, voiceName: string) => {
    if (pendingAudioSettingsSegmentId) {
      setSegments(prevSegments =>
        prevSegments.map(segment =>
          segment.id === pendingAudioSettingsSegmentId
            ? {
                ...segment,
                audioSettings: {
                  ...segment.audioSettings,
                  voiceId,
                  voiceName,
                  voiceAvatar: "🎭",
                  voiceStyle: "活泼",
                  speed: segment.audioSettings?.speed || 1.0,
                  ttsVolume: segment.audioSettings?.ttsVolume || 80,
                  bgmVolume: segment.audioSettings?.bgmVolume || 30,
                  autoDucking: segment.audioSettings?.autoDucking ?? true,
                  bgmTracks: segment.audioSettings?.bgmTracks || [],
                  loopMode: segment.audioSettings?.loopMode || 'loop'
                }
              }
            : segment
        )
      );
      closeModal();
      setTimeout(() => {
        setActiveModal({ type: 'audioSettings', segmentId: pendingAudioSettingsSegmentId });
        setPendingAudioSettingsSegmentId(null);
      }, 100);
    }
  };

  const updateSegmentAudioSettings = (segmentId: string, settings: AudioSettings) => {
    setSegments(prevSegments =>
      prevSegments.map(segment =>
        segment.id === segmentId
          ? { ...segment, audioSettings: settings }
          : segment
      )
    );
  };

  const handleAddBgmToSegment = (bgm: { name: string; url: string }) => {
    if (pendingAudioSettingsSegmentId) {
      setSegments(prevSegments =>
        prevSegments.map(segment => {
          if (segment.id === pendingAudioSettingsSegmentId) {
            const newTrack = {
              id: Date.now().toString(),
              name: bgm.name,
              duration: "3:24"
            };
            return {
              ...segment,
              audioSettings: {
                ...segment.audioSettings,
                voiceId: segment.audioSettings?.voiceId || "voice_1",
                voiceName: segment.audioSettings?.voiceName || "东伦敦女网红",
                voiceAvatar: segment.audioSettings?.voiceAvatar || "🎭",
                voiceStyle: segment.audioSettings?.voiceStyle || "活泼",
                speed: segment.audioSettings?.speed || 1.0,
                ttsVolume: segment.audioSettings?.ttsVolume || 80,
                bgmVolume: segment.audioSettings?.bgmVolume || 30,
                autoDucking: segment.audioSettings?.autoDucking ?? true,
                bgmTracks: [...(segment.audioSettings?.bgmTracks || []), newTrack],
                loopMode: segment.audioSettings?.loopMode || 'loop'
              }
            };
          }
          return segment;
        })
      );
      closeModal();
      setTimeout(() => {
        setActiveModal({ type: 'audioSettings', segmentId: pendingAudioSettingsSegmentId });
        setPendingAudioSettingsSegmentId(null);
      }, 100);
    }
  };

  const renumberSegments = (segmentList: Segment[]) => {
    return segmentList.map((segment, index) => ({
      ...segment,
      name: `分段${index + 1}`
    }));
  };

  const handleAddNewSegment = () => {
    const newSegment: Segment = {
      id: Date.now().toString(),
      name: `分段${segments.length + 1}`,
      type: "口播",
      video: "",
      script: "",
      animatedText: "未设置",
      sticker: "未设置",
      enableDigitalHumans: false,
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
        id: (Date.now() + index).toString(),
        name: `分段${segments.length + index + 1}`,
        type: "口播",
        video: "",
        script: line.trim(),
        animatedText: "未设置",
        sticker: "未设置",
        enableDigitalHumans: false,
        audio: ""
      }));
      const allSegments = renumberSegments([...segments, ...newSegments]);
      setSegments(allSegments);
    }
  };

  const handleDeleteSegment = (segmentId: string) => {
    const filteredSegments = segments.filter(s => s.id !== segmentId);
    const renumberedSegments = renumberSegments(filteredSegments);
    setSegments(renumberedSegments);
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

  const updateSegmentVideo = (segmentId: string, video: string) => {
    setSegments(prevSegments => 
      prevSegments.map(segment => 
        segment.id === segmentId 
          ? { ...segment, video }
          : segment
      )
    );
  };

  const handleGlobalDigitalHumanConfig = () => {
    setActiveModal({ type: 'digitalHuman', segmentId: null });
  };

  const closeModal = () => {
    setActiveModal({ type: null, segmentId: null });
  };

  const updateSegmentDigitalHuman = (digitalHumans: DigitalHuman[]) => {
    onGlobalDigitalHumansChange(digitalHumans);
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
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleGlobalDigitalHumanConfig}
            className="gap-2"
          >
            <User size={14} />
            数字人配置
            {globalDigitalHumans.length > 0 && (
              <div className="flex gap-1 ml-1">
                {globalDigitalHumans.map((_, index) => (
                  <div 
                    key={index}
                    className="h-4 w-4 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center font-bold"
                  >
                    {index + 1}
                  </div>
                ))}
              </div>
            )}
          </Button>
        </div>
      </div>

      {/* Segment Cards */}
      <ScrollArea className="flex-1">
        <div className="space-y-4 pr-4">
          {segments.map((segment, index) => (
            <SegmentCard
              key={segment.id}
              id={segment.id}
              index={index}
              name={segment.name}
              script={segment.script}
              video={segment.video}
              audioSettings={segment.audioSettings}
              onScriptChange={(script) => updateSegmentScript(segment.id, script)}
              onDelete={() => handleDeleteSegment(segment.id)}
              onOpenAudioSettings={() => handleOpenAudioSettings(segment.id)}
              onVideoSelect={(video) => updateSegmentVideo(segment.id, video)}
            />
          ))}
        </div>
      </ScrollArea>

      {/* Modals */}
      {activeModal.type === 'digitalHuman' && (
        <DigitalHumanModal
          isOpen={true}
          onClose={closeModal}
          segmentId="global"
          onSubmit={(_, digitalHumans) => updateSegmentDigitalHuman(digitalHumans)}
          currentDigitalHumans={globalDigitalHumans}
          isControlling={true}
          controllingSegmentName={null}
        />
      )}
      
      {activeModal.type === 'bgm' && (
        <BgmModal
          isOpen={true}
          onClose={() => {
            closeModal();
            if (pendingAudioSettingsSegmentId) {
              setTimeout(() => {
                setActiveModal({ type: 'audioSettings', segmentId: pendingAudioSettingsSegmentId });
                setPendingAudioSettingsSegmentId(null);
              }, 100);
            }
          }}
          selectedBgm={selectedBgm}
          onSelect={(bgm) => {
            console.log("BGM选择:", bgm);
            if (bgm.cancelled) {
              closeModal();
              if (pendingAudioSettingsSegmentId) {
                setTimeout(() => {
                  setActiveModal({ type: 'audioSettings', segmentId: pendingAudioSettingsSegmentId });
                  setPendingAudioSettingsSegmentId(null);
                }, 100);
              }
            } else if (bgm.name && bgm.url) {
              handleAddBgmToSegment({ name: bgm.name, url: bgm.url });
            }
          }}
        />
      )}
      
      {activeModal.type === 'voiceSelection' && (
        <VoiceSelectionModal
          isOpen={true}
          onClose={() => {
            closeModal();
            if (pendingAudioSettingsSegmentId) {
              setTimeout(() => {
                setActiveModal({ type: 'audioSettings', segmentId: pendingAudioSettingsSegmentId });
                setPendingAudioSettingsSegmentId(null);
              }, 100);
            }
          }}
          onConfirm={(voiceId) => {
            const voiceNames: Record<string, string> = {
              'xiaoxiao': '晓晓',
              'yunxi': '云溪',
              'xiaoyi': '晓艺',
              'yunjian': '云健'
            };
            handleVoiceSelectedForSegment(voiceId, voiceNames[voiceId] || voiceId);
          }}
        />
      )}

      {activeModal.type === 'audioSettings' && activeModal.segmentId && (
        <AudioSettingsModal
          isOpen={true}
          onClose={closeModal}
          segmentId={activeModal.segmentId}
          segmentName={segments.find(s => s.id === activeModal.segmentId)?.name || ""}
          currentSettings={segments.find(s => s.id === activeModal.segmentId)?.audioSettings}
          onSave={updateSegmentAudioSettings}
          onSelectVoice={() => {
            setPendingAudioSettingsSegmentId(activeModal.segmentId);
            closeModal();
            setTimeout(() => {
              setActiveModal({ type: 'voiceSelection', segmentId: null });
            }, 100);
          }}
          onSelectBgm={() => {
            setPendingAudioSettingsSegmentId(activeModal.segmentId);
            closeModal();
            setTimeout(() => {
              setActiveModal({ type: 'bgm', segmentId: null });
            }, 100);
          }}
        />
      )}
    </div>
  );
};

export default SegmentTable;
