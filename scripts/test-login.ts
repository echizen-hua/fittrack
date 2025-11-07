// 测试登录功能的脚本
// 使用方法：在浏览器控制台运行此脚本（需要先配置Supabase）

// 注意：这个脚本需要在Supabase Dashboard中禁用邮箱验证后才能正常工作

async function testLogin() {
  const { createClient } = await import('@supabase/supabase-js')
  
  // 从环境变量获取配置（在实际应用中）
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '你的Supabase URL'
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '你的Supabase Key'
  
  const supabase = createClient(supabaseUrl, supabaseAnonKey)
  
  const testEmail = 'testuser@gmail.com'
  const testPassword = 'test123456'
  
  console.log('开始测试登录功能...')
  
  try {
    // 测试1：尝试登录
    console.log('测试1：尝试登录...')
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword,
    })
    
    if (loginError) {
      console.error('登录失败:', loginError.message)
      
      if (loginError.message.includes('Email not confirmed')) {
        console.log('❌ 邮箱未验证')
        console.log('解决方案：')
        console.log('1. 在Supabase Dashboard中禁用邮箱验证')
        console.log('   - Authentication → Settings → 关闭"Enable email confirmations"')
        console.log('2. 或者手动确认邮箱')
        console.log('   - Authentication → Users → 找到用户 → Confirm email')
      } else {
        console.log('其他错误:', loginError)
      }
      return
    }
    
    console.log('✅ 登录成功！')
    console.log('用户信息:', loginData.user)
    
    // 测试2：检查登录状态
    console.log('\n测试2：检查登录状态...')
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      console.log('✅ 用户已登录:', user.email)
    } else {
      console.log('❌ 用户未登录')
    }
    
    // 测试3：登出
    console.log('\n测试3：测试登出...')
    const { error: signOutError } = await supabase.auth.signOut()
    if (signOutError) {
      console.error('登出失败:', signOutError)
    } else {
      console.log('✅ 登出成功')
    }
    
  } catch (error) {
    console.error('测试过程中出错:', error)
  }
}

// 如果是在浏览器控制台运行
if (typeof window !== 'undefined') {
  console.log('请在应用页面运行此脚本')
  console.log('或者直接在浏览器控制台调用 testLogin()')
}

export { testLogin }

