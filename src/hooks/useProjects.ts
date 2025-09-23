import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { Database } from '@/integrations/supabase/types'
import { useToast } from '@/hooks/use-toast'

type Project = Database['public']['Tables']['projects']['Row']
type ProjectInsert = Database['public']['Tables']['projects']['Insert']
type ProjectUpdate = Database['public']['Tables']['projects']['Update']

export const useProjects = () => {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  // Load projects
  const loadProjects = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('updated_at', { ascending: false })

      if (error) throw error
      setProjects(data || [])
    } catch (error) {
      console.error('Error loading projects:', error)
      toast({
        title: "加载失败",
        description: "无法加载项目库",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  // Create project
  const createProject = async (projectData: Omit<ProjectInsert, 'user_id'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('用户未登录')

      const { data, error } = await supabase
        .from('projects')
        .insert({
          ...projectData,
          user_id: user.id,
        })
        .select()
        .single()

      if (error) throw error

      setProjects(prev => [data, ...prev])
      
      toast({
        title: "创建成功",
        description: `项目 ${data.name} 已创建`,
      })

      return data
    } catch (error) {
      console.error('Error creating project:', error)
      toast({
        title: "创建失败",
        description: "无法创建项目",
        variant: "destructive"
      })
      throw error
    }
  }

  // Update project
  const updateProject = async (projectId: string, updates: ProjectUpdate) => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', projectId)
        .select()
        .single()

      if (error) throw error

      setProjects(prev => prev.map(p => p.id === projectId ? data : p))
      
      toast({
        title: "更新成功",
        description: "项目已保存",
      })

      return data
    } catch (error) {
      console.error('Error updating project:', error)
      toast({
        title: "更新失败",
        description: "无法保存项目",
        variant: "destructive"
      })
      throw error
    }
  }

  // Delete project
  const deleteProject = async (projectId: string) => {
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId)

      if (error) throw error

      setProjects(prev => prev.filter(p => p.id !== projectId))
      
      toast({
        title: "删除成功",
        description: "项目已删除",
      })
    } catch (error) {
      console.error('Error deleting project:', error)
      toast({
        title: "删除失败",
        description: "无法删除项目",
        variant: "destructive"
      })
    }
  }

  // Copy project
  const copyProject = async (projectId: string) => {
    try {
      const originalProject = projects.find(p => p.id === projectId)
      if (!originalProject) throw new Error('项目不存在')

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('用户未登录')

      const { data, error } = await supabase
        .from('projects')
        .insert({
          user_id: user.id,
          name: `${originalProject.name}副本`,
          thumbnail: originalProject.thumbnail,
          duration: originalProject.duration,
          segments_count: originalProject.segments_count,
          status: 'draft' as const,
          is_template: false,
          data: originalProject.data,
        })
        .select()
        .single()

      if (error) throw error

      setProjects(prev => [data, ...prev])
      
      toast({
        title: "复制成功",
        description: `项目副本已创建`,
      })

      return data
    } catch (error) {
      console.error('Error copying project:', error)
      toast({
        title: "复制失败",
        description: "无法复制项目",
        variant: "destructive"
      })
    }
  }

  // Toggle template status
  const toggleTemplate = async (projectId: string) => {
    try {
      const project = projects.find(p => p.id === projectId)
      if (!project) throw new Error('项目不存在')

      const { data, error } = await supabase
        .from('projects')
        .update({
          is_template: !project.is_template,
          updated_at: new Date().toISOString(),
        })
        .eq('id', projectId)
        .select()
        .single()

      if (error) throw error

      setProjects(prev => prev.map(p => p.id === projectId ? data : p))
      
      toast({
        title: data.is_template ? "已设为模板" : "已取消模板",
        description: data.is_template ? "项目已保存为模板" : "项目已取消模板状态",
      })

      return data
    } catch (error) {
      console.error('Error toggling template:', error)
      toast({
        title: "操作失败",
        description: "无法更改模板状态",
        variant: "destructive"
      })
    }
  }

  // Get projects by filter
  const getProjectsByStatus = (status?: Project['status'], isTemplate?: boolean) => {
    return projects.filter(project => {
      if (status && project.status !== status) return false
      if (isTemplate !== undefined && project.is_template !== isTemplate) return false
      return true
    })
  }

  useEffect(() => {
    loadProjects()
  }, [])

  return {
    projects,
    loading,
    createProject,
    updateProject,
    deleteProject,
    copyProject,
    toggleTemplate,
    getProjectsByStatus,
    refreshProjects: loadProjects,
    isSupabaseConfigured: true // Always true since we're using the direct client
  }
}