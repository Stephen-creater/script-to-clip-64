-- 添加缺失的字段到materials表
ALTER TABLE public.materials 
ADD COLUMN IF NOT EXISTS original_name text,
ADD COLUMN IF NOT EXISTS mime_type text,
ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now(),
ADD COLUMN IF NOT EXISTS width integer,
ADD COLUMN IF NOT EXISTS height integer,
ADD COLUMN IF NOT EXISTS tags text[],
ADD COLUMN IF NOT EXISTS folder_id uuid;

-- 更新现有记录的缺失字段
UPDATE public.materials 
SET 
  original_name = name || '.png',
  mime_type = CASE 
    WHEN file_type = 'image' THEN 'image/png'
    WHEN file_type = 'video' THEN 'video/mp4'
    WHEN file_type = 'audio' THEN 'audio/mp3'
    ELSE 'application/octet-stream'
  END,
  updated_at = now()
WHERE original_name IS NULL OR mime_type IS NULL;