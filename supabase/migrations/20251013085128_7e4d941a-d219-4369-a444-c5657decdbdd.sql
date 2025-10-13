-- Add type column to folders table
ALTER TABLE public.folders 
ADD COLUMN type text NOT NULL DEFAULT 'video' CHECK (type IN ('video', 'image', 'audio'));

-- Add comment for documentation
COMMENT ON COLUMN public.folders.type IS 'Folder type: video, image, or audio. Restricts what file types can be uploaded to the folder.';