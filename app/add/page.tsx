// 这个页面让用户添加训练记录
// 用户可以：选择动作、输入重量、次数、组数，然后保存到数据库
'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import ErrorMessage from '@/components/ui/ErrorMessage'
import { exerciseVideos } from '@/lib/exerciseVideos'

// 定义动作的数据类型
interface Exercise {
  id: string
  name: string
  category: string
}

// 强制动态渲染，避免构建时预渲染
export const dynamic = 'force-dynamic'

export default function AddWorkoutPage() {
  const router = useRouter()
  
  // 状态管理：存储预设动作列表
  const [exercises, setExercises] = useState<Exercise[]>([])
  
  // 状态管理：表单输入值
  const [selectedExercise, setSelectedExercise] = useState('')
  const [weight, setWeight] = useState('')
  const [reps, setReps] = useState('')
  const [sets, setSets] = useState('1')
  
  // 状态管理：加载和错误状态
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 页面加载时，检查登录状态并加载预设动作列表
  useEffect(() => {
    checkAuth()
    loadExercises()
  }, [])

  // 检查用户是否已登录
  const checkAuth = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        // 如果未登录，跳转到登录页
        router.push('/login')
      }
    } catch (error) {
      console.error('检查登录状态失败:', error)
      router.push('/login')
    }
  }

  // 从数据库加载预设动作列表
  const loadExercises = async () => {
    try {
      setError(null)
      // 从exercises表中查询所有动作，按类别排序
      const { data, error } = await supabase
        .from('exercises')
        .select('*')
        .order('category', { ascending: true })
      
      if (error) {
        // 检查是否是网络错误
        if (error.message.includes('fetch') || error.message.includes('network')) {
          throw new Error('网络连接失败，请检查网络后重试')
        }
        throw error
      }
      
      // 如果成功获取数据，更新状态
      if (data) {
        setExercises(data)
      }
    } catch (error: any) {
      console.error('加载动作失败:', error)
      // 提供更友好的错误信息
      const errorMessage = error.message || '加载动作列表失败，请刷新页面重试'
      setError(errorMessage)
    }
  }

  // 处理表单提交：保存训练记录到数据库
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault() // 阻止表单默认提交行为
    setLoading(true) // 开始加载
    setError(null) // 清除之前的错误

    try {
      // 获取当前登录的用户
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError) throw userError
      if (!user) {
        throw new Error('请先登录')
      }

      // 验证输入数据
      if (!selectedExercise) {
        throw new Error('请选择动作')
      }
      
      const weightNum = parseFloat(weight)
      if (!weight || isNaN(weightNum) || weightNum <= 0) {
        throw new Error('请输入有效的重量（必须大于0）')
      }
      if (weightNum > 1000) {
        throw new Error('重量不能超过1000kg')
      }
      
      const repsNum = parseInt(reps)
      if (!reps || isNaN(repsNum) || repsNum <= 0) {
        throw new Error('请输入有效的次数（必须大于0）')
      }
      if (repsNum > 1000) {
        throw new Error('次数不能超过1000次')
      }
      
      const setsNum = parseInt(sets)
      if (!sets || isNaN(setsNum) || setsNum <= 0) {
        throw new Error('请输入有效的组数（必须大于0）')
      }
      if (setsNum > 100) {
        throw new Error('组数不能超过100组')
      }

      // 插入训练记录到workouts表
      const { error: insertError } = await supabase
        .from('workouts')
        .insert({
          user_id: user.id, // 当前用户的ID
          exercise_name: selectedExercise, // 选择的动作名称
          weight: parseFloat(weight), // 重量（转换为数字）
          reps: parseInt(reps), // 次数（转换为整数）
          sets: parseInt(sets), // 组数（转换为整数）
        })

      if (insertError) {
        // 检查是否是网络错误
        if (insertError.message.includes('fetch') || insertError.message.includes('network')) {
          throw new Error('网络连接失败，请检查网络后重试')
        }
        throw insertError
      }

      // 保存成功，显示提示并跳转到首页
      // 使用router.refresh()确保首页数据刷新
      router.push('/')
      router.refresh()
    } catch (error: any) {
      // 如果出错，显示错误信息
      const errorMessage = error.message || '保存失败，请重试'
      setError(errorMessage)
      console.error('保存失败:', error)
    } finally {
      setLoading(false) // 结束加载状态
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto">
        {/* 白色卡片容器 */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold mb-6">添加训练记录</h1>
          
          {/* 表单 */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 选择动作 */}
            <div>
              <label className="block text-sm font-medium mb-2">
                选择动作
              </label>
              <select
                value={selectedExercise}
                onChange={(e) => setSelectedExercise(e.target.value)}
                className="w-full px-4 py-3 border rounded-lg text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">请选择...</option>
                {exercises.map((ex) => (
                  <option key={ex.id} value={ex.name}>
                    {ex.name} ({ex.category})
                  </option>
                ))}
              </select>
              {/* 视频教程链接 */}
              {selectedExercise && exerciseVideos[selectedExercise] && (
                <a
                  href={exerciseVideos[selectedExercise]}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex items-center text-sm text-blue-500 hover:text-blue-600 underline"
                >
                  📹 查看{selectedExercise}视频教程
                </a>
              )}
            </div>

            {/* 重量输入 */}
            <div>
              <label className="block text-sm font-medium mb-2">
                重量 (kg)
              </label>
              <input
                type="number"
                step="0.5"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="w-full px-4 py-3 border rounded-lg text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="80"
                required
                min="0"
              />
            </div>

            {/* 次数输入 */}
            <div>
              <label className="block text-sm font-medium mb-2">
                次数 (reps)
              </label>
              <input
                type="number"
                value={reps}
                onChange={(e) => setReps(e.target.value)}
                className="w-full px-4 py-3 border rounded-lg text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="10"
                required
                min="1"
              />
            </div>

            {/* 组数输入 */}
            <div>
              <label className="block text-sm font-medium mb-2">
                组数 (sets)
              </label>
              <input
                type="number"
                value={sets}
                onChange={(e) => setSets(e.target.value)}
                className="w-full px-4 py-3 border rounded-lg text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="4"
                required
                min="1"
              />
            </div>

            {/* 错误提示 */}
            {error && (
              <ErrorMessage 
                message={error} 
                onDismiss={() => setError(null)}
              />
            )}

            {/* 保存按钮 */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-500 text-white py-4 rounded-lg text-lg font-medium hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  保存中...
                </>
              ) : (
                '💪 保存记录'
              )}
            </button>

            {/* 返回按钮 */}
            <button
              type="button"
              onClick={() => router.push('/')}
              className="w-full bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition-colors"
            >
              返回
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

