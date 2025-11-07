# NOTES.md - AI Agent Instructions for FitTrack

## 🎯 项目概述

你正在为一位**编程经验有限的Vibe-coder**构建**FitTrack**。请：
- 用简单的语言解释所有技术概念
- 提供可直接运行的完整代码，并附带清晰的注释
- 在执行每一步之前先解释你要做什么以及为什么
- 每次只实现一个小功能，并立即测试
- 优先选择简单可行的方案，而非复杂的最佳实践

## 📚 我们要构建什么

**应用名称：** FitTrack - Simple Workout Logger

**目标：** 帮助健身新手快速记录训练数据并追踪力量进步

**技术栈：** 
- **Next.js 14：** 一个React框架，让我们无需复杂配置就能构建网站。它自动处理路由（页面跳转）、优化（让网站更快）等繁琐工作
- **Tailwind CSS：** 一种CSS框架，让我们用class就能写样式，不用写复杂的CSS文件
- **Supabase：** 开箱即用的后端服务，提供数据库（存储数据）和用户认证（登录注册），不用我们自己搭建服务器
- **Vercel：** 一键部署平台，把我们的网站发布到互联网上，免费且自动

**学习目标：** 通过构建这个应用，你将理解：
- 如何用React构建用户界面
- 如何连接和使用数据库
- 如何实现用户登录注册
- 如何部署一个真实的Web应用

## 🛠 环境准备

### 前置条件检查
```bash
# 确保这些工具已安装（在终端运行）:
node --version  # 应该是 v18.x 或更高
npm --version   # 应该是 v9.x 或更高
git --version   # 任何最新版本
```

如果没有安装，请访问：
- Node.js: https://nodejs.org/（下载LTS版本）
- Git: https://git-scm.com/

### 项目初始化
```bash
# 第1步：创建Next.js项目
npx create-next-app@latest fittrack --typescript --tailwind --app

# 第2步：进入项目目录
cd fittrack

# 第3步：安装Shadcn/ui（漂亮的UI组件库）
npx shadcn-ui@latest init
# 选择默认选项即可（一路回车）

# 第4步：安装Supabase客户端
npm install @supabase/supabase-js

# 第5步：启动开发服务器
npm run dev
# 在浏览器打开 http://localhost:3000 应该能看到欢迎页面
```

### 项目结构
```
fittrack/
├── app/                    # Next.js页面和路由
│   ├── page.tsx           # 首页（Dashboard）
│   ├── add/               # 添加训练记录页面
│   │   └── page.tsx
│   ├── history/           # 历史记录页面
│   │   └── page.tsx
│   ├── login/             # 登录页面
│   │   └── page.tsx
│   └── api/               # API路由（后端逻辑）
├── components/            # 可复用的UI组件
│   ├── ui/               # Shadcn UI组件
│   └── features/         # 功能组件
├── lib/                  # 工具函数和配置
│   └── supabase.ts       # Supabase连接配置
├── public/               # 静态资源（图片等）
├── .env.local           # 环境变量（Supabase密钥等）
└── package.json         # 项目依赖
```

## 🚀 实施阶段

### 第一阶段：基础搭建（第1-2天）
**目标：** 项目能运行，Supabase连接成功，用户能注册登录

#### 任务1：配置Supabase

1. **创建Supabase项目**
   - 访问 https://supabase.com
   - 点击"New Project"
   - 项目名：fittrack
   - 数据库密码：设置一个强密码（记住它！）
   - 区域：选择Singapore（距离中国最近）
   - 等待2-3分钟创建完成

2. **获取API密钥**
   - 项目创建后，点击Settings → API
   - 复制这两个值：
     - `Project URL`: https://xxx.supabase.co
     - `anon public key`: 一串很长的密钥

