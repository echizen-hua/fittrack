// 这个页面让用户记录身体数据（体重、体脂等）
// 用户可以在这里追踪自己的身体变化
'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import ErrorMessage from '@/components/ui/ErrorMessage'
import EmptyState from '@/components/ui/EmptyState'

// 定义身体数据的数据类型
interface BodyMeasurement {
  id: string
  weight: number
  body_fat: number | null
  muscle_mass: number | null
  notes: string | null
  created_at: string
}

// 强制动态渲染，避免构建时预渲染
export const dynamic = 'force-dynamic'

export default function BodyTrackingPage() {
  const router = useRouter()
  
  // 状态管理：表单输入值
  const [weight, setWeight] = useState('')
  const [bodyFat, setBodyFat] = useState('')
  const [muscleMass, setMuscleMass] = useState('')
  const [notes, setNotes] = useState('')
  
  // 状态管理：历史记录
  const [measurements, setMeasurements] = useState<BodyMeasurement[]>([])
  
  // 状态管理：加载和错误状态
  const [loading, setLoading] = useState(false)
  const [loadingHistory, setLoadingHistory] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 页面加载时，检查登录状态并加载历史记录
  useEffect(() => {
    checkAuth()
    loadMeasurements()
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

  // 从数据库加载身体数据记录
  const loadMeasurements = async () => {
    try {
      setLoadingHistory(true)
      setError(null)

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      // 查询用户的身体数据记录，按时间倒序排列
      const { data, error } = await supabase
        .from('body_measurements')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(30) // 只显示最近30条记录

      if (error) {
        if (error.message.includes('fetch') || error.message.includes('network')) {
          throw new Error('网络连接失败，请检查网络后重试')
        }
        throw error
      }

      setMeasurements(data || [])
    } catch (error: any) {
      console.error('加载身体数据失败:', error)
      setError(error.message || '加载数据失败')
    } finally {
      setLoadingHistory(false)
    }
  }

  // 处理表单提交：保存身体数据
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // 获取当前登录的用户
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError) throw userError
      if (!user) {
        throw new Error('请先登录')
      }

      // 验证输入数据
      const weightNum = parseFloat(weight)
      if (!weight || isNaN(weightNum) || weightNum <= 0) {
        throw new Error('请输入有效的体重（必须大于0）')
      }
      if (weightNum > 500) {
        throw new Error('体重不能超过500kg')
      }

      const bodyFatNum = bodyFat ? parseFloat(bodyFat) : null
      if (bodyFat && (isNaN(bodyFatNum!) || bodyFatNum! < 0 || bodyFatNum! > 100)) {
        throw new Error('体脂率必须在0-100%之间')
      }

      const muscleMassNum = muscleMass ? parseFloat(muscleMass) : null
      if (muscleMass && (isNaN(muscleMassNum!) || muscleMassNum! <= 0)) {
        throw new Error('肌肉量必须大于0')
      }

      // 插入身体数据到数据库
      const { error: insertError } = await supabase
        .from('body_measurements')
        .insert({
          user_id: user.id,
          weight: weightNum,
          body_fat: bodyFatNum,
          muscle_mass: muscleMassNum,
          notes: notes || null,
        })

      if (insertError) {
        if (insertError.message.includes('fetch') || insertError.message.includes('network')) {
          throw new Error('网络连接失败，请检查网络后重试')
        }
        throw insertError
      }

      // 保存成功，清空表单并刷新列表
      setWeight('')
      setBodyFat('')
      setMuscleMass('')
      setNotes('')
      await loadMeasurements()
      
      // 显示成功提示
      alert('保存成功！📏')
    } catch (error: any) {
      const errorMessage = error.message || '保存失败，请重试'
      setError(errorMessage)
      console.error('保存失败:', error)
    } finally {
      setLoading(false)
    }
  }

  // 格式化日期显示
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return '今天'
    if (diffDays === 1) return '昨天'
    if (diffDays < 7) return `${diffDays}天前`
    
    return date.toLocaleDateString('zh-CN')
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto">
        {/* 顶部栏 */}
        <div className="bg-blue-500 text-white p-4 rounded-t-lg mb-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">📏 身体数据</h1>
            <button
              onClick={() => router.push('/')}
              className="text-sm hover:underline"
            >
              返回
            </button>
          </div>
        </div>

        {/* 添加记录表单 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-4">
          <h2 className="text-xl font-bold mb-4">记录身体数据</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 体重输入 */}
            <div>
              <label className="block text-sm font-medium mb-2">
                体重 (kg) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.1"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="w-full px-4 py-3 border rounded-lg text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="70.5"
                required
                min="0"
              />
            </div>

            {/* 体脂率输入（可选） */}
            <div>
              <label className="block text-sm font-medium mb-2">
                体脂率 (%) <span className="text-gray-400 text-xs">可选</span>
              </label>
              <input
                type="number"
                step="0.1"
                value={bodyFat}
                onChange={(e) => setBodyFat(e.target.value)}
                className="w-full px-4 py-3 border rounded-lg text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="15.0"
                min="0"
                max="100"
              />
            </div>

            {/* 肌肉量输入（可选） */}
            <div>
              <label className="block text-sm font-medium mb-2">
                肌肉量 (kg) <span className="text-gray-400 text-xs">可选</span>
              </label>
              <input
                type="number"
                step="0.1"
                value={muscleMass}
                onChange={(e) => setMuscleMass(e.target.value)}
                className="w-full px-4 py-3 border rounded-lg text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="55.0"
                min="0"
              />
            </div>

            {/* 备注输入（可选） */}
            <div>
              <label className="block text-sm font-medium mb-2">
                备注 <span className="text-gray-400 text-xs">可选</span>
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-4 py-3 border rounded-lg text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="记录一些备注信息..."
                rows={3}
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
              className="w-full bg-blue-500 text-white py-4 rounded-lg text-lg font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  保存中...
                </>
              ) : (
                '💾 保存记录'
              )}
            </button>
          </form>
        </div>

        {/* 历史记录 */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">历史记录</h2>
          
          {loadingHistory ? (
            <LoadingSpinner text="加载中..." />
          ) : measurements.length === 0 ? (
            <EmptyState
              icon="📏"
              title="还没有身体数据记录"
              description="开始记录你的身体数据，追踪身体变化！"
            />
          ) : (
            <div className="space-y-3">
              {measurements.map((measurement) => (
                <div
                  key={measurement.id}
                  className="border-l-4 border-green-500 pl-4 py-3 hover:bg-gray-50 transition-colors rounded-r"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium text-lg">
                      {measurement.weight}kg
                    </div>
                    <div className="text-sm text-gray-400">
                      {formatDate(measurement.created_at)}
                    </div>
                  </div>
                  <div className="text-gray-600 text-sm space-y-1">
                    {measurement.body_fat && (
                      <div>体脂率：{measurement.body_fat}%</div>
                    )}
                    {measurement.muscle_mass && (
                      <div>肌肉量：{measurement.muscle_mass}kg</div>
                    )}
                    {measurement.notes && (
                      <div className="text-gray-500 italic">备注：{measurement.notes}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

