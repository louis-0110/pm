# Git 身份验证配置指南

## 问题说明

当使用 HTTPS 方式进行 Git 操作（拉取、推送）时，遇到 `401 HTTP` 错误，这是因为需要身份验证。

---

## 解决方案

### 方案 1：使用 SSH（推荐）✅

SSH 方式无需密码，使用密钥认证，更安全更方便。

#### 1. 检查是否已有 SSH 密钥

```bash
# Windows (Git Bash)
ls ~/.ssh/id_rsa.pub

# macOS/Linux
ls ~/.ssh/id_rsa.pub
```

#### 2. 生成 SSH 密钥（如果没有）

```bash
ssh-keygen -t ed25519 -C "your_email@example.com"
# 或使用 RSA
ssh-keygen -t rsa -b 4096 -C "your_email@example.com"
```

#### 3. 添加 SSH 公钥到 GitHub/GitLab

**GitHub:**
1. 复制公钥内容：`cat ~/.ssh/id_rsa.pub` (Windows Git Bash)
2. 打开：Settings → SSH and GPG keys → New SSH key
3. 粘贴公钥，点击 Add SSH key

**GitLab:**
1. 打开：Settings → SSH Keys
2. 粘贴公钥，点击 Add key

#### 4. 修改仓库远程地址为 SSH

```bash
# 查看当前远程地址
git remote -v

# 切换为 SSH（GitHub 示例）
git remote set-url origin git@github.com:username/repo.git

# 切换为 SSH（GitLab 示例）
git remote set-url origin git@gitlab.com:username/repo.git
```

#### 5. 启动 SSH Agent 并添加密钥

```bash
# 启动 ssh-agent
eval "$(ssh-agent -s)"

# 添加私钥
ssh-add ~/.ssh/id_rsa
# 或
ssh-add ~/.ssh/id_ed25519

# Windows PowerShell 如果上面不行，用这个：
ssh-agent.exe
ssh-add.exe ~/.ssh/id_rsa
```

#### 6. 测试连接

```bash
# GitHub
ssh -T git@github.com

# GitLab
ssh -T git@gitlab.com
```

---

### 方案 2：配置 Git 凭据助手（HTTPS）

如果你必须使用 HTTPS，可以配置凭据助手来缓存密码。

#### Windows (使用 Git Credential Manager)

Git for Windows 已自带 Git Credential Manager，会自动弹出登录窗口。

```bash
# 配置凭据助手
git config --global credential.helper manager-core

# 或者使用 store（不推荐，密码明文存储）
git config --global credential.helper store
```

#### macOS

```bash
# 使用 osxkeychain（推荐）
git config --global credential.helper osxkeychain
```

#### Linux

```bash
# 使用 cache（临时缓存，默认 1 小时）
git config --global credential.helper cache

# 设置缓存时间（例如 5 小时）
git config --global credential.helper 'cache --timeout=18000'
```

---

### 方案 3：使用个人访问令牌（PAT）

对于 GitHub/GitLab 等，可以使用个人访问令牌代替密码。

#### GitHub 生成 PAT

1. 打开：Settings → Developer settings → Personal access tokens → Tokens (classic)
2. 点击 "Generate new token (classic)"
3. 选择权限：
   - `repo` - 完整仓库访问权限
   - `workflow` - 如果需要 GitHub Actions
4. 点击 "Generate token"
5. **复制并保存 token**（只显示一次）

#### 使用 PAT

当 Git 询问密码时，粘贴 PAT 而不是账户密码。

或者直接在 URL 中使用：

```bash
# HTTPS 方式（不推荐，URL 中包含凭据）
git clone https://USERNAME:TOKEN@github.com/username/repo.git

# 或修改现有远程
git remote set-url origin https://USERNAME:TOKEN@github.com/username/repo.git
```

---

### 方案 4：配置 Git 凭据存储（每次输入一次）

```bash
# 配置全局凭据存储
git config --global credential.helper store

# 下次 pull/push 时输入一次用户名和密码（或 PAT）
# 之后会保存在 ~/.git-credentials 文件中
```

---

## 本应用的认证支持

### 当前支持的认证方式

1. **SSH 密钥认证** ✅（推荐）
   - 自动从 SSH Agent 读取密钥
   - 无需密码，最安全方便

2. **HTTPS 认证** ⚠️
   - 需要配置凭据助手
   - 可能需要输入用户名和密码/PAT

### 认证优先级

本应用会按以下顺序尝试认证：

1. SSH Agent 中的密钥
2. 默认凭据（如有）
3. 失败后返回友好错误提示

---

## 快速排查清单

### 遇到 401 错误时：

- [ ] 是否已配置 SSH 密钥？
- [ ] SSH 公钥是否已添加到 GitHub/GitLab？
- [ ] 是否已启动 SSH Agent 并添加密钥？
- [ ] 远程仓库地址是 HTTPS 还是 SSH？
- [ ] 是否可以使用 `ssh -T git@github.com` 成功连接？
- [ ] 如果使用 HTTPS，是否已配置凭据助手？

### 推荐配置流程

```bash
# 1. 生成 SSH 密钥
ssh-keygen -t ed25519 -C "your_email@example.com"

# 2. 启动 SSH Agent
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519

# 3. 测试连接
ssh -T git@github.com

# 4. 修改远程地址为 SSH
git remote set-url origin git@github.com:username/repo.git

# 5. 测试操作
git pull
git push
```

---

## 常见问题

### Q: 为什么推荐使用 SSH 而不是 HTTPS？

**A:**
- SSH 无需输入密码
- SSH 更安全（公钥加密）
- SSH 支持 SSH Agent，一次配置永久使用
- HTTPS 需要每次输入密码或配置凭据助手

### Q: 如何查看当前使用的认证方式？

```bash
# 查看远程仓库 URL
git remote -v

# SSH 示例：git@github.com:user/repo.git
# HTTPS 示例：https://github.com/user/repo.git
```

### Q: Windows 下 SSH Agent 不工作？

```bash
# 确保 Pageant (PuTTY) 或 Windows SSH Agent 正在运行
# 或使用 Git Bash：
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_rsa
```

### Q: 如何清除保存的凭据？

```bash
# Windows: 删除凭据管理器中的 Git 凭据
# macOS: 删除钥匙串中的 Git 凭据
# Linux: 删除 ~/.git-credentials 文件

# 或重新设置
git config --global --unset credential.helper
```

---

## 总结

**最佳实践：**
1. ✅ 使用 SSH + SSH Agent（最推荐）
2. ✅ 为不同平台配置不同的密钥
3. ✅ 定期轮换密钥
4. ⚠️ 不要在 URL 中硬编码密码
5. ⚠️ 不要使用 `credential.helper store`（明文存储）

**对于本应用：**
- 配置好 SSH 密钥后，所有 Git 操作（pull/push）将无需额外输入密码
- 如果必须使用 HTTPS，请配置 Git Credential Manager
