import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { Database } from '@/integrations/supabase/types'
import { useToast } from '@/hooks/use-toast'

type Material = Database['public']['Tables']['materials']['Row']
type MaterialInsert = Database['public']['Tables']['materials']['Insert']
type MaterialUpdate = Database['public']['Tables']['materials']['Update']

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
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('用户未登录')

      // Determine file type
      const fileType = file.type.startsWith('image/') ? 'image' : 
                     file.type.startsWith('audio/') ? 'audio' : 
                     file.type.startsWith('video/') ? 'video' : 'other'

      // Generate unique file path
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`

      // Upload file to storage
      const { data: storageData, error: storageError } = await supabase.storage
        .from('materials')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (storageError) throw storageError

      // Get file information
      let duration: number | undefined
      let width: number | undefined
      let height: number | undefined

      // For images, get dimensions
      if (fileType === 'image') {
        const img = new Image()
        img.src = URL.createObjectURL(file)
        await new Promise((resolve) => {
          img.onload = () => {
            width = img.naturalWidth
            height = img.naturalHeight
            resolve(void 0)
          }
        })
        URL.revokeObjectURL(img.src)
      }

      // For audio/video, get duration
      if (fileType === 'audio' || fileType === 'video') {
        const media = document.createElement(fileType === 'audio' ? 'audio' : 'video')
        media.src = URL.createObjectURL(file)
        await new Promise((resolve) => {
          media.addEventListener('loadedmetadata', () => {
            duration = media.duration
            resolve(void 0)
          })
        })
        URL.revokeObjectURL(media.src)
      }

      // Save material info to database
      const { data: materialData, error: dbError } = await supabase
        .from('materials')
        .insert({
          user_id: user.id,
          name: file.name.replace(/\.[^/.]+$/, ""), // Remove extension
          original_name: file.name,
          file_path: storageData.path,
          file_size: file.size,
          file_type: fileType,
          mime_type: file.type,
          duration,
          width,
          height,
          category,
          subcategory,
          metadata: {
            originalFileName: file.name,
            uploadedAt: new Date().toISOString()
          }
        })
        .select()
        .single()

      if (dbError) throw dbError

      setMaterials(prev => [materialData, ...prev])
      
      toast({
        title: "上传成功",
        description: `${file.name} 已上传到素材库`,
      })

      return materialData
    } catch (error) {
      console.error('Error uploading material:', error)
      toast({
        title: "上传失败",
        description: `无法上传 ${file.name}`,
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
      if (!material) throw new Error('素材不存在')

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('materials')
        .remove([material.file_path])

      if (storageError) throw storageError

      // Delete from database
      const { error: dbError } = await supabase
        .from('materials')
        .delete()
        .eq('id', materialId)

      if (dbError) throw dbError

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

  // Update material
  const updateMaterial = async (materialId: string, updates: MaterialUpdate) => {
    try {
      const { data, error } = await supabase
        .from('materials')
        .update(updates)
        .eq('id', materialId)
        .select()
        .single()

      if (error) throw error

      setMaterials(prev => prev.map(m => m.id === materialId ? data : m))
      
      toast({
        title: "更新成功",
        description: "素材信息已更新",
      })

      return data
    } catch (error) {
      console.error('Error updating material:', error)
      toast({
        title: "更新失败",
        description: "无法更新素材信息",
        variant: "destructive"
      })
      throw error
    }
  }

  // Search materials
  const searchMaterials = async (query: string) => {
    try {
      const { data, error } = await supabase
        .from('materials')
        .select('*')
        .or(`name.ilike.%${query}%,original_name.ilike.%${query}%,tags.cs.{${query}}`)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error searching materials:', error)
      return []
    }
  }

  // Get material URL
  const getMaterialUrl = (material: Material) => {
    const { data } = supabase.storage.from('materials').getPublicUrl(material.file_path)
    return data.publicUrl
  }

  // Add tags
  const addTags = async (materialId: string, tags: string[]) => {
    const material = materials.find(m => m.id === materialId)
    if (!material) return

    const newTags = [...(material.tags || []), ...tags].filter((tag, index, arr) => arr.indexOf(tag) === index)
    
    return updateMaterial(materialId, { tags: newTags })
  }

  // Remove tags
  const removeTags = async (materialId: string, tagsToRemove: string[]) => {
    const material = materials.find(m => m.id === materialId)
    if (!material) return

    const newTags = (material.tags || []).filter(tag => !tagsToRemove.includes(tag))
    
    return updateMaterial(materialId, { tags: newTags })
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
    updateMaterial,
    getMaterialsByCategory,
    getMaterialUrl,
    searchMaterials,
    addTags,
    removeTags,
    refreshMaterials: loadMaterials,
    isSupabaseConfigured: true // Always true since we're using the direct client
  }
}