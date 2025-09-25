-- 暂时允许访问测试数据，直到实现认证系统
-- 修改folders表的RLS策略，允许访问测试数据
DROP POLICY IF EXISTS "用户只能查看自己的文件夹" ON public.folders;
CREATE POLICY "用户只能查看自己的文件夹" 
ON public.folders 
FOR SELECT 
USING (auth.uid() = user_id OR user_id = '00000000-0000-0000-0000-000000000000');

-- 修改materials表的RLS策略，允许访问测试数据
DROP POLICY IF EXISTS "用户只能查看自己的素材" ON public.materials;
CREATE POLICY "用户只能查看自己的素材" 
ON public.materials 
FOR SELECT 
USING (auth.uid() = user_id OR user_id = '00000000-0000-0000-0000-000000000000');