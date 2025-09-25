import { useState, useEffect } from 'react'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/integrations/supabase/client'

export interface Material {
  id: string
  name: string
  original_name: string
  file_path: string
  file_type: string
  mime_type: string
  file_size: number
  category: string
  subcategory?: string
  width?: number
  height?: number
  duration?: number
  tags?: string[]
  metadata?: Record<string, any>
  created_at: string
  updated_at: string
  user_id: string
  folder_id?: string
}

type MaterialInsert = Omit<Material, 'id' | 'created_at' | 'updated_at' | 'user_id'>
type MaterialUpdate = Partial<Omit<Material, 'id' | 'created_at' | 'user_id'>>

// Mock data for demo - 包含所有类型素材
const mockMaterials: Material[] = [
  // 视频素材 - 车窗外风景
  {
    id: 'video-1',
    name: '春日车窗风景',
    original_name: 'spring_window_view.mp4',
    file_path: '/placeholder.svg',
    file_type: 'video',
    mime_type: 'video/mp4',
    file_size: 8520000,
    category: '视频素材',
    subcategory: '车窗外风景',
    duration: 45.2,
    width: 1920,
    height: 1080,
    tags: ['车窗', '风景', '春天', '绿色'],
    metadata: {},
    created_at: '2024-01-10T09:00:00Z',
    updated_at: '2024-01-10T09:00:00Z',
    user_id: 'demo-user',
  },
  {
    id: 'video-2',
    name: '都市夜景车窗',
    original_name: 'city_night_window.mp4',
    file_path: '/placeholder.svg',
    file_type: 'video',
    mime_type: 'video/mp4',
    file_size: 12450000,
    category: '视频素材',
    subcategory: '车窗外风景',
    duration: 38.7,
    width: 1920,
    height: 1080,
    tags: ['车窗', '夜景', '城市', '霓虹'],
    metadata: {},
    created_at: '2024-01-10T09:15:00Z',
    updated_at: '2024-01-10T09:15:00Z',
    user_id: 'demo-user',
  },
  {
    id: 'video-3',
    name: '乡村田野车窗',
    original_name: 'countryside_window.mp4',
    file_path: '/placeholder.svg',
    file_type: 'video',
    mime_type: 'video/mp4',
    file_size: 9750000,
    category: '视频素材',
    subcategory: '车窗外风景',
    duration: 52.3,
    width: 1920,
    height: 1080,
    tags: ['车窗', '田野', '乡村', '自然'],
    metadata: {},
    created_at: '2024-01-10T09:30:00Z',
    updated_at: '2024-01-10T09:30:00Z',
    user_id: 'demo-user',
  },
  // 视频素材 - 车站内
  {
    id: 'video-4',
    name: '繁忙候车大厅',
    original_name: 'busy_waiting_hall.mp4',
    file_path: '/placeholder.svg',
    file_type: 'video',
    mime_type: 'video/mp4',
    file_size: 15620000,
    category: '视频素材',
    subcategory: '车站内',
    duration: 41.8,
    width: 1920,
    height: 1080,
    tags: ['车站', '候车', '人群', '大厅'],
    metadata: {},
    created_at: '2024-01-10T10:00:00Z',
    updated_at: '2024-01-10T10:00:00Z',
    user_id: 'demo-user',
  },
  {
    id: 'video-5',
    name: '月台等车场景',
    original_name: 'platform_waiting.mp4',
    file_path: '/placeholder.svg',
    file_type: 'video',
    mime_type: 'video/mp4',
    file_size: 11200000,
    category: '视频素材',
    subcategory: '车站内',
    duration: 35.6,
    width: 1920,
    height: 1080,
    tags: ['月台', '等车', '火车', '旅客'],
    metadata: {},
    created_at: '2024-01-10T10:15:00Z',
    updated_at: '2024-01-10T10:15:00Z',
    user_id: 'demo-user',
  },
  {
    id: 'video-6',
    name: '检票口通道',
    original_name: 'ticket_check_gate.mp4',
    file_path: '/placeholder.svg',
    file_type: 'video',
    mime_type: 'video/mp4',
    file_size: 8900000,
    category: '视频素材',
    subcategory: '车站内',
    duration: 28.4,
    width: 1920,
    height: 1080,
    tags: ['检票', '通道', '车站', '进站'],
    metadata: {},
    created_at: '2024-01-10T10:30:00Z',
    updated_at: '2024-01-10T10:30:00Z',
    user_id: 'demo-user',
  },
  // 贴纸素材 - 表情类
  {
    id: 'sticker-1',
    name: '开心表情贴纸',
    original_name: 'test1.png',
    file_path: '/assets/stickers/test1.png',
    file_type: 'image',
    mime_type: 'image/png',
    file_size: 15360,
    category: '图片素材',
    subcategory: '表情类',
    width: 128,
    height: 128,
    tags: ['表情', '贴纸', '开心', '可爱'],
    metadata: {},
    created_at: '2024-01-15T10:30:00Z',
    updated_at: '2024-01-15T10:30:00Z',
    user_id: 'demo-user',
  },
  {
    id: 'sticker-2',
    name: '惊讶表情贴纸',
    original_name: 'test2.png',
    file_path: '/assets/stickers/test2.png',
    file_type: 'image',
    mime_type: 'image/png',
    file_size: 18240,
    category: '图片素材',
    subcategory: '表情类',
    width: 128,
    height: 128,
    tags: ['表情', '贴纸', '惊讶', '震惊'],
    metadata: {},
    created_at: '2024-01-16T09:15:00Z',
    updated_at: '2024-01-16T09:15:00Z',
    user_id: 'demo-user',
  },
  {
    id: 'sticker-3',
    name: '哭泣表情贴纸',
    original_name: 'sad-face.png',
    file_path: '/assets/stickers/test1.png', // 复用测试图片
    file_type: 'image',
    mime_type: 'image/png',
    file_size: 16800,
    category: '图片素材',
    subcategory: '表情类',
    width: 128,
    height: 128,
    tags: ['表情', '贴纸', '哭泣', '难过'],
    metadata: {},
    created_at: '2024-01-17T11:45:00Z',
    updated_at: '2024-01-17T11:45:00Z',
    user_id: 'demo-user',
  },
  // 贴纸素材 - 装饰类
  {
    id: 'sticker-4',
    name: '爱心装饰贴纸',
    original_name: 'heart-decoration.png',
    file_path: '/assets/stickers/test2.png', // 复用测试图片
    file_type: 'image',
    mime_type: 'image/png',
    file_size: 12800,
    category: '图片素材',
    subcategory: '装饰类',
    width: 64,
    height: 64,
    tags: ['爱心', '装饰', '浪漫', '粉色'],
    metadata: {},
    created_at: '2024-01-18T14:20:00Z',
    updated_at: '2024-01-18T14:20:00Z',
    user_id: 'demo-user',
  },
  {
    id: 'sticker-5',
    name: '星星装饰贴纸',
    original_name: 'star-decoration.png',
    file_path: '/assets/stickers/test1.png', // 复用测试图片
    file_type: 'image',
    mime_type: 'image/png',
    file_size: 14560,
    category: '图片素材',
    subcategory: '装饰类',
    width: 64,
    height: 64,
    tags: ['星星', '装饰', '闪亮', '金色'],
    metadata: {},
    created_at: '2024-01-19T16:10:00Z',
    updated_at: '2024-01-19T16:10:00Z',
    user_id: 'demo-user',
  },
  {
    id: 'sticker-6',
    name: '彩虹装饰贴纸',
    original_name: 'rainbow-decoration.png',
    file_path: '/assets/stickers/test2.png', // 复用测试图片
    file_type: 'image',
    mime_type: 'image/png',
    file_size: 19200,
    category: '图片素材',
    subcategory: '装饰类',
    width: 96,
    height: 48,
    tags: ['彩虹', '装饰', '色彩', '梦幻'],
    metadata: {},
    created_at: '2024-01-20T10:30:00Z',
    updated_at: '2024-01-20T10:30:00Z',
    user_id: 'demo-user',
  },
  // 贴纸素材 - 营销类
  {
    id: 'sticker-7',
    name: '折扣标签贴纸',
    original_name: 'discount-badge.png',
    file_path: '/assets/stickers/test1.png', // 复用测试图片
    file_type: 'image',
    mime_type: 'image/png',
    file_size: 22400,
    category: '图片素材',
    subcategory: '营销类',
    width: 120,
    height: 120,
    tags: ['营销', '折扣', '促销', '标签'],
    metadata: {},
    created_at: '2024-01-21T13:30:00Z',
    updated_at: '2024-01-21T13:30:00Z',
    user_id: 'demo-user',
  },
  {
    id: 'sticker-8',
    name: '新品上市贴纸',
    original_name: 'new-product.png',
    file_path: '/assets/stickers/test2.png', // 复用测试图片
    file_type: 'image',
    mime_type: 'image/png',
    file_size: 18900,
    category: '图片素材',
    subcategory: '营销类',
    width: 100,
    height: 100,
    tags: ['营销', '新品', '上市', '推广'],
    metadata: {},
    created_at: '2024-01-22T15:45:00Z',
    updated_at: '2024-01-22T15:45:00Z',
    user_id: 'demo-user',
  },
  {
    id: 'sticker-9',
    name: '限时优惠贴纸',
    original_name: 'limited-offer.png',
    file_path: '/assets/stickers/test1.png', // 复用测试图片
    file_type: 'image',
    mime_type: 'image/png',
    file_size: 21760,
    category: '图片素材',
    subcategory: '营销类',
    width: 130,
    height: 80,
    tags: ['营销', '限时', '优惠', '促销'],
    metadata: {},
    created_at: '2024-01-23T09:20:00Z',
    updated_at: '2024-01-23T09:20:00Z',
    user_id: 'demo-user',
  },
  // 音频素材 - BGM
  {
    id: 'bgm-1',
    name: 'BGM音乐1',
    original_name: 'bgm1.mp3',
    file_path: '/placeholder.svg',
    file_type: 'audio',
    mime_type: 'audio/mp3',
    file_size: 2048000,
    category: '音频素材',
    subcategory: 'BGM',
    duration: 120,
    tags: ['BGM', '背景音乐'],
    metadata: {},
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    user_id: 'demo-user',
  }
]

