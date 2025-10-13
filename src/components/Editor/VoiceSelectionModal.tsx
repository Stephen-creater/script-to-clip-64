import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Volume2, Check } from "lucide-react";

interface VoiceSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (voiceId: string) => void;
}

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

export const VoiceSelectionModal = ({
  isOpen,
  onClose,
  onConfirm
}: VoiceSelectionModalProps) => {
  const [selectedVoice, setSelectedVoice] = useState<string>("");
  const [activeTab, setActiveTab] = useState<string>("english");

  const handleConfirm = () => {
    if (selectedVoice) {
      onConfirm(selectedVoice);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Volume2 size={20} className="text-primary" />
            选择音色
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="english">英语</TabsTrigger>
            <TabsTrigger value="spanish">西班牙语</TabsTrigger>
          </TabsList>

          <TabsContent value="english" className="space-y-2 mt-4">
            {ENGLISH_VOICES.map((voice) => (
              <div
                key={voice.id}
                onClick={() => setSelectedVoice(voice.id)}
                className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                  selectedVoice === voice.id
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50 hover:bg-accent"
                }`}
              >
                <div className="text-3xl">{voice.avatar}</div>
                <div className="flex-1">
                  <div className="font-medium text-sm">{voice.name}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {voice.description}
                  </div>
                </div>
                {selectedVoice === voice.id && (
                  <Check className="text-primary" size={20} />
                )}
              </div>
            ))}
          </TabsContent>

          <TabsContent value="spanish" className="space-y-2 mt-4">
            {SPANISH_VOICES.map((voice) => (
              <div
                key={voice.id}
                onClick={() => setSelectedVoice(voice.id)}
                className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                  selectedVoice === voice.id
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50 hover:bg-accent"
                }`}
              >
                <div className="text-3xl">{voice.avatar}</div>
                <div className="flex-1">
                  <div className="font-medium text-sm">{voice.name}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {voice.description}
                  </div>
                </div>
                {selectedVoice === voice.id && (
                  <Check className="text-primary" size={20} />
                )}
              </div>
            ))}
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={onClose}>
            取消
          </Button>
          <Button onClick={handleConfirm} disabled={!selectedVoice}>
            确认
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
