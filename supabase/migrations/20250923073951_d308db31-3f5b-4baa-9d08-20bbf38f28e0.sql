-- 创建材料库存储桶
INSERT INTO storage.buckets (id, name, public) VALUES ('materials', 'materials', true);

-- 创建文件夹表
CREATE TABLE public.folders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  parent_id UUID REFERENCES public.folders(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 创建素材表
CREATE TABLE public.materials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  folder_id UUID REFERENCES public.folders(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  original_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  file_type TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  duration DECIMAL,
  width INTEGER,
  height INTEGER,
  category TEXT NOT NULL,
  subcategory TEXT,
  tags TEXT[],
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 启用 RLS
ALTER TABLE public.folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.materials ENABLE ROW LEVEL SECURITY;

-- 文件夹表的 RLS 策略
CREATE POLICY "用户只能查看自己的文件夹" 
ON public.folders 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "用户可以创建自己的文件夹" 
ON public.folders 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "用户可以更新自己的文件夹" 
ON public.folders 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "用户可以删除自己的文件夹" 
ON public.folders 
FOR DELETE 
USING (auth.uid() = user_id);

-- 素材表的 RLS 策略
CREATE POLICY "用户只能查看自己的素材" 
ON public.materials 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "用户可以上传自己的素材" 
ON public.materials 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "用户可以更新自己的素材" 
ON public.materials 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "用户可以删除自己的素材" 
ON public.materials 
FOR DELETE 
USING (auth.uid() = user_id);

-- 存储桶的 RLS 策略
CREATE POLICY "用户可以查看自己的素材文件" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'materials' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "用户可以上传自己的素材文件" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'materials' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "用户可以更新自己的素材文件" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'materials' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "用户可以删除自己的素材文件" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'materials' AND auth.uid()::text = (storage.foldername(name))[1]);

-- 创建更新时间戳的触发器函数
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- 为表添加更新时间戳触发器
CREATE TRIGGER update_folders_updated_at
  BEFORE UPDATE ON public.folders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_materials_updated_at
  BEFORE UPDATE ON public.materials
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 创建索引以提高查询性能
CREATE INDEX idx_folders_user_id ON public.folders(user_id);
CREATE INDEX idx_folders_parent_id ON public.folders(parent_id);
CREATE INDEX idx_materials_user_id ON public.materials(user_id);
CREATE INDEX idx_materials_folder_id ON public.materials(folder_id);
CREATE INDEX idx_materials_category ON public.materials(category);
CREATE INDEX idx_materials_subcategory ON public.materials(subcategory);
CREATE INDEX idx_materials_tags ON public.materials USING GIN(tags);
CREATE INDEX idx_materials_created_at ON public.materials(created_at DESC);