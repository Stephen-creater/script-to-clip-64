import { useState, useEffect } from 'react'
import { supabase, uploadFile, deleteFile, getFileUrl, STORAGE_BUCKETS } from '@/lib/supabase'
import { Database } from '@/lib/database.types'
import { useToast } from '@/hooks/use-toast'

type Material = Database['public']['Tables']['materials']['Row']
type MaterialInsert = Database['public']['Tables']['materials']['Insert']

export const useMaterials = () => {
  const [materials, setMaterials] = useState<Material[]>([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const { toast } = useToast()

  // Load materials
  const loadMaterials = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('materials')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setMaterials(data || [])
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

  // Upload material file
  const uploadMaterial = async (
    file: File, 
    category: string, 
    subcategory?: string
  ) => {
    setUploading(true)
    try {
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
      
      // Get file URL
      const fileUrl = getFileUrl(STORAGE_BUCKETS.MATERIALS, filePath)

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
    try {
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
    refreshMaterials: loadMaterials
  }
}