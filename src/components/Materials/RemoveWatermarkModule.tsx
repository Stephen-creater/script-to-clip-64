import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Upload,
  HelpCircle,
  Wand2,
  Paintbrush,
  Eraser,
  FileVideo,
  Loader2,
  Check,
  Eye,
  Download,
  ArrowLeftRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type SelectionMode = "smart" | "paint" | "erase";

interface PaintStroke {
  points: { x: number; y: number }[];
  mode: "paint" | "erase";
  brushSize: number;
}

interface RemoveWatermarkModuleProps {
  onBatchUpload: () => void;
}

const RemoveWatermarkModule = ({ onBatchUpload }: RemoveWatermarkModuleProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string>("");
  const [isDragging, setIsDragging] = useState(false);

  // AI Eraser state
  const [aiEnabled, setAiEnabled] = useState(true);
  const [selectionMode, setSelectionMode] = useState<SelectionMode>("smart");
  const [brushSize, setBrushSize] = useState([50]);
  const [brushSizeInput, setBrushSizeInput] = useState("50");

  // Canvas painting state
  const [isPainting, setIsPainting] = useState(false);
  const [strokes, setStrokes] = useState<PaintStroke[]>([]);
  const currentStrokeRef = useRef<PaintStroke | null>(null);

  // Smart selection box state
  const [selectionBox, setSelectionBox] = useState({ x: 20, y: 10, w: 60, h: 15 });
  const [isDraggingBox, setIsDraggingBox] = useState(false);
  const [isResizingBox, setIsResizingBox] = useState<string | null>(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Processing state
  const [isProcessing, setIsProcessing] = useState(false);
  const [processProgress, setProcessProgress] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showComparison, setShowComparison] = useState(false);

  // Progress bar (frame scrubber)
  const [framePosition, setFramePosition] = useState(0);

  // Canvas dimensions
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });

  // Mock smart detection highlights
  const [smartHighlights] = useState([
    { x: 5, y: 5, w: 25, h: 8, label: "水印" },
    { x: 10, y: 85, w: 80, h: 10, label: "字幕" },
  ]);

  // Draw mock video frame
  const drawVideoFrame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Draw a mock video frame with gradient background
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, "#1a1a2e");
    gradient.addColorStop(0.5, "#16213e");
    gradient.addColorStop(1, "#0f3460");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw mock content elements
    ctx.fillStyle = "rgba(255,255,255,0.1)";
    ctx.fillRect(canvas.width * 0.1, canvas.height * 0.3, canvas.width * 0.8, canvas.height * 0.4);

    // Draw mock watermark
    ctx.save();
    ctx.globalAlpha = 0.3;
    ctx.fillStyle = "#ffffff";
    ctx.font = `${Math.max(14, canvas.width * 0.03)}px sans-serif`;
    ctx.fillText("@ sample_watermark", canvas.width * 0.05, canvas.height * 0.1);
    ctx.restore();

    // Draw mock subtitle
    ctx.save();
    ctx.fillStyle = "rgba(0,0,0,0.6)";
    const subtitleH = canvas.height * 0.08;
    ctx.fillRect(canvas.width * 0.1, canvas.height * 0.87, canvas.width * 0.8, subtitleH);
    ctx.fillStyle = "#ffffff";
    ctx.font = `${Math.max(12, canvas.width * 0.025)}px sans-serif`;
    ctx.textAlign = "center";
    ctx.fillText("这是一段示例字幕文本", canvas.width * 0.5, canvas.height * 0.87 + subtitleH * 0.7);
    ctx.restore();
  }, []);

  // Draw overlay (paint strokes, selection box, smart highlights)
  const drawOverlay = useCallback(() => {
    const canvas = overlayCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw smart highlights when in smart mode
    if (selectionMode === "smart" && aiEnabled) {
      smartHighlights.forEach((hl) => {
        const x = (hl.x / 100) * canvas.width;
        const y = (hl.y / 100) * canvas.height;
        const w = (hl.w / 100) * canvas.width;
        const h = (hl.h / 100) * canvas.height;

        ctx.strokeStyle = "hsl(199, 89%, 48%)";
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 3]);
        ctx.strokeRect(x, y, w, h);
        ctx.setLineDash([]);

        ctx.fillStyle = "rgba(14, 165, 233, 0.15)";
        ctx.fillRect(x, y, w, h);

        // Label
        ctx.fillStyle = "hsl(199, 89%, 48%)";
        ctx.font = "12px sans-serif";
        ctx.fillText(hl.label, x + 4, y - 4);
      });
    }

    // Draw paint strokes
    strokes.forEach((stroke) => {
      if (stroke.points.length < 2) return;
      ctx.beginPath();
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.lineWidth = stroke.brushSize;

      if (stroke.mode === "paint") {
        ctx.strokeStyle = "rgba(239, 68, 68, 0.4)";
        ctx.globalCompositeOperation = "source-over";
      } else {
        ctx.globalCompositeOperation = "destination-out";
        ctx.strokeStyle = "rgba(0,0,0,1)";
      }

      ctx.moveTo(
        (stroke.points[0].x / 100) * canvas.width,
        (stroke.points[0].y / 100) * canvas.height
      );
      for (let i = 1; i < stroke.points.length; i++) {
        ctx.lineTo(
          (stroke.points[i].x / 100) * canvas.width,
          (stroke.points[i].y / 100) * canvas.height
        );
      }
      ctx.stroke();
      ctx.globalCompositeOperation = "source-over";
    });

    // Draw draggable selection box (in smart mode)
    if (selectionMode === "smart") {
      const bx = (selectionBox.x / 100) * canvas.width;
      const by = (selectionBox.y / 100) * canvas.height;
      const bw = (selectionBox.w / 100) * canvas.width;
      const bh = (selectionBox.h / 100) * canvas.height;

      ctx.strokeStyle = "#22d3ee";
      ctx.lineWidth = 2;
      ctx.strokeRect(bx, by, bw, bh);
      ctx.fillStyle = "rgba(34, 211, 238, 0.08)";
      ctx.fillRect(bx, by, bw, bh);

      // Draw corner handles
      const handleSize = 8;
      const handles = [
        { x: bx, y: by },
        { x: bx + bw, y: by },
        { x: bx, y: by + bh },
        { x: bx + bw, y: by + bh },
        { x: bx + bw / 2, y: by },
        { x: bx + bw / 2, y: by + bh },
        { x: bx, y: by + bh / 2 },
        { x: bx + bw, y: by + bh / 2 },
      ];
      handles.forEach((h) => {
        ctx.fillStyle = "#22d3ee";
        ctx.fillRect(h.x - handleSize / 2, h.y - handleSize / 2, handleSize, handleSize);
      });
    }

    // Show comparison divider
    if (showComparison && isCompleted) {
      const divX = canvas.width * 0.5;
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(divX, 0);
      ctx.lineTo(divX, canvas.height);
      ctx.stroke();

      // Labels
      ctx.fillStyle = "rgba(0,0,0,0.6)";
      ctx.fillRect(divX - 60, canvas.height / 2 - 14, 50, 24);
      ctx.fillRect(divX + 10, canvas.height / 2 - 14, 50, 24);
      ctx.fillStyle = "#ffffff";
      ctx.font = "12px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("处理前", divX - 35, canvas.height / 2 + 2);
      ctx.fillText("处理后", divX + 35, canvas.height / 2 + 2);
      ctx.textAlign = "start";
    }
  }, [selectionMode, aiEnabled, smartHighlights, strokes, selectionBox, showComparison, isCompleted]);

  // Resize canvas to fit container
  useEffect(() => {
    const updateSize = () => {
      const container = containerRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;
      setCanvasSize({ width: w, height: h });

      [canvasRef.current, overlayCanvasRef.current].forEach((c) => {
        if (c) {
          c.width = w;
          c.height = h;
        }
      });
    };

    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, [videoFile]);

  useEffect(() => {
    if (videoFile) {
      drawVideoFrame();
      drawOverlay();
    }
  }, [videoFile, drawVideoFrame, drawOverlay, canvasSize]);

  // Canvas mouse handlers for painting
  const getCanvasPos = (e: React.MouseEvent) => {
    const canvas = overlayCanvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    };
  };

  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (selectionMode === "smart") {
      // Check if clicking on box handles or body
      const pos = getCanvasPos(e);
      const { x, y, w, h } = selectionBox;
      const handleTolerance = 3;

      // Check corners
      const corners = [
        { name: "tl", cx: x, cy: y },
        { name: "tr", cx: x + w, cy: y },
        { name: "bl", cx: x, cy: y + h },
        { name: "br", cx: x + w, cy: y + h },
      ];
      for (const c of corners) {
        if (Math.abs(pos.x - c.cx) < handleTolerance && Math.abs(pos.y - c.cy) < handleTolerance) {
          setIsResizingBox(c.name);
          setDragStart(pos);
          return;
        }
      }

      // Check if inside box
      if (pos.x >= x && pos.x <= x + w && pos.y >= y && pos.y <= y + h) {
        setIsDraggingBox(true);
        setDragStart({ x: pos.x - x, y: pos.y - y });
        return;
      }
      return;
    }

    if (selectionMode === "paint" || selectionMode === "erase") {
      const pos = getCanvasPos(e);
      setIsPainting(true);
      const newStroke: PaintStroke = {
        points: [pos],
        mode: selectionMode === "paint" ? "paint" : "erase",
        brushSize: brushSize[0] * 0.5,
      };
      currentStrokeRef.current = newStroke;
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    if (selectionMode === "smart") {
      const pos = getCanvasPos(e);
      if (isDraggingBox) {
        setSelectionBox((prev) => ({
          ...prev,
          x: Math.max(0, Math.min(100 - prev.w, pos.x - dragStart.x)),
          y: Math.max(0, Math.min(100 - prev.h, pos.y - dragStart.y)),
        }));
        drawOverlay();
        return;
      }
      if (isResizingBox) {
        const { x, y, w, h } = selectionBox;
        let newBox = { ...selectionBox };
        if (isResizingBox.includes("r")) newBox.w = Math.max(5, pos.x - x);
        if (isResizingBox.includes("b")) newBox.h = Math.max(5, pos.y - y);
        if (isResizingBox.includes("l")) {
          newBox.w = Math.max(5, x + w - pos.x);
          newBox.x = pos.x;
        }
        if (isResizingBox.includes("t")) {
          newBox.h = Math.max(5, y + h - pos.y);
          newBox.y = pos.y;
        }
        setSelectionBox(newBox);
        drawOverlay();
        return;
      }
      return;
    }

    if (isPainting && currentStrokeRef.current) {
      const pos = getCanvasPos(e);
      currentStrokeRef.current.points.push(pos);
      // Redraw overlay with current stroke
      const allStrokes = [...strokes, currentStrokeRef.current];
      setStrokes(allStrokes);
    }
  };

  const handleCanvasMouseUp = () => {
    if (isDraggingBox) setIsDraggingBox(false);
    if (isResizingBox) setIsResizingBox(null);
    if (isPainting && currentStrokeRef.current) {
      setStrokes((prev) => [...prev, currentStrokeRef.current!]);
      currentStrokeRef.current = null;
      setIsPainting(false);
    }
  };

  // File upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("video/")) {
      setVideoFile(file);
      setVideoUrl(URL.createObjectURL(file));
      setIsCompleted(false);
      setIsProcessing(false);
      setStrokes([]);
      setShowComparison(false);
    }
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("video/")) {
      setVideoFile(file);
      setVideoUrl(URL.createObjectURL(file));
      setIsCompleted(false);
      setIsProcessing(false);
      setStrokes([]);
      setShowComparison(false);
    }
  }, []);

  // Handle brush size sync
  const handleBrushSizeSlider = (val: number[]) => {
    setBrushSize(val);
    setBrushSizeInput(val[0].toString());
  };

  const handleBrushSizeInput = (val: string) => {
    setBrushSizeInput(val);
    const num = parseInt(val);
    if (!isNaN(num) && num >= 1 && num <= 100) {
      setBrushSize([num]);
    }
  };

  // Process (mock)
  const handleProcess = () => {
    setIsProcessing(true);
    setProcessProgress(0);
    const interval = setInterval(() => {
      setProcessProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsProcessing(false);
          setIsCompleted(true);
          toast.success("AI消除完成");
          return 100;
        }
        return prev + Math.floor(Math.random() * 15) + 5;
      });
    }, 500);
  };

  // Mode buttons config
  const modeButtons = [
    { mode: "smart" as SelectionMode, icon: Wand2, label: "智能选区" },
    { mode: "paint" as SelectionMode, icon: Paintbrush, label: "涂抹选区" },
    { mode: "erase" as SelectionMode, icon: Eraser, label: "擦除选区" },
  ];

  return (
    <div className="bg-card border border-border rounded-lg flex flex-col h-full">
      {/* Header - matching other modules */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Wand2 size={18} className="text-primary" />
          <h3 className="font-medium text-foreground">去水印/字幕</h3>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onBatchUpload}>
            批量上传
          </Button>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <HelpCircle size={16} className="text-muted-foreground" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="max-w-xs">
              <ul className="text-xs space-y-1">
                <li>• 水印面积不超过画面 20% 效果最佳</li>
                <li>• 支持智能选区、涂抹选区、擦除选区</li>
                <li>• 处理完成后支持前后对比查看</li>
              </ul>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>

      {/* Content - Left/Right split */}
      <div className="flex-1 overflow-hidden flex">
        {!videoFile ? (
          /* Upload area when no file */
          <div className="flex-1 flex items-center justify-center p-4">
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors w-full",
                isDragging
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-muted-foreground"
              )}
            >
              <Upload size={32} className="mx-auto text-muted-foreground mb-3" />
              <p className="text-sm font-medium text-foreground mb-1">点击上传或拖拽视频</p>
              <p className="text-xs text-muted-foreground">
                支持格式：MP4, MOV, AVI · 最大 500MB
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="video/*"
                className="hidden"
                onChange={handleFileUpload}
              />
            </div>
          </div>
        ) : (
          <>
            {/* Left - Video Canvas */}
            <div className="flex-1 flex flex-col min-w-0">
              <div
                ref={containerRef}
                className="flex-1 relative bg-black/90 overflow-hidden"
                style={{
                  cursor:
                    selectionMode === "paint"
                      ? "crosshair"
                      : selectionMode === "erase"
                      ? "cell"
                      : "default",
                }}
              >
                <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
                <canvas
                  ref={overlayCanvasRef}
                  className="absolute inset-0 w-full h-full"
                  onMouseDown={handleCanvasMouseDown}
                  onMouseMove={handleCanvasMouseMove}
                  onMouseUp={handleCanvasMouseUp}
                  onMouseLeave={handleCanvasMouseUp}
                />

                {/* Processing overlay */}
                {isProcessing && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <div className="bg-card rounded-lg p-4 text-center space-y-3 w-48">
                      <Loader2 size={24} className="mx-auto animate-spin text-primary" />
                      <p className="text-sm text-foreground">AI消除中...</p>
                      <Progress value={Math.min(processProgress, 100)} className="h-2" />
                      <p className="text-xs text-muted-foreground">{Math.min(processProgress, 100)}%</p>
                    </div>
                  </div>
                )}

                {/* Completed overlay actions */}
                {isCompleted && !showComparison && (
                  <div className="absolute top-3 right-3 flex gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      className="gap-1 text-xs"
                      onClick={() => setShowComparison(true)}
                    >
                      <ArrowLeftRight size={14} />
                      对比
                    </Button>
                    <Button size="sm" variant="secondary" className="gap-1 text-xs">
                      <Download size={14} />
                      下载
                    </Button>
                  </div>
                )}
                {showComparison && (
                  <div className="absolute top-3 right-3">
                    <Button
                      size="sm"
                      variant="secondary"
                      className="gap-1 text-xs"
                      onClick={() => setShowComparison(false)}
                    >
                      <Eye size={14} />
                      退出对比
                    </Button>
                  </div>
                )}
              </div>

              {/* Bottom bar: filename + progress scrubber */}
              <div className="px-3 py-2 bg-muted/50 border-t border-border space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground min-w-0">
                    <FileVideo size={14} className="flex-shrink-0" />
                    <span className="truncate">{videoFile.name}</span>
                  </div>
                  {isCompleted && (
                    <div className="flex items-center gap-1">
                      <Check size={12} className="text-emerald-500" />
                      <span className="text-xs text-emerald-600">已完成</span>
                    </div>
                  )}
                </div>
                <Slider
                  value={[framePosition]}
                  onValueChange={(v) => setFramePosition(v[0])}
                  max={100}
                  step={1}
                  className="w-full"
                />
              </div>
            </div>

            {/* Right - Control Panel */}
            <div className="w-[200px] flex-shrink-0 border-l border-border flex flex-col bg-card overflow-y-auto">
              <Tabs defaultValue="basic" className="flex-1 flex flex-col">
                <TabsList className="w-full rounded-none border-b border-border bg-transparent h-auto p-0">
                  {["基础", "抠像", "蒙版", "美颜美体"].map((tab) => (
                    <TabsTrigger
                      key={tab}
                      value={tab === "基础" ? "basic" : tab === "抠像" ? "keying" : tab === "蒙版" ? "mask" : "beauty"}
                      className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none text-xs py-2.5"
                    >
                      {tab}
                    </TabsTrigger>
                  ))}
                </TabsList>

                <TabsContent value="basic" className="flex-1 flex flex-col p-3 space-y-4 mt-0">
                  {/* AI消除 toggle */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">AI消除</span>
                    <Switch
                      checked={aiEnabled}
                      onCheckedChange={setAiEnabled}
                    />
                  </div>

                  {aiEnabled && (
                    <>
                      {/* Mode buttons */}
                      <div className="grid grid-cols-3 gap-1.5">
                        {modeButtons.map(({ mode, icon: Icon, label }) => (
                          <button
                            key={mode}
                            onClick={() => setSelectionMode(mode)}
                            className={cn(
                              "flex flex-col items-center gap-1 py-2 px-1 rounded-md text-xs transition-colors border",
                              selectionMode === mode
                                ? "bg-primary/10 border-primary text-primary"
                                : "bg-muted/50 border-transparent text-muted-foreground hover:bg-muted"
                            )}
                          >
                            <Icon size={16} />
                            <span className="leading-tight text-center" style={{ fontSize: "10px" }}>
                              {label}
                            </span>
                          </button>
                        ))}
                      </div>

                      {/* Brush size - only for paint/erase modes */}
                      {(selectionMode === "paint" || selectionMode === "erase") && (
                        <div className="space-y-2">
                          <span className="text-xs text-muted-foreground">画笔大小</span>
                          <div className="flex items-center gap-2">
                            <Slider
                              value={brushSize}
                              onValueChange={handleBrushSizeSlider}
                              min={1}
                              max={100}
                              step={1}
                              className="flex-1"
                            />
                            <Input
                              value={brushSizeInput}
                              onChange={(e) => handleBrushSizeInput(e.target.value)}
                              className="w-12 h-7 text-xs text-center p-0"
                              type="number"
                              min={1}
                              max={100}
                            />
                          </div>
                        </div>
                      )}

                      {/* Hint */}
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        在左侧视频上涂抹需要消除的区域
                      </p>

                      {/* Spacer */}
                      <div className="flex-1" />

                      {/* Process button */}
                      <Button
                        className="w-full bg-cyan-500 hover:bg-cyan-600 text-white"
                        onClick={handleProcess}
                        disabled={isProcessing}
                      >
                        {isProcessing ? (
                          <>
                            <Loader2 size={16} className="mr-1 animate-spin" />
                            处理中...
                          </>
                        ) : (
                          "消除"
                        )}
                      </Button>
                    </>
                  )}
                </TabsContent>

                <TabsContent value="keying" className="flex-1 p-3 mt-0">
                  <p className="text-xs text-muted-foreground text-center py-8">抠像功能开发中...</p>
                </TabsContent>
                <TabsContent value="mask" className="flex-1 p-3 mt-0">
                  <p className="text-xs text-muted-foreground text-center py-8">蒙版功能开发中...</p>
                </TabsContent>
                <TabsContent value="beauty" className="flex-1 p-3 mt-0">
                  <p className="text-xs text-muted-foreground text-center py-8">美颜美体功能开发中...</p>
                </TabsContent>
              </Tabs>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default RemoveWatermarkModule;
