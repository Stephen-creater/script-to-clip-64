import { useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, User } from 'lucide-react'

interface AuthGuardProps {
  children: React.ReactNode
}

export const AuthGuard = ({ children }: AuthGuardProps) => {
  const { user, loading, isSigningIn, signInAnonymously, isAuthenticated } = useAuth()

  useEffect(() => {
    // 如果没有用户登录，自动尝试匿名登录
    if (!loading && !user) {
      signInAnonymously()
    }
  }, [loading, user, signInAnonymously])

  if (loading || isSigningIn) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">
            {isSigningIn ? '正在登录...' : '加载中...'}
          </p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Card className="w-[400px]">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <User className="h-5 w-5" />
              需要登录
            </CardTitle>
            <CardDescription>
              请登录以继续使用素材库功能
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={signInAnonymously} 
              className="w-full"
              disabled={isSigningIn}
            >
              {isSigningIn ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  登录中...
                </>
              ) : (
                '快速开始'
              )}
            </Button>
            <div className="text-center text-sm text-muted-foreground">
              系统将自动为您创建临时账户
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return <>{children}</>
}