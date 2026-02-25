<p align="center">
  <img src="src/assets/app-icon.png" alt="PM Logo" width="128" height="128">
</p>

<h1 align="center">PM - 项目仓库管理器</h1>

<p align="center">
  <strong>一款跨平台的 Git/SVN 项目管理桌面应用</strong>
</p>

<p align="center">
  <a href="#功能特性">功能特性</a> •
  <a href="#技术栈">技术栈</a> •
  <a href="#安装">安装</a> •
  <a href="#使用指南">使用指南</a> •
  <a href="#开发">开发</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Tauri-2.x-24C8D8?style=flat-square&logo=tauri" alt="Tauri">
  <img src="https://img.shields.io/badge/Vue-3.x-4FC08D?style=flat-square&logo=vue.js" alt="Vue">
  <img src="https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript" alt="TypeScript">
  <img src="https://img.shields.io/badge/PrimeVue-4.x-DD0031?style=flat-square" alt="PrimeVue">
  <img src="https://img.shields.io/badge/Rust-1.x-DEA584?style=flat-square&logo=rust" alt="Rust">
</p>

---

## 功能特性

### 📁 项目管理
- 创建、编辑、删除项目
- 项目分组管理
- 项目描述与备注

### 🔗 仓库管理
- **Git 仓库支持**：完整的 Git 操作支持
- **SVN 仓库支持**：兼容 SVN 版本控制系统
- **本地添加**：选择本地已有仓库路径
- **URL 克隆**：通过 Git/SVN URL 直接克隆仓库

### 🔄 版本控制操作

#### Git 操作
| 操作 | 描述 |
|------|------|
| `Pull` | 从远程仓库拉取最新代码 |
| `Push` | 推送本地提交到远程仓库 |
| `Commit` | 提交本地更改 |
| `Diff` | 查看文件差异 |

#### SVN 操作
| 操作 | 描述 |
|------|------|
| `Update` | 更新到最新版本 |
| `Commit` | 提交更改 |
| `Diff` | 查看文件差异 |
| `Revert` | 还原更改 |

### 🛠 快捷工具
- **一键打开 VSCode**：快速在编辑器中打开仓库
- **复制路径**：快速复制仓库路径到剪贴板
- **批量操作**：支持批量拉取所有仓库

### ⚙️ 系统设置
- Git 默认远程配置
- SSH 密钥路径配置
- 自动拉取/推送开关
- VSCode 路径配置
- 跨平台适配（Windows / macOS / Linux）

---

## 技术栈

