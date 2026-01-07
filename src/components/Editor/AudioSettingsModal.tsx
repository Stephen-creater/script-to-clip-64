import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { 
  Play, 
  Pause, 
  Music, 
  Plus, 
  Trash2, 
  Shuffle, 
  Repeat,
  Volume2,
  Mic
} from "lucide-react";

interface BgmTrack {
  id: string;
  name: string;
  duration: string;
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
  bgmTracks: BgmTrack[];
  loopMode: 'loop' | 'shuffle';
}

interface AudioSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  segmentId?: string;
  segmentIds?: string[];
  segmentName: string;
  currentSettings?: Partial<AudioSettings>;
  onSave: (segmentId: string, settings: AudioSettings) => void;
  onBatchSave?: (segmentIds: string[], settings: AudioSettings) => void;
  onSelectVoice: () => void;
  onSelectBgm: () => void;
}

const DEFAULT_SETTINGS: AudioSettings = {
  voiceId: "voice_1",
  voiceName: "东伦敦女网红",
  voiceAvatar: "🎭",
  voiceStyle: "活泼",
  speed: 1.0,
  ttsVolume: 80,
  bgmVolume: 30,
  autoDucking: true,
  bgmTracks: [],
  loopMode: 'loop'
};

export const AudioSettingsModal = ({
  isOpen,
  onClose,
  segmentId,
  segmentIds,
  segmentName,
  currentSettings,
  onSave,
  onBatchSave,
  onSelectVoice,
  onSelectBgm
}: AudioSettingsModalProps) => {
  const isBatchMode = !!(segmentIds && segmentIds.length > 0);
  const [settings, setSettings] = useState<AudioSettings>({
    ...DEFAULT_SETTINGS,
    ...currentSettings
  });
  const [isPlaying, setIsPlaying] = useState(false);

  const handleSpeedChange = (value: number[]) => {
    setSettings(prev => ({ ...prev, speed: value[0] }));
  };

  const handleTtsVolumeChange = (value: number[]) => {
    setSettings(prev => ({ ...prev, ttsVolume: value[0] }));
  };

  const handleBgmVolumeChange = (value: number[]) => {
    setSettings(prev => ({ ...prev, bgmVolume: value[0] }));
  };

  const handleRemoveBgm = (trackId: string) => {
    setSettings(prev => ({
      ...prev,
      bgmTracks: prev.bgmTracks.filter(t => t.id !== trackId)
    }));
  };

  const handleSave = () => {
    if (isBatchMode && segmentIds && onBatchSave) {
      onBatchSave(segmentIds, settings);
    } else if (segmentId) {
      onSave(segmentId, settings);
    }
    onClose();
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  // Speed marks for the slider
  const speedMarks = [0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Volume2 size={20} className="text-primary" />
            {isBatchMode ? `批量音频设置 - ${segmentIds?.length}个分段` : `音频设置 - ${segmentName}`}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-6 pb-4">
            {/* AI Voiceover Section */}
            <div className="bg-slate-50 rounded-xl p-4 space-y-4">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <Mic size={16} className="text-primary" />
                AI 配音配置
              </div>
              
              {/* Voice Card */}
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center text-2xl">
                    {settings.voiceAvatar}
                  </div>
                  <div>
                    <div className="font-medium text-foreground">{settings.voiceName}</div>
                    <Badge variant="secondary" className="text-xs mt-1">
                      {settings.voiceStyle}
                    </Badge>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={onSelectVoice}
                  className="gap-2"
                >
                  🎭 切换音色
                </Button>
              </div>

              {/* Speed Control */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">语速控制</span>
                  <span className="text-sm font-medium text-primary">{settings.speed.toFixed(1)}x</span>
                </div>
                <div className="relative px-1">
                  <Slider
                    value={[settings.speed]}
                    onValueChange={handleSpeedChange}
                    min={0.5}
                    max={2.0}
                    step={0.1}
                    className="w-full"
                  />
                  <div className="flex justify-between mt-1 px-1">
                    {speedMarks.map(mark => (
                      <span 
                        key={mark} 
                        className={`text-[10px] ${settings.speed === mark ? 'text-primary font-medium' : 'text-muted-foreground'}`}
                      >
                        {mark}x
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Preview Waveform */}
              <div className="bg-background rounded-lg p-3 border border-border">
                <div className="flex items-center gap-3">
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="h-8 w-8 shrink-0"
                    onClick={togglePlay}
                  >
                    {isPlaying ? <Pause size={14} /> : <Play size={14} />}
                  </Button>
                  <div className="flex-1 flex items-center gap-0.5 h-6">
                    {/* Waveform visualization */}
                    {Array.from({ length: 40 }).map((_, i) => (
                      <div
                        key={i}
                        className={`w-1 rounded-full transition-all ${isPlaying ? 'bg-primary' : 'bg-muted-foreground/30'}`}
                        style={{
                          height: `${Math.random() * 80 + 20}%`,
                          animationDelay: `${i * 50}ms`
                        }}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0">试听</span>
                </div>
              </div>
            </div>

            {/* Mixer Section */}
            <div className="bg-slate-50 rounded-xl p-4 space-y-4">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <Volume2 size={16} className="text-primary" />
                音量混音
              </div>

              {/* TTS Volume */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">人声/TTS 音量</span>
                  <span className="text-sm font-medium">{settings.ttsVolume}%</span>
                </div>
                <Slider
                  value={[settings.ttsVolume]}
                  onValueChange={handleTtsVolumeChange}
                  min={0}
                  max={100}
                  step={1}
                  className="w-full"
                />
              </div>

              {/* BGM Volume */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">背景音乐 (BGM) 音量</span>
                  <span className="text-sm font-medium">{settings.bgmVolume}%</span>
                </div>
                <Slider
                  value={[settings.bgmVolume]}
                  onValueChange={handleBgmVolumeChange}
                  min={0}
                  max={100}
                  step={1}
                  className="w-full"
                />
              </div>

              {/* Auto Ducking */}
              <div className="flex items-center gap-3 pt-2">
                <Checkbox
                  id="auto-ducking"
                  checked={settings.autoDucking}
                  onCheckedChange={(checked) => 
                    setSettings(prev => ({ ...prev, autoDucking: !!checked }))
                  }
                />
                <label 
                  htmlFor="auto-ducking" 
                  className="text-sm text-muted-foreground cursor-pointer"
                >
                  自动闪避 (Auto Ducking) - 人说话时 BGM 自动变小
                </label>
              </div>
            </div>

            {/* BGM Playlist Section */}
            <div className="bg-slate-50 rounded-xl p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <Music size={16} className="text-primary" />
                  背景音乐
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={onSelectBgm}
                  className="gap-1 h-7"
                >
                  <Plus size={14} />
                  添加音乐
                </Button>
              </div>

              {/* BGM Track List */}
              {settings.bgmTracks.length > 0 ? (
                <div className="space-y-2">
                  {settings.bgmTracks.map((track) => (
                    <div 
                      key={track.id}
                      className="flex items-center justify-between bg-background rounded-lg px-3 py-2 border border-border"
                    >
                      <div className="flex items-center gap-3">
                        <Music size={14} className="text-muted-foreground" />
                        <span className="text-sm font-medium">{track.name}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-muted-foreground">{track.duration}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-muted-foreground hover:text-destructive"
                          onClick={() => handleRemoveBgm(track.id)}
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground text-sm">
                  暂无背景音乐，点击上方按钮添加
                </div>
              )}

              {/* Loop Mode */}
              {settings.bgmTracks.length > 0 && (
                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <span className="text-sm text-muted-foreground">播放模式</span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant={settings.loopMode === 'loop' ? 'default' : 'ghost'}
                      size="sm"
                      className="h-7 gap-1"
                      onClick={() => setSettings(prev => ({ ...prev, loopMode: 'loop' }))}
                    >
                      <Repeat size={14} />
                      列表循环
                    </Button>
                    <Button
                      variant={settings.loopMode === 'shuffle' ? 'default' : 'ghost'}
                      size="sm"
                      className="h-7 gap-1"
                      onClick={() => setSettings(prev => ({ ...prev, loopMode: 'shuffle' }))}
                    >
                      <Shuffle size={14} />
                      随机播放
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="flex justify-end gap-3 pt-4 border-t border-border">
          <Button variant="outline" onClick={onClose}>
            取消
          </Button>
          <Button onClick={handleSave}>
            确认保存
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
