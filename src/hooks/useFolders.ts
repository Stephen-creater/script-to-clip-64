import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'

export interface Folder {
  id: string
  name: string
  parent_id?: string
  user_id: string
  created_at: string
  updated_at: string
}

export const useFolders = () => {
  const [folders, setFolders] = useState<Folder[]>([])
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const loadFolders = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('folders')
        .select('*')
        .order('name')

      if (error) throw error

      // Map database data to Folder interface
      const mappedFolders: Folder[] = (data || []).map((item: any) => ({
        id: item.id,
        name: item.name,
        parent_id: item.parent_id || undefined,
        user_id: item.user_id,
        created_at: item.created_at,
        updated_at: item.updated_at || item.created_at
      }))

      setFolders(mappedFolders)
    } catch (error) {
      console.error('Error loading folders:', error)
      toast({
        title: "加载失败",
        description: "无法加载文件夹",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadFolders()
  }, [])

  // Get image material folders only
  const getImageFolders = () => {
    return folders.filter(folder => 
      folder.name === '图片素材' || 
      folder.parent_id === folders.find(f => f.name === '图片素材')?.id
    )
  }

  // Get folder hierarchy as nested structure
  const getFolderHierarchy = () => {
    const hierarchy: any[] = []
    const imageFolder = folders.find(f => f.name === '图片素材')
    
    if (imageFolder) {
      const subfolders = folders.filter(f => f.parent_id === imageFolder.id)
      
      subfolders.forEach(subfolder => {
        const subSubfolders = folders.filter(f => f.parent_id === subfolder.id)
        hierarchy.push({
          id: subfolder.id,
          name: subfolder.name,
          subfolders: subSubfolders.map(sub => ({
            id: sub.id,
            name: sub.name
          }))
        })
      })
    }
    
    return hierarchy
  }

  return {
    folders,
    loading,
    getImageFolders,
    getFolderHierarchy,
    refreshFolders: loadFolders
  }
}