import { useState, useEffect } from 'react'
import { supabase, isSupabaseConfigured } from '@/lib/supabase-safe'
import { Database } from '@/lib/database.types'
import { useToast } from '@/hooks/use-toast'

type Project = Database['public']['Tables']['projects']['Row']
type ProjectInsert = Database['public']['Tables']['projects']['Insert']
type ProjectUpdate = Database['public']['Tables']['projects']['Update']

// Mock projects for when Supabase is not configured
const mockProjects: Project[] = [
  {
    id: 'mock-1',
    user_id: 'mock-user',
    name: '西班牙火车旅行',
    thumbnail: null,
    duration: 45.6,
    segments_count: 5,
    status: 'completed',
    is_template: false,
    created_at: '2024-01-15T14:30:00Z',
    updated_at: '2024-01-15T14:30:00Z',
    data: { segments: [] }
  },
  {
    id: 'mock-2',
    user_id: 'mock-user',
    name: '产品介绍视频',
    thumbnail: null,
    duration: 32.4,
    segments_count: 4,
    status: 'draft',
    is_template: false,
    created_at: '2024-01-14T16:45:00Z',
    updated_at: '2024-01-14T16:45:00Z',
    data: { segments: [] }
  },
  {
    id: 'mock-3',
    user_id: 'mock-user',
    name: '品牌宣传片',
    thumbnail: null,
    duration: 58.2,
    segments_count: 6,
    status: 'processing',
    is_template: false,
    created_at: '2024-01-13T09:20:00Z',
    updated_at: '2024-01-13T09:20:00Z',
    data: { segments: [] }
  },
  {
    id: 'mock-4',
    user_id: 'mock-user',
    name: '教程视频模板',
    thumbnail: null,
    duration: 40.0,
    segments_count: 4,
    status: 'completed',
    is_template: true,
    created_at: '2024-01-12T11:15:00Z',
    updated_at: '2024-01-12T11:15:00Z',
    data: { segments: [] }
  }
]

export const useProjects = () => {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  // Load projects
  const loadProjects = async () => {
    setLoading(true)
    try {
      if (!isSupabaseConfigured) {
        // Use mock data when Supabase is not configured
        setProjects(mockProjects)
        toast({
          title: "演示模式",
          description: "当前使用演示数据。连接 Supabase 以使用真实存储功能。",
          variant: "destructive"
        })
        return
      }

      if (!supabase) throw new Error('Supabase not available')

      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('updated_at', { ascending: false })

      if (error) throw error
      setProjects(data || [])
    } catch (error) {
      console.error('Error loading projects:', error)
      // Fallback to mock data on error
      setProjects(mockProjects)
      toast({
        title: "加载失败",
        description: "使用演示数据。请检查 Supabase 连接。",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  // Create project
  const createProject = async (projectData: Omit<ProjectInsert, 'user_id'>) => {
    if (!isSupabaseConfigured) {
      toast({
        title: "功能不可用",
        description: "请先连接 Supabase 以使用项目创建功能",
        variant: "destructive"
      })
      return
    }

    try {
      if (!supabase) throw new Error('Supabase not available')

      // Get user ID (for now, use a default user)
      const { data: { user } } = await supabase.auth.getUser()
      const userId = user?.id || 'anonymous'

      const { data, error } = await supabase
        .from('projects')
        .insert({
          ...projectData,
          user_id: userId,
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
    if (!isSupabaseConfigured) {
      toast({
        title: "功能不可用",
        description: "请先连接 Supabase 以使用项目更新功能",
        variant: "destructive"
      })
      return
    }

    try {
      if (!supabase) throw new Error('Supabase not available')

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
    if (!isSupabaseConfigured) {
      toast({
        title: "功能不可用",
        description: "请先连接 Supabase 以使用复制功能",
        variant: "destructive"
      })
      return
    }

    try {
      if (!supabase) throw new Error('Supabase not available')

      const originalProject = projects.find(p => p.id === projectId)
      if (!originalProject) throw new Error('Project not found')

      const { data: { user } } = await supabase.auth.getUser()
      const userId = user?.id || 'anonymous'

      const { data, error } = await supabase
        .from('projects')
        .insert({
          user_id: userId,
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
    if (!isSupabaseConfigured) {
      toast({
        title: "功能不可用",
        description: "请先连接 Supabase 以使用模板功能",
        variant: "destructive"
      })
      return
    }

    try {
      if (!supabase) throw new Error('Supabase not available')

      const project = projects.find(p => p.id === projectId)
      if (!project) throw new Error('Project not found')

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
    isSupabaseConfigured
  }
}