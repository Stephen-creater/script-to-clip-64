import { useState, useEffect } from 'react'
import { supabase, isSupabaseConfigured, uploadFile, deleteFile, getFileUrl, STORAGE_BUCKETS } from '@/lib/supabase-safe'
import { Database } from '@/lib/database.types'
import { useToast } from '@/hooks/use-toast'

type Material = Database['public']['Tables']['materials']['Row']
type MaterialInsert = Database['public']['Tables']['materials']['Insert']

// Mock data for when Supabase is not configured
const mockMaterials: Material[] = [
  {
    id: 'mock-1',
    user_id: 'mock-user',
    name: '轻松愉悦.mp3',
    type: 'audio',
    category: '音频素材',
    subcategory: 'BGM',
    file_path: 'mock/bgm/relaxing.mp3',
    file_size: 3800000,
    file_type: 'audio/mpeg',
    thumbnail: null,
    duration: 150,
    created_at: '2024-01-15T10:30:00Z',
    metadata: null
  },
  {
    id: 'mock-2',
    user_id: 'mock-user',
    name: '激励节拍.mp3',
    type: 'audio',
    category: '音频素材',
    subcategory: 'BGM',
    file_path: 'mock/bgm/energetic.mp3',
    file_size: 4200000,
    file_type: 'audio/mpeg',
    thumbnail: null,
    duration: 195,
    created_at: '2024-01-14T14:20:00Z',
    metadata: null
  },
  {
    id: 'mock-3',
    user_id: 'mock-user',
    name: '营销标签1.png',
    type: 'image',
    category: '图片素材',
    subcategory: '营销类',
    file_path: 'mock/images/marketing1.png',
    file_size: 156000,
    file_type: 'image/png',
    thumbnail: null,
    duration: null,
    created_at: '2024-01-13T09:15:00Z',
    metadata: null
  },
  {
    id: 'mock-4',
    user_id: 'mock-user',
    name: '装饰元素1.png',
    type: 'image',
    category: '图片素材',
    subcategory: '装饰类',
    file_path: 'mock/images/decoration1.png',
    file_size: 89000,
    file_type: 'image/png',
    thumbnail: null,
    duration: null,
    created_at: '2024-01-12T16:45:00Z',
    metadata: null
  }
]

export const useMaterials = () => {
  const [materials, setMaterials] = useState<Material[]>([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const { toast } = useToast()

  // Load materials
  const loadMaterials = async () => {
    setLoading(true)
    try {
      if (!isSupabaseConfigured) {
        // Use mock data when Supabase is not configured
        setMaterials(mockMaterials)
        toast({
          title: "演示模式",
          description: "当前使用演示数据。连接 Supabase 以使用真实存储功能。",
          variant: "destructive"
        })
        return
      }

      if (!supabase) throw new Error('Supabase not available')

      const { data, error } = await supabase
        .from('materials')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setMaterials(data || [])
    } catch (error) {
      console.error('Error loading materials:', error)
      // Fallback to mock data on error
      setMaterials(mockMaterials)
      toast({
        title: "加载失败",
        description: "使用演示数据。请检查 Supabase 连接。",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  // Upload material file
  const uploadMaterial = async (
    file: File, 
    category: string, 
    subcategory?: string
  ) => {
    if (!isSupabaseConfigured) {
      toast({
        title: "功能不可用",
        description: "请先连接 Supabase 以使用文件上传功能",
        variant: "destructive"
      })
      return
    }

    setUploading(true)
    try {
      if (!supabase) throw new Error('Supabase not available')

      // Get user ID (for now, use a default user)
      const { data: { user } } = await supabase.auth.getUser()
      const userId = user?.id || 'anonymous'

      // Determine file type
      const fileType = file.type.startsWith('image/') ? 'image' : 
                      file.type.startsWith('audio/') ? 'audio' : 'video'
      
      // Generate file path
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
      const filePath = `${userId}/${category}/${subcategory || 'default'}/${fileName}`

      // Upload to storage
      const uploadData = await uploadFile(STORAGE_BUCKETS.MATERIALS, filePath, file)
      
      // Save to database
      const materialData: MaterialInsert = {
        user_id: userId,
        name: file.name,
        type: fileType,
        category,
        subcategory,
        file_path: filePath,
        file_size: file.size,
        file_type: file.type,
        duration: fileType === 'audio' || fileType === 'video' ? null : null, // TODO: Extract duration
        metadata: {
          original_name: file.name,
          upload_date: new Date().toISOString()
        }
      }

      const { data, error } = await supabase
        .from('materials')
        .insert(materialData)
        .select()
        .single()

      if (error) throw error

      // Add to local state
      setMaterials(prev => [data, ...prev])
      
      toast({
        title: "上传成功",
        description: `素材 ${file.name} 已上传`,
      })

      return data
    } catch (error) {
      console.error('Error uploading material:', error)
      toast({
        title: "上传失败",
        description: "无法上传素材文件",
        variant: "destructive"
      })
      throw error
    } finally {
      setUploading(false)
    }
  }

  // Delete material
  const deleteMaterial = async (materialId: string) => {
    if (!isSupabaseConfigured) {
      toast({
        title: "功能不可用",
        description: "请先连接 Supabase 以使用删除功能",
        variant: "destructive"
      })
      return
    }

    try {
      if (!supabase) throw new Error('Supabase not available')

      const material = materials.find(m => m.id === materialId)
      if (!material) throw new Error('Material not found')

      // Delete from storage
      await deleteFile(STORAGE_BUCKETS.MATERIALS, material.file_path)

      // Delete from database
      const { error } = await supabase
        .from('materials')
        .delete()
        .eq('id', materialId)

      if (error) throw error

      // Remove from local state
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

  // Get materials by category
  const getMaterialsByCategory = (category: string, subcategory?: string) => {
    return materials.filter(m => {
      if (subcategory) {
        return m.category === category && m.subcategory === subcategory
      }
      return m.category === category
    })
  }

  // Get material URL
  const getMaterialUrl = (material: Material) => {
    return getFileUrl(STORAGE_BUCKETS.MATERIALS, material.file_path)
  }

  useEffect(() => {
    loadMaterials()
  }, [])

  return {
    materials,
    loading,
    uploading,
    uploadMaterial,
    deleteMaterial,
    getMaterialsByCategory,
    getMaterialUrl,
    refreshMaterials: loadMaterials,
    isSupabaseConfigured
  }
}