export const useMaterials = () => {
  const [materials, setMaterials] = useState<Material[]>([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const { toast } = useToast()

  // Load materials - 模拟模式，直接返回mock数据
  const loadMaterials = async () => {
    setLoading(true)
    try {
      // 模拟网络延迟
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // 直接使用模拟数据
      setMaterials(mockMaterials)
      
      console.log('已加载模拟素材数据:', mockMaterials.length, '个素材')
    } catch (error) {
      console.error('Error loading materials:', error)
      toast({
        title: "加载失败",
        description: "无法加载素材库",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  // Upload material (demo mode)
  const uploadMaterial = async (file: File, category: string, subcategory?: string) => {
    setUploading(true)
    setUploadProgress(0)
    
    try {
      // Simulate real-time upload progress
      const updateProgress = async () => {
        for (let i = 0; i <= 100; i += 10) {
          setUploadProgress(i)
          await new Promise(resolve => setTimeout(resolve, 100))
        }
      }
      
      await updateProgress()
      
      const newMaterial: Material = {
        id: Date.now().toString(),
        name: file.name.split('.')[0],
        original_name: file.name,
        file_path: '/placeholder.svg',
        file_type: file.type.startsWith('image') ? 'image' : 
                   file.type.startsWith('video') ? 'video' : 
                   file.type.startsWith('audio') ? 'audio' : 'other',
        mime_type: file.type,
        file_size: file.size,
        category,
        subcategory,
        tags: [],
        metadata: {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user_id: 'demo-user',
      }

      setMaterials(prev => [newMaterial, ...prev])
      
      toast({
        title: "上传成功",
        description: `${file.name} 已上传到${category}${subcategory ? ` - ${subcategory}` : ''}`,
      })

      return newMaterial
    } catch (error) {
      console.error('Error uploading material:', error)
      toast({
        title: "上传失败",
        description: "无法上传文件",
        variant: "destructive"
      })
      throw error
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }

  // Delete material (demo mode)
  const deleteMaterial = async (materialId: string) => {
    try {
      setMaterials(prev => prev.filter(m => m.id !== materialId))
      
      toast({
        title: "删除成功",
        description: "素材已删除",
      })
    } catch (error) {
      console.error('Error deleting material:', error)
      toast({
        title: "删除失败",
        description: "无法删除素材",
        variant: "destructive"
      })
    }
  }

  // Update material (demo mode)
  const updateMaterial = async (materialId: string, updates: MaterialUpdate) => {
    try {
      setMaterials(prev => prev.map(m => 
        m.id === materialId 
          ? { ...m, ...updates, updated_at: new Date().toISOString() }
          : m
      ))
      
      toast({
        title: "更新成功",
        description: "素材信息已更新",
      })
    } catch (error) {
      console.error('Error updating material:', error)
      toast({
        title: "更新失败",
        description: "无法更新素材信息",
        variant: "destructive"
      })
    }
  }

  // Get materials by category
  const getMaterialsByCategory = (category: string, subcategory?: string) => {
    return materials.filter(material => {
      if (material.category !== category) return false
      if (subcategory && material.subcategory !== subcategory) return false
      return true
    })
  }

  // Search materials
  const searchMaterials = (query: string) => {
    if (!query.trim()) return materials
    
    const lowerQuery = query.toLowerCase()
    return materials.filter(material => 
      material.name.toLowerCase().includes(lowerQuery) ||
      material.original_name.toLowerCase().includes(lowerQuery) ||
      (material.tags && material.tags.some(tag => 
        tag.toLowerCase().includes(lowerQuery)
      ))
    )
  }

  // Get material URL (demo mode)
  const getMaterialUrl = (material: Material) => {
    return material.file_path
  }

  // Add tags to material
  const addTags = async (materialId: string, tags: string[]) => {
    try {
      setMaterials(prev => prev.map(m => 
        m.id === materialId 
          ? { 
              ...m, 
              tags: [...(m.tags || []), ...tags.filter(tag => !(m.tags || []).includes(tag))],
              updated_at: new Date().toISOString()
            }
          : m
      ))
      
      toast({
        title: "标签已添加",
        description: "素材标签更新成功",
      })
    } catch (error) {
      console.error('Error adding tags:', error)
      toast({
        title: "添加失败",
        description: "无法添加标签",
        variant: "destructive"
      })
    }
  }

  // Remove tags from material
  const removeTags = async (materialId: string, tagsToRemove: string[]) => {
    try {
      setMaterials(prev => prev.map(m => 
        m.id === materialId 
          ? { 
              ...m, 
              tags: (m.tags || []).filter(tag => !tagsToRemove.includes(tag)),
              updated_at: new Date().toISOString()
            }
          : m
      ))
      
      toast({
        title: "标签已删除",
        description: "素材标签更新成功",
      })
    } catch (error) {
      console.error('Error removing tags:', error)
      toast({
        title: "删除失败",
        description: "无法删除标签",
        variant: "destructive"
      })
    }
  }

  useEffect(() => {
    loadMaterials()
  }, [])

  return {
    materials,
    loading,
    uploading,
    uploadProgress,
    uploadMaterial,
    deleteMaterial,
    updateMaterial,
    getMaterialsByCategory,
    searchMaterials,
    getMaterialUrl,
    addTags,
    removeTags,
    refreshMaterials: loadMaterials,
    isSupabaseConfigured: true // Using Supabase
  }
}