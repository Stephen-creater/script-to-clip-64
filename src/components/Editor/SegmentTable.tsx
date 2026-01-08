import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  GripVertical, 
  Plus, 
  Upload, 
  Wand2, 
  Settings2,
  FileText,
  Volume2,
  User,
  Scissors
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AnimatedTextModal } from "./AnimatedTextModal";
import { StickerModal } from "./StickerModal";
import StickerAudioBgmModal from "./StickerAudioBgmModal";
import { DigitalHumanModal } from "./DigitalHumanModal";
import { BgmModal } from "./BgmModal";
import { MaterialSelectionModal } from "./MaterialSelectionModal";
import { VoiceSelectionModal } from "./VoiceSelectionModal";
import { ScriptVariantModal } from "./ScriptVariantModal";
import { AudioSettingsModal } from "./AudioSettingsModal";
import { AudioSelectionModal } from "./AudioSelectionModal";
import { BatchTrimModal } from "./BatchTrimModal";

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
  videoDuration?: number; // 素材时长（秒）
  segmentDuration?: number; // 分段时长（秒）- 用于固定时长模式
  script: string;
  scriptVariants?: ScriptVariant[];
  animatedText: string;
  sticker: string;
  enableDigitalHumans?: boolean; // 是否显示数字人
  audio: string;
  audioTimestamp?: string;
  materialWarning?: string; // 素材警告信息
  audioSettings?: AudioSettings; // 音频设置
}

