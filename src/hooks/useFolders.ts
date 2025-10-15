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

// 模拟文件夹数据
const mockFolders: Folder[] = [
  // 主文件夹 - 视频文件夹
  {
    id: 'folder-video-library',
    name: '视频文件夹',
    user_id: 'demo-user',
    created_at: '2024-01-10T07:00:00Z',
    updated_at: '2024-01-10T07:00:00Z'
  },
  // 子文件夹 - 西班牙火车旅行_成片
  {
    id: 'folder-xibanya',
    name: '西班牙火车旅行_成片',
    parent_id: 'folder-video-library',
    user_id: 'demo-user',
    created_at: '2024-01-10T07:10:00Z',
    updated_at: '2024-01-10T07:10:00Z'
  },
  // 子文件夹 - 英铁1015
  {
    id: 'folder-yingtie1015',
    name: '英铁1015',
    parent_id: 'folder-video-library',
    user_id: 'demo-user',
    created_at: '2024-01-10T07:20:00Z',
    updated_at: '2024-01-10T07:20:00Z'
  },
  // 子文件夹 - 英铁1016
  {
    id: 'folder-yingtie1016',
    name: '英铁1016',
    parent_id: 'folder-video-library',
    user_id: 'demo-user',
    created_at: '2024-01-10T07:30:00Z',
    updated_at: '2024-01-10T07:30:00Z'
  },
  // 主文件夹 - 视频素材
  {
    id: 'folder-video',
    name: '视频素材',
    user_id: 'demo-user',
    created_at: '2024-01-10T08:00:00Z',
    updated_at: '2024-01-10T08:00:00Z'
  },
  // 子文件夹 - 车窗外风景
  {
    id: 'folder-window-scenery',
    name: '车窗外风景',
    parent_id: 'folder-video',
    user_id: 'demo-user',
    created_at: '2024-01-10T08:30:00Z',
    updated_at: '2024-01-10T08:30:00Z'
  },
  // 子文件夹 - 车站内
  {
    id: 'folder-station-interior',
    name: '车站内',
    parent_id: 'folder-video',
    user_id: 'demo-user',
    created_at: '2024-01-10T09:00:00Z',
    updated_at: '2024-01-10T09:00:00Z'
  },
  // 主文件夹 - 图片素材
  {
    id: 'folder-main-image',
    name: '图片素材',
    user_id: 'demo-user',
    created_at: '2024-01-10T10:00:00Z',
    updated_at: '2024-01-10T10:00:00Z'
  },
  // 子文件夹 - 表情类
  {
    id: 'folder-emotion',
    name: '表情类',
    parent_id: 'folder-main-image',
    user_id: 'demo-user',
    created_at: '2024-01-10T10:30:00Z',
    updated_at: '2024-01-10T10:30:00Z'
  },
  // 子文件夹 - 装饰类
  {
    id: 'folder-decoration',
    name: '装饰类',
    parent_id: 'folder-main-image',
    user_id: 'demo-user',
    created_at: '2024-01-10T11:00:00Z',
    updated_at: '2024-01-10T11:00:00Z'
  },
  // 子文件夹 - 营销类
  {
    id: 'folder-marketing',
    name: '营销类',
    parent_id: 'folder-main-image',
    user_id: 'demo-user',
    created_at: '2024-01-10T11:30:00Z',
    updated_at: '2024-01-10T11:30:00Z'
  },
  // 主文件夹 - 音频素材
  {
    id: 'folder-audio',
    name: '音频素材',
    user_id: 'demo-user',
    created_at: '2024-01-10T12:00:00Z',
    updated_at: '2024-01-10T12:00:00Z'
  },
  // 子文件夹 - BGM
  {
    id: 'folder-bgm',
    name: 'BGM',
    parent_id: 'folder-audio',
    user_id: 'demo-user',
    created_at: '2024-01-10T12:30:00Z',
    updated_at: '2024-01-10T12:30:00Z'
  },
  // 子文件夹 - 音效素材
  {
    id: 'folder-sound-effects',
    name: '音效素材',
    parent_id: 'folder-audio',
    user_id: 'demo-user',
    created_at: '2024-01-10T13:00:00Z',
    updated_at: '2024-01-10T13:00:00Z'
  }
]

export const useFolders = () => {
  const [folders, setFolders] = useState<Folder[]>([])
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const loadFolders = async () => {
    setLoading(true)
    try {
      // 模拟网络延迟
      await new Promise(resolve => setTimeout(resolve, 300))
      
      // 直接使用模拟数据
      setFolders(mockFolders)
      
      console.log('已加载模拟文件夹数据:', mockFolders.length, '个文件夹')
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