### 前端
| 技术 | 说明 |
|------|------|
| [Vue 3](https://vuejs.org/) | 渐进式 JavaScript 框架 |
| [TypeScript](https://www.typescriptlang.org/) | 类型安全的 JavaScript 超集 |
| [PrimeVue](https://primevue.org/) | 强大的 Vue 3 UI 组件库 |
| [Vue Router](https://router.vuejs.org/) | Vue.js 官方路由 |

### 后端
| 技术 | 说明 |
|------|------|
| [Tauri 2](https://tauri.app/) | 使用 Rust 构建跨平台桌面应用 |
| [Rust](https://www.rust-lang.org/) | 高性能系统编程语言 |
| [SQLite](https://www.sqlite.org/) | 轻量级嵌入式数据库 |

### Tauri 插件
- `@tauri-apps/plugin-dialog` - 文件对话框
- `@tauri-apps/plugin-fs` - 文件系统操作
- `@tauri-apps/plugin-shell` - Shell 命令执行
- `@tauri-apps/plugin-sql` - SQLite 数据库支持
- `@tauri-apps/plugin-opener` - URL/文件打开

---

## 安装

### 前置要求
- [Node.js](https://nodejs.org/) 18+
- [pnpm](https://pnpm.io/) (推荐) 或 npm
- [Rust](https://www.rust-lang.org/tools/install)
- [Git](https://git-scm.com/) (用于 Git 仓库操作)
- [SVN](https://subversion.apache.org/) (可选，用于 SVN 仓库操作)

### 从源码构建

```bash
# 克隆仓库
git clone https://github.com/your-username/pm.git
cd pm

# 安装依赖
pnpm install

# 开发模式运行
pnpm tauri dev

# 构建生产版本
pnpm tauri build
```

构建完成后，安装包位于 `src-tauri/target/release/bundle/` 目录。

### GitHub Actions 自动构建

本项目配置了 GitHub Actions 自动构建工作流，支持以下平台：

| 平台 | 构建产物 |
|------|---------|
| macOS (Apple Silicon) | `.dmg`, `.app` |
| macOS (Intel) | `.dmg`, `.app` |
| Windows | `.msi`, `.exe` |
| Linux | `.AppImage`, `.deb` |

**发布新版本：**

```bash
# 创建并推送标签
git tag v1.0.0
git push origin v1.0.0
```

推送标签后，GitHub Actions 会自动：
1. 构建所有平台的安装包
2. 创建 GitHub Release 草稿
3. 上传所有安装包到 Release

---

## 使用指南

### 创建项目

1. 点击左侧项目列表区域的 **「新建项目」** 按钮
2. 输入项目名称和描述
3. 点击确认创建

### 添加仓库

**方式一：本地路径**
1. 进入项目详情页
2. 点击 **「添加仓库」** 按钮
3. 选择 **「本地路径」** 模式
4. 选择本地仓库文件夹
5. 系统自动检测 Git/SVN 类型

**方式二：URL 克隆**
1. 进入项目详情页
2. 点击 **「添加仓库」** 按钮
3. 选择 **「URL 克隆」** 模式
4. 输入仓库 URL（支持 Git/SVN）
5. 选择目标存储位置

### 仓库操作

进入仓库详情页后，可以执行以下操作：

- **拉取/更新**：同步远程最新代码
- **提交**：填写提交信息并提交更改
- **推送**：推送本地提交到远程
- **打开编辑器**：在 VSCode 中打开仓库
- **复制路径**：复制仓库完整路径

### 批量操作

在项目详情页，当有多个仓库时，可以：
- **全部拉取**：一键拉取项目下所有仓库

---

## 开发

### 项目结构

```
pm/
├── src/                    # 前端源码
│   ├── api/                # API 接口层
│   │   ├── git.ts          # Git 操作 API
│   │   ├── svn.ts          # SVN 操作 API
│   │   ├── config.ts       # 配置 API
│   │   └── system.ts       # 系统 API
│   ├── assets/             # 静态资源
│   ├── components/         # Vue 组件
│   │   ├── PL.vue          # 项目列表
│   │   ├── PD.vue          # 项目详情
│   │   ├── RD.vue          # 仓库详情
│   │   ├── Settings.vue    # 设置页面
│   │   └── WindowBar.vue   # 窗口控制栏
│   ├── types/              # TypeScript 类型定义
│   ├── utils/              # 工具函数
│   ├── Home.vue            # 主页面布局
│   ├── main.ts             # 入口文件
│   └── router.ts           # 路由配置
├── src-tauri/              # Tauri 后端
│   ├── src/
│   │   └── lib.rs          # Rust 主逻辑
│   ├── tauri.conf.json     # Tauri 配置
│   └── Cargo.toml          # Rust 依赖
└── package.json            # 前端依赖
```

### 开发命令

```bash
# 启动开发服务器
pnpm dev

# 类型检查
pnpm build

# Tauri 开发模式
pnpm tauri dev

# 构建应用
pnpm tauri build
```

### 添加新的 Tauri 命令

1. 在 `src-tauri/src/lib.rs` 中添加命令函数：

```rust
#[tauri::command]
async fn my_command(param: String) -> Result<String, String> {
    // 实现逻辑
    Ok("success".to_string())
}
```

2. 在 `invoke_handler` 中注册：

```rust
.invoke_handler(tauri::generate_handler![
    // ... 其他命令
    my_command,
])
```

3. 在前端调用：

```typescript
import { invoke } from '@tauri-apps/api/core'

const result = await invoke<string>('my_command', { param: 'value' })
```

---

## 跨平台支持

PM 支持以下操作系统：

| 平台 | 状态 |
|------|------|
| Windows 10/11 | ✅ 支持 |
| macOS 10.15+ | ✅ 支持 |
| Linux | ✅ 支持 |

系统会自动检测当前运行环境，并提供相应的默认配置和路径提示。

---

## 许可证

[MIT License](LICENSE)

---

<p align="center">
  Made with ❤️ using Tauri + Vue 3
</p>
