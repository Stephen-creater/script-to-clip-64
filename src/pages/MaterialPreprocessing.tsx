import { Scissors } from "lucide-react";

const MaterialPreprocessing = () => {
  return (
    <div className="p-6 max-w-7xl mx-auto min-h-full">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-display bg-gradient-primary bg-clip-text text-transparent">
          素材预处理
        </h1>
        <p className="text-body-small text-muted-foreground mt-1">在这里进行素材初剪</p>
      </div>

      {/* Placeholder Content */}
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-6">
          <Scissors size={32} className="text-muted-foreground" />
        </div>
        <h2 className="text-heading-2 text-foreground mb-2">功能开发中</h2>
        <p className="text-body text-muted-foreground max-w-md">
          素材预处理功能正在开发中，敬请期待。您可以在这里进行素材初剪等操作。
        </p>
      </div>
    </div>
  );
};

export default MaterialPreprocessing;
