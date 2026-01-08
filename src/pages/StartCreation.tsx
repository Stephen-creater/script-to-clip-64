import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Zap, 
  Rocket, 
  Clock, 
  Lock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const StartCreation: React.FC = () => {
  const navigate = useNavigate();
  
  // State
  const [taskName, setTaskName] = useState('');
  const [durationMode, setDurationMode] = useState<'flexible' | 'fixed'>('fixed');

  const handleCreateTask = () => {
    if (!taskName.trim()) {
      toast.error("请输入任务名称");
      return;
    }
    
    toast.success("任务创建成功！");
    const params = new URLSearchParams({
      taskName: taskName.trim(),
      durationMode
    });
    navigate(`/editor?${params.toString()}`);
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-background dark:to-muted/30">
      <div className="w-full max-w-lg p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Zap className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">开始创作</h1>
          <p className="text-muted-foreground">配置参数，一键启动流水线</p>
        </div>

        {/* Form Card */}
        <div className="bg-card rounded-2xl border border-border shadow-lg p-6 space-y-6">
          {/* Duration Mode Toggle + Task Name */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-foreground">任务配置</label>
            <div className="flex gap-3">
              {/* Duration Mode Toggle */}
              <div className="flex-shrink-0">
                <div className="flex p-1 bg-muted rounded-lg h-11">
                  <button
                    onClick={() => setDurationMode('fixed')}
                    className={cn(
                      "px-3 rounded-md text-sm font-medium transition-all duration-200 flex items-center gap-1.5",
                      durationMode === 'fixed'
                        ? "bg-card text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Lock size={14} />
                    固定时长
                  </button>
                  <button
                    onClick={() => setDurationMode('flexible')}
                    className={cn(
                      "px-3 rounded-md text-sm font-medium transition-all duration-200 flex items-center gap-1.5",
                      durationMode === 'flexible'
                        ? "bg-card text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Clock size={14} />
                    灵活时长
                  </button>
                </div>
              </div>

              {/* Task Name Input */}
              <Input
                placeholder="输入任务名称..."
                value={taskName}
                onChange={(e) => setTaskName(e.target.value)}
                className="h-11 flex-1"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {durationMode === 'fixed' 
                ? '固定时长：强制锁定每个分段的秒数' 
                : '灵活时长：画面跟随口播时长自动伸缩'}
            </p>
          </div>

          {/* Create Button */}
          <Button
            onClick={handleCreateTask}
            className="w-full h-12 text-base font-medium bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
          >
            <Rocket size={18} />
            开始创作
          </Button>
        </div>
      </div>
    </div>
  );
};

export default StartCreation;
