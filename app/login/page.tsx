// 这个页面让用户登录或注册
// 用户可以在这里输入邮箱和密码来注册新账号或登录已有账号
'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

// 强制动态渲染，避免构建时预渲染
export const dynamic = 'force-dynamic'

export default function LoginPage() {
  const router = useRouter()
  
  // 状态管理：表单输入值
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  
  // 状态管理：加载和错误状态
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // 状态管理：当前是注册模式还是登录模式
  const [isSignUp, setIsSignUp] = useState(false)

  // 处理登录/注册
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault() // 阻止表单默认提交
    setLoading(true) // 开始加载
    setError(null) // 清除之前的错误

    try {
      if (isSignUp) {
        // 注册新用户
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        })
        
        if (error) throw error
        
        // 检查是否需要邮箱验证
        if (data.user && !data.session) {
          // 需要邮箱验证
          alert('注册成功！请检查邮箱并点击验证链接。\n\n（开发环境提示：可在Supabase Dashboard中禁用邮箱验证）')
        } else {
          // 注册成功且已自动登录
          alert('注册成功！')
          router.push('/')
          return
        }
        
        setIsSignUp(false) // 切换到登录模式
      } else {
        // 登录已有账号
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        
        if (error) {
          // 如果是邮箱未确认错误，提供更友好的提示
          if (error.message.includes('Email not confirmed') || error.message.includes('email_not_confirmed')) {
            throw new Error('邮箱未验证。请检查邮箱并点击验证链接。\n\n（开发环境：可在Supabase Dashboard的Authentication设置中禁用邮箱验证）')
          }
          throw error
        }
        
        // 登录成功，跳转到首页
        router.push('/')
      }
    } catch (error: any) {
      // 如果出错，显示错误信息
      setError(error.message || '操作失败，请重试')
      console.error('认证错误:', error)
    } finally {
      setLoading(false) // 结束加载状态
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        {/* 标题 */}
        <h1 className="text-2xl font-bold text-center mb-6">
          FitTrack
        </h1>
        <h2 className="text-xl text-center mb-6">
          {isSignUp ? '注册账号' : '登录'}
        </h2>
        
        {/* 表单 */}
        <form onSubmit={handleAuth} className="space-y-4">
          {/* 邮箱输入框 */}
          <div>
            <label className="block text-sm font-medium mb-2">
              邮箱
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="your@email.com"
              required
            />
          </div>
          
          {/* 密码输入框 */}
          <div>
            <label className="block text-sm font-medium mb-2">
              密码
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="至少6个字符"
              required
              minLength={6}
            />
          </div>
          
          {/* 错误提示 */}
          {error && (
            <div className="text-red-500 text-sm bg-red-50 p-3 rounded-lg">
              {error}
            </div>
          )}
          
          {/* 提交按钮 */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 text-white py-3 rounded-lg font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? '处理中...' : (isSignUp ? '注册' : '登录')}
          </button>
        </form>
        
        {/* 切换注册/登录模式 */}
        <button
          onClick={() => {
            setIsSignUp(!isSignUp)
            setError(null) // 切换模式时清除错误
          }}
          className="w-full mt-4 text-blue-500 hover:underline"
        >
          {isSignUp ? '已有账号？去登录' : '没有账号？去注册'}
        </button>
      </div>
    </div>
  )
}

