import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Settings2, User, Video, Palette, Download } from "lucide-react";

const Settings = () => {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
          设置
        </h1>
        <p className="text-muted-foreground mt-2">配置您的工作环境和偏好</p>
      </div>

      <div className="space-y-6">
        {/* 用户信息 */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <User size={20} className="text-primary" />
              <CardTitle>用户信息</CardTitle>
            </div>
            <CardDescription>
              管理您的账户信息和个人资料
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="username">用户名</Label>
                <Input id="username" defaultValue="admin" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">邮箱</Label>
                <Input id="email" defaultValue="admin@example.com" />
              </div>
            </div>
            <Button>保存更改</Button>
          </CardContent>
        </Card>

        {/* 视频设置 */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Video size={20} className="text-primary" />
              <CardTitle>视频设置</CardTitle>
            </div>
            <CardDescription>
              配置默认的视频参数和质量设置
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>默认分辨率</Label>
                <Select defaultValue="1080p">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="720p">720p (HD)</SelectItem>
                    <SelectItem value="1080p">1080p (Full HD)</SelectItem>
                    <SelectItem value="4k">4K (Ultra HD)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>帧率</Label>
                <Select defaultValue="30fps">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="24fps">24 FPS</SelectItem>
                    <SelectItem value="30fps">30 FPS</SelectItem>
                    <SelectItem value="60fps">60 FPS</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>编码格式</Label>
                <Select defaultValue="h264">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="h264">H.264</SelectItem>
                    <SelectItem value="h265">H.265</SelectItem>
                    <SelectItem value="vp9">VP9</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>比特率</Label>
                <Select defaultValue="high">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">低质量</SelectItem>
                    <SelectItem value="medium">中等质量</SelectItem>
                    <SelectItem value="high">高质量</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 界面设置 */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Palette size={20} className="text-primary" />
              <CardTitle>界面设置</CardTitle>
            </div>
            <CardDescription>
              自定义您的工作界面外观和行为
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>主题模式</Label>
                <p className="text-sm text-muted-foreground">切换深色或浅色主题</p>
              </div>
              <Select defaultValue="dark">
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">浅色</SelectItem>
                  <SelectItem value="dark">深色</SelectItem>
                  <SelectItem value="auto">自动</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>自动保存</Label>
                <p className="text-sm text-muted-foreground">自动保存项目更改</p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>显示网格线</Label>
                <p className="text-sm text-muted-foreground">在预览中显示辅助网格</p>
              </div>
              <Switch />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>启用快捷键提示</Label>
                <p className="text-sm text-muted-foreground">显示键盘快捷键提示</p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        {/* 导出设置 */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Download size={20} className="text-primary" />
              <CardTitle>导出设置</CardTitle>
            </div>
            <CardDescription>
              配置视频导出的默认参数
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>默认导出路径</Label>
              <div className="flex gap-2">
                <Input defaultValue="/Users/admin/Videos" className="flex-1" />
                <Button variant="outline">浏览</Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>文件名格式</Label>
                <Select defaultValue="auto">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">自动命名</SelectItem>
                    <SelectItem value="project">项目名称</SelectItem>
                    <SelectItem value="date">日期时间</SelectItem>
                    <SelectItem value="custom">自定义</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>导出格式</Label>
                <Select defaultValue="mp4">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mp4">MP4</SelectItem>
                    <SelectItem value="mov">MOV</SelectItem>
                    <SelectItem value="avi">AVI</SelectItem>
                    <SelectItem value="webm">WebM</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>导出完成后打开文件夹</Label>
                <p className="text-sm text-muted-foreground">自动打开包含导出文件的文件夹</p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        {/* 系统信息 */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Settings2 size={20} className="text-primary" />
              <CardTitle>系统信息</CardTitle>
            </div>
            <CardDescription>
              查看系统状态和版本信息
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <Label className="text-muted-foreground">版本号</Label>
                <p className="font-mono">v2.1.0</p>
              </div>
              <div>
                <Label className="text-muted-foreground">最后更新</Label>
                <p>2024-01-15</p>
              </div>
              <div>
                <Label className="text-muted-foreground">存储空间</Label>
                <p>2.3 GB / 10 GB</p>
              </div>
              <div>
                <Label className="text-muted-foreground">项目数量</Label>
                <p>15 个项目</p>
              </div>
            </div>
            
            <Separator />
            
            <div className="flex gap-2">
              <Button variant="outline">检查更新</Button>
              <Button variant="outline">清理缓存</Button>
              <Button variant="outline">导出设置</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;