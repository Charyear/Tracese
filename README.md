# Tracese
Tracese-Life Record and Habit Management Mini Program

> Minimalist, high-profile local life recording tools, support habits punch, countdown, birthday reminders, asset management, subscription management and other types of records.

## ✨ 特性

- 🎯 ** Multi-type Records** - Habit Carding, Countdown, Birthday, Diary, Assets, Subscriptions, Plans, Random Choice
- 📊 ** data statistics ** -asset revenue and expenditure chart, subscription cost overview, at a glance
- 🎨 ** Morandi color matching ** -soft advanced gray color scheme, visual comfort
- 🌓 ** dark mode ** -complete adaptation of light / dark theme
- 🔔 ** Intelligent reminder ** -support habit punching, birthday, subscription renewal and other reminders
- 💾 ** Local storage ** - All data is stored locally, securely and privately
- 📤 ** Data backup ** - Support export / import JSON backup
- 🎴 ** Card Style ** - Multiple Preset Styles + Custom Theme Illustration

## 🛠 技术栈

| 类别 | 技术 |
|------|------|
| 框架 | Uni-app (Vue 3 Composition API) |
| 构建工具 | Vite 5 |
| 状态管理 | Pinia |
| 样式 | 内联样式 + Tailwind CSS (weapp-tailwindcss) |
| 类型系统 | TypeScript |
| 本地存储 | uni.getStorageSync / setStorageSync |
| 目标平台 | 微信小程序 (mp-weixin) |

## 📁 项目结构

```
every-trace/
├── src/
│   ├── pages/                    # 页面
│   │   ├── index/                # 首页（卡片列表 + 统计面板）
│   │   ├── edit/                 # 新建/编辑记录
│   │   ├── type-select/          # 类型选择页
│   │   ├── settings/             # 设置（主题、数据管理、统计）
│   │   ├── custom-settings/      # 卡片自定义（样式、置顶）
│   │   ├── style-library/        # 手绘插画样式库
│   │   └── game/                 # 随机选择游戏
│   ├── components/               # 组件
│   │   ├── AppCard.vue           # 卡片组件
│   │   ├── AppNavbar.vue         # 导航栏组件
│   │   └── BottomSheet/          # 底部弹出（空目录）
│   ├── store/                    # Pinia 状态管理
│   │   ├── records.ts            # 记录卡片数据
│   │   ├── settings.ts           # 主题与偏好设置
│   │   └── backup.ts             # 数据导入/导出
│   ├── types/                    # TypeScript 类型定义
│   │   └── card.ts               # 卡片类型与接口
│   ├── utils/                    # 工具函数
│   │   └── reminder.ts           # 提醒逻辑
│   ├── styles/                   # 全局样式
│   │   └── main.css              # Tailwind 入口 + 全局重置
│   ├── App.vue                   # 应用入口
│   ├── main.ts                   # 初始化（Pinia 挂载）
│   ├── manifest.json             # 应用配置
│   └── pages.json                # 路由配置
├── vite.config.ts                # Vite 配置（uni 插件 + tailwind）
├── tailwind.config.js            # Tailwind 主题（莫兰迪色板）
├── tsconfig.json                 # TypeScript 配置
├── postcss.config.js             # PostCSS 配置
├── project.config.json           # 微信开发者工具配置
└── package.json                  # 依赖与脚本
```

## 🚀 快速开始

### 环境要求

- Node.js >= 18
- 微信开发者工具
- npm / pnpm / yarn

### 安装与运行

```bash
# 1. 安装依赖
npm install

# 2. 开发模式（热更新）
npm run dev:mp-weixin

# 3. 生产构建
npm run build:mp-weixin
```

构建完成后，使用微信开发者工具打开 `dist/build/mp-weixin/` 目录即可预览。

## 📖 核心功能说明

### 卡片类型

| 类型 | 说明 | 特有字段 |
|------|------|----------|
| `habit` | 习惯打卡 | punches, dailyLimit, minIntervalMinutes |
| `countdown` | 倒计时/正计时 | targetDate |
| `birthday` | 生日记录 | birthDate |
| `diary` | 日记 | content |
| `asset` | 资产记录 | amount, flowType, source, date |
| `subscription` | 订阅管理 | price, billingCycle, nextBillingDate |
| `plan` | 计划 | steps[] |

