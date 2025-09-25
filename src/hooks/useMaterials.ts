import { useState, useEffect } from 'react'
import { useToast } from '@/hooks/use-toast'

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

// Mock data for demo
const mockMaterials: Material[] = [
  {
    id: '1',
    name: '示例图片1',
    original_name: 'sample1.jpg',
    file_path: '/placeholder.svg',
    file_type: 'image',
    mime_type: 'image/jpeg',
    file_size: 1024000,
    category: '图片素材',
    subcategory: '营销类',
    width: 1920,
    height: 1080,
    tags: ['示例', '图片'],
    metadata: {},
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    user_id: 'demo-user',
  },
  {
    id: '2',
    name: '示例视频1',
    original_name: 'sample1.mp4',
    file_path: '/placeholder.svg',
    file_type: 'video',
    mime_type: 'video/mp4',
    file_size: 5120000,
    category: '视频素材',
    duration: 30.5,
    width: 1920,
    height: 1080,
    tags: ['示例', '视频'],
    metadata: {},
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    user_id: 'demo-user',
  },
  {
    id: '3',
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
  },
]

export const useMaterials = () => {
  const [materials, setMaterials] = useState<Material[]>([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const { toast } = useToast()

  // Load materials (demo mode)
  const loadMaterials = async () => {
    setLoading(true)
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500))
      setMaterials(mockMaterials)
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
    isSupabaseConfigured: false // Demo mode
  }
}