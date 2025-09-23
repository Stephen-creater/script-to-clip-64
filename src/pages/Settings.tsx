import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User } from "lucide-react";

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
      </div>
    </div>
  );
};

export default Settings;