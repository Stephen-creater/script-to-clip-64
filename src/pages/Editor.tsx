import SegmentTable from "@/components/Editor/SegmentTable";

const Editor = () => {
  return (
    <div className="flex h-full">
      {/* Video Preview */}
      <div className="w-1/3 bg-preview-bg border-r border-border p-6">
        <div className="bg-black rounded-lg aspect-video flex items-center justify-center">
          <div className="text-white/60 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-white/10 rounded-full flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-white/60">
                <path d="M8 5v14l11-7L8 5z" fill="currentColor"/>
              </svg>
            </div>
            <p className="text-sm">视频预览区域</p>
            <p className="text-xs mt-2 text-white/40">点击预览按钮查看效果</p>
          </div>
        </div>
        
        {/* Preview Controls */}
        <div className="mt-6 space-y-4">
          <div className="bg-card p-4 rounded-lg border border-border">
            <h3 className="text-sm font-medium mb-3">项目信息</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex justify-between">
                <span>总时长:</span>
                <span>45.6秒</span>
              </div>
              <div className="flex justify-between">
                <span>分段数:</span>
                <span>5个</span>
              </div>
              <div className="flex justify-between">
                <span>分辨率:</span>
                <span>1920x1080</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Segment Table */}
      <SegmentTable />
    </div>
  );
};

export default Editor;