3. **配置环境变量**
   - 在项目根目录创建`.env.local`文件
   - 添加以下内容（替换为你的实际值）：
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://你的项目ID.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=你的anon密钥
   ```

4. **创建Supabase客户端**
   ```typescript
   // 文件：lib/supabase.ts
   // 这个文件负责连接Supabase数据库
   import { createClient } from '@supabase/supabase-js'
   
   const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
   const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
   
   // 导出一个可以在整个应用中使用的Supabase客户端
   export const supabase = createClient(supabaseUrl, supabaseAnonKey)
   ```

5. **创建数据库表**
   - 在Supabase Dashboard点击"SQL Editor"
   - 运行以下SQL（创建3个表）：
   ```sql
   -- 用户表（Supabase Auth会自动创建，这里只是展示结构）
   
   -- 训练记录表
   CREATE TABLE workouts (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
     exercise_name VARCHAR(100) NOT NULL,
     weight DECIMAL(5,2) NOT NULL,
     reps INTEGER NOT NULL,
     sets INTEGER NOT NULL,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
   );
   
   -- 预设动作表
   CREATE TABLE exercises (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     name VARCHAR(100) NOT NULL,
     category VARCHAR(50) NOT NULL,
     english_name VARCHAR(100)
   );
   
   -- 插入20个预设动作
   INSERT INTO exercises (name, category, english_name) VALUES
   -- 腿部
   ('深蹲', '腿部', 'Squat'),
   ('前蹲', '腿部', 'Front Squat'),
   ('硬拉', '腿部', 'Deadlift'),
   ('罗马尼亚硬拉', '腿部', 'Romanian Deadlift'),
   ('腿举', '腿部', 'Leg Press'),
   ('弓步蹲', '腿部', 'Lunge'),
   -- 胸部
   ('卧推', '胸部', 'Bench Press'),
   ('上斜卧推', '胸部', 'Incline Bench Press'),
   ('哑铃卧推', '胸部', 'Dumbbell Bench Press'),
   ('俯卧撑', '胸部', 'Push-up'),
   -- 背部
   ('引体向上', '背部', 'Pull-up'),
   ('高位下拉', '背部', 'Lat Pulldown'),
   ('杠铃划船', '背部', 'Barbell Row'),
   ('坐姿划船', '背部', 'Seated Row'),
   -- 肩部
   ('推举', '肩部', 'Overhead Press'),
   ('侧平举', '肩部', 'Lateral Raise'),
   ('面拉', '肩部', 'Face Pull'),
   -- 手臂
   ('二头弯举', '手臂', 'Bicep Curl'),
   ('三头下压', '手臂', 'Tricep Pushdown'),
   ('锤式弯举', '手臂', 'Hammer Curl');
   
   -- 创建索引以提升查询速度
   CREATE INDEX idx_workouts_user_id ON workouts(user_id);
   CREATE INDEX idx_workouts_created_at ON workouts(created_at DESC);
   ```

6. **测试连接**
   - 预期：数据库表创建成功，可以在Supabase的Table Editor中看到

#### 任务2：实现用户认证（登录注册）

**学习重点：** 用户认证是如何工作的

1. **创建登录页面**
   ```typescript
   // 文件：app/login/page.tsx
   // 这个页面让用户登录或注册
   'use client'
   
   import { useState } from 'react'
   import { supabase } from '@/lib/supabase'
   import { useRouter } from 'next/navigation'
   
   export default function LoginPage() {
     const router = useRouter()
     const [email, setEmail] = useState('')
     const [password, setPassword] = useState('')
     const [loading, setLoading] = useState(false)
     const [error, setError] = useState<string | null>(null)
     const [isSignUp, setIsSignUp] = useState(false)
   
     // 处理登录/注册
     const handleAuth = async (e: React.FormEvent) => {
       e.preventDefault()
       setLoading(true)
       setError(null)
   
       try {
         if (isSignUp) {
           // 注册新用户
           const { error } = await supabase.auth.signUp({
             email,
             password,
           })
           if (error) throw error
           alert('注册成功！请登录')
           setIsSignUp(false)
         } else {
           // 登录
           const { error } = await supabase.auth.signInWithPassword({
             email,
             password,
           })
           if (error) throw error
           router.push('/') // 登录成功，跳转到首页
         }
       } catch (error: any) {
         setError(error.message)
       } finally {
         setLoading(false)
       }
     }
   
     return (
       <div className="min-h-screen flex items-center justify-center bg-gray-50">
         <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
           <h1 className="text-2xl font-bold text-center mb-6">
             FitTrack
           </h1>
           <h2 className="text-xl text-center mb-6">
             {isSignUp ? '注册账号' : '登录'}
           </h2>
           
           <form onSubmit={handleAuth} className="space-y-4">
             <div>
               <label className="block text-sm font-medium mb-2">
                 邮箱
               </label>
               <input
                 type="email"
                 value={email}
                 onChange={(e) => setEmail(e.target.value)}
                 className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                 required
               />
             </div>
             
             <div>
               <label className="block text-sm font-medium mb-2">
                 密码
               </label>
               <input
                 type="password"
                 value={password}
                 onChange={(e) => setPassword(e.target.value)}
                 className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                 required
                 minLength={6}
               />
             </div>
             
             {error && (
               <div className="text-red-500 text-sm">{error}</div>
             )}
             
             <button
               type="submit"
               disabled={loading}
               className="w-full bg-blue-500 text-white py-3 rounded-lg font-medium hover:bg-blue-600 disabled:opacity-50"
             >
               {loading ? '处理中...' : (isSignUp ? '注册' : '登录')}
             </button>
           </form>
           
           <button
             onClick={() => setIsSignUp(!isSignUp)}
             className="w-full mt-4 text-blue-500 hover:underline"
           >
             {isSignUp ? '已有账号？去登录' : '没有账号？去注册'}
           </button>
         </div>
       </div>
     )
   }
   ```

2. **测试认证功能**
   - 操作：访问 http://localhost:3000/login
   - 预期：看到登录页面，能注册新账号，能登录
   - 调试：如果出错，检查Supabase密钥是否正确配置在`.env.local`

### 第二阶段：核心功能（第3-7天）
**目标：** 实现添加记录、查看历史、进步图表

#### 功能1：快速添加训练记录

**学习重点：** 表单处理、数据提交、状态管理

1. **创建添加记录页面**
   ```typescript
   // 文件：app/add/page.tsx
   // 这个页面让用户添加训练记录
   'use client'
   
   import { useState, useEffect } from 'react'
   import { supabase } from '@/lib/supabase'
   import { useRouter } from 'next/navigation'
   
   interface Exercise {
     id: string
     name: string
     category: string
   }
   
   export default function AddWorkoutPage() {
     const router = useRouter()
     const [exercises, setExercises] = useState<Exercise[]>([])
     const [selectedExercise, setSelectedExercise] = useState('')
     const [weight, setWeight] = useState('')
     const [reps, setReps] = useState('')
     const [sets, setSets] = useState('1')
     const [loading, setLoading] = useState(false)
     const [error, setError] = useState<string | null>(null)
   
     // 加载预设动作列表
     useEffect(() => {
       loadExercises()
     }, [])
   
     const loadExercises = async () => {
       const { data, error } = await supabase
         .from('exercises')
         .select('*')
         .order('category', { ascending: true })
       
       if (data) setExercises(data)
       if (error) console.error('加载动作失败:', error)
     }
   
     // 保存训练记录
     const handleSubmit = async (e: React.FormEvent) => {
       e.preventDefault()
       setLoading(true)
       setError(null)
   
       try {
         // 获取当前登录用户
         const { data: { user } } = await supabase.auth.getUser()
         if (!user) throw new Error('请先登录')
   
         // 插入训练记录
         const { error } = await supabase
           .from('workouts')
           .insert({
             user_id: user.id,
             exercise_name: selectedExercise,
             weight: parseFloat(weight),
             reps: parseInt(reps),
             sets: parseInt(sets),
           })
   
         if (error) throw error
   
         // 保存成功，跳转回首页
         alert('保存成功！💪')
         router.push('/')
       } catch (error: any) {
         setError(error.message)
       } finally {
         setLoading(false)
       }
     }
   
     return (
       <div className="min-h-screen bg-gray-50 p-4">
         <div className="max-w-md mx-auto">
           <div className="bg-white rounded-lg shadow-md p-6">
             <h1 className="text-2xl font-bold mb-6">添加训练记录</h1>
             
             <form onSubmit={handleSubmit} className="space-y-4">
               {/* 选择动作 */}
               <div>
                 <label className="block text-sm font-medium mb-2">
                   选择动作
                 </label>
                 <select
                   value={selectedExercise}
                   onChange={(e) => setSelectedExercise(e.target.value)}
                   className="w-full px-4 py-3 border rounded-lg text-lg"
                   required
                 >
                   <option value="">请选择...</option>
                   {exercises.map((ex) => (
                     <option key={ex.id} value={ex.name}>
                       {ex.name} ({ex.category})
                     </option>
                   ))}
                 </select>
               </div>
   
               {/* 重量 */}
               <div>
                 <label className="block text-sm font-medium mb-2">
                   重量 (kg)
                 </label>
                 <input
                   type="number"
                   step="0.5"
                   value={weight}
                   onChange={(e) => setWeight(e.target.value)}
                   className="w-full px-4 py-3 border rounded-lg text-lg"
                   placeholder="80"
                   required
                   min="0"
                 />
               </div>
   
               {/* 次数 */}
               <div>
                 <label className="block text-sm font-medium mb-2">
                   次数 (reps)
                 </label>
                 <input
                   type="number"
                   value={reps}
                   onChange={(e) => setReps(e.target.value)}
                   className="w-full px-4 py-3 border rounded-lg text-lg"
                   placeholder="10"
                   required
                   min="1"
                 />
               </div>
   
               {/* 组数 */}
               <div>
                 <label className="block text-sm font-medium mb-2">
                   组数 (sets)
                 </label>
                 <input
                   type="number"
                   value={sets}
                   onChange={(e) => setSets(e.target.value)}
                   className="w-full px-4 py-3 border rounded-lg text-lg"
                   placeholder="4"
                   required
                   min="1"
                 />
               </div>
   
               {error && (
                 <div className="text-red-500 text-sm">{error}</div>
               )}
   
               {/* 保存按钮 */}
               <button
                 type="submit"
                 disabled={loading}
                 className="w-full bg-orange-500 text-white py-4 rounded-lg text-lg font-medium hover:bg-orange-600 disabled:opacity-50"
               >
                 {loading ? '保存中...' : '💪 保存记录'}
               </button>
   
               <button
                 type="button"
                 onClick={() => router.push('/')}
                 className="w-full bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300"
               >
                 返回
               </button>
             </form>
           </div>
         </div>
       </div>
     )
   }
   ```

2. **测试添加功能**
   - 操作：访问 http://localhost:3000/add
   - 输入：选择"深蹲"，重量80，次数10，组数4
   - 点击保存
   - 预期：显示"保存成功"，在Supabase的workouts表中能看到这条记录
   - 常见问题：如果保存失败，检查是否已登录

#### 功能2：查看历史记录

**学习重点：** 数据查询、列表渲染、日期格式化

1. **创建历史记录页面**
   ```typescript
   // 文件：app/history/page.tsx
   // 显示用户的所有训练记录
   'use client'
   
   import { useState, useEffect } from 'react'
   import { supabase } from '@/lib/supabase'
   import { useRouter } from 'next/navigation'
   
   interface Workout {
     id: string
     exercise_name: string
     weight: number
     reps: number
     sets: number
     created_at: string
   }
   
   export default function HistoryPage() {
     const router = useRouter()
     const [workouts, setWorkouts] = useState<Workout[]>([])
     const [loading, setLoading] = useState(true)
   
     useEffect(() => {
       loadWorkouts()
     }, [])
   
     const loadWorkouts = async () => {
       try {
         const { data: { user } } = await supabase.auth.getUser()
         if (!user) {
           router.push('/login')
           return
         }
   
         // 查询用户的训练记录，按时间倒序
         const { data, error } = await supabase
           .from('workouts')
           .select('*')
           .eq('user_id', user.id)
           .order('created_at', { ascending: false })
   
         if (error) throw error
         setWorkouts(data || [])
       } catch (error) {
         console.error('加载记录失败:', error)
       } finally {
         setLoading(false)
       }
     }
   
     // 格式化日期
     const formatDate = (dateString: string) => {
       const date = new Date(dateString)
       const now = new Date()
       const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
       
       if (diffDays === 0) return '今天'
       if (diffDays === 1) return '昨天'
       if (diffDays < 7) return `${diffDays}天前`
       
       return date.toLocaleDateString('zh-CN')
     }
   
     // 按日期分组
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
   
     if (loading) {
       return (
         <div className="min-h-screen flex items-center justify-center">
           <div className="text-lg">加载中...</div>
         </div>
       )
     }
   
     const groupedWorkouts = groupByDate()
   
     return (
       <div className="min-h-screen bg-gray-50 p-4">
         <div className="max-w-md mx-auto">
           <div className="flex items-center justify-between mb-6">
             <h1 className="text-2xl font-bold">历史记录</h1>
             <button
               onClick={() => router.push('/')}
               className="text-blue-500 hover:underline"
             >
               返回
             </button>
           </div>
   
           {workouts.length === 0 ? (
             <div className="bg-white rounded-lg shadow-md p-8 text-center">
               <p className="text-gray-500 mb-4">还没有训练记录</p>
               <button
                 onClick={() => router.push('/add')}
                 className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
               >
                 添加第一条记录
               </button>
             </div>
           ) : (
             <div className="space-y-6">
               {Object.entries(groupedWorkouts).map(([date, workouts]) => (
                 <div key={date}>
                   <h2 className="text-lg font-medium mb-3 text-gray-700">
                     📅 {date}
                   </h2>
                   <div className="space-y-3">
                     {workouts.map((workout) => (
                       <div
                         key={workout.id}
                         className="bg-white rounded-lg shadow-md p-4"
                       >
                         <div className="font-medium text-lg">
                           {workout.exercise_name}
                         </div>
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
                 </div>
               ))}
             </div>
           )}
         </div>
       </div>
     )
   }
   ```

2. **测试历史记录**
   - 操作：访问 http://localhost:3000/history
   - 预期：看到之前添加的训练记录，按日期分组显示
   - 调试：如果没有数据，检查是否添加过记录，是否登录状态正确

#### 功能3：首页Dashboard

1. **创建首页**
   ```typescript
   // 文件：app/page.tsx
   // 应用首页，显示今日训练和快捷入口
   'use client'
   
   import { useState, useEffect } from 'react'
   import { supabase } from '@/lib/supabase'
   import { useRouter } from 'next/navigation'
   
   interface Workout {
     id: string
     exercise_name: string
     weight: number
     reps: number
     sets: number
     created_at: string
   }
   
   export default function HomePage() {
     const router = useRouter()
     const [user, setUser] = useState<any>(null)
     const [todayWorkouts, setTodayWorkouts] = useState<Workout[]>([])
     const [loading, setLoading] = useState(true)
   
     useEffect(() => {
       checkUser()
     }, [])
   
     const checkUser = async () => {
       const { data: { user } } = await supabase.auth.getUser()
       
       if (!user) {
         router.push('/login')
         return
       }
       
       setUser(user)
       await loadTodayWorkouts(user.id)
       setLoading(false)
     }
   
     const loadTodayWorkouts = async (userId: string) => {
       const today = new Date()
       today.setHours(0, 0, 0, 0)
       
       const { data } = await supabase
         .from('workouts')
         .select('*')
         .eq('user_id', userId)
         .gte('created_at', today.toISOString())
         .order('created_at', { ascending: false })
       
       setTodayWorkouts(data || [])
     }
   
     const handleLogout = async () => {
       await supabase.auth.signOut()
       router.push('/login')
     }
   
     if (loading) {
       return (
         <div className="min-h-screen flex items-center justify-center">
           <div className="text-lg">加载中...</div>
         </div>
       )
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
           {/* 添加记录按钮 */}
           <button
             onClick={() => router.push('/add')}
             className="w-full bg-orange-500 text-white py-6 rounded-lg text-xl font-medium hover:bg-orange-600 shadow-lg"
           >
             ➕ 添加训练记录
           </button>
   
           {/* 今日训练 */}
           <div className="bg-white rounded-lg shadow-md p-6">
             <h2 className="text-xl font-bold mb-4">📅 今日训练</h2>
             {todayWorkouts.length === 0 ? (
               <p className="text-gray-500 text-center py-4">
                 今天还没有训练记录
               </p>
             ) : (
               <div className="space-y-3">
                 {todayWorkouts.map((workout) => (
                   <div
                     key={workout.id}
                     className="border-l-4 border-blue-500 pl-4 py-2"
                   >
                     <div className="font-medium">{workout.exercise_name}</div>
                     <div className="text-gray-600">
                       {workout.weight}kg × {workout.reps}次 × {workout.sets}组
                     </div>
                     <div className="text-sm text-gray-400">
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
             <button
               onClick={() => router.push('/history')}
               className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition"
             >
               <div className="text-3xl mb-2">📊</div>
               <div className="font-medium">历史记录</div>
             </button>
             
             <button
               onClick={() => router.push('/chart')}
               className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition"
             >
               <div className="text-3xl mb-2">📈</div>
               <div className="font-medium">进步图表</div>
             </button>
           </div>
         </div>
       </div>
     )
   }
   ```

2. **测试首页**
   - 操作：访问 http://localhost:3000
   - 预期：看到今日训练记录、添加按钮、快捷入口
   - 调试：如果一直加载，检查控制台错误信息

#### 功能4：进步图表

**学习重点：** 数据可视化、Chart.js使用

1. **安装Chart.js**
   ```bash
   npm install chart.js react-chartjs-2
   ```

2. **创建图表页面**
   ```typescript
   // 文件：app/chart/page.tsx
   // 显示某个动作的重量趋势图
   'use client'
   
   import { useState, useEffect } from 'react'
   import { supabase } from '@/lib/supabase'
   import { useRouter } from 'next/navigation'
   import { Line } from 'react-chartjs-2'
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
   
   // 注册Chart.js组件
   ChartJS.register(
     CategoryScale,
     LinearScale,
     PointElement,
     LineElement,
     Title,
     Tooltip,
     Legend
   )
   
   interface Exercise {
     id: string
     name: string
   }
   
   interface WorkoutData {
     date: string
     weight: number
   }
   
   export default function ChartPage() {
     const router = useRouter()
     const [exercises, setExercises] = useState<Exercise[]>([])
     const [selectedExercise, setSelectedExercise] = useState('')
     const [chartData, setChartData] = useState<WorkoutData[]>([])
   
     useEffect(() => {
       loadExercises()
     }, [])
   
     useEffect(() => {
       if (selectedExercise) {
         loadChartData()
       }
     }, [selectedExercise])
   
     const loadExercises = async () => {
       const { data } = await supabase
         .from('exercises')
         .select('*')
         .order('name')
       
       if (data) setExercises(data)
     }
   
     const loadChartData = async () => {
       const { data: { user } } = await supabase.auth.getUser()
       if (!user) return
   
       // 查询最近30天的该动作记录
       const thirtyDaysAgo = new Date()
       thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
   
       const { data } = await supabase
         .from('workouts')
         .select('weight, created_at')
         .eq('user_id', user.id)
         .eq('exercise_name', selectedExercise)
         .gte('created_at', thirtyDaysAgo.toISOString())
         .order('created_at', { ascending: true })
   
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
     }
   
     // 计算进步百分比
     const calculateProgress = () => {
       if (chartData.length < 2) return null
       
       const first = chartData[0].weight
       const last = chartData[chartData.length - 1].weight
       const increase = last - first
       const percentage = ((increase / first) * 100).toFixed(1)
       
       return { increase, percentage }
     }
   
     const progress = calculateProgress()
   
     // 图表配置
     const data = {
       labels: chartData.map(d => d.date),
       datasets: [
         {
           label: '重量 (kg)',
           data: chartData.map(d => d.weight),
           borderColor: 'rgb(59, 130, 246)',
           backgroundColor: 'rgba(59, 130, 246, 0.1)',
           tension: 0.3,
         }
       ]
     }
   
     const options = {
       responsive: true,
       plugins: {
         legend: {
           display: false
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
           beginAtZero: false
         }
       }
     }
   
     return (
       <div className="min-h-screen bg-gray-50 p-4">
         <div className="max-w-2xl mx-auto">
           <div className="flex items-center justify-between mb-6">
             <h1 className="text-2xl font-bold">📈 进步图表</h1>
             <button
               onClick={() => router.push('/')}
               className="text-blue-500 hover:underline"
             >
               返回
             </button>
           </div>
   
           {/* 选择动作 */}
           <div className="bg-white rounded-lg shadow-md p-6 mb-6">
             <label className="block text-sm font-medium mb-2">
               选择动作
             </label>
             <select
               value={selectedExercise}
               onChange={(e) => setSelectedExercise(e.target.value)}
               className="w-full px-4 py-3 border rounded-lg text-lg"
             >
               <option value="">请选择...</option>
               {exercises.map((ex) => (
                 <option key={ex.id} value={ex.name}>
                   {ex.name}
                 </option>
               ))}
             </select>
           </div>
   
           {/* 图表 */}
           {selectedExercise && chartData.length > 0 && (
             <div className="bg-white rounded-lg shadow-md p-6">
               <Line data={data} options={options} />
               
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
   
           {selectedExercise && chartData.length === 0 && (
             <div className="bg-white rounded-lg shadow-md p-8 text-center">
               <p className="text-gray-500">该动作还没有足够的数据</p>
               <p className="text-sm text-gray-400 mt-2">
                 至少需要记录2次才能显示图表
               </p>
             </div>
           )}
         </div>
       </div>
     )
   }
   ```

3. **测试图表功能**
   - 操作：访问 http://localhost:3000/chart
   - 选择一个有多次记录的动作（如"深蹲"）
   - 预期：看到该动作的重量趋势线图，显示进步百分比
   - 调试：如果图表不显示，检查是否有足够的数据（至少2条记录）

### 第三阶段：优化与部署（第8-10天）
**目标：** 完善体验，部署到线上

#### 任务1：添加错误处理和加载状态

在所有页面添加：
- 网络错误提示
- 加载动画
- 空状态提示
- 表单验证

#### 任务2：移动端优化

确保：
- 按钮足够大（至少48px高度）
- 字体清晰可读（至少16px）
- 在不同手机上测试（iPhone、Android）

#### 任务3：部署到Vercel

1. **推送到GitHub**
   ```bash
   git init
   git add .
   git commit -m "feat: FitTrack MVP完成"
   git branch -M main
   git remote add origin https://github.com/你的用户名/fittrack.git
   git push -u origin main
   ```

2. **部署到Vercel**
   - 访问 https://vercel.com
   - 用GitHub登录
   - 点击"Import Project"
   - 选择fittrack仓库
   - 添加环境变量：
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - 点击Deploy
   - 等待3分钟完成

3. **测试线上版本**
   - 访问Vercel给的域名（如 fittrack-xxx.vercel.app）
   - 测试所有功能
   - 在手机上打开测试

## 💡 学习资源

### Next.js入门
- **官方教程**：https://nextjs.org/learn（英文，但很详细）
- **B站视频**：搜索"Next.js 14入门"
- **时间**：2-3小时速成

### Supabase使用
- **官方文档**：https://supabase.com/docs
- **YouTube**："Supabase Crash Course"
- **时间**：1小时速成

### Tailwind CSS
- **官方文档**：https://tailwindcss.com/docs
- **技巧**：需要什么样式就搜什么（如"tailwind button"）
- **时间**：边用边学

### 遇到问题时
1. **Discord社区**：Next.js Discord、Supabase Discord
2. **搜索引擎**：Google搜索错误信息
3. **AI助手**：问ChatGPT、Claude
4. **Stack Overflow**：搜索技术问题

## 🐛 常见问题与解决方案

### "Module not found"错误
**原因：** 依赖包没安装或路径错误
**解决：**
```bash
npm install
# 或者删除node_modules重新安装
rm -rf node_modules package-lock.json
npm install
```

### "Invalid API key"错误
**原因：** Supabase密钥配置错误
**解决：**
1. 检查`.env.local`文件是否存在
2. 确认密钥没有多余的空格
3. 重启开发服务器（`npm run dev`）

### 添加记录后历史记录不更新
**原因：** 页面没有重新加载数据
**解决：**
- 刷新页面
- 或在代码中添加自动刷新逻辑

### 图表不显示
**检查：**
1. 是否有足够的数据（至少2条记录）
2. Chart.js是否正确安装
3. 浏览器控制台是否有错误

### 部署后环境变量不生效
**解决：**
1. 在Vercel设置中添加环境变量
2. 重新部署（Deployments → Redeploy）

## 📝 代码规范

### 组件结构模板
```typescript
'use client' // 如果组件需要使用useState、useEffect等hooks

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function ComponentName() {
  // 1. 状态声明
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // 2. 副作用
  useEffect(() => {
    loadData()
  }, [])
  
  // 3. 事件处理函数
  const loadData = async () => {
    try {
      // 逻辑
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }
  
  // 4. 渲染
  return (
    <div>
      {/* JSX */}
    </div>
  )
}
```

### API调用模板
```typescript
const fetchData = async () => {
  try {
    setLoading(true)
    setError(null)
    
    const { data, error } = await supabase
      .from('table_name')
      .select('*')
    
    if (error) throw error
    
    setData(data)
  } catch (error: any) {
    setError(error.message)
    console.error('Error:', error)
  } finally {
    setLoading(false)
  }
}
```

## 🧪 测试清单

### 手动测试
每个功能完成后测试：

- [ ] **注册登录**
  - 能用新邮箱注册
  - 能用已有账号登录
  - 错误密码会提示错误
  - 登录后跳转到首页

- [ ] **添加记录**
  - 能选择20个预设动作
  - 能输入重量、次数、组数
  - 保存成功有提示
  - 数据保存到数据库

- [ ] **历史记录**
  - 显示所有记录
  - 按日期分组
  - 按时间倒序排列

- [ ] **进步图表**
  - 选择动作后显示图表
  - 图表数据正确
  - 显示进步百分比

- [ ] **移动端**
  - 在手机上打开正常
  - 按钮容易点击
  - 文字清晰可读

- [ ] **错误情况**
  - 网络断开有提示
  - 未登录跳转到登录页
  - 表单验证正常

## 📊 理解架构

### 数据流程
```
用户操作 → React组件 → Supabase客户端 → Supabase服务器 → PostgreSQL数据库
                                                              ↓
                                                         返回数据
                                                              ↓
用户界面更新 ← React组件 ← Supabase客户端 ← Supabase服务器 ←┘
```

### 关键概念解释

1. **Next.js App Router**
   - 简单理解：文件夹结构就是URL路径
   - 例如：`app/add/page.tsx` → 访问 `/add`

2. **React Hooks**
   - `useState`：管理组件内部数据（如表单输入）
   - `useEffect`：在组件加载时执行操作（如获取数据）

3. **Supabase**
   - 简单理解：一个远程数据库+用户系统
   - 不需要写后端代码，直接调用API即可

4. **Tailwind CSS**
   - 简单理解：用class写样式
   - 例如：`bg-blue-500`表示蓝色背景

## 🚀 部署指南

### 部署前检查
- [ ] 所有功能测试通过
- [ ] 移除console.log调试语句
- [ ] 环境变量正确配置
- [ ] 在本地运行`npm run build`成功

### 部署到Vercel
1. **推送代码到GitHub**
   ```bash
   git add .
   git commit -m "部署准备"
   git push
   ```

2. **在Vercel导入项目**
   - 访问vercel.com
   - 点击"Import Project"
   - 选择GitHub仓库

3. **配置环境变量**
   在Vercel项目设置中添加：
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

4. **部署**
   - 点击Deploy
   - 等待构建完成
   - 获得正式URL

### 部署后验证
- [ ] 访问线上URL能正常打开
- [ ] 能注册新账号
- [ ] 能添加记录
- [ ] 能查看历史
- [ ] 图表功能正常

## 🎯 MVP完成定义

你的FitTrack MVP完成的标准：

### 功能完整性
- [x] 用户能注册和登录
- [x] 用户能添加训练记录
- [x] 用户能查看历史记录
- [x] 用户能看到进步图表
- [x] 提供20个预设动作

### 体验质量
- [x] 手机上可以正常使用
- [x] 添加到保存 ≤ 5秒
- [x] 页面加载 < 3秒
- [x] 没有严重Bug

### 部署完成
- [x] 部署到Vercel
- [x] 可以通过URL访问
- [x] 可以添加到手机主屏幕

## 📁 参考文档

- **PRD**：`augment/20251106175000_FitTrack产品需求文档PRD.md`
- **技术设计**：`augment/20251106180000_FitTrack技术设计文档-极速MVP.md`

## 💬 最后的话

记住：
- 遇到问题很正常，不要气馁
- 先让功能跑起来，再考虑优化
- 每次只关注一个功能
- 测试、测试、测试！
- AI助手随时帮你解决问题

**从第一阶段开始，一步一步来。祝你成功！💪**

