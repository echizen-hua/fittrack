// 这个文件负责连接Supabase数据库
// Supabase是一个后端服务，提供数据库和用户认证功能
import { createClient } from '@supabase/supabase-js'

// 从环境变量中读取Supabase的URL和密钥
// 这些值来自 .env.local 文件（开发环境）或Vercel环境变量（生产环境）
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// 创建并导出一个Supabase客户端
// 这个客户端可以在整个应用中使用，用来操作数据库和用户认证
// 如果环境变量未设置，创建一个空的客户端（构建时不会报错）
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createClient('https://placeholder.supabase.co', 'placeholder-key')

