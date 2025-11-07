'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import EmptyState from '@/components/ui/EmptyState'

// 定义训练记录的数据类型
interface Workout {
  id: string
  exercise_name: string
  weight: number
  reps: number
  sets: number
  created_at: string
}

// 强制动态渲染，避免构建时预渲染
export const dynamic = 'force-dynamic'

export default function Home() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [todayWorkouts, setTodayWorkouts] = useState<Workout[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 页面加载时检查用户登录状态并加载今日训练记录
  useEffect(() => {
    checkUser()
  }, [])

  // 检查用户是否已登录并加载今日训练记录
  const checkUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        // 如果未登录，跳转到登录页
        router.push('/login')
        return
      }
      
      // 如果已登录，保存用户信息并加载今日训练记录
      setUser(user)
      await loadTodayWorkouts(user.id)
    } catch (error) {
      console.error('检查用户状态失败:', error)
      setError('加载失败，请刷新页面重试')
    } finally {
      setLoading(false)
    }
  }

  // 加载今日的训练记录
  const loadTodayWorkouts = async (userId: string) => {
    try {
      setError(null)
      // 计算今天的开始时间（00:00:00）
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      // 查询今天的训练记录，按时间倒序排列
      const { data, error } = await supabase
        .from('workouts')
        .select('*')
        .eq('user_id', userId)
        .gte('created_at', today.toISOString())
        .order('created_at', { ascending: false })

      if (error) {
        if (error.message.includes('fetch') || error.message.includes('network')) {
          throw new Error('网络连接失败，请检查网络后重试')
        }
        throw error
      }

      // 如果成功获取数据，更新状态
      setTodayWorkouts(data || [])
    } catch (error: any) {
      console.error('加载今日训练记录失败:', error)
      setError(error.message || '加载今日训练记录失败')
    }
  }

  // 处理登出
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      router.push('/login')
    } catch (error) {
      console.error('登出失败:', error)
    }
  }

  // 加载中显示
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner text="加载中..." />
      </div>
    )
  }

  // 如果未登录，不显示内容（会跳转到登录页）
  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部栏 */}
      <div className="bg-blue-500 text-white p-4">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold">FitTrack</h1>
          <button
            onClick={handleLogout}
            className="text-sm hover:underline"
          >
            登出
          </button>
        </div>
      </div>

      <div className="max-w-md mx-auto p-4 space-y-6">
        {/* 欢迎信息 */}
        <div className="text-center mt-4">
          <p className="text-lg text-gray-600">
            欢迎，{user.email}
          </p>
        </div>

        {/* 添加训练记录按钮 */}
        <Link 
          href="/add"
          className="block w-full bg-orange-500 text-white py-4 px-6 rounded-lg text-lg font-medium hover:bg-orange-600 transition-colors shadow-md text-center"
        >
          ➕ 添加训练记录
        </Link>

        {/* 今日训练 */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">📅 今日训练</h2>
          
          {/* 错误提示 */}
          {error && (
            <div className="text-red-500 text-sm bg-red-50 p-3 rounded-lg mb-4">
              {error}
              <button
                onClick={() => user && loadTodayWorkouts(user.id)}
                className="ml-2 text-red-600 underline"
              >
                重试
              </button>
            </div>
          )}

          {/* 今日训练记录列表 */}
          {!error && todayWorkouts.length === 0 ? (
            <EmptyState
              icon="💪"
              title="今天还没有训练记录"
              description="开始记录你的第一次训练吧！"
              actionLabel="添加训练记录"
              onAction={() => router.push('/add')}
            />
          ) : !error && (
            <div className="space-y-3">
              {todayWorkouts.map((workout) => (
                <div
                  key={workout.id}
                  className="border-l-4 border-blue-500 pl-4 py-2 hover:bg-gray-50 transition-colors rounded-r"
                >
                  <div className="font-medium text-lg">{workout.exercise_name}</div>
                  <div className="text-gray-600 mt-1">
                    {workout.weight}kg × {workout.reps}次 × {workout.sets}组
                  </div>
                  <div className="text-sm text-gray-400 mt-1">
                    {new Date(workout.created_at).toLocaleTimeString('zh-CN', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 快捷入口 */}
        <div className="grid grid-cols-2 gap-4">
          <Link
            href="/history"
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition text-center"
          >
            <div className="text-3xl mb-2">📊</div>
            <div className="font-medium">历史记录</div>
          </Link>
          
          <Link
            href="/chart"
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition text-center"
          >
            <div className="text-3xl mb-2">📈</div>
            <div className="font-medium">进步图表</div>
          </Link>

          {/* V2功能入口 */}
          <Link
            href="/body"
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition text-center"
          >
            <div className="text-3xl mb-2">📏</div>
            <div className="font-medium">身体数据</div>
          </Link>
          
          <Link
            href="/plans"
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition text-center"
          >
            <div className="text-3xl mb-2">📋</div>
            <div className="font-medium">训练计划</div>
          </Link>
        </div>
      </div>
    </div>
  );
}
