-- FitTrack 数据库表创建脚本
-- 请在Supabase Dashboard的SQL Editor中运行此脚本

-- ============================================
-- 1. 创建训练记录表（workouts）
-- ============================================
-- 这个表用来存储用户的所有训练记录
CREATE TABLE IF NOT EXISTS workouts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  exercise_name VARCHAR(100) NOT NULL,
  weight DECIMAL(5,2) NOT NULL,
  reps INTEGER NOT NULL,
  sets INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- ============================================
-- 2. 创建预设动作表（exercises）
-- ============================================
-- 这个表用来存储20个预设的健身动作
CREATE TABLE IF NOT EXISTS exercises (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  category VARCHAR(50) NOT NULL,
  english_name VARCHAR(100)
);

-- ============================================
-- 3. 插入20个预设动作数据
-- ============================================
-- 如果动作已存在，则跳过（使用ON CONFLICT）
INSERT INTO exercises (name, category, english_name) VALUES
  -- 腿部动作（6个）
  ('深蹲', '腿部', 'Squat'),
  ('前蹲', '腿部', 'Front Squat'),
  ('硬拉', '腿部', 'Deadlift'),
  ('罗马尼亚硬拉', '腿部', 'Romanian Deadlift'),
  ('腿举', '腿部', 'Leg Press'),
  ('弓步蹲', '腿部', 'Lunge'),
  -- 胸部动作（4个）
  ('卧推', '胸部', 'Bench Press'),
  ('上斜卧推', '胸部', 'Incline Bench Press'),
  ('哑铃卧推', '胸部', 'Dumbbell Bench Press'),
  ('俯卧撑', '胸部', 'Push-up'),
  -- 背部动作（4个）
  ('引体向上', '背部', 'Pull-up'),
  ('高位下拉', '背部', 'Lat Pulldown'),
  ('杠铃划船', '背部', 'Barbell Row'),
  ('坐姿划船', '背部', 'Seated Row'),
  -- 肩部动作（3个）
  ('推举', '肩部', 'Overhead Press'),
  ('侧平举', '肩部', 'Lateral Raise'),
  ('面拉', '肩部', 'Face Pull'),
  -- 手臂动作（3个）
  ('二头弯举', '手臂', 'Bicep Curl'),
  ('三头下压', '手臂', 'Tricep Pushdown'),
  ('锤式弯举', '手臂', 'Hammer Curl')
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- 4. 创建索引以提升查询速度
-- ============================================
-- 为user_id创建索引，加快按用户查询的速度
CREATE INDEX IF NOT EXISTS idx_workouts_user_id ON workouts(user_id);

-- 为created_at创建索引，加快按时间排序的速度
CREATE INDEX IF NOT EXISTS idx_workouts_created_at ON workouts(created_at DESC);

-- ============================================
-- 5. 设置行级安全策略（RLS）
-- ============================================
-- 启用行级安全，确保用户只能访问自己的数据
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;

-- 创建策略：用户只能查看自己的训练记录
CREATE POLICY "Users can view their own workouts"
  ON workouts FOR SELECT
  USING (auth.uid() = user_id);

-- 创建策略：用户只能插入自己的训练记录
CREATE POLICY "Users can insert their own workouts"
  ON workouts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 创建策略：用户只能更新自己的训练记录
CREATE POLICY "Users can update their own workouts"
  ON workouts FOR UPDATE
  USING (auth.uid() = user_id);

-- 创建策略：用户只能删除自己的训练记录
CREATE POLICY "Users can delete their own workouts"
  ON workouts FOR DELETE
  USING (auth.uid() = user_id);

-- exercises表是公开的，所有人都可以查看，所以不需要RLS策略

-- ============================================
-- 完成！
-- ============================================
-- 运行完成后，你应该能看到：
-- 1. workouts表已创建
-- 2. exercises表已创建，并且有20条记录
-- 3. 索引已创建
-- 4. 行级安全策略已启用

