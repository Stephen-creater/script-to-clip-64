import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Volume2, Check, Zap, Pause, Play } from "lucide-react";
import { Slider } from "@/components/ui/slider";

interface VoiceSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (voiceId: string, speed: number) => void;
  firstSegmentText?: string;
}

const DEFAULT_PREVIEW_TEXT = "欢迎使用 Trainpal，这是试听音频。";

const ENGLISH_VOICES = [
  {
    id: "en_female_energetic",
    name: "东伦敦女网红",
    description: "A bold and energetic young woman from East London",
    avatar: "🟡"
  },
  {
    id: "en_female_cheerful",
    name: "伦敦女孩A-活力活泼",
    description: "A cheerful, authentic British female voice",
    avatar: "🔵"
  },
  {
    id: "en_male_witty",
    name: "俏皮东伦敦男孩",
    description: "A lively, quick-witted male voice with a London accent",
    avatar: "🟢"
  },
  {
    id: "en_female_sharp",
    name: "尖锐、聪明、清脆的伦敦女生",
    description: "A sharp, intelligent female voice with a crisp tone",
    avatar: "🟡"
  },
  {
    id: "en_female_vibrant",
    name: "揭露内幕年轻伦敦女孩",
    description: "A vibrant, quick-paced female voice with an exposé style",
    avatar: "🟠"
  }
];

const SPANISH_VOICES = [
  {
    id: "es_female_enthusiastic",
    name: "西班牙-女-情绪拉满安利",
    description: "Voz femenina con acento español de alta energía",
    avatar: "🔵"
  },
  {
    id: "es_female_revealing",
    name: "西班牙-女-爆料型",
    description: "Voz femenina con acento español de revelación",
    avatar: "🟢"
  },
  {
    id: "es_female_sarcastic",
    name: "西班牙-女-吐槽型",
    description: "Voz femenina con acento 100% español sarcástico",
    avatar: "🟣"
  },
  {
    id: "es_female_angry",
    name: "西班牙-女-吐槽爆料",
    description: "Voz femenina con tono cabreado pero informativo",
    avatar: "🔵"
  },
  {
    id: "es_female_natural",
    name: "西班牙-女-自然短视频",
    description: "Voz femenina con acento 100% español natural",
    avatar: "🟣"
  }
];

// Waveform animation component
const WaveformAnimation = () => (
  <div className="flex items-center gap-0.5 h-4">
    {[1, 2, 3, 4].map((i) => (
      <div
        key={i}
        className="w-0.5 bg-purple-600 rounded-full animate-pulse"
        style={{
          height: `${Math.random() * 12 + 4}px`,
          animationDelay: `${i * 0.1}s`,
          animationDuration: '0.5s'
        }}
      />
    ))}
  </div>
);

export const VoiceSelectionModal = ({
  isOpen,
  onClose,
  onConfirm,
  firstSegmentText
}: VoiceSelectionModalProps) => {
  const [selectedVoice, setSelectedVoice] = useState<string>("");
  const [activeTab, setActiveTab] = useState<string>("english");
  const [speed, setSpeed] = useState<number>(1.1);
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Get preview text (truncated to 50 chars)
  const getPreviewText = () => {
    const text = firstSegmentText?.trim() || DEFAULT_PREVIEW_TEXT;
    return text.length > 50 ? text.slice(0, 50) : text;
  };

  // Handle voice preview playback
  const handlePreview = (voiceId: string) => {
    if (playingVoiceId === voiceId) {
      // Stop current playback
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      setPlayingVoiceId(null);
    } else {
      // Stop any existing playback
      if (audioRef.current) {
        audioRef.current.pause();
      }
      
      // Start new playback (mock - in real implementation, call TTS API)
      setPlayingVoiceId(voiceId);
      
      // Simulate audio playback ending after 3 seconds
      setTimeout(() => {
        if (playingVoiceId === voiceId) {
          setPlayingVoiceId(null);
        }
      }, 3000);
    }
  };

  // Cleanup on close
  useEffect(() => {
    if (!isOpen) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      setPlayingVoiceId(null);
    }
  }, [isOpen]);

  const handleConfirm = () => {
    if (selectedVoice) {
      onConfirm(selectedVoice, speed);
    }
  };

  const previewText = getPreviewText();

  const renderVoiceCard = (voice: typeof ENGLISH_VOICES[0]) => {
    const isSelected = selectedVoice === voice.id;
    const isPlaying = playingVoiceId === voice.id;

    return (
      <div
        key={voice.id}
        onClick={() => setSelectedVoice(voice.id)}
        className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
          isSelected
            ? "border-purple-600 bg-purple-50"
            : "border-border hover:border-purple-400 hover:bg-accent"
        }`}
      >
        <div className="text-3xl">{voice.avatar}</div>
        <div className="flex-1 min-w-0">
          <div className="font-medium text-sm">{voice.name}</div>
          <div className="text-xs text-muted-foreground mt-0.5 truncate">
            {voice.description}
          </div>
          {isPlaying && (
            <div className="text-xs text-purple-600 mt-1 flex items-center gap-1 truncate">
              <span>🔊 正在试听:</span>
              <span className="truncate">{previewText.slice(0, 20)}...</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          {isPlaying && <WaveformAnimation />}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0"
            onClick={(e) => {
              e.stopPropagation();
              handlePreview(voice.id);
            }}
          >
            {isPlaying ? (
              <Pause size={16} className="text-purple-600" />
            ) : (
              <Play size={16} />
            )}
          </Button>
          {isSelected && (
            <Check className="text-purple-600 shrink-0" size={20} />
          )}
        </div>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Volume2 size={20} className="text-primary" />
            选择音色
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full flex-1 overflow-hidden flex flex-col">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="english">英语</TabsTrigger>
            <TabsTrigger value="spanish">西班牙语</TabsTrigger>
          </TabsList>

          <TabsContent value="english" className="space-y-2 mt-4 overflow-y-auto flex-1">
            {ENGLISH_VOICES.map(renderVoiceCard)}
          </TabsContent>

          <TabsContent value="spanish" className="space-y-2 mt-4 overflow-y-auto flex-1">
            {SPANISH_VOICES.map(renderVoiceCard)}
          </TabsContent>
        </Tabs>

        {/* Footer with speed control and buttons */}
        <div className="flex items-center justify-between pt-4 border-t">
          {/* Speed Control */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Zap size={16} className="text-amber-500" />
              <span className="text-sm">语速</span>
            </div>
            <div className="flex items-center gap-2 w-32">
              <Slider
                value={[speed]}
                onValueChange={(values) => setSpeed(values[0])}
                min={0.8}
                max={1.5}
                step={0.1}
                className="w-full"
              />
            </div>
            <span className="text-sm font-medium w-10 text-right">
              {speed.toFixed(1)}x
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              取消
            </Button>
            <Button onClick={handleConfirm} disabled={!selectedVoice}>
              确认生成
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
