// 这个页面显示某个动作的重量趋势图表
// 用户可以选择一个动作，查看该动作的重量变化趋势，了解自己的进步情况
'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { Line } from 'react-chartjs-2'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import EmptyState from '@/components/ui/EmptyState'
import ErrorMessage from '@/components/ui/ErrorMessage'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'

// 注册Chart.js组件（这是使用Chart.js的必要步骤）
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

// 定义动作的数据类型
interface Exercise {
  id: string
  name: string
}

// 定义图表数据的数据类型
interface WorkoutData {
  date: string
  weight: number
}

// 强制动态渲染，避免构建时预渲染
export const dynamic = 'force-dynamic'

export default function ChartPage() {
  const router = useRouter()
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [selectedExercise, setSelectedExercise] = useState('')
  const [chartData, setChartData] = useState<WorkoutData[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 页面加载时，检查登录状态并加载动作列表
  useEffect(() => {
    checkAuth()
    loadExercises()
  }, [])

  // 当选择动作改变时，加载该动作的图表数据
  useEffect(() => {
    if (selectedExercise) {
      loadChartData()
    } else {
      setChartData([])
    }
  }, [selectedExercise])

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

  // 从数据库加载预设动作列表
  const loadExercises = async () => {
    try {
      setError(null)
      const { data, error } = await supabase
        .from('exercises')
        .select('*')
        .order('name')
      
      if (error) {
        if (error.message.includes('fetch') || error.message.includes('network')) {
          throw new Error('网络连接失败，请检查网络后重试')
        }
        throw error
      }
      
      if (data) {
        setExercises(data)
      }
    } catch (error: any) {
      console.error('加载动作失败:', error)
      setError(error.message || '加载动作列表失败')
    }
  }

  // 加载选中动作的图表数据（最近30天的记录）
  const loadChartData = async () => {
    try {
      setLoading(true)
      setError(null)

      // 获取当前登录的用户
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      // 计算30天前的日期
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      // 查询最近30天的该动作记录，按时间正序排列
      const { data, error } = await supabase
        .from('workouts')
        .select('weight, created_at')
        .eq('user_id', user.id)
        .eq('exercise_name', selectedExercise)
        .gte('created_at', thirtyDaysAgo.toISOString())
        .order('created_at', { ascending: true })

      if (error) {
        if (error.message.includes('fetch') || error.message.includes('network')) {
          throw new Error('网络连接失败，请检查网络后重试')
        }
        throw error
      }

      // 格式化数据为图表需要的格式
      if (data) {
        const formatted = data.map(item => ({
          date: new Date(item.created_at).toLocaleDateString('zh-CN', {
            month: '2-digit',
            day: '2-digit'
          }),
          weight: item.weight
        }))
        setChartData(formatted)
      }
    } catch (error: any) {
      console.error('加载图表数据失败:', error)
      const errorMessage = error.message || '加载图表数据失败，请重试'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  // 计算进步百分比
  // 比较第一次和最后一次记录的重量，计算进步幅度
  const calculateProgress = () => {
    if (chartData.length < 2) return null
    
    const first = chartData[0].weight
    const last = chartData[chartData.length - 1].weight
    const increase = last - first
    const percentage = ((increase / first) * 100).toFixed(1)
    
    return { increase, percentage }
  }

  const progress = calculateProgress()

  // 图表数据配置
  const data = {
    labels: chartData.map(d => d.date), // X轴：日期
    datasets: [
      {
        label: '重量 (kg)',
        data: chartData.map(d => d.weight), // Y轴：重量
        borderColor: 'rgb(59, 130, 246)', // 线条颜色：蓝色
        backgroundColor: 'rgba(59, 130, 246, 0.1)', // 填充颜色：浅蓝色
        tension: 0.3, // 线条平滑度
      }
    ]
  }

  // 图表选项配置
  const options = {
    responsive: true, // 响应式设计
    plugins: {
      legend: {
        display: false // 不显示图例
      },
      title: {
        display: true,
        text: `${selectedExercise} - 重量趋势（近30天）`,
        font: {
          size: 16
        }
      }
    },
    scales: {
      y: {
        beginAtZero: false // Y轴不从0开始，更好地显示变化
      }
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        {/* 顶部栏 */}
        <div className="bg-blue-500 text-white p-4 rounded-t-lg mb-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">📈 进步图表</h1>
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
            onRetry={selectedExercise ? loadChartData : loadExercises}
            onDismiss={() => setError(null)}
          />
        )}

        {/* 选择动作 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <label className="block text-sm font-medium mb-2">
            选择动作
          </label>
          <select
            value={selectedExercise}
            onChange={(e) => setSelectedExercise(e.target.value)}
            className="w-full px-4 py-3 border rounded-lg text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">请选择...</option>
            {exercises.map((ex) => (
              <option key={ex.id} value={ex.name}>
                {ex.name}
              </option>
            ))}
          </select>
        </div>

        {/* 加载中 */}
        {loading && (
          <div className="bg-white rounded-lg shadow-md">
            <LoadingSpinner text="加载图表数据中..." />
          </div>
        )}

        {/* 显示图表 */}
        {!loading && selectedExercise && chartData.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <Line data={data} options={options} />
            
            {/* 显示进步统计 */}
            {progress && (
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <div className="text-center">
                  <div className="text-sm text-gray-600 mb-1">进步</div>
                  <div className="text-2xl font-bold text-blue-600">
                    +{progress.increase}kg ({progress.percentage > '0' ? '+' : ''}{progress.percentage}%)
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 没有数据提示 */}
        {!loading && selectedExercise && chartData.length === 0 && (
          <EmptyState
            icon="📊"
            title="该动作还没有足够的数据"
            description="至少需要记录2次才能显示图表"
            actionLabel="添加训练记录"
            onAction={() => router.push('/add')}
          />
        )}

        {/* 未选择动作提示 */}
        {!loading && !selectedExercise && !error && (
          <EmptyState
            icon="📈"
            title="请选择一个动作查看进步图表"
            description="选择一个动作，查看该动作的重量变化趋势"
          />
        )}
      </div>
    </div>
  )
}

