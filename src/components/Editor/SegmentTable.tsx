import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
import { SubtitleModal } from "./SubtitleModal";
import { StickerModal } from "./StickerModal";

interface Segment {
  id: string;
  name: string;
  type: string;
  video: string;
  script: string;
  animatedText: string;
  subtitleStyle: string;
  sticker: string;
  audio: string;
}

const SegmentTable = () => {
  const [segments, setSegments] = useState<Segment[]>([
    {
      id: "1",
      name: "分段1",
      type: "开头",
      video: "素材组：开头",
      script: "El secreto que nadie te cuenta sobre los trenes en España",
      animatedText: "未设置",
      subtitleStyle: "未设置",
      sticker: "1组",
      audio: ""
    },
    {
      id: "2",
      name: "分段8",
      type: "口播",
      video: "素材组：西班牙风景",
      script: "los asientos vacíos son pérdidas",
      animatedText: "未设置",
      subtitleStyle: "未设置",
      sticker: "未设置",
      audio: ""
    },
    {
      id: "3",
      name: "分段10",
      type: "口播",
      video: "素材组：西班牙风景",
      script: "Para recuperar costes",
      animatedText: "未设置",
      subtitleStyle: "未设置",
      sticker: "未设置",
      audio: ""
    },
    {
      id: "4",
      name: "分段13",
      type: "口播",
      video: "素材组：西班牙风景",
      script: "La compañía mete estos billetes en canales ocultos",
      animatedText: "未设置",
      subtitleStyle: "未设置",
      sticker: "未设置",
      audio: ""
    },
    {
      id: "5",
      name: "分段14",
      type: "口播",
      video: "素材组：火车",
      script: "con descuentos de hasta el 80%",
      animatedText: "80%",
      subtitleStyle: "未设置",
      sticker: "未设置",
      audio: ""
    }
  ]);

  const [selectedSegments, setSelectedSegments] = useState<string[]>([]);
  const [activeModal, setActiveModal] = useState<{
    type: 'animatedText' | 'subtitle' | 'sticker' | null;
    segmentId: string | null;
  }>({ type: null, segmentId: null });

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
    // Generate audio for all segments with scripts
    const updatedSegments = segments.map(segment => {
      if (segment.script && !segment.audio) {
        return {
          ...segment,
          audio: `audio_${segment.id}.mp3`
        };
      }
      return segment;
    });
    setSegments(updatedSegments);
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
      subtitleStyle: "未设置", 
      sticker: "未设置",
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
        subtitleStyle: "未设置",
        sticker: "未设置", 
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

  const openModal = (type: 'animatedText' | 'subtitle' | 'sticker', segmentId: string) => {
    setActiveModal({ type, segmentId });
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

  return (
    <div className="flex-1 bg-background p-6">
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
          <Button size="sm" className="bg-gradient-primary" onClick={handleGenerateAudio}>
            <Volume2 size={16} className="mr-2" />
            一键生成音频
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

      {/* Table */}
      <div className="bg-card rounded-lg border border-border overflow-hidden shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-editor-grid border-b border-border">
              <tr>
                <th className="w-12 p-3 text-left">
                  <Checkbox
                    checked={selectedSegments.length === segments.length}
                    onCheckedChange={handleSelectAll}
                  />
                </th>
                <th className="w-8 p-3"></th>
                <th className="min-w-[160px] p-3 text-left text-sm font-medium text-foreground">分段名称</th>
                <th className="min-w-[180px] p-3 text-left text-sm font-medium text-foreground">画面</th>
                <th className="min-w-[320px] p-3 text-left text-sm font-medium text-foreground">文案</th>
                <th className="min-w-[100px] p-3 text-left text-sm font-medium text-foreground">花字</th>
                <th className="min-w-[100px] p-3 text-left text-sm font-medium text-foreground">字幕样式</th>
                <th className="min-w-[100px] p-3 text-left text-sm font-medium text-foreground">贴纸</th>
                <th className="min-w-[120px] p-3 text-left text-sm font-medium text-foreground">音频</th>
              </tr>
            </thead>
            <tbody>
              {segments.map((segment, index) => (
                <tr 
                  key={segment.id}
                  className={cn(
                    "border-b border-border hover:bg-editor-hover transition-colors",
                    selectedSegments.includes(segment.id) && "bg-editor-selected/10"
                  )}
                >
                  <td className="p-3">
                    <Checkbox
                      checked={selectedSegments.includes(segment.id)}
                      onCheckedChange={(checked) => handleSelectSegment(segment.id, !!checked)}
                    />
                  </td>
                  <td className="p-3">
                    <GripVertical size={16} className="text-muted-foreground cursor-grab" />
                  </td>
                  <td className="p-3">
                    <div className="space-y-2">
                      <Input
                        value={segment.name}
                        className="text-sm border-0 bg-transparent p-0 font-medium"
                        readOnly
                      />
                      <Select value={segment.type}>
                        <SelectTrigger className="h-8 text-xs bg-secondary">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="开头">开头</SelectItem>
                          <SelectItem value="口播">口播</SelectItem>
                          <SelectItem value="产品展示">产品展示</SelectItem>
                          <SelectItem value="结尾">结尾</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </td>
                  <td className="p-3">
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <Upload size={14} className="mr-2" />
                      {segment.video}
                    </Button>
                  </td>
                  <td className="p-3">
                    <Textarea
                      value={segment.script}
                      className="min-h-[60px] text-sm resize-none border-0 bg-transparent p-0"
                      readOnly
                    />
                  </td>
                  <td className="p-3">
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
                  <td className="p-3">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full justify-start"
                      onClick={() => openModal('subtitle', segment.id)}
                    >
                      <Settings2 size={14} className="mr-2" />
                      {segment.subtitleStyle}
                    </Button>
                  </td>
                  <td className="p-3">
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
                  <td className="p-3">
                    {segment.audio ? (
                      <Button variant="outline" size="sm" className="w-full justify-start">
                        <Music size={14} className="mr-2" />
                        {segment.audio}
                      </Button>
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
      </div>

      {/* Add Segment Button */}
      <div className="mt-4 text-center">
        <Button variant="outline" className="w-full" onClick={handleAddNewSegment}>
          <Plus size={16} className="mr-2" />
          添加
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
      
      {activeModal.type === 'subtitle' && (
        <SubtitleModal
          isOpen={true}
          onClose={closeModal}
          segmentId={activeModal.segmentId!}
        />
      )}
      
      {activeModal.type === 'sticker' && (
        <StickerModal
          isOpen={true}
          onClose={closeModal}
          segmentId={activeModal.segmentId!}
        />
      )}
    </div>
  );
};

export default SegmentTable;