-- FitTrack V2功能 - 身体数据追踪表
-- 请在Supabase Dashboard的SQL Editor中运行此脚本

-- ============================================
-- 创建身体数据表（body_measurements）
-- ============================================
-- 这个表用来存储用户的身体数据（体重、体脂等）
CREATE TABLE IF NOT EXISTS body_measurements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  weight DECIMAL(5,2) NOT NULL, -- 体重（kg）
  body_fat DECIMAL(4,2), -- 体脂率（%，可选）
  muscle_mass DECIMAL(5,2), -- 肌肉量（kg，可选）
  notes TEXT, -- 备注（可选）
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- ============================================
-- 创建索引以提升查询速度
-- ============================================
CREATE INDEX IF NOT EXISTS idx_body_measurements_user_id ON body_measurements(user_id);
CREATE INDEX IF NOT EXISTS idx_body_measurements_created_at ON body_measurements(created_at DESC);

-- ============================================
-- 设置行级安全策略（RLS）
-- ============================================
ALTER TABLE body_measurements ENABLE ROW LEVEL SECURITY;

-- 创建策略：用户只能查看自己的身体数据
CREATE POLICY "Users can view their own body measurements"
  ON body_measurements FOR SELECT
  USING (auth.uid() = user_id);

-- 创建策略：用户只能插入自己的身体数据
CREATE POLICY "Users can insert their own body measurements"
  ON body_measurements FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 创建策略：用户只能更新自己的身体数据
CREATE POLICY "Users can update their own body measurements"
  ON body_measurements FOR UPDATE
  USING (auth.uid() = user_id);

-- 创建策略：用户只能删除自己的身体数据
CREATE POLICY "Users can delete their own body measurements"
  ON body_measurements FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- 创建训练计划表（workout_plans）
-- ============================================
CREATE TABLE IF NOT EXISTS workout_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL, -- 计划名称
  description TEXT, -- 计划描述
  difficulty VARCHAR(20) NOT NULL, -- 难度：beginner, intermediate, advanced
  duration_weeks INTEGER, -- 计划时长（周）
  exercises JSONB NOT NULL -- 计划包含的动作（JSON格式）
);

-- ============================================
-- 插入预设训练计划
-- ============================================
INSERT INTO workout_plans (name, description, difficulty, duration_weeks, exercises) VALUES
  ('新手全身训练', '适合健身新手的全身训练计划，每周3次', 'beginner', 4, 
   '[
     {"day": 1, "exercises": ["深蹲", "卧推", "引体向上", "推举"]},
     {"day": 2, "exercises": ["硬拉", "上斜卧推", "杠铃划船", "侧平举"]},
     {"day": 3, "exercises": ["腿举", "哑铃卧推", "坐姿划船", "面拉"]}
   ]'::jsonb),
  ('增肌计划', '专注于肌肉增长的训练计划，每周4-5次', 'intermediate', 8,
   '[
     {"day": 1, "exercises": ["深蹲", "前蹲", "腿举", "弓步蹲"]},
     {"day": 2, "exercises": ["卧推", "上斜卧推", "哑铃卧推", "俯卧撑"]},
     {"day": 3, "exercises": ["硬拉", "罗马尼亚硬拉", "杠铃划船", "坐姿划船"]},
     {"day": 4, "exercises": ["推举", "侧平举", "面拉", "二头弯举", "三头下压"]}
   ]'::jsonb),
  ('力量提升计划', '专注于提升最大力量的训练计划', 'advanced', 12,
   '[
     {"day": 1, "exercises": ["深蹲", "前蹲", "腿举"]},
     {"day": 2, "exercises": ["卧推", "上斜卧推"]},
     {"day": 3, "exercises": ["硬拉", "罗马尼亚硬拉", "杠铃划船"]},
     {"day": 4, "exercises": ["推举", "引体向上", "高位下拉"]}
   ]'::jsonb)
ON CONFLICT DO NOTHING;

-- ============================================
-- 完成！
-- ============================================

