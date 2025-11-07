# Supabase数据库设置指南

## 📋 步骤说明

### 第一步：打开Supabase SQL Editor
1. 登录 https://supabase.com
2. 选择你的FitTrack项目
3. 点击左侧菜单的 **SQL Editor**（SQL编辑器）

### 第二步：运行SQL脚本
1. 点击 **New Query**（新建查询）
2. 打开项目中的 `supabase-setup.sql` 文件
3. 复制文件中的所有内容
4. 粘贴到SQL Editor中
5. 点击 **Run**（运行）按钮

### 第三步：验证结果
运行完成后，检查：

1. **检查表是否创建成功**
   - 点击左侧菜单的 **Table Editor**（表编辑器）
   - 应该能看到两个表：
     - `workouts`（训练记录表）
     - `exercises`（预设动作表）

2. **检查预设动作数据**
   - 点击 `exercises` 表
   - 应该能看到20条记录（深蹲、卧推、引体向上等）

3. **检查索引**
   - 点击左侧菜单的 **Database** → **Indexes**
   - 应该能看到两个索引：
     - `idx_workouts_user_id`
     - `idx_workouts_created_at`

4. **检查安全策略**
   - 点击左侧菜单的 **Authentication** → **Policies**
   - 应该能看到4个策略（针对workouts表）

## ⚠️ 常见问题

### 问题1：提示"relation already exists"
**原因**：表已经存在
**解决**：这是正常的，SQL脚本使用了 `IF NOT EXISTS`，会自动跳过已存在的表

### 问题2：提示权限错误
**原因**：可能是RLS策略的问题
**解决**：检查是否已登录Supabase账号，确保有项目权限

### 问题3：exercises表是空的
**原因**：插入数据时出错
**解决**：单独运行INSERT语句部分，检查是否有重复的name值

## ✅ 完成标志

当你能在Table Editor中看到：
- ✅ `workouts` 表（有5个字段：id, user_id, exercise_name, weight, reps, sets, created_at）
- ✅ `exercises` 表（有20条记录）

说明数据库设置成功！

## 📝 下一步

数据库设置完成后，就可以开始构建添加训练记录的功能了！

