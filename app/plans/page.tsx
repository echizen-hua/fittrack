// 这个页面显示推荐的训练计划
// 用户可以选择一个训练计划，查看计划内容
'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import ErrorMessage from '@/components/ui/ErrorMessage'
import EmptyState from '@/components/ui/EmptyState'

// 定义训练计划的数据类型
interface WorkoutPlan {
  id: string
  name: string
  description: string | null
  difficulty: string
  duration_weeks: number | null
  exercises: any // JSON格式的训练计划
}

// 强制动态渲染，避免构建时预渲染
export const dynamic = 'force-dynamic'

export default function PlansPage() {
  const router = useRouter()
  const [plans, setPlans] = useState<WorkoutPlan[]>([])
  const [selectedPlan, setSelectedPlan] = useState<WorkoutPlan | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 页面加载时，检查登录状态并加载训练计划
  useEffect(() => {
    checkAuth()
    loadPlans()
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

  // 从数据库加载训练计划
  const loadPlans = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from('workout_plans')
        .select('*')
        .order('difficulty', { ascending: true })

      if (error) {
        if (error.message.includes('fetch') || error.message.includes('network')) {
          throw new Error('网络连接失败，请检查网络后重试')
        }
        throw error
      }

      setPlans(data || [])
    } catch (error: any) {
      console.error('加载训练计划失败:', error)
      setError(error.message || '加载训练计划失败')
    } finally {
      setLoading(false)
    }
  }

  // 获取难度显示文本
  const getDifficultyText = (difficulty: string) => {
    const map: { [key: string]: { text: string; color: string } } = {
      beginner: { text: '新手', color: 'bg-green-100 text-green-700' },
      intermediate: { text: '中级', color: 'bg-yellow-100 text-yellow-700' },
      advanced: { text: '高级', color: 'bg-red-100 text-red-700' },
    }
    return map[difficulty] || { text: difficulty, color: 'bg-gray-100 text-gray-700' }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto">
        {/* 顶部栏 */}
        <div className="bg-blue-500 text-white p-4 rounded-t-lg mb-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">📋 训练计划</h1>
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
            onRetry={loadPlans}
            onDismiss={() => setError(null)}
          />
        )}

        {/* 加载中 */}
        {loading ? (
          <div className="bg-white rounded-lg shadow-md">
            <LoadingSpinner text="加载训练计划中..." />
          </div>
        ) : plans.length === 0 ? (
          <EmptyState
            icon="📋"
            title="暂无训练计划"
            description="训练计划功能正在开发中"
          />
        ) : (
          <div className="space-y-4">
            {/* 训练计划列表 */}
            {!selectedPlan && plans.map((plan) => {
              const difficulty = getDifficultyText(plan.difficulty)
              return (
                <div
                  key={plan.id}
                  className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => setSelectedPlan(plan)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-xl font-bold">{plan.name}</h3>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${difficulty.color}`}>
                      {difficulty.text}
                    </span>
                  </div>
                  {plan.description && (
                    <p className="text-gray-600 mb-3">{plan.description}</p>
                  )}
                  {plan.duration_weeks && (
                    <p className="text-sm text-gray-500">
                      计划时长：{plan.duration_weeks}周
                    </p>
                  )}
                  <div className="mt-4 text-blue-500 text-sm font-medium">
                    点击查看详情 →
                  </div>
                </div>
              )
            })}

            {/* 训练计划详情 */}
            {selectedPlan && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold">{selectedPlan.name}</h2>
                  <button
                    onClick={() => setSelectedPlan(null)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>

                {selectedPlan.description && (
                  <p className="text-gray-600 mb-4">{selectedPlan.description}</p>
                )}

                <div className="space-y-4">
                  {Array.isArray(selectedPlan.exercises) && selectedPlan.exercises.map((day: any, index: number) => (
                    <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
                      <h3 className="font-semibold text-lg mb-2">
                        第{day.day}天
                      </h3>
                      <div className="space-y-1">
                        {Array.isArray(day.exercises) && day.exercises.map((exercise: string, exIndex: number) => (
                          <div key={exIndex} className="text-gray-700">
                            • {exercise}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 pt-4 border-t">
                  <p className="text-sm text-gray-500 mb-4">
                    💡 提示：按照计划中的动作进行训练，记录每次的训练数据，追踪你的进步！
                  </p>
                  <button
                    onClick={() => router.push('/add')}
                    className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition-colors font-medium"
                  >
                    开始记录训练
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

