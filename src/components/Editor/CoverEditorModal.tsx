import React, { useState, useRef, useEffect } from "react";
import { X, Type, Smile, ImagePlus, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface CoverElement {
  id: string;
  type: 'text' | 'sticker';
  content: string;
  position: { x: number; y: number };
  style?: {
    color?: string;
    backgroundColor?: string;
    borderColor?: string;
  };
}

interface CoverEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  posterImage?: string;
  onSave?: (thumbnailUrl: string) => void;
}

const TEXT_STYLES = [
  { id: 'style1', color: '#fff', bg: '#e53935', border: 'transparent' },
  { id: 'style2', color: '#2196f3', bg: '#fff', border: '#2196f3' },
  { id: 'style3', color: '#000', bg: '#ffeb3b', border: 'transparent' },
  { id: 'style4', color: '#fff', bg: '#9c27b0', border: 'transparent' },
];

const MOCK_STICKERS = [
  { id: 's1', content: '🔥' },
  { id: 's2', content: '⭐' },
  { id: 's3', content: '💯' },
  { id: 's4', content: '🎯' },
  { id: 's5', content: '✨' },
  { id: 's6', content: '👍' },
];

export const CoverEditorModal: React.FC<CoverEditorModalProps> = ({
  isOpen,
  onClose,
  posterImage,
  onSave
}) => {
  const [elements, setElements] = useState<CoverElement[]>([]);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [backgroundImage, setBackgroundImage] = useState<string | null>(posterImage || null);
  const [showStickerPanel, setShowStickerPanel] = useState(false);
  const [selectedTextStyle, setSelectedTextStyle] = useState(TEXT_STYLES[0]);
  const canvasRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Drag state
  const [dragging, setDragging] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (posterImage) {
      setBackgroundImage(posterImage);
    }
  }, [posterImage]);

  const handleAddText = () => {
    const newElement: CoverElement = {
      id: `text-${Date.now()}`,
      type: 'text',
      content: '输入标题',
      position: { x: 50, y: 50 },
      style: {
        color: selectedTextStyle.color,
        backgroundColor: selectedTextStyle.bg,
        borderColor: selectedTextStyle.border,
      }
    };
    setElements([...elements, newElement]);
    setSelectedElementId(newElement.id);
    setShowStickerPanel(false);
  };

  const handleAddSticker = (sticker: { id: string; content: string }) => {
    const newElement: CoverElement = {
      id: `sticker-${Date.now()}`,
      type: 'sticker',
      content: sticker.content,
      position: { x: 50, y: 50 },
    };
    setElements([...elements, newElement]);
    setSelectedElementId(newElement.id);
    setShowStickerPanel(false);
  };

  const handleUploadImage = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setBackgroundImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleMouseDown = (e: React.MouseEvent, elementId: string) => {
    e.stopPropagation();
    setDragging(elementId);
    setSelectedElementId(elementId);
    
    const element = elements.find(el => el.id === elementId);
    if (element && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const currentX = (element.position.x / 100) * rect.width;
      const currentY = (element.position.y / 100) * rect.height;
      setDragOffset({
        x: e.clientX - rect.left - currentX,
        y: e.clientY - rect.top - currentY
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragging || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left - dragOffset.x) / rect.width) * 100;
    const y = ((e.clientY - rect.top - dragOffset.y) / rect.height) * 100;

    setElements(elements.map(el => 
      el.id === dragging 
        ? { ...el, position: { x: Math.max(0, Math.min(90, x)), y: Math.max(0, Math.min(90, y)) } }
        : el
    ));
  };

  const handleMouseUp = () => {
    setDragging(null);
  };

  const handleTextChange = (elementId: string, newContent: string) => {
    setElements(elements.map(el => 
      el.id === elementId ? { ...el, content: newContent } : el
    ));
  };

  const handleDeleteElement = (elementId: string) => {
    setElements(elements.filter(el => el.id !== elementId));
    setSelectedElementId(null);
  };

  const handleSave = () => {
    // Mock save - in real implementation, this would capture the canvas as an image
    const mockThumbnailUrl = backgroundImage || '/placeholder.svg';
    onSave?.(mockThumbnailUrl);
    toast.success('封面保存成功！');
    onClose();
  };

  const handleCanvasClick = () => {
    setSelectedElementId(null);
    setShowStickerPanel(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-neutral-900 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-700">
        <h2 className="text-lg font-semibold text-white">封面编辑器</h2>
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-neutral-400 hover:text-white hover:bg-neutral-700"
          onClick={onClose}
        >
          <X size={20} />
        </Button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left - Canvas Area */}
        <div className="flex-1 flex items-center justify-center p-8 bg-neutral-900">
          <div 
            ref={canvasRef}
            className="relative rounded-lg overflow-hidden cursor-crosshair shadow-2xl"
            style={{ 
              aspectRatio: '9/16',
              height: 'min(80vh, 600px)',
              backgroundColor: '#1a1a1a'
            }}
            onClick={handleCanvasClick}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            {/* Background Image */}
            {backgroundImage ? (
              <img 
                src={backgroundImage} 
                alt="Cover background"
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-neutral-500">
                  <ImagePlus size={48} className="mx-auto mb-2 opacity-50" />
                  <p className="text-sm">视频第一帧</p>
                  <p className="text-xs opacity-60">(Mock 占位)</p>
                </div>
              </div>
            )}

            {/* Gradient Overlay for better text visibility */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40 pointer-events-none" />

            {/* Elements */}
            {elements.map((element) => (
              <div
                key={element.id}
                className={`absolute cursor-move select-none transition-shadow ${
                  selectedElementId === element.id 
                    ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-transparent' 
                    : ''
                }`}
                style={{
                  left: `${element.position.x}%`,
                  top: `${element.position.y}%`,
                  transform: 'translate(-50%, -50%)',
                }}
                onMouseDown={(e) => handleMouseDown(e, element.id)}
              >
                {element.type === 'text' ? (
                  <div className="relative group">
                    <input
                      type="text"
                      value={element.content}
                      onChange={(e) => handleTextChange(element.id, e.target.value)}
                      className="px-4 py-2 text-xl font-bold rounded-lg border-2 bg-opacity-90 outline-none min-w-[120px] text-center"
                      style={{
                        color: element.style?.color,
                        backgroundColor: element.style?.backgroundColor,
                        borderColor: element.style?.borderColor || 'transparent',
                      }}
                      onClick={(e) => e.stopPropagation()}
                    />
                    {selectedElementId === element.id && (
                      <button
                        className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center hover:bg-red-600"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteElement(element.id);
                        }}
                      >
                        ×
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="relative group">
                    <span className="text-5xl drop-shadow-lg">{element.content}</span>
                    {selectedElementId === element.id && (
                      <button
                        className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center hover:bg-red-600"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteElement(element.id);
                        }}
                      >
                        ×
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right - Toolkit */}
        <div className="w-72 bg-neutral-800 border-l border-neutral-700 flex flex-col">
          <div className="p-4 border-b border-neutral-700">
            <h3 className="text-base font-semibold text-white">封面装修</h3>
          </div>

          <div className="flex-1 p-4 space-y-6 overflow-y-auto">
            {/* Add Text */}
            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full h-14 justify-start gap-3 bg-neutral-700/50 border-neutral-600 text-white hover:bg-neutral-700 hover:text-white"
                onClick={handleAddText}
              >
                <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <Type size={20} className="text-blue-400" />
                </div>
                <span className="text-sm font-medium">添加花字</span>
              </Button>
              
              {/* Text Style Presets */}
              <div className="flex items-center gap-2 pl-2">
                <span className="text-xs text-neutral-400">预设样式:</span>
                {TEXT_STYLES.map((style) => (
                  <button
                    key={style.id}
                    className={`w-6 h-6 rounded-full border-2 transition-transform ${
                      selectedTextStyle.id === style.id 
                        ? 'scale-110 border-white' 
                        : 'border-transparent hover:scale-105'
                    }`}
                    style={{ backgroundColor: style.bg }}
                    onClick={() => setSelectedTextStyle(style)}
                  />
                ))}
              </div>
            </div>

            {/* Add Sticker */}
            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full h-14 justify-start gap-3 bg-neutral-700/50 border-neutral-600 text-white hover:bg-neutral-700 hover:text-white"
                onClick={() => setShowStickerPanel(!showStickerPanel)}
              >
                <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                  <Smile size={20} className="text-yellow-400" />
                </div>
                <span className="text-sm font-medium">添加贴纸</span>
              </Button>
              
              {/* Sticker Grid */}
              {showStickerPanel && (
                <div className="grid grid-cols-4 gap-2 p-3 bg-neutral-700/50 rounded-lg">
                  {MOCK_STICKERS.map((sticker) => (
                    <button
                      key={sticker.id}
                      className="w-12 h-12 flex items-center justify-center text-2xl bg-neutral-600/50 rounded-lg hover:bg-neutral-600 transition-colors"
                      onClick={() => handleAddSticker(sticker)}
                    >
                      {sticker.content}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Upload Image */}
            <div>
              <Button
                variant="outline"
                className="w-full h-14 justify-start gap-3 bg-neutral-700/50 border-neutral-600 text-white hover:bg-neutral-700 hover:text-white"
                onClick={handleUploadImage}
              >
                <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                  <ImagePlus size={20} className="text-green-400" />
                </div>
                <span className="text-sm font-medium">上传图片</span>
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>

            {/* Tips */}
            <div className="mt-auto pt-4 border-t border-neutral-700">
              <p className="text-xs text-neutral-500">
                提示：点击画布上的元素可选中，拖动调整位置，双击编辑文字内容。
              </p>
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="p-4 border-t border-neutral-700 space-y-2">
            <Button
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              onClick={handleSave}
            >
              <Check size={16} className="mr-2" />
              确认保存
            </Button>
            <Button
              variant="outline"
              className="w-full border-neutral-600 text-neutral-300 hover:bg-neutral-700 hover:text-white"
              onClick={onClose}
            >
              取消
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoverEditorModal;
