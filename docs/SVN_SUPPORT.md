# SVN 支持文档

本文档说明了项目中对 Subversion (SVN) 的支持功能。

## 目录
- [概述](#概述)
- [安装 SVN](#安装-svn)
- [添加 SVN 仓库](#添加-svn-仓库)
- [支持的 SVN 操作](#支持的-svn-操作)
- [SVN 配置](#svn-配置)
- [故障排除](#故障排除)

## 概述

项目现在支持两种版本控制系统：
- **Git** - 分布式版本控制系统
- **SVN** - 集中式版本控制系统

SVN 支持通过调用系统的 SVN 命令行工具实现，因此需要系统已安装 Subversion。

## 安装 SVN

### Windows
从 [Apache Subversion官网](https://subversion.apache.org/packages.html) 下载并安装 Windows 版本的 SVN。

安装后，在命令行中验证安装：
```bash
svn --version
```

### macOS
使用 Homebrew 安装：
```bash
brew install subversion
```

### Linux
- Ubuntu/Debian:
  ```bash
  sudo apt update
  sudo apt install subversion
  ```
- Fedora/RHEL:
  ```bash
  sudo yum install subversion
  ```

## 添加 SVN 仓库

1. 在项目详情页面点击"添加仓库"按钮
2. 选择一个包含 `.svn` 目录的文件夹
3. 系统会自动检测为 SVN 仓库
4. 输入仓库名称并确认添加

或者，你也可以手动在数据库中添加：
```sql
INSERT INTO repositories (name, path, project_id, vcs)
VALUES ('仓库名称', '/path/to/repo', 1, 'svn');
```

## 支持的 SVN 操作

### 1. 查看状态
显示当前工作副本的状态，包括：
- 当前版本号
- 修改的文件
- 未跟踪的文件
- 最后修改作者
- 最后修改日期

**实现命令**: `svn info` 和 `svn status`

### 2. 更新 (Update)
从服务器更新到最新版本。

**实现命令**: `svn update`
```rust
// Rust 调用
await invoke('svn_update', { path: '/path/to/repo' })
```

### 3. 提交 (Commit)
提交本地更改到服务器。

**实现命令**: `svn commit -m "message"`
```rust
// Rust 调用
await invoke('svn_commit', {
    path: '/path/to/repo',
    message: '提交消息'
})
```

### 4. 查看差异 (Diff)
查看工作副本与服务器版本的差异。

**实现命令**: `svn diff`
```rust
// Rust 调用
await invoke('svn_diff', { path: '/path/to/repo' })
```

### 5. 添加文件
将新文件添加到版本控制。

**实现命令**: `svn add`
```rust
// Rust 调用
await invoke('svn_add', {
    path: '/path/to/repo',
    files: ['file1.js', 'file2.js']
})
```

### 6. 还原文件
还原文件到未修改状态。

**实现命令**: `svn revert`
```rust
// Rust 调用
await invoke('svn_revert', {
    path: '/path/to/repo',
    files: ['file1.js'] // 可选，不指定则还原所有
})
```

### 7. 测试认证
测试与服务器的连接和认证状态。

**实现命令**: `svn info`
```rust
// Rust 调用
await invoke('test_svn_auth', { path: '/path/to/repo' })
```

## SVN 配置

SVN 配置存储在 `~/.pm/config.json` 文件中：

```json
{
  "svn": {
    "auto_update": false,
    "username": null,
    "password": null
  }
}
```

### 配置选项

| 选项 | 类型 | 说明 |
|------|------|------|
| `auto_update` | boolean | 是否自动更新（预留功能） |
| `username` | string|null | SVN 用户名（可选） |
| `password` | string|null | SVN 密码（可选） |

### 修改配置

```javascript
import { invoke } from '@tauri-apps/api/core'

// 获取配置
const config = await invoke('get_config')

// 修改配置
config.svn.auto_update = true
config.svn.username = 'myuser'

// 保存配置
await invoke('save_config', { config })
```

## 数据库结构

SVN 仓库使用与 Git 相同的数据库表结构：

```sql
CREATE TABLE repositories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    path TEXT UNIQUE NOT NULL,
    url TEXT,
    project_id INTEGER NOT NULL,
    vcs TEXT CHECK(vcs IN ('git', 'svn', '')),
    created_at TEXT DEFAULT (strftime('%Y-%m-%d %H:%M:%S', 'now', 'localtime')),
    updated_at TEXT DEFAULT (strftime('%Y-%m-%d %H:%M:%S', 'now', 'localtime')),
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);
```

## 故障排除

### 错误：未检测到 SVN

**错误信息**:
```
未检测到 SVN，请先安装 Subversion
```

**解决方案**:
1. 确认已安装 SVN：`svn --version`
2. 重启应用程序
3. 确保 SVN 在系统 PATH 中

### 错误：不是一个 SVN 工作副本

**错误信息**:
```
不是一个 SVN 工作副本
```

**解决方案**:
1. 确认选择的路径包含 `.svn` 目录
2. 尝试使用 `svn checkout` 检出一个新的工作副本

### 错误：认证失败

**错误信息**:
```
❌ 认证失败！

问题: SVN 认证失败

可能的原因:
1. 用户名或密码错误
2. 没有访问权限
3. 凭据已过期
```

**解决方案**:
1. 在终端中手动测试：`svn info` - 会提示输入凭据
2. 使用命令行提交时指定用户名：
   ```bash
   svn commit --username <用户名> --password <密码>
   ```
3. 清除已保存的凭据并重新输入

### Windows 特定问题

如果遇到 SVN 命令无法执行的问题：

1. 确认 SVN 已添加到系统 PATH
2. 重启命令提示符和应用程序
3. 使用完整路径测试：`"C:\Program Files\TortoiseSVN\bin\svn.exe" --version`

## API 参考

### Rust 后端命令

| 命令 | 参数 | 返回值 |
|------|------|--------|
| `get_svn_status` | `path: String` | `SvnStatus` |
| `svn_update` | `path: String` | `String` |
| `svn_commit` | `path: String, message: String` | `String` |
| `svn_diff` | `path: String` | `String` |
| `test_svn_auth` | `path: String` | `String` |
| `svn_add` | `path: String, files: Vec<String>` | `String` |
| `svn_revert` | `path: String, files?: Vec<String>` | `String` |

### 前端状态结构

```typescript
interface SvnStatus {
    revision?: string;           // 版本号
    url?: string;               // 仓库 URL
    repository_root?: string;    // 仓库根路径
    modified_files: string[];   // 修改的文件列表
    untracked_files: string[];  // 未跟踪的文件列表
    is_dirty: boolean;          // 是否有未提交的更改
    author?: string;            // 最后修改作者
    date?: string;              // 最后修改日期
}
```

## 贡献

如需添加更多 SVN 功能或改进现有功能，请参考：

1. **后端代码**: `src-tauri/src/lib.rs`
2. **前端代码**: `src/components/RD.vue`, `src/components/PD.vue`
3. **数据库**: `src/db/createTable.ts`

## 许可证

与主项目保持一致。

---

**最后更新**: 2025-02-04
