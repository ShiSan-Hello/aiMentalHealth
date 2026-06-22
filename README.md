# AI Mental Health（AI 心理健康平台）

基于 **Vue 3** + **Element Plus** 构建的心理健康服务平台，提供 AI 心理咨询对话、情绪日记记录、心理健康知识科普等功能，同时包含管理后台用于数据分析与内容管理。

## 功能概览

### 用户端
- 🏠 **首页**：欢迎页面，引导用户开启心理咨询
- 💬 **AI 心理咨询**：与 AI 助手实时对话，自动识别用户情绪状态，提供温暖建议和治愈行动方案
- 📔 **情绪日记**：记录每日情绪状态，追踪情绪变化
- 📚 **知识文章**：浏览心理健康科普文章，支持文章详情阅读

### 管理后台
- 📊 **数据看板**：可视化展示平台核心数据（基于 ECharts）
- 📝 **文章管理**：知识文章的发布、编辑、审核与删除（集成富文本编辑器）
- 💬 **咨询记录**：查看用户咨询会话记录
- 😊 **情绪日志**：查看用户情绪日记数据

## 技术栈

| 类别 | 技术 |
|------|------|
| 前端框架 | Vue 3（Composition API + `<script setup>`） |
| 构建工具 | Vite 8 |
| UI 组件库 | Element Plus |
| 状态管理 | Pinia 3 |
| 路由 | Vue Router 4 |
| HTTP 请求 | Axios |
| 图表 | ECharts 6 |
| 富文本编辑器 | wangEditor |
| AI 流式响应 | @microsoft/fetch-event-source（SSE） |
| CSS 预处理 | Sass |

## 项目结构

```
src/
├── api/                # API 接口
│   ├── admin.js        # 管理端接口
│   └── frontend.js     # 用户端接口
├── assets/             # 静态资源（图片、SVG）
├── components/         # 公共组件
│   ├── ArticleDialog.vue
│   ├── AuthLayout.vue          # 登录注册布局
│   ├── BackendLayout.vue       # 后台管理布局（含侧边栏）
│   ├── FrontendLayout.vue      # 前台布局（含导航栏）
│   ├── MarkdownRenderer.vue
│   ├── Navbar.vue
│   ├── PageHead.vue
│   ├── RichTextEditor.vue      # 富文本编辑器
│   ├── Sidebar.vue             # 后台侧边栏
│   └── TableSearch.vue
├── config/             # 配置文件
├── router/             # 路由配置（前台/后台/登录注册）
├── stores/             # Pinia 状态管理
├── utils/              # 工具函数（Axios 封装与拦截器）
└── views/              # 页面视图
    ├── home.vue                # 首页
    ├── consultation.vue        # AI 咨询对话
    ├── emotionDiary.vue        # 情绪日记
    ├── frontendKnowledge.vue   # 知识文章列表
    ├── articleDetail.vue       # 文章详情
    ├── login.vue               # 登录
    ├── register.vue            # 注册
    ├── dashboard.vue           # 后台数据看板
    ├── knowledge.vue           # 后台文章管理
    ├── consultations.vue       # 后台咨询记录
    └── emotional.vue           # 后台情绪日志
```

## 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览构建结果
npm run preview
```

## 环境要求

- Node.js >= 18
- npm / pnpm

## 后端服务

本项目为前端工程，默认代理 API 请求至后端服务。后端配置文件位于 `src/config/index.js`。

---

## License

仅供学习交流使用。