### 数据存储

- 所有卡片数据以 JSON 格式存储在 `uni.getStorageSync("every_trace_cards")`
- 设置项（主题、振动）分别存储在 localStorage
- 无后端依赖，完全本地运行

### 提醒系统

- 每种卡片类型有独立的提醒配置
- 支持每日、每周、每月、一次性提醒
- 提醒检查在 App 启动和前台时自动执行

## 🎨 设计规范

### 莫兰迪色板

```javascript
// tailwind.config.js 中定义
morandi: {
  blue:    { light: '#F0F4F8', DEFAULT: '#A5C4D4', dark: '#5C7C8A' },
  green:   { light: '#F1F7F4', DEFAULT: '#ADC7B8', dark: '#6E8B79' },
  pink:    { light: '#FBF2F2', DEFAULT: '#E3B9BC', dark: '#A67C80' },
  orange:  { light: '#FDF6F0', DEFAULT: '#E9C6B1', dark: '#AC8065' },
  purple:  { light: '#F7F3F9', DEFAULT: '#D6C5D8', dark: '#8E7B92' },
  cream:   { light: '#FAF7F2', DEFAULT: '#ECC89C', dark: '#B08E62' },
}
```

### 间距规范

- 基础单位：`8rpx`
- 卡片内边距：`24rpx - 32rpx`
- 元素间距：`16rpx - 24rpx`
- 圆角：卡片 `24rpx - 32rpx`，按钮 `20rpx - 40rpx`

## 🔧 可优化项

以下为代码审查中发现的可改进点，按优先级排列：

### 高优先级

1. **空目录清理** — `src/components/BottomSheet/` 为空目录，应删除或实现
2. **类型断言过多** — `index.vue` 中大量使用 `(card as any)`，应利用 TypeScript 类型收窄
3. **魔法字符串** — 卡片类型字符串（`'habit'`, `'subscription'` 等）散落各处，建议提取为常量枚举
4. **重复代码** — 左右两列卡片的渲染逻辑完全一致，可抽取为可复用块

### 中优先级

5. **图表组件化** — 资产统计图表与面板耦合度高，适合拆分为独立组件
6. **Store 拆分** — `records.ts` 超过 200 行，提醒相关逻辑可独立为 `reminder.ts` store
7. **常量提取** — `MAX_PINNED_CARDS`、`DAY_MS` 等应集中管理
8. **错误处理** — 部分 try/catch 仅 console.error，缺少用户提示

### 低优先级

9. **性能优化** — 大量 `computed` 在数据量大时可能影响性能，可考虑缓存策略
10. **无障碍** — 缺少 `aria-label` 等无障碍属性
11. **单元测试** — 目前无测试覆盖
12. **国际化** — 硬编码中文，未做 i18n 抽象

## 📝 路由配置

| 路径 | 页面 | 说明 |
|------|------|------|
| `/pages/index/index` | 首页 | 卡片列表、分类筛选、统计面板 |
| `/pages/edit/edit` | 编辑 | 新建/编辑记录 |
| `/pages/type-select/type-select` | 类型选择 | 选择要创建的记录类型 |
| `/pages/settings/settings` | 设置 | 主题切换、数据管理、统计概览 |
| `/pages/custom-settings/custom-settings` | 自定义 | 卡片样式、置顶设置 |
| `/pages/style-library/style-library` | 样式库 | 手绘插画主题选择 |
| `/pages/game/game` | 游戏 | 随机选择器 |


按照上述功能清单，为每个页面添加一个提醒功能，最后通过微信的消息通知来实现提醒。需在 sendWechatReminder 函数中填入实际的模板ID即可启用微信消息通知。



**直接重构 `drawPoster()`**：

- **第一层**：绘制整张海报背景（渐变、光晕、装饰元素）。
- **第二层**：绘制统一品牌区域（Logo、应用名）。
- **第三层**：根据卡片类型绘制动态内容（唯一变化部分）。
- **第四层**：绘制治愈文案和底部品牌信息。

所有类型共用同一套海报模板，仅中间内容变化
