import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { User } from '@supabase/supabase-js'
import { useToast } from '@/hooks/use-toast'

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isSigningIn, setIsSigningIn] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    // 获取当前用户
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user ?? null)
      setLoading(false)
    }

    getSession()

    // 监听认证状态变化
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  // 匿名登录
  const signInAnonymously = async () => {
    setIsSigningIn(true)
    try {
      const { data, error } = await supabase.auth.signInAnonymously()
      if (error) throw error
      
      toast({
        title: "登录成功",
        description: "已自动登录，现在可以使用所有功能",
      })
      
      return data
    } catch (error) {
      console.error('Error signing in anonymously:', error)
      toast({
        title: "登录失败",
        description: "无法自动登录，请重试",
        variant: "destructive"
      })
    } finally {
      setIsSigningIn(false)
    }
  }

  // 邮箱登录
  const signInWithEmail = async (email: string, password: string) => {
    setIsSigningIn(true)
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error
      
      toast({
        title: "登录成功",
        description: "欢迎回来！",
      })
      
      return data
    } catch (error) {
      console.error('Error signing in with email:', error)
      toast({
        title: "登录失败",
        description: "邮箱或密码错误",
        variant: "destructive"
      })
      throw error
    } finally {
      setIsSigningIn(false)
    }
  }

  // 邮箱注册
  const signUpWithEmail = async (email: string, password: string) => {
    setIsSigningIn(true)
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })
      if (error) throw error
      
      toast({
        title: "注册成功",
        description: "账户已创建，请检查邮箱验证",
      })
      
      return data
    } catch (error) {
      console.error('Error signing up with email:', error)
      toast({
        title: "注册失败",
        description: "无法创建账户，请重试",
        variant: "destructive"
      })
      throw error
    } finally {
      setIsSigningIn(false)
    }
  }

  // 登出
  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      
      toast({
        title: "已登出",
        description: "您已成功登出",
      })
    } catch (error) {
      console.error('Error signing out:', error)
      toast({
        title: "登出失败",
        description: "无法登出，请重试",
        variant: "destructive"
      })
    }
  }

  return {
    user,
    loading,
    isSigningIn,
    signInAnonymously,
    signInWithEmail,
    signUpWithEmail,
    signOut,
    isAuthenticated: !!user
  }
}