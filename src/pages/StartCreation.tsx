import React, { useState, useMemo, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Zap, 
  Wand2, 
  FileText, 
  Rocket, 
  Clock, 
  Lock, 
  X, 
  Search,
  Check,
  Layers,
  Star,
  Copy,
  Trash2,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  ChevronDown,
  ChevronUp,
  Eye,
  Flame,
  GripHorizontal
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

// Enhanced Template interface
interface SegmentScript {
  index: number;
  duration: number;
  title: string;
  content: string;
  materialTip?: string;
}

interface ProductionTips {
  materials: string;
  captionStyle: string;
  bgm: string;
  transition: string;
}

interface Template {
  id: string;
  name: string;
  thumbnail: string;
  videoUrl: string;
  duration: number;
  segments: number;
  tags: string[];
  views: number;
  isHot: boolean;
  category: 'knowledge' | 'pain-point' | 'viral' | 'tutorial' | 'all';
  script: SegmentScript[];
  tips: ProductionTips;
}

// Categories
const CATEGORIES = [
  { id: 'all', name: '全部' },
  { id: 'knowledge', name: '冷知识' },
  { id: 'pain-point', name: '用户痛点' },
  { id: 'viral', name: '爆款梗改' },
  { id: 'tutorial', name: '教程指南' }
];

// Mock templates data
const MOCK_TEMPLATES: Template[] = [
  {
    id: '1',
    name: '带货混剪_快闪',
    thumbnail: '/placeholder.svg',
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    duration: 15,
    segments: 5,
    tags: ['高转化', '快闪'],
    views: 1234,
    isHot: true,
    category: 'pain-point',
    script: [
      { index: 1, duration: 3, title: '开场吸睛', content: '你还在为[产品]发愁吗？', materialTip: '产品特写图' },
      { index: 2, duration: 4, title: '痛点共鸣', content: '传统方法又贵又慢', materialTip: '对比场景' },
      { index: 3, duration: 4, title: '解决方案', content: '[产品名]帮你解决！', materialTip: '产品使用视频' },
      { index: 4, duration: 2, title: '价格刺激', content: '限时5折，仅需¥XX', materialTip: '价格标签' },
      { index: 5, duration: 2, title: '行动召唤', content: '立即下单 →', materialTip: '二维码' }
    ],
    tips: {
      materials: '产品图3张 + 使用视频1段',
      captionStyle: '大字快闪 + 数字强调',
      bgm: '节奏感强的电子音乐',
      transition: '快切无转场'
    }
  },
  {
    id: '2',
    name: '风景Vlog_舒缓',
    thumbnail: '/placeholder.svg',
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    duration: 30,
    segments: 3,
    tags: ['卡点', '空镜'],
    views: 856,
    isHot: false,
    category: 'knowledge',
    script: [
      { index: 1, duration: 10, title: '开场氛围', content: '跟我一起看看[目的地]的美景', materialTip: '风景远景' },
      { index: 2, duration: 15, title: '景点展示', content: '这里有最美的日落', materialTip: '多个景点' },
      { index: 3, duration: 5, title: '结尾升华', content: '旅行的意义就在于此', materialTip: '人物剪影' }
    ],
    tips: {
      materials: '风景视频5-8段',
      captionStyle: '小清新手写体',
      bgm: '轻柔吉他或钢琴',
      transition: '淡入淡出'
    }
  },
  {
    id: '3',
    name: '口播_知识科普',
    thumbnail: '/placeholder.svg',
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    duration: 60,
    segments: 8,
    tags: ['字幕大', '安全区'],
    views: 2103,
    isHot: true,
    category: 'knowledge',
    script: [
      { index: 1, duration: 5, title: '引入话题', content: '今天教大家一个冷知识', materialTip: '口播视频' },
      { index: 2, duration: 8, title: '知识点1', content: '火车的速度其实...', materialTip: '示意图' },
      { index: 3, duration: 10, title: '知识点2', content: '而且你知道吗...', materialTip: '动画素材' },
      { index: 4, duration: 8, title: '延伸讲解', content: '这背后的原理是...', materialTip: '图表' },
      { index: 5, duration: 12, title: '案例分析', content: '举个例子...', materialTip: '案例视频' },
      { index: 6, duration: 8, title: '知识点3', content: '还有一点很重要...', materialTip: '图解' },
      { index: 7, duration: 5, title: '总结', content: '所以记住这几点...', materialTip: '总结卡片' },
      { index: 8, duration: 4, title: '结尾互动', content: '你还想知道什么？评论区告诉我', materialTip: '口播' }
    ],
    tips: {
      materials: '口播视频1段 + 辅助素材若干',
      captionStyle: '大字幕 + 关键词高亮',
      bgm: '轻快背景音乐',
      transition: '简单切换'
    }
  },
  {
    id: '4',
    name: '我的专用_英铁',
    thumbnail: '/placeholder.svg',
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    duration: 20,
    segments: 4,
    tags: ['个人'],
    views: 45,
    isHot: false,
    category: 'all',
    script: [
      { index: 1, duration: 5, title: '开场', content: '从伦敦到爱丁堡', materialTip: '火车外观' },
      { index: 2, duration: 6, title: '沿途风景', content: '窗外的英伦风光', materialTip: '车窗风景' },
      { index: 3, duration: 5, title: '车内体验', content: '舒适的一等座', materialTip: '车厢内景' },
      { index: 4, duration: 4, title: '结尾', content: '期待下次旅程', materialTip: '站台' }
    ],
    tips: {
      materials: '火车视频 + 风景图',
      captionStyle: '简洁字幕',
      bgm: '轻音乐',
      transition: '淡入淡出'
    }
  },
  {
    id: '5',
    name: '美食探店_快节奏',
    thumbnail: '/placeholder.svg',
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    duration: 25,
    segments: 6,
    tags: ['美食', '探店'],
    views: 3456,
    isHot: true,
    category: 'viral',
    script: [
      { index: 1, duration: 3, title: '悬念开场', content: '这家店排队2小时值不值？', materialTip: '门店外景' },
      { index: 2, duration: 5, title: '环境展示', content: '装修风格很有特色', materialTip: '店内环境' },
      { index: 3, duration: 6, title: '招牌菜1', content: '必点的招牌来了', materialTip: '菜品特写' },
      { index: 4, duration: 5, title: '招牌菜2', content: '还有这道也不能错过', materialTip: '菜品特写' },
      { index: 5, duration: 4, title: '试吃反应', content: '一口下去...', materialTip: '吃播画面' },
      { index: 6, duration: 2, title: '总结推荐', content: '值得来打卡！', materialTip: '店铺信息' }
    ],
    tips: {
      materials: '美食特写6-8张 + 环境视频',
      captionStyle: '活泼字体 + emoji',
      bgm: '欢快节奏',
      transition: '跳切'
    }
  },
  {
    id: '6',
    name: '产品开箱_对比',
    thumbnail: '/placeholder.svg',
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    duration: 45,
    segments: 7,
    tags: ['开箱', '测评'],
    views: 1890,
    isHot: false,
    category: 'tutorial',
    script: [
      { index: 1, duration: 5, title: '开箱悬念', content: '这两款谁更值得买？', materialTip: '两款产品包装' },
      { index: 2, duration: 8, title: '外观对比', content: '先看外观设计', materialTip: '外观对比镜头' },
      { index: 3, duration: 8, title: '功能对比1', content: '核心功能对比', materialTip: '功能演示' },
      { index: 4, duration: 8, title: '功能对比2', content: '细节功能差异', materialTip: '细节特写' },
      { index: 5, duration: 6, title: '使用体验', content: '实际用下来...', materialTip: '使用画面' },
      { index: 6, duration: 5, title: '价格分析', content: '价格方面...', materialTip: '价格对比图' },
      { index: 7, duration: 5, title: '购买建议', content: '我的推荐是...', materialTip: '产品推荐' }
    ],
    tips: {
      materials: '两款产品 + 对比素材',
      captionStyle: '信息图风格',
      bgm: '科技感背景音',
      transition: '分屏对比'
    }
  },
  {
    id: '7',
    name: '情感故事_治愈',
    thumbnail: '/placeholder.svg',
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    duration: 35,
    segments: 5,
    tags: ['情感', '治愈'],
    views: 2567,
    isHot: false,
    category: 'viral',
    script: [
      { index: 1, duration: 6, title: '情境引入', content: '生活中总有这样的时刻...', materialTip: '情绪画面' },
      { index: 2, duration: 8, title: '故事展开', content: '那天发生了一件事...', materialTip: '场景重现' },
      { index: 3, duration: 10, title: '情感高潮', content: '那一刻我突然明白...', materialTip: '情感特写' },
      { index: 4, duration: 6, title: '感悟分享', content: '原来幸福就是...', materialTip: '温馨画面' },
      { index: 5, duration: 5, title: '结尾升华', content: '愿你也能找到属于自己的...', materialTip: '治愈画面' }
    ],
    tips: {
      materials: '情感类素材 + 空镜',
      captionStyle: '文艺手写体',
      bgm: '钢琴/轻音乐',
      transition: '慢淡入淡出'
    }
  },
  {
    id: '8',
    name: '技能教程_步骤',
    thumbnail: '/placeholder.svg',
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    duration: 50,
    segments: 6,
    tags: ['教程', '干货'],
    views: 4321,
    isHot: true,
    category: 'tutorial',
    script: [
      { index: 1, duration: 5, title: '问题引入', content: '很多人问我这个怎么做', materialTip: '问题展示' },
      { index: 2, duration: 10, title: '步骤一', content: '第一步，先准备...', materialTip: '操作演示' },
      { index: 3, duration: 12, title: '步骤二', content: '接下来，我们要...', materialTip: '操作演示' },
      { index: 4, duration: 10, title: '步骤三', content: '然后是关键的一步...', materialTip: '操作演示' },
      { index: 5, duration: 8, title: '注意事项', content: '有几个坑要注意...', materialTip: '错误示范' },
      { index: 6, duration: 5, title: '成果展示', content: '最终效果就是这样', materialTip: '成品展示' }
    ],
    tips: {
      materials: '操作录屏 + 步骤图解',
      captionStyle: '清晰标注 + 步骤序号',
      bgm: '轻快背景',
      transition: '直切'
    }
  },
  {
    id: '9',
    name: '热点追踪_快评',
    thumbnail: '/placeholder.svg',
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    duration: 18,
    segments: 4,
    tags: ['热点', '快评'],
    views: 5678,
    isHot: true,
    category: 'viral',
    script: [
      { index: 1, duration: 4, title: '热点引入', content: '最近这件事火了...', materialTip: '新闻截图' },
      { index: 2, duration: 6, title: '事件还原', content: '事情是这样的...', materialTip: '事件素材' },
      { index: 3, duration: 5, title: '观点输出', content: '我的看法是...', materialTip: '观点卡片' },
      { index: 4, duration: 3, title: '互动引导', content: '你怎么看？评论区见', materialTip: '互动引导' }
    ],
    tips: {
      materials: '热点素材 + 表情包',
      captionStyle: '大字强调',
      bgm: '新闻感背景',
      transition: '快切'
    }
  },
  {
    id: '10',
    name: '日常记录_碎片',
    thumbnail: '/placeholder.svg',
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    duration: 22,
    segments: 5,
    tags: ['日常', 'Vlog'],
    views: 789,
    isHot: false,
    category: 'all',
    script: [
      { index: 1, duration: 4, title: '早间日常', content: '今天的一天从...开始', materialTip: '早起画面' },
      { index: 2, duration: 5, title: '工作/学习', content: '上午的时间用来...', materialTip: '工作画面' },
      { index: 3, duration: 5, title: '午间时光', content: '中午吃了...', materialTip: '美食/休息' },
      { index: 4, duration: 5, title: '下午活动', content: '下午做了...', materialTip: '活动画面' },
      { index: 5, duration: 3, title: '一天结束', content: '今天也是充实的一天', materialTip: '晚间画面' }
    ],
    tips: {
      materials: '日常手机拍摄素材',
      captionStyle: '简约字幕',
      bgm: '轻松氛围',
      transition: '自然过渡'
    }
  }
];

// Mock projects data for custom creation view
interface Project {
  id: number;
  title: string;
  duration: string;
  segments: number;
  createdAt: string;
  thumbnail?: string;
}

const MOCK_PROJECTS: Project[] = [
  { id: 1, title: '222', duration: '00:01', segments: 2, createdAt: '2026-01-12 14:50:27' },
  { id: 2, title: '熊浩成-test', duration: '00:01', segments: 2, createdAt: '2025-12-29 10:57:25' },
  { id: 3, title: '1111111', duration: '00:49', segments: 5, createdAt: '2025-12-26 17:41:29' },
  { id: 4, title: '1226', duration: '00:55', segments: 15, createdAt: '2025-12-26 16:15:47' },
  { id: 5, title: '12.26早上来了发', duration: '00:34', segments: 6, createdAt: '2025-12-25 17:19:42' },
  { id: 6, title: '1224dzx', duration: '00:43', segments: 8, createdAt: '2025-12-24 17:56:30' },
  { id: 7, title: '1229-syx-火车技巧', duration: '00:00', segments: 4, createdAt: '2025-12-23 18:08:19' },
  { id: 8, title: 'zmy', duration: '00:00', segments: 3, createdAt: '2025-12-23 17:54:18' },
  { id: 9, title: '12231', duration: '00:27', segments: 6, createdAt: '2025-12-23 17:44:19' },
  { id: 10, title: '23日范1', duration: '00:00', segments: 6, createdAt: '2025-12-23 17:15:20' },
  { id: 11, title: '12.233333', duration: '00:19', segments: 6, createdAt: '2025-12-23 16:36:23' },
  { id: 12, title: 'zyq1223', duration: '00:23', segments: 15, createdAt: '2025-12-23 16:29:09' },
];

const StartCreation: React.FC = () => {
  const navigate = useNavigate();
  
  // Left panel state
  const [sourceMode, setSourceMode] = useState<'blank' | 'template'>('template');
  const [taskName, setTaskName] = useState('');
  const [durationMode, setDurationMode] = useState<'flexible' | 'fixed'>('flexible');
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(MOCK_TEMPLATES[0]);
  
  // Right panel state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [splitRatio, setSplitRatio] = useState(55); // Top area percentage
  const [templateDurationMode, setTemplateDurationMode] = useState<'flexible' | 'fixed'>('flexible');
  
  // Video player state
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // Collapsible state
  const [scriptOpen, setScriptOpen] = useState(false);
  const [tipsOpen, setTipsOpen] = useState(false);
  
  // Drag state
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  const filteredTemplates = useMemo(() => {
    return MOCK_TEMPLATES.filter(template => {
      const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
      const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  const handleSelectTemplate = (template: Template) => {
    setSelectedTemplate(template);
    setSourceMode('template');
    setIsPlaying(false);
    setScriptOpen(false);
    setTipsOpen(false);
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
    }
  };

  const handleClearTemplate = () => {
    setSelectedTemplate(null);
    setSourceMode('blank');
  };

  const handleCreateTask = () => {
    if (!taskName.trim()) {
      toast.error("请输入任务名称");
      return;
    }
    
    if (sourceMode === 'template' && !selectedTemplate) {
      toast.error("请先选择模板");
      return;
    }
    
    toast.success("任务创建成功！");
    const params = new URLSearchParams({
      taskName: taskName.trim(),
      durationMode
    });
    if (selectedTemplate?.id) {
      params.set('templateId', selectedTemplate.id.toString());
    }
    navigate(`/editor?${params.toString()}`);
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleFullscreen = () => {
    if (videoRef.current) {
      videoRef.current.requestFullscreen();
    }
  };

  // Drag handlers for split view
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    isDragging.current = true;
    e.preventDefault();
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging.current || !containerRef.current) return;
    
    const containerRect = containerRef.current.getBoundingClientRect();
    const newRatio = ((e.clientY - containerRect.top) / containerRect.height) * 100;
    setSplitRatio(Math.min(Math.max(newRatio, 30), 70));
  }, []);

  const handleMouseUp = useCallback(() => {
    isDragging.current = false;
  }, []);

  React.useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}分${secs}秒` : `${secs}s`;
  };

  return (
    <div className="h-screen flex flex-row overflow-hidden bg-background min-w-[1200px]">
      {/* Left Panel - Command Center */}
      <div className="w-[400px] flex-shrink-0 bg-card border-r border-border shadow-sm z-10 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <h1 className="text-xl font-semibold text-foreground">开始创作</h1>
          </div>
          <p className="text-muted-foreground text-sm">配置参数，一键启动流水线</p>
        </div>

        {/* Scrollable Form Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Source Switch */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-foreground">创作基准</label>
            <div className="flex gap-2">
              <Button
                variant={sourceMode === 'blank' ? 'default' : 'outline'}
                className={cn(
                  "flex-1 justify-center gap-2 h-10",
                  sourceMode === 'blank' && "bg-primary text-primary-foreground"
                )}
                onClick={() => {
                  setSourceMode('blank');
                  setSelectedTemplate(null);
                }}
              >
                <Wand2 size={16} />
                自定义创作
              </Button>
              <Button
                variant={sourceMode === 'template' ? 'default' : 'outline'}
                className={cn(
                  "flex-1 justify-center gap-2 h-10",
                  sourceMode === 'template' && "bg-primary text-primary-foreground"
                )}
                onClick={() => setSourceMode('template')}
              >
                <FileText size={16} />
                引用模板
              </Button>
            </div>
          </div>

          {/* Task Name */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-foreground">名称</label>
            <Input
              placeholder="例如：英铁混剪-2025..."
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
              className="h-10"
            />
          </div>

          {/* Duration Mode - Only show for blank mode */}
          {sourceMode === 'blank' && (
            <div className="space-y-3">
              <label className="text-sm font-medium text-foreground">时长模式</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setDurationMode('flexible')}
                  className={cn(
                    "p-4 rounded-md border text-left transition-all duration-200",
                    durationMode === 'flexible'
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-muted-foreground"
                  )}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Clock size={16} className={durationMode === 'flexible' ? "text-primary" : "text-muted-foreground"} />
                    <span className="font-medium text-sm text-foreground">灵活时长</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    画面跟随口播时长自动伸缩
                  </p>
                </button>
                <button
                  onClick={() => setDurationMode('fixed')}
                  className={cn(
                    "p-4 rounded-md border text-left transition-all duration-200",
                    durationMode === 'fixed'
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-muted-foreground"
                  )}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Lock size={16} className={durationMode === 'fixed' ? "text-primary" : "text-muted-foreground"} />
                    <span className="font-medium text-sm text-foreground">固定时长</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    强制锁定每个分段的秒数
                  </p>
                </button>
              </div>
            </div>
          )}

          {/* Selected Template Info */}
          {sourceMode === 'template' && selectedTemplate && (
            <div className="space-y-3">
              <label className="text-sm font-medium text-foreground">已选模板</label>
              <div className="p-4 rounded-md bg-muted/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center">
                    <FileText size={18} className="text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm text-foreground">{selectedTemplate.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {selectedTemplate.segments} 个分段 · {formatDuration(selectedTemplate.duration)}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
                  onClick={handleClearTemplate}
                >
                  <X size={16} />
                </Button>
              </div>
            </div>
          )}

          {/* Prompt to select template */}
          {sourceMode === 'template' && !selectedTemplate && (
            <div className="p-4 rounded-md border border-dashed border-primary/30 bg-primary/5">
              <p className="text-sm text-muted-foreground text-center">
                👉 请在右侧模板库中选择一个模板
              </p>
            </div>
          )}
        </div>

        {/* Sticky Bottom Action */}
        <div className="p-6 border-t border-border bg-card">
          <Button
            onClick={handleCreateTask}
            className="w-full h-11 text-sm font-medium bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
          >
            <Rocket size={16} />
            立即创建任务
          </Button>
        </div>
      </div>

      {/* Right Panel - Resource Pool */}
      <div className="flex-1 flex flex-col bg-muted/30 overflow-hidden">
        {sourceMode === 'template' ? (
          <>
            {/* Template Mode Header */}
            <div className="p-4 border-b border-border bg-card">
              <div className="flex items-center justify-between gap-4 mb-3">
                <span className="font-medium text-foreground">选择模板</span>
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="搜索模板..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 h-9"
                  />
                </div>
              </div>
              
              {/* Template Duration Mode */}
              <div className="space-y-2">
                <span className="text-xs text-muted-foreground">模板模式</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setTemplateDurationMode('flexible')}
                    className={cn(
                      "px-4 py-1.5 rounded-md text-sm font-medium transition-colors",
                      templateDurationMode === 'flexible'
                        ? "bg-primary text-primary-foreground"
                        : "bg-card text-muted-foreground hover:text-foreground border border-border"
                    )}
                  >
                    灵活时长
                  </button>
                  <button
                    onClick={() => setTemplateDurationMode('fixed')}
                    className={cn(
                      "px-4 py-1.5 rounded-md text-sm font-medium transition-colors",
                      templateDurationMode === 'fixed'
                        ? "bg-primary text-primary-foreground"
                        : "bg-card text-muted-foreground hover:text-foreground border border-border"
                    )}
                  >
                    固定时长
                  </button>
                </div>
              </div>
            </div>

            {/* Split View Container */}
            <div ref={containerRef} className="flex-1 flex flex-col overflow-hidden">
              {/* Top: Template Grid */}
              <div 
                className="overflow-y-auto p-4"
                style={{ height: `${splitRatio}%` }}
              >
                {filteredTemplates.length > 0 ? (
                  <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filteredTemplates.map((template) => {
                      const isSelected = selectedTemplate?.id === template.id;
                      return (
                        <button
                          key={template.id}
                          onClick={() => handleSelectTemplate(template)}
                          className={cn(
                            "group relative bg-card rounded-md border overflow-hidden text-left transition-all duration-200",
                            isSelected
                              ? "border-primary border-2 shadow-sm"
                              : "border-border hover:border-muted-foreground"
                          )}
                        >
                          {/* Selected Check */}
                          {isSelected && (
                            <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center z-10">
                              <Check size={12} className="text-primary-foreground" />
                            </div>
                          )}

                          {/* Thumbnail */}
                          <div className="aspect-video bg-muted relative">
                            <img 
                              src={template.thumbnail} 
                              alt={template.name}
                              className="w-full h-full object-cover"
                            />
                            {/* Duration & Hot badge */}
                            <div className="absolute bottom-2 left-2 flex items-center gap-1.5">
                              <Badge variant="secondary" className="bg-black/70 text-white text-xs gap-1 px-1.5 py-0.5">
                                <Clock size={10} />
                                {formatDuration(template.duration)}
                              </Badge>
                              {template.isHot && (
                                <Badge className="bg-orange-500 text-white text-xs gap-0.5 px-1.5 py-0.5">
                                  <Flame size={10} />
                                </Badge>
                              )}
                            </div>
                          </div>

                          {/* Content */}
                          <div className="p-3 space-y-2">
                            <h3 className="font-medium text-sm text-foreground line-clamp-1">
                              {template.name}
                            </h3>
                            
                            {/* Tags */}
                            <div className="flex flex-wrap gap-1">
                              {template.tags.map((tag, idx) => (
                                <span 
                                  key={idx} 
                                  className="text-xs text-muted-foreground"
                                >
                                  #{tag}
                                </span>
                              ))}
                            </div>

                            {/* Stats */}
                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Layers size={10} />
                                {template.segments}段
                              </span>
                              <span className="flex items-center gap-1">
                                <Eye size={10} />
                                {template.views >= 1000 ? `${(template.views / 1000).toFixed(1)}k` : template.views}
                              </span>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-12 h-12 rounded-md bg-muted flex items-center justify-center mx-auto mb-3">
                        <FileText size={20} className="text-muted-foreground" />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {searchQuery ? '未找到匹配的模板' : '暂无模板'}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Drag Handle */}
              <div 
                className="h-2 bg-border hover:bg-primary/30 cursor-row-resize flex items-center justify-center transition-colors group"
                onMouseDown={handleMouseDown}
              >
                <GripHorizontal size={14} className="text-muted-foreground group-hover:text-primary" />
              </div>

              {/* Bottom: Template Preview */}
              <div 
                className="overflow-y-auto bg-card border-t border-border"
                style={{ height: `${100 - splitRatio}%` }}
              >
                {selectedTemplate ? (
                  <div className="p-4 space-y-4">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-foreground flex items-center gap-2">
                          {selectedTemplate.name}
                          {selectedTemplate.isHot && (
                            <Badge className="bg-orange-500 text-white text-xs">热门</Badge>
                          )}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          {selectedTemplate.tags.map((tag, idx) => (
                            <span key={idx} className="text-xs text-muted-foreground">#{tag}</span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Video Player - 9:16 aspect ratio */}
                    <div className="relative aspect-[9/16] max-h-[300px] bg-black rounded-md overflow-hidden mx-auto">
                      <video
                        ref={videoRef}
                        src={selectedTemplate.videoUrl}
                        className="w-full h-full object-contain"
                        muted={isMuted}
                        loop
                        playsInline
                      />
                      
                      {/* Video Controls */}
                      <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/70 to-transparent">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={togglePlay}
                              className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                            >
                              {isPlaying ? <Pause size={14} className="text-white" /> : <Play size={14} className="text-white ml-0.5" />}
                            </button>
                            <button 
                              onClick={toggleMute}
                              className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                            >
                              {isMuted ? <VolumeX size={14} className="text-white" /> : <Volume2 size={14} className="text-white" />}
                            </button>
                          </div>
                          <button 
                            onClick={handleFullscreen}
                            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                          >
                            <Maximize2 size={14} className="text-white" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <Clock size={14} />
                        {formatDuration(selectedTemplate.duration)}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Layers size={14} />
                        {selectedTemplate.segments}个分段
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Eye size={14} />
                        {selectedTemplate.views.toLocaleString()}次使用
                      </span>
                    </div>

                    {/* Script Collapsible */}
                    <Collapsible open={scriptOpen} onOpenChange={setScriptOpen}>
                      <CollapsibleTrigger className="w-full flex items-center justify-between p-3 rounded-md bg-muted/50 hover:bg-muted transition-colors">
                        <span className="text-sm font-medium text-foreground flex items-center gap-2">
                          📝 脚本内容
                        </span>
                        {scriptOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </CollapsibleTrigger>
                      <CollapsibleContent className="mt-2">
                        <div className="space-y-3 p-3 rounded-md border border-border">
                          {selectedTemplate.script.map((segment) => (
                            <div key={segment.index} className="space-y-1">
                              <div className="flex items-center gap-2 text-sm">
                                <span className="font-medium text-foreground">
                                  第{segment.index}段（{segment.duration}s）- {segment.title}
                                </span>
                              </div>
                              <p className="text-sm text-muted-foreground pl-4">
                                "{segment.content}"
                              </p>
                              {segment.materialTip && (
                                <p className="text-xs text-primary pl-4">
                                  💡 建议素材：{segment.materialTip}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </CollapsibleContent>
                    </Collapsible>

                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <p className="text-sm text-muted-foreground">选择一个模板查看详情</p>
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Custom Creation Mode Header */}
            <div className="p-4 border-b border-border bg-card">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <Wand2 size={18} className="text-primary" />
                  <span className="font-medium text-foreground">选择历史项目作为参考</span>
                </div>
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="搜索项目..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 h-9"
                  />
                </div>
              </div>
            </div>

            {/* Project Grid */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 2xl:grid-cols-8 gap-4">
                {MOCK_PROJECTS.filter(p => 
                  p.title.toLowerCase().includes(searchQuery.toLowerCase())
                ).map((project) => (
                  <div
                    key={project.id}
                    className="group relative bg-card rounded-md border border-border overflow-hidden hover:border-muted-foreground transition-all duration-200"
                  >
                    {/* Thumbnail - 9:16 aspect ratio */}
                    <div className="aspect-[9/16] bg-gradient-to-br from-violet-500 to-purple-600 relative">
                      {/* Hover actions */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-200 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                        <button className="w-7 h-7 rounded-full bg-white/90 hover:bg-white flex items-center justify-center transition-colors">
                          <Star size={12} className="text-amber-500" />
                        </button>
                        <button className="w-7 h-7 rounded-full bg-white/90 hover:bg-white flex items-center justify-center transition-colors">
                          <Copy size={12} className="text-muted-foreground" />
                        </button>
                        <button className="w-7 h-7 rounded-full bg-white/90 hover:bg-white flex items-center justify-center transition-colors">
                          <Trash2 size={12} className="text-destructive" />
                        </button>
                      </div>
                    </div>

                    {/* Info */}
                    <div className="p-2 space-y-1">
                      <h4 className="font-medium text-xs text-foreground truncate">
                        {project.title}
                      </h4>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock size={10} />
                        <span>{project.duration} ({project.segments} 分段)</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {project.createdAt.split(' ')[0]}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default StartCreation;
