// 这个页面显示用户的所有训练记录
// 用户可以在这里查看之前添加的所有训练数据，按日期分组显示
'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import EmptyState from '@/components/ui/EmptyState'
import ErrorMessage from '@/components/ui/ErrorMessage'
import { generateShareText, copyToClipboard } from '@/lib/shareUtils'

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

export default function HistoryPage() {
  const router = useRouter()
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [shareSuccess, setShareSuccess] = useState<string | null>(null)

  // 页面加载时，检查登录状态并加载训练记录
  useEffect(() => {
    checkAuth()
    loadWorkouts()
  }, [])

  // 检查用户是否已登录
  const checkAuth = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
      }
    } catch (error) {
      console.error('检查登录状态失败:', error)
      router.push('/login')
    }
  }

  // 从数据库加载训练记录
  const loadWorkouts = async () => {
    try {
      setLoading(true)
      setError(null)

      // 获取当前登录的用户
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      // 查询用户的训练记录，按时间倒序排列
      const { data, error } = await supabase
        .from('workouts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        // 检查是否是网络错误
        if (error.message.includes('fetch') || error.message.includes('network')) {
          throw new Error('网络连接失败，请检查网络后重试')
        }
        throw error
      }

      // 如果成功获取数据，更新状态
      setWorkouts(data || [])
    } catch (error: any) {
      console.error('加载记录失败:', error)
      const errorMessage = error.message || '加载记录失败，请刷新页面重试'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  // 格式化日期显示
  // 将数据库中的日期转换为友好的显示格式（今天、昨天、X天前等）
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return '今天'
    if (diffDays === 1) return '昨天'
    if (diffDays < 7) return `${diffDays}天前`
    
    return date.toLocaleDateString('zh-CN')
  }

  // 处理分享训练记录
  const handleShare = async (workout: Workout) => {
    const shareText = generateShareText(workout)
    const success = await copyToClipboard(shareText)
    
    if (success) {
      setShareSuccess('已复制到剪贴板！可以粘贴到微信、微博等社交平台分享')
      setTimeout(() => setShareSuccess(null), 3000)
    } else {
      setError('复制失败，请手动复制')
    }
  }

  // 按日期分组训练记录
  // 将同一天的训练记录放在一起显示
  const groupByDate = () => {
    const groups: { [key: string]: Workout[] } = {}
    
    workouts.forEach(workout => {
      const dateKey = formatDate(workout.created_at)
      if (!groups[dateKey]) {
        groups[dateKey] = []
      }
      groups[dateKey].push(workout)
    })
    
    return groups
  }

  // 加载中显示
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-lg shadow-md">
            <LoadingSpinner text="加载训练记录中..." />
          </div>
        </div>
      </div>
    )
  }

  const groupedWorkouts = groupByDate()

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto">
        {/* 顶部栏 */}
        <div className="bg-blue-500 text-white p-4 rounded-t-lg mb-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">历史记录</h1>
            <button
              onClick={() => router.push('/')}
              className="text-sm hover:underline"
            >
              返回
            </button>
          </div>
        </div>

        {/* 错误提示 */}
        {error && (
          <ErrorMessage 
            message={error} 
            onRetry={loadWorkouts}
            onDismiss={() => setError(null)}
          />
        )}

        {/* 分享成功提示 */}
        {shareSuccess && (
          <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-lg mb-4">
            {shareSuccess}
          </div>
        )}

        {/* 如果没有记录，显示提示 */}
        {!error && workouts.length === 0 ? (
          <EmptyState
            icon="📝"
            title="还没有训练记录"
            description="开始记录你的第一次训练，追踪你的进步！"
            actionLabel="添加第一条记录"
            onAction={() => router.push('/add')}
          />
        ) : !error && (
          /* 显示所有训练记录，按日期分组 */
          <div className="space-y-6">
            {Object.entries(groupedWorkouts).map(([date, dateWorkouts]) => (
              <div key={date}>
                {/* 日期标题 */}
                <h2 className="text-lg font-medium mb-3 text-gray-700">
                  📅 {date}
                </h2>
                {/* 该日期的所有训练记录 */}
                <div className="space-y-3">
                  {dateWorkouts.map((workout) => (
                    <div
                      key={workout.id}
                      className="bg-white rounded-lg shadow-md p-4"
                    >
                      {/* 动作名称和分享按钮 */}
                      <div className="flex items-start justify-between mb-1">
                        <div className="font-medium text-lg">
                          {workout.exercise_name}
                        </div>
                        <button
                          onClick={() => handleShare(workout)}
                          className="text-blue-500 hover:text-blue-600 text-sm"
                          title="分享这条记录"
                        >
                          📤 分享
                        </button>
                      </div>
                      {/* 训练详情 */}
                      <div className="text-gray-600 mt-1">
                        {workout.weight}kg × {workout.reps}次 × {workout.sets}组
                      </div>
                      {/* 时间 */}
                      <div className="text-sm text-gray-400 mt-1">
                        {new Date(workout.created_at).toLocaleTimeString('zh-CN', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

