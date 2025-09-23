-- 创建项目表
CREATE TABLE public.projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  thumbnail TEXT,
  duration DECIMAL,
  segments_count INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft',
  is_template BOOLEAN DEFAULT FALSE,
  data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 启用 RLS
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- 项目表的 RLS 策略
CREATE POLICY "用户只能查看自己的项目" 
ON public.projects 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "用户可以创建自己的项目" 
ON public.projects 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "用户可以更新自己的项目" 
ON public.projects 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "用户可以删除自己的项目" 
ON public.projects 
FOR DELETE 
USING (auth.uid() = user_id);

-- 为项目表添加更新时间戳触发器
CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 创建索引以提高查询性能
CREATE INDEX idx_projects_user_id ON public.projects(user_id);
CREATE INDEX idx_projects_status ON public.projects(status);
CREATE INDEX idx_projects_is_template ON public.projects(is_template);
CREATE INDEX idx_projects_created_at ON public.projects(created_at DESC);