import { useState, useEffect } from 'react'
import { useToast } from '@/hooks/use-toast'

export interface Project {
  id: string
  user_id: string
  name: string
  thumbnail?: string
  duration?: number
  segments_count?: number
  status: 'draft' | 'published' | 'archived' | 'completed' | 'processing'
  is_template?: boolean
  data?: Record<string, any>
  created_at: string
  updated_at: string
}

type ProjectInsert = Omit<Project, 'id' | 'created_at' | 'updated_at' | 'user_id'>
type ProjectUpdate = Partial<Omit<Project, 'id' | 'created_at' | 'user_id'>>

// Mock data for demo
const mockProjects: Project[] = [
  {
    id: '1',
    user_id: 'demo-user',
    name: '示例项目 1',
    thumbnail: '/placeholder.svg',
    duration: 120,
    segments_count: 5,
    status: 'draft',
    is_template: false,
    data: {},
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '2',
    user_id: 'demo-user',
    name: '示例模板',
    thumbnail: '/placeholder.svg',
    duration: 60,
    segments_count: 3,
    status: 'published',
    is_template: true,
    data: {},
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '3',
    user_id: 'demo-user',
    name: '营销视频项目',
    thumbnail: '/placeholder.svg',
    duration: 90,
    segments_count: 4,
    status: 'draft',
    is_template: false,
    data: {},
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

export const useProjects = () => {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  // Load projects (demo mode)
  const loadProjects = async () => {
    setLoading(true)
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500))
      setProjects(mockProjects)
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

  // Create project (demo mode)
  const createProject = async (projectData: Omit<ProjectInsert, 'user_id'>) => {
    try {
      const newProject: Project = {
        ...projectData,
        id: Date.now().toString(),
        user_id: 'demo-user',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      setProjects(prev => [newProject, ...prev])
      
      toast({
        title: "创建成功",
        description: `项目 ${newProject.name} 已创建`,
      })

      return newProject
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

  // Update project (demo mode)
  const updateProject = async (projectId: string, updates: ProjectUpdate) => {
    try {
      setProjects(prev => prev.map(p => 
        p.id === projectId 
          ? { ...p, ...updates, updated_at: new Date().toISOString() }
          : p
      ))
      
      toast({
        title: "更新成功",
        description: "项目已保存",
      })

      const updatedProject = projects.find(p => p.id === projectId)
      return updatedProject
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

  // Delete project (demo mode)
  const deleteProject = async (projectId: string) => {
    try {
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

  // Copy project (demo mode)
  const copyProject = async (projectId: string) => {
    try {
      const originalProject = projects.find(p => p.id === projectId)
      if (!originalProject) throw new Error('项目不存在')

      const newProject: Project = {
        ...originalProject,
        id: Date.now().toString(),
        name: `${originalProject.name}副本`,
        status: 'draft' as const,
        is_template: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      setProjects(prev => [newProject, ...prev])
      
      toast({
        title: "复制成功",
        description: `项目副本已创建`,
      })

      return newProject
    } catch (error) {
      console.error('Error copying project:', error)
      toast({
        title: "复制失败",
        description: "无法复制项目",
        variant: "destructive"
      })
    }
  }

  // Toggle template status (demo mode)
  const toggleTemplate = async (projectId: string) => {
    try {
      const project = projects.find(p => p.id === projectId)
      if (!project) throw new Error('项目不存在')

      const updatedProject = {
        ...project,
        is_template: !project.is_template,
        updated_at: new Date().toISOString(),
      }

      setProjects(prev => prev.map(p => p.id === projectId ? updatedProject : p))
      
      toast({
        title: updatedProject.is_template ? "已设为模板" : "已取消模板",
        description: updatedProject.is_template ? "项目已保存为模板" : "项目已取消模板状态",
      })

      return updatedProject
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
    isSupabaseConfigured: false // Demo mode
  }
}