# FitTrack - Simple Workout Logger

> 帮助健身新手快速记录训练数据并追踪力量进步的Web应用

## 🎯 项目简介

FitTrack是一个简单易用的健身记录应用，专注于帮助健身新手快速记录训练数据并追踪力量进步。

### 核心功能

- ✅ **快速添加训练记录** - 3秒完成记录，不打断训练节奏
- ✅ **查看历史记录** - 按日期分组，清晰展示训练历史
- ✅ **进步图表** - 可视化力量增长趋势，激励持续训练
- ✅ **预设动作库** - 20个常见健身动作，快速选择
- ✅ **用户认证** - 安全的账号系统，数据云端保存

### V2优化功能

- ✅ **身体数据追踪** - 记录体重、体脂率、肌肉量
- ✅ **训练计划推荐** - 3个预设训练计划（新手/中级/高级）
- ✅ **社交分享** - 一键分享训练成果
- ✅ **视频教程链接** - 每个动作都有YouTube教程链接

## 🛠 技术栈

- **前端框架**: Next.js 14 (App Router)
- **UI框架**: React 18 + TypeScript
- **样式**: Tailwind CSS
- **后端**: Supabase (PostgreSQL + Auth)
- **图表**: Chart.js + react-chartjs-2
- **部署**: Vercel

## 📦 安装和运行

### 前置要求

- Node.js 18.x 或更高版本
- npm 9.x 或更高版本
- Supabase 账号（免费）

### 安装步骤

1. **克隆项目**
```bash
git clone https://github.com/你的用户名/fittrack.git
cd fittrack
```

2. **安装依赖**
```bash
npm install
```

3. **配置环境变量**

创建 `.env.local` 文件：
```bash
NEXT_PUBLIC_SUPABASE_URL=你的Supabase项目URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=你的Supabase匿名密钥
```

4. **设置数据库**

在Supabase Dashboard的SQL Editor中执行：
- `supabase-setup.sql` - 基础表结构
- `supabase-v2-setup.sql` - V2功能表结构

5. **启动开发服务器**
```bash
npm run dev
```

访问 http://localhost:3000

## 🚀 部署

### 部署到Vercel

1. 推送代码到GitHub
2. 访问 [Vercel](https://vercel.com)
3. 导入GitHub仓库
4. 配置环境变量（Supabase URL和Key）
5. 点击Deploy

详细部署指南请参考：[部署指南](NOTES.md#部署指南)

## 📁 项目结构

```
fittrack/
├── app/                    # Next.js页面和路由
│   ├── page.tsx           # 首页（Dashboard）
│   ├── add/               # 添加训练记录
│   ├── history/           # 历史记录
│   ├── chart/             # 进步图表
│   ├── login/             # 登录注册
│   ├── body/              # 身体数据（V2）
│   └── plans/             # 训练计划（V2）
├── components/            # React组件
│   └── ui/               # UI组件库
├── lib/                  # 工具函数和配置
│   ├── supabase.ts       # Supabase客户端
│   ├── shareUtils.ts     # 分享功能
│   └── exerciseVideos.ts # 视频教程链接
├── augment/              # 项目文档
└── scripts/              # 工具脚本
```

## 📚 文档

- [NOTES.md](NOTES.md) - 完整的开发指南和代码示例
- [产品需求文档](augment/20251106175000_FitTrack产品需求文档PRD.md) - PRD
- [技术设计文档](augment/20251106180000_FitTrack技术设计文档-极速MVP.md) - TDD
- [功能实现检查报告](augment/20250106180000_FitTrack功能实现检查报告.md) - 功能检查

## 🧪 测试

### 功能测试清单

- [ ] 注册新账号
- [ ] 添加训练记录
- [ ] 查看历史记录
- [ ] 查看进步图表
- [ ] 记录身体数据
- [ ] 查看训练计划
- [ ] 分享训练记录
- [ ] 查看视频教程

详细测试指南请参考：[V2-TEST-SUMMARY.md](V2-TEST-SUMMARY.md)

## 🤝 贡献

欢迎提交Issue和Pull Request！

## 📄 许可证

ISC

## 🙏 致谢

- Next.js团队
- Supabase团队
- Tailwind CSS团队
- Chart.js团队

## 📞 联系方式

如有问题或建议，请提交Issue。

---

**Made with 💪 by FitTrack Team**