interface SegmentTableProps {
  durationMode?: 'flexible' | 'fixed';
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
  durationMode = 'flexible',
  onSegmentsChange, 
  onConfigurationChange,
  globalDigitalHumans,
  onGlobalDigitalHumansChange 
}: SegmentTableProps) => {
  const isFixedMode = durationMode === 'fixed';
  
  const [segments, setSegments] = useState<Segment[]>([
    {
      id: "1",
      name: "分段1",
      type: "口播",
      video: "",
      script: "1",
      animatedText: "未设置",
      sticker: "未设置",
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
      audio: ""
    }
  ]);

  const [selectedSegments, setSelectedSegments] = useState<string[]>([]);
  const [activeModal, setActiveModal] = useState<{
    type: 'animatedText' | 'sticker' | 'stickerAudioBgm' | 'digitalHuman' | 'bgm' | 'materialSelection' | 'voiceSelection' | 'scriptVariant' | 'audioSettings' | 'audioSelection' | 'batchTrim' | null;
    segmentId: string | null;
  }>({ type: null, segmentId: null });
  
  const [selectedVoiceId, setSelectedVoiceId] = useState<string>("");
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
              duration: "3:24" // Mock duration
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

  const handleBatchDelete = () => {
    if (selectedSegments.length === 0) return;
    const filteredSegments = segments.filter(segment => !selectedSegments.includes(segment.id));
    const renumberedSegments = renumberSegments(filteredSegments);
    setSegments(renumberedSegments);
    setSelectedSegments([]);
  };

  const openModal = (type: 'animatedText' | 'sticker' | 'stickerAudioBgm' | 'digitalHuman' | 'bgm' | 'materialSelection' | 'scriptVariant' | 'audioSettings' | 'voiceSelection' | 'audioSelection' | 'batchTrim', segmentId?: string | null) => {
    setActiveModal({ type, segmentId: segmentId || null });
  };

  const handleBatchTrim = (settings: { mode: string; duration: number }) => {
    console.log('Batch trim settings:', settings);
    // TODO: Apply trim settings to all segments
  };

  const handleDigitalHumanClick = (segmentId: string) => {
    // 切换分段的数字人启用/禁用状态
    setSegments(prevSegments =>
      prevSegments.map(s =>
        s.id === segmentId
          ? { ...s, enableDigitalHumans: !s.enableDigitalHumans }
          : s
      )
    );
  };

  const handleGlobalDigitalHumanConfig = () => {
    // 打开全局数字人配置modal
    openModal('digitalHuman');
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
      prevSegments.map(segment => {
        if (segment.id === segmentId) {
          // 检查文案长度与素材时长是否匹配
          const estimatedScriptDuration = script.length * 0.3;
          let materialWarning: string | undefined;
          
          if (segment.videoDuration && script.length > 0 && estimatedScriptDuration > segment.videoDuration) {
            materialWarning = "素材时长过小，请重新选择素材！";
          }
          
          return { ...segment, script, materialWarning };
        }
        return segment;
      })
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
      prevSegments.map(segment => {
        if (segment.id === segmentId) {
          // 模拟素材时长（实际应从素材库获取）
          const mockDuration = Math.random() * 5 + 2; // 2-7秒
          
          // 检查文案长度与素材时长是否匹配
          // 假设每个字符需要0.3秒来朗读
          const scriptLength = segment.script.length;
          const estimatedScriptDuration = scriptLength * 0.3;
          
          let materialWarning: string | undefined;
          if (scriptLength > 0 && estimatedScriptDuration > mockDuration) {
            materialWarning = "素材时长过小，请重新选择素材！";
          }
          
          return { 
            ...segment, 
            video: material.name,
            videoDuration: mockDuration,
            materialWarning
          };
        }
        return segment;
      })
    );
  };

  const updateSegmentDigitalHuman = (digitalHumans: DigitalHuman[]) => {
    // 全局数字人配置更新
    onGlobalDigitalHumansChange(digitalHumans);
  };

  const updateSegmentScriptVariants = (segmentId: string, variants: ScriptVariant[]) => {
    setSegments(prevSegments => 
      prevSegments.map(segment => 
        segment.id === segmentId 
          ? { 
              ...segment, 
              scriptVariants: variants,
              script: variants.length > 0 ? `已配置${variants.length}个变体` : segment.script
            }
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
          <Button variant="outline" size="sm" onClick={() => openModal('batchTrim')}>
            <Scissors size={16} className="mr-2" />
            批量裁剪素材
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
        {/* 全局配置区域 */}
        <div className="bg-editor-grid border-b border-border px-4 py-3 flex items-center justify-between">
          <div className="text-sm font-medium text-muted-foreground">
            全局配置
          </div>
          <div className="flex items-center gap-2">
            {isFixedMode ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => openModal('stickerAudioBgm')}
                className="gap-2"
              >
                <Settings2 size={14} />
                贴纸/音频/BGM设置
              </Button>
            ) : (
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
            )}
          </div>
        </div>
        
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
                <th className="w-12 px-4 py-4 text-left text-body-small font-semibold text-foreground">排序</th>
                <th className="min-w-[120px] px-4 py-4 text-left text-body-small font-semibold text-foreground">分段名称</th>
                <th className="min-w-[160px] px-4 py-4 text-left text-body-small font-semibold text-foreground">视频素材文件夹</th>
                <th className="min-w-[120px] px-4 py-4 text-left text-body-small font-semibold text-foreground">分段时长</th>
                {!isFixedMode && (
                  <>
                    <th className="min-w-[100px] px-4 py-4 text-left text-body-small font-semibold text-foreground">花字/贴纸</th>
                    <th className="min-w-[280px] px-4 py-4 text-left text-body-small font-semibold text-foreground">字幕文案</th>
                    <th className="min-w-[120px] px-4 py-4 text-left text-body-small font-semibold text-foreground">字幕音频</th>
                  </>
                )}
                <th className="w-20 px-4 py-4 text-left text-body-small font-semibold text-foreground">操作</th>
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
                    <td className="w-12 p-4 border-r border-border/50">
                      <GripVertical size={16} className="text-muted-foreground cursor-grab" />
                    </td>
                    <td className="min-w-[120px] p-4 border-r border-border/50">
                      <span className="text-sm text-foreground">{segment.name}</span>
                    </td>
                    <td className="min-w-[160px] p-4 border-r border-border/50">
                      <div className="space-y-1">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="w-full justify-start text-muted-foreground hover:text-foreground"
                          onClick={() => openModal('materialSelection', segment.id)}
                        >
                          <Upload size={14} className="mr-2" />
                          {segment.video || "选择文件夹"}
                        </Button>
                        {segment.materialWarning && (
                          <p className="text-xs text-destructive">
                            {segment.materialWarning}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="min-w-[120px] p-4 border-r border-border/50">
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          placeholder="请输入时长"
                          value={segment.segmentDuration || ''}
                          onChange={(e) => {
                            const value = e.target.value ? parseInt(e.target.value) : undefined;
                            setSegments(prevSegments =>
                              prevSegments.map(s =>
                                s.id === segment.id
                                  ? { ...s, segmentDuration: value }
                                  : s
                              )
                            );
                          }}
                          className="w-24 h-8 text-sm"
                        />
                        <span className="text-sm text-muted-foreground">秒</span>
                      </div>
                    </td>
                    {!isFixedMode && (
                      <>
                        <td className="min-w-[100px] p-4 border-r border-border/50">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="w-full justify-start text-muted-foreground hover:text-foreground"
                            onClick={() => openModal('stickerAudioBgm', segment.id)}
                          >
                            {segment.sticker === "未设置" ? "✏ 未设置" : segment.sticker}
                          </Button>
                        </td>
                        <td className="min-w-[280px] p-4 border-r border-border/50">
                          <div className="relative group">
                            <Button
                              variant="ghost"
                              size="sm"
                              className={cn(
                                "w-full justify-start text-muted-foreground hover:text-foreground",
                                segment.scriptVariants && segment.scriptVariants.length > 0 && "text-foreground"
                              )}
                              onClick={() => openModal('scriptVariant', segment.id)}
                            >
                              ✏ {segment.scriptVariants && segment.scriptVariants.length > 0 
                                ? `点击添加字幕文案` 
                                : "点击添加字幕文案"}
                            </Button>
                          </div>
                        </td>
                        <td className="min-w-[120px] p-4 border-r border-border/50">
                          <span className={cn(
                            "text-sm",
                            segment.audioSettings ? "text-foreground" : "text-muted-foreground"
                          )}>
                            {segment.audioSettings ? (
                              <Button 
                                variant="ghost"
                                size="sm"
                                className="text-foreground"
                                onClick={() => handleOpenAudioSettings(segment.id)}
                              >
                                {segment.audioSettings.voiceName} · {segment.audioSettings.speed}x
                              </Button>
                            ) : (
                              <Button 
                                variant="ghost"
                                size="sm"
                                className="text-muted-foreground hover:text-foreground"
                                onClick={() => handleOpenAudioSettings(segment.id)}
                              >
                                未生成
                              </Button>
                            )}
                          </span>
                        </td>
                      </>
                    )}
                    <td className="w-20 p-4">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => {
                          const filteredSegments = segments.filter(s => s.id !== segment.id);
                          const renumberedSegments = renumberSegments(filteredSegments);
                          setSegments(renumberedSegments);
                        }}
                      >
                        🗑 删除
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ScrollArea>
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
      
      {activeModal.type === 'sticker' && (
        <StickerModal
          isOpen={true}
          onClose={closeModal}
          segmentId={activeModal.segmentId!}
        />
      )}

      {activeModal.type === 'stickerAudioBgm' && (
        <StickerAudioBgmModal
          open={true}
          onClose={closeModal}
          segmentName={segments.find(s => s.id === activeModal.segmentId)?.name}
          onSelectSticker={() => {
            openModal('sticker', activeModal.segmentId);
          }}
          onSelectAudio={() => {
            openModal('audioSelection', activeModal.segmentId);
          }}
          onSelectBgm={() => {
            openModal('bgm', activeModal.segmentId);
          }}
          onSubmit={() => {
            closeModal();
          }}
        />
      )}

      {activeModal.type === 'audioSelection' && (
        <AudioSelectionModal
          isOpen={true}
          onClose={closeModal}
          onSelect={(audio) => {
            console.log("选择音频:", audio);
            closeModal();
          }}
        />
      )}
      
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
            // Find the voice name from the voice ID
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

      {activeModal.type === 'scriptVariant' && activeModal.segmentId && (
        <ScriptVariantModal
          isOpen={true}
          onClose={closeModal}
          segmentId={activeModal.segmentId}
          segmentName={segments.find(s => s.id === activeModal.segmentId)?.name || ""}
          initialVariants={segments.find(s => s.id === activeModal.segmentId)?.scriptVariants}
          onSubmit={updateSegmentScriptVariants}
        />
      )}

      {activeModal.type === 'batchTrim' && (
        <BatchTrimModal
          isOpen={true}
          onClose={closeModal}
          onTrim={handleBatchTrim}
        />
      )}
    </div>
  );
};

export default SegmentTable;