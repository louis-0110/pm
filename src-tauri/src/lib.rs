// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/

use git2::{Repository, StatusOptions, ObjectType, Cred, RemoteCallbacks, PushOptions, FetchOptions};
use serde::{Serialize, Deserialize};
use std::fs;
use std::path::PathBuf;
use std::process::{Command, Stdio};

#[derive(Debug, Serialize)]
pub struct GitStatus {
    pub branch: Option<String>,
    pub commit: Option<String>,
    pub modified_files: Vec<String>,
    pub untracked_files: Vec<String>,
    pub is_dirty: bool,
    pub ahead: Option<usize>,
    pub behind: Option<usize>,
}

#[derive(Debug, Serialize)]
pub struct SvnStatus {
    pub revision: Option<String>,
    pub url: Option<String>,
    pub repository_root: Option<String>,
    pub modified_files: Vec<String>,
    pub untracked_files: Vec<String>,
    pub is_dirty: bool,
    pub author: Option<String>,
    pub date: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct AppConfig {
    pub git: GitConfig,
    pub svn: SvnConfig,
    pub editor: EditorConfig,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct GitConfig {
    pub default_remote: Option<String>,
    pub ssh_key_path: Option<String>,
    pub auto_fetch: bool,
    pub auto_push: bool,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SvnConfig {
    pub auto_update: bool,
    pub username: Option<String>,
    pub password: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct EditorConfig {
    pub vscode_path: Option<String>,
    pub default_editor: String,
}

impl Default for AppConfig {
    fn default() -> Self {
        Self {
            git: GitConfig {
                default_remote: Some("origin".to_string()),
                ssh_key_path: None,
                auto_fetch: false,
                auto_push: false,
            },
            svn: SvnConfig {
                auto_update: false,
                username: None,
                password: None,
            },
            editor: EditorConfig {
                vscode_path: None,
                default_editor: "code".to_string(),
            },
        }
    }
}

fn get_config_path() -> Result<PathBuf, String> {
    let mut path = dirs::home_dir().ok_or("无法获取用户目录")?;
    path.push(".pm");
    path.push("config.json");
    Ok(path)
}

#[tauri::command]
async fn open_folder(path: String) -> Result<(), String> {
    tauri_plugin_opener::open_path(&path, None::<&str>).map_err(|err| err.to_string())?;
    Ok(())
}

#[tauri::command]
async fn open_in_vscode(path: String) -> Result<(), String> {
    // 尝试使用 code 命令打开 VSCode
    let result = Command::new("code")
        .arg(&path)
        .spawn();

    match result {
        Ok(_) => Ok(()),
        Err(e) => {
            // 如果 code 命令失败，尝试常见的 VSCode 安装路径
            #[cfg(target_os = "macos")]
            {
                // macOS 上尝试使用应用路径
                let app_result = Command::new("/Applications/Visual Studio Code.app/Contents/Resources/app/bin/code")
                    .arg(&path)
                    .spawn();

                if app_result.is_ok() {
                    return Ok(());
                }
            }

            Err(format!(
                "无法打开 VSCode: {}\n\n请确保:\n1. VSCode 已安装\n2. 已添加 'code' 命令到 PATH\n\n在 VSCode 中按 Cmd+Shift+P，输入 'Shell Command: Install code command in PATH'",
                e
            ))
        }
    }
}

#[tauri::command]
async fn get_repository_status(path: String) -> Result<GitStatus, String> {
    let repo = Repository::open(&path).map_err(|e| format!("无法打开仓库: {}", e))?;

    // 获取当前分支
    let head = repo.head().map_err(|e| format!("无法获取HEAD: {}", e))?;
    let branch = head.shorthand().map(|s| s.to_string());

    // 获取当前 commit hash
    let commit = head.target().map(|oid| oid.to_string());

    // 获取状态
    let mut opts = StatusOptions::new();
    opts.include_untracked(true);

    let statuses = repo.statuses(Some(&mut opts)).map_err(|e| format!("无法获取状态: {}", e))?;

    let mut modified_files = Vec::new();
    let mut untracked_files = Vec::new();

    for entry in statuses.iter() {
        if let Some(path) = entry.path() {
            let path_str = path.to_string();

            match entry.status() {
                git2::Status::CURRENT => continue,
                git2::Status::WT_NEW => untracked_files.push(path_str),
                _ => modified_files.push(path_str),
            }
        }
    }

    let is_dirty = !modified_files.is_empty() || !untracked_files.is_empty();

    // 获取分支ahead/behind信息 (简化实现)
    let ahead = None;
    let behind = None;

    Ok(GitStatus {
        branch,
        commit,
        modified_files,
        untracked_files,
        is_dirty,
        ahead,
        behind,
    })
}

// 创建认证回调
fn create_auth_callbacks() -> RemoteCallbacks<'static> {
    let mut callbacks = RemoteCallbacks::new();

    callbacks.credentials(|_url, username_from_url, _allowed_types| {
        let username = username_from_url.unwrap_or("git");

        // 1. 首先尝试 SSH 密钥（从 SSH agent）
        if let Ok(cred) = Cred::ssh_key_from_agent(username) {
            return Ok(cred);
        }

        // 2. 尝试使用默认凭据助手（系统 Git Credential Manager）
        if let Ok(cred) = Cred::default() {
            return Ok(cred);
        }

        // 3. 给出友好的错误提示
        Err(git2::Error::from_str(
            "认证失败。请尝试以下方法之一：\n\
            1. 在终端中执行一次: git push（这会缓存您的凭据）\n\
            2. 或者使用 SSH URL: git remote set-url origin git@github.com:user/repo.git"
        ))
    });

    callbacks
}

#[tauri::command]
async fn git_pull(path: String) -> Result<String, String> {
    // 首先尝试使用系统 Git 命令（会使用已保存的凭据）
    let output = Command::new("git")
        .args(["-C", &path, "pull"])
        .output()
        .map_err(|e| format!("执行 Git 命令失败: {}", e))?;

    if output.status.success() {
        let stdout = String::from_utf8_lossy(&output.stdout);
        let message = if stdout.trim().is_empty() {
            "拉取成功（已是最新）".to_string()
        } else {
            stdout.trim().to_string()
        };
        Ok(message)
    } else {
        let _stderr = String::from_utf8_lossy(&output.stderr);
        // 如果系统 Git 失败，尝试使用 git2 库
        git_pull_libgit2(path).await
    }
}

/// 使用 git2 库的 pull 实现（备用方案）
async fn git_pull_libgit2(path: String) -> Result<String, String> {
    let repo = Repository::open(&path).map_err(|e| format!("无法打开仓库: {}", e))?;

    // 获取远程名称（通常是 "origin"）
    let head = repo.head().map_err(|e| format!("无法获取HEAD: {}", e))?;
    let branch_name = head.shorthand().ok_or("无法获取分支名称")?;

    // 查找远程分支
    let remote_name = find_remote_for_branch(&repo, branch_name)?;

    // 创建带有认证的 fetch 选项
    let callbacks = create_auth_callbacks();
    let mut fetch_options = FetchOptions::new();
    fetch_options.remote_callbacks(callbacks);

    // 执行 fetch
    let mut remote = repo.find_remote(&remote_name)
        .map_err(|e| format!("无法找到远程仓库 '{}': {}", remote_name, e))?;

    remote.fetch(&[branch_name], Some(&mut fetch_options), None)
        .map_err(|e| {
            if e.to_string().contains("401") || e.to_string().contains("auth") {
                format!("认证失败：请检查您的 Git 凭据配置\n\n可能的原因：\n1. 未配置 Git 凭据\n2. 用户名或密码错误\n3. Token 已过期\n\n解决方案：\n- 在终端中执行一次: git pull（这会缓存您的凭据）\n- 或者使用 SSH 而不是 HTTPS\n- 或者配置 Git 凭据助手: git config --global credential.helper manager")
            } else {
                format!("拉取失败: {}", e)
            }
        })?;

    // 获取远程分支的 OID
    let remote_branch = repo.find_reference(&format!("refs/remotes/{}/{}", remote_name, branch_name))
        .map_err(|e| format!("无法找到远程分支: {}", e))?;

    let remote_oid = remote_branch.target().ok_or("无法获取远程分支 OID")?;
    let remote_commit = repo.find_object(remote_oid, Some(ObjectType::Commit))
        .map_err(|e| format!("无法找到远程提交: {}", e))?;

    // 合并到当前分支
    repo.checkout_tree(&remote_commit, None)
        .map_err(|e| format!("合并失败: {}", e))?;

    // 更新 HEAD 引用
    let head_ref = repo.head()
        .map_err(|e| format!("无法获取 HEAD: {}", e))?;
    repo.reference(
        &head_ref.name().ok_or("无法获取 HEAD 名称")?,
        remote_oid,
        true,
        "pull"
    ).map_err(|e| format!("无法更新 HEAD: {}", e))?;

    Ok(format!("成功从 {}/{} 拉取最新代码", remote_name, branch_name))
}

#[tauri::command]
async fn git_push(path: String) -> Result<String, String> {
    // 首先尝试使用系统 Git 命令（会使用已保存的凭据）
    let output = Command::new("git")
        .args(["-C", &path, "push"])
        .output()
        .map_err(|e| format!("执行 Git 命令失败: {}", e))?;

    if output.status.success() {
        let stdout = String::from_utf8_lossy(&output.stdout);
        let message = if stdout.trim().is_empty() {
            "推送成功".to_string()
        } else {
            stdout.trim().to_string()
        };
        Ok(message)
    } else {
        let _stderr = String::from_utf8_lossy(&output.stderr);
        // 如果系统 Git 失败，尝试使用 git2 库
        git_push_libgit2(path).await
    }
}

/// 使用 git2 库的 push 实现（备用方案）
async fn git_push_libgit2(path: String) -> Result<String, String> {
    let repo = Repository::open(&path).map_err(|e| format!("无法打开仓库: {}", e))?;

    // 获取当前分支
    let head = repo.head().map_err(|e| format!("无法获取HEAD: {}", e))?;
    let branch_name = head.shorthand().ok_or("无法获取分支名称")?;

    // 查找远程名称
    let remote_name = find_remote_for_branch(&repo, branch_name)?;

    // 获取远程分支引用名
    let remote_ref_name = format!("refs/heads/{}", branch_name);

    // 创建带有认证的 push 选项
    let callbacks = create_auth_callbacks();
    let mut push_options = PushOptions::new();
    push_options.remote_callbacks(callbacks);

    // 获取远程
    let mut remote = repo.find_remote(&remote_name)
        .map_err(|e| format!("无法找到远程仓库 '{}': {}", remote_name, e))?;

    // 推送
    let refspec = format!("{}:{}", remote_ref_name, remote_ref_name);

    remote.push(&[&refspec], Some(&mut push_options))
        .map_err(|e| {
            if e.to_string().contains("401") || e.to_string().contains("auth") {
                format!("认证失败：请检查您的 Git 凭据配置\n\n可能的原因：\n1. 未配置 Git 凭据\n2. 用户名或密码错误\n3. Token 已过期\n4. 没有推送权限\n\n解决方案：\n- 在终端中执行一次: git push（这会缓存您的凭据）\n- 或者使用 SSH 而不是 HTTPS\n- 或者配置 Git 凭据助手: git config --global credential.helper manager")
            } else {
                format!("推送失败: {}", e)
            }
        })?;

    Ok(format!("成功推送到 {}/{}", remote_name, branch_name))
}

#[tauri::command]
async fn git_commit(path: String, message: String) -> Result<String, String> {
    let repo = Repository::open(&path).map_err(|e| format!("无法打开仓库: {}", e))?;

    // 获取当前 HEAD 的 OID
    let head_oid = repo.head()
        .and_then(|h| h.target().ok_or(git2::Error::from_str("无法获取 HEAD OID")))
        .map_err(|e| format!("无法获取 HEAD: {}", e))?;

    let head_commit = repo.find_commit(head_oid)
        .map_err(|e| format!("无法找到 HEAD 提交: {}", e))?;

    // 获取索引
    let mut index = repo.index()
        .map_err(|e| format!("无法获取索引: {}", e))?;

    // 更新索引（添加所有更改）
    index.update_all(vec!["*"], None)
        .map_err(|e| format!("更新索引失败: {}", e))?;

    // 检查是否有更改
    let tree_id = index.write_tree()
        .map_err(|e| format!("写入树失败: {}", e))?;

    let tree = repo.find_tree(tree_id)
        .map_err(|e| format!("无法找到树: {}", e))?;

    // 检查是否有实际更改
    if tree.id() == head_commit.tree_id() {
        return Err("没有需要提交的更改".to_string());
    }

    // 创建签名（用于作者和提交者）
    let sig = repo.signature()
        .map_err(|e| format!("无法获取签名: {}", e))?;

    // 创建提交
    let oid = repo.commit(
        Some("HEAD"),
        &sig,
        &sig,
        &message,
        &tree,
        &[&head_commit],
    ).map_err(|e| format!("提交失败: {}", e))?;

    let commit = repo.find_commit(oid)
        .map_err(|e| format!("无法找到提交: {}", e))?;

    Ok(format!("提交成功: {} - {}", &commit.id().to_string()[..8], message))
}

#[tauri::command]
async fn git_diff(path: String) -> Result<String, String> {
    let repo = Repository::open(&path).map_err(|e| format!("无法打开仓库: {}", e))?;

    // 获取 HEAD 对象
    let head = repo.head().map_err(|e| format!("无法获取 HEAD: {}", e))?;
    let head_oid = head.target().ok_or("无法获取 HEAD OID")?;
    let head_commit = repo.find_commit(head_oid)
        .map_err(|e| format!("无法找到 HEAD 提交: {}", e))?;

    // 获取 HEAD 树
    let head_tree = head_commit.tree()
        .map_err(|e| format!("无法获取 HEAD 树: {}", e))?;

    // 获取当前工作区的差异
    let diff = repo.diff_tree_to_workdir_with_index(Some(&head_tree), None)
        .map_err(|e| format!("无法获取差异: {}", e))?;

    // 生成差异文本
    let mut diff_text = String::new();
    diff.print(git2::DiffFormat::Patch, |_delta, _hunk, line| {
        match line.origin() {
            '+' | '-' | ' ' => {
                diff_text.push(line.origin());
                diff_text.push_str(std::str::from_utf8(line.content()).unwrap_or(""));
            }
            'F' | 'T' => {
                // 文件头信息
                diff_text.push_str(std::str::from_utf8(line.content()).unwrap_or(""));
            }
            _ => {}
        }
        true
    }).map_err(|e| format!("生成差异文本失败: {}", e))?;

    if diff_text.is_empty() {
        Ok("暂无变更".to_string())
    } else {
        Ok(diff_text)
    }
}

// 辅助函数：查找分支对应的远程名称
fn find_remote_for_branch(repo: &Repository, branch_name: &str) -> Result<String, String> {
    // 尝试获取分支的配置
    let branch = repo.find_branch(branch_name, git2::BranchType::Local);

    if let Ok(branch) = branch {
        if let Ok(upstream) = branch.upstream() {
            if let Ok(Some(upstream_name)) = upstream.name() {
                // upstream_name 格式通常是 "refs/remotes/origin/branch_name"
                // 我们需要提取 "origin" 部分
                let parts: Vec<&str> = upstream_name.split('/').collect();
                if parts.len() >= 3 {
                    return Ok(parts[2].to_string()); // origin 在索引 2
                }
            }
        }
    }

    // 默认使用 "origin"
    Ok("origin".to_string())
}

#[tauri::command]
async fn test_git_auth(path: String) -> Result<String, String> {
    let repo = Repository::open(&path).map_err(|e| format!("无法打开仓库: {}", e))?;

    // 尝试获取远程
    let mut remote = repo.find_remote("origin")
        .or_else(|_| repo.find_remote("upstream"))
        .map_err(|_| format!("未找到远程仓库"))?;

    let remote_url = remote.url().unwrap_or("unknown").to_string();

    // 检查是 SSH 还是 HTTPS
    let auth_type = if remote_url.starts_with("git@") || remote_url.starts_with("ssh://") {
        "SSH"
    } else if remote_url.starts_with("https://") || remote_url.starts_with("http://") {
        "HTTPS"
    } else {
        "未知"
    };

    // 创建认证回调
    let callbacks = create_auth_callbacks();

    // 尝试连接测试
    let mut fetch_options = FetchOptions::new();
    fetch_options.remote_callbacks(callbacks);

    // 测试连接
    match remote.fetch(&["HEAD"], Some(&mut fetch_options), None) {
        Ok(_) => Ok(format!(
            "✅ 认证测试成功！\n\n\
            远程仓库: {}\n\
            认证方式: {}\n\
            您的 Git 凭据配置正确，可以正常进行拉取和推送操作。",
            remote_url, auth_type
        )),
        Err(e) => {
            let error_msg = e.to_string();
            if error_msg.contains("401") || error_msg.contains("auth") || error_msg.contains("认证") {
                Err(format!(
                    "❌ 认证失败！\n\n\
                    远程仓库: {}\n\
                    认证方式: {}\n\n\
                    问题: {}\n\n\
                    请参考 docs/GIT_AUTH_SETUP.md 配置 Git 身份验证。\n\n\
                    快速解决方案:\n\
                    1. 使用 SSH: git remote set-url origin git@github.com:user/repo.git\n\
                    2. 或配置凭据助手: git config --global credential.helper manager-core\n\
                    3. 或使用个人访问令牌（GitHub/GitLab）",
                    remote_url, auth_type, error_msg
                ))
            } else {
                Err(format!("连接测试失败: {}", error_msg))
            }
        }
    }
}

#[tauri::command]
async fn open_terminal(path: String) -> Result<(), String> {
    #[cfg(target_os = "windows")]
    {
        Command::new("cmd")
            .args(["/c", "start", "cmd", "/k", &format!("cd /d {}", path)])
            .spawn()
            .map_err(|e| format!("打开终端失败: {}", e))?;
    }

    #[cfg(target_os = "macos")]
    {
        Command::new("osascript")
            .args(["-e", &format!("tell application \"Terminal\" to do script \"cd {}\"", path)])
            .spawn()
            .map_err(|e| format!("打开终端失败: {}", e))?;
    }

    #[cfg(target_os = "linux")]
    {
        Command::new("gnome-terminal")
            .args(["--working-directory", &path])
            .spawn()
            .map_err(|e| format!("打开终端失败: {}", e))?;
    }

    Ok(())
}

#[tauri::command]
async fn get_config() -> Result<AppConfig, String> {
    let config_path = get_config_path()?;

    // 如果配置文件不存在，返回默认配置
    if !config_path.exists() {
        // 创建配置目录
        if let Some(parent) = config_path.parent() {
            fs::create_dir_all(parent)
                .map_err(|e| format!("无法创建配置目录 '{}': {}", parent.display(), e))?;
        }

        // 写入默认配置
        let default_config = AppConfig::default();
        let config_json = serde_json::to_string_pretty(&default_config)
            .map_err(|e| format!("序列化配置失败: {}", e))?;

        fs::write(&config_path, config_json)
            .map_err(|e| format!("写入配置文件失败 '{}': {}", config_path.display(), e))?;

        return Ok(default_config);
    }

    // 读取配置文件
    let config_content = fs::read_to_string(&config_path)
        .map_err(|e| format!("读取配置文件失败 '{}': {}", config_path.display(), e))?;

    // 尝试解析配置，如果失败则使用默认配置并重新保存
    let config: AppConfig = match serde_json::from_str(&config_content) {
        Ok(config) => config,
        Err(e) => {
            eprintln!("配置文件解析失败: {}, 使用默认配置并重新保存", e);
            // 使用默认配置并重新写入文件
            let default_config = AppConfig::default();
            let config_json = serde_json::to_string_pretty(&default_config)
                .map_err(|e| format!("序列化配置失败: {}", e))?;
            fs::write(&config_path, config_json)
                .map_err(|e| format!("写入配置文件失败 '{}': {}", config_path.display(), e))?;
            default_config
        }
    };

    Ok(config)
}

#[tauri::command]
async fn save_config(config: AppConfig) -> Result<(), String> {
    let config_path = get_config_path()?;

    // 创建配置目录
    if let Some(parent) = config_path.parent() {
        fs::create_dir_all(parent)
            .map_err(|e| format!("无法创建配置目录 '{}': {}", parent.display(), e))?;
    }

    // 序列化并写入配置
    let config_json = serde_json::to_string_pretty(&config)
        .map_err(|e| format!("序列化配置失败: {}", e))?;

    fs::write(&config_path, config_json)
        .map_err(|e| format!("写入配置文件失败 '{}': {}", config_path.display(), e))?;

    Ok(())
}

#[tauri::command]
async fn get_home_dir() -> Result<String, String> {
    dirs::home_dir()
        .and_then(|p| p.to_str().map(|s| s.to_string()))
        .ok_or("无法获取用户目录".to_string())
}

#[tauri::command]
async fn git_clone(url: String, target_path: String) -> Result<String, String> {
    // 验证 URL 不为空
    if url.trim().is_empty() {
        return Err("Git URL 不能为空".to_string());
    }

    // 验证目标路径不为空
    if target_path.trim().is_empty() {
        return Err("目标路径不能为空".to_string());
    }

    // 执行 git clone 命令
    let output = Command::new("git")
        .args(["clone", &url, &target_path])
        .output()
        .map_err(|e| format!("执行 git clone 失败: {}", e))?;

    if output.status.success() {
        let stdout = String::from_utf8_lossy(&output.stdout);
        let message = if stdout.trim().is_empty() {
            "克隆成功".to_string()
        } else {
            stdout.trim().to_string()
        };
        Ok(message)
    } else {
        let stderr = String::from_utf8_lossy(&output.stderr);
        Err(format!("克隆失败: {}", stderr))
    }
}

#[tauri::command]
async fn svn_checkout(url: String, target_path: String) -> Result<String, String> {
    // 检查 SVN 是否已安装
    check_svn_installed()?;

    // 验证 URL 不为空
    if url.trim().is_empty() {
        return Err("SVN URL 不能为空".to_string());
    }

    // 验证目标路径不为空
    if target_path.trim().is_empty() {
        return Err("目标路径不能为空".to_string());
    }

    // 执行 svn checkout 命令
    let output = Command::new("svn")
        .args(["checkout", &url, &target_path])
        .output()
        .map_err(|e| format!("执行 svn checkout 失败: {}", e))?;

    if output.status.success() {
        let stdout = String::from_utf8_lossy(&output.stdout);
        // 从输出中提取版本信息，例如 "Checked out revision 12345"
        let summary = stdout
            .lines()
            .find(|l| l.contains("Checked out revision") || l.contains("取出版本"))
            .unwrap_or("检出成功");
        Ok(summary.to_string())
    } else {
        let stderr = String::from_utf8_lossy(&output.stderr);
        Err(format!("检出失败: {}", stderr))
    }
}

// ==================== SVN Commands ====================

/// 检查 SVN 是否已安装
fn check_svn_installed() -> Result<(), String> {
    let result = Command::new("svn")
        .arg("--version")
        .stdout(Stdio::null())
        .stderr(Stdio::null())
        .output();

    match result {
        Ok(output) if output.status.success() => Ok(()),
        Ok(_) => Err("SVN 命令执行失败".to_string()),
        Err(_) => Err("未检测到 SVN，请先安装 Subversion\n\n安装方法:\n- Windows: 从 https://svn.apache.org/ 下载安装\n- macOS: brew install subversion\n- Linux: sudo apt install subversion 或 sudo yum install subversion".to_string()),
    }
}

/// 查找 SVN 工作副本的根目录（包含 .svn 的目录）
fn find_svn_working_copy_root(path: &PathBuf) -> Result<PathBuf, String> {
    let mut current_path = path.clone();

    // 首先检查当前路径是否存在
    if !current_path.exists() {
        return Err(format!("路径不存在: {}", path.display()));
    }

    // 向上遍历目录树，查找包含 .svn 的目录
    loop {
        let svn_dir = current_path.join(".svn");

        if svn_dir.exists() && svn_dir.is_dir() {
            return Ok(current_path);
        }

        // 移动到父目录
        match current_path.parent() {
            Some(parent) if !parent.as_os_str().is_empty() => {
                current_path = parent.to_path_buf();
            }
            _ => {
                return Err(format!(
                    "在路径 '{}' 及其父目录中未找到 SVN 工作副本（.svn 目录）",
                    path.display()
                ));
            }
        }
    }
}

#[tauri::command]
async fn get_svn_status(path: String) -> Result<SvnStatus, String> {
    // 检查 SVN 是否已安装
    check_svn_installed()?;

    let path_obj = PathBuf::from(&path);
    if !path_obj.exists() {
        return Err(format!("路径不存在: {}", path));
    }

    // 查找 SVN 工作副本的根目录（包含 .svn 的目录）
    let working_copy_root = find_svn_working_copy_root(&path_obj)?;

    // 获取 SVN info（使用根目录）
    let info_output = Command::new("svn")
        .args(["info", working_copy_root.to_str().unwrap()])
        .output()
        .map_err(|e| format!("执行 svn info 失败: {}", e))?;

    if !info_output.status.success() {
        let error_msg = String::from_utf8_lossy(&info_output.stderr);
        if error_msg.contains("not a working copy") {
            return Err(format!("不是一个 SVN 工作副本: {}", error_msg));
        }
        return Err(format!("获取 SVN 信息失败: {}", error_msg));
    }

    let info_text = String::from_utf8_lossy(&info_output.stdout);
    let mut revision = None;
    let mut url = None;
    let mut repository_root = None;
    let mut author = None;
    let mut date = None;

    for line in info_text.lines() {
        if let Some(val) = line.strip_prefix("Revision: ") {
            revision = Some(val.to_string());
        } else if let Some(val) = line.strip_prefix("URL: ") {
            url = Some(val.to_string());
        } else if let Some(val) = line.strip_prefix("Repository Root: ") {
            repository_root = Some(val.to_string());
        } else if let Some(val) = line.strip_prefix("Last Changed Author: ") {
            author = Some(val.to_string());
        } else if let Some(val) = line.strip_prefix("Last Changed Date: ") {
            // SVN 日期格式: "2024-01-15 10:30:45 +0800"
            date = Some(val.split('(').next().unwrap_or(val).trim().to_string());
        }
    }

    // 获取 SVN status（使用根目录）
    let status_output = Command::new("svn")
        .args(["status", working_copy_root.to_str().unwrap()])
        .output()
        .map_err(|e| format!("执行 svn status 失败: {}", e))?;

    let status_text = String::from_utf8_lossy(&status_output.stdout);
    let mut modified_files = Vec::new();
    let mut untracked_files = Vec::new();

    for line in status_text.lines() {
        let line = line.trim();
        if line.is_empty() {
            continue;
        }

        // 如果当前目录是根目录，显示所有文件（包括子目录中的文件）
        // SVN status 格式: "M       file.ext" 或 "?       file.ext"
        let first_char = line.chars().next();

        // 跳过状态标题行
        if line.starts_with("Status of working copy") || line.starts_with("---") {
            continue;
        }

        let file_path = if line.chars().count() > 8 {
            line.chars().skip(8).collect::<String>()
        } else {
            line.to_string()
        };

        match first_char {
            Some('M') | Some('A') | Some('D') | Some('R') => modified_files.push(file_path),
            Some('?') => untracked_files.push(file_path),
            _ => {}
        }
    }

    let is_dirty = !modified_files.is_empty() || !untracked_files.is_empty();

    Ok(SvnStatus {
        revision,
        url,
        repository_root,
        modified_files,
        untracked_files,
        is_dirty,
        author,
        date,
    })
}

#[tauri::command]
async fn svn_update(path: String) -> Result<String, String> {
    check_svn_installed()?;

    let output = Command::new("svn")
        .args(["update", &path])
        .output()
        .map_err(|e| format!("执行 svn update 失败: {}", e))?;

    if output.status.success() {
        let stdout = String::from_utf8_lossy(&output.stdout);
        // 解析更新摘要，例如 "Updated to revision 12345"
        let summary = stdout
            .lines()
            .find(|l| l.contains("revision") || l.contains("更新到"))
            .unwrap_or("更新成功");
        Ok(summary.to_string())
    } else {
        let stderr = String::from_utf8_lossy(&output.stderr);
        Err(format!("更新失败: {}", stderr))
    }
}

#[tauri::command]
async fn svn_commit(path: String, message: String) -> Result<String, String> {
    check_svn_installed()?;

    if message.trim().is_empty() {
        return Err("提交消息不能为空".to_string());
    }

    let output = Command::new("svn")
        .args(["commit", &path, "-m", &message])
        .output()
        .map_err(|e| format!("执行 svn commit 失败: {}", e))?;

    if output.status.success() {
        let stdout = String::from_utf8_lossy(&output.stdout);
        // 解析提交摘要，例如 "Committed revision 12345"
        let summary = stdout
            .lines()
            .find(|l| l.contains("Committed revision") || l.contains("提交的版本"))
            .unwrap_or("提交成功");
        Ok(summary.to_string())
    } else {
        let stderr = String::from_utf8_lossy(&output.stderr);
        Err(format!("提交失败: {}", stderr))
    }
}

#[tauri::command]
async fn svn_diff(path: String) -> Result<String, String> {
    check_svn_installed()?;

    let output = Command::new("svn")
        .args(["diff", &path])
        .output()
        .map_err(|e| format!("执行 svn diff 失败: {}", e))?;

    let diff_text = String::from_utf8_lossy(&output.stdout).to_string();

    if diff_text.trim().is_empty() {
        Ok("暂无变更".to_string())
    } else {
        Ok(diff_text)
    }
}

#[tauri::command]
async fn test_svn_auth(path: String) -> Result<String, String> {
    check_svn_installed()?;

    // 使用 svn info 测试连接
    let output = Command::new("svn")
        .args(["info", &path])
        .output()
        .map_err(|e| format!("执行 svn info 失败: {}", e))?;

    if output.status.success() {
        let stdout = String::from_utf8_lossy(&output.stdout);

        // 解析仓库信息
        let mut url = "未知".to_string();
        let mut revision = "未知".to_string();
        let mut repository_root = "未知".to_string();

        for line in stdout.lines() {
            if let Some(val) = line.strip_prefix("URL: ") {
                url = val.to_string();
            } else if let Some(val) = line.strip_prefix("Revision: ") {
                revision = val.to_string();
            } else if let Some(val) = line.strip_prefix("Repository Root: ") {
                repository_root = val.to_string();
            }
        }

        Ok(format!(
            "✅ 认证测试成功！\n\n\
            仓库 URL: {}\n\
            当前版本: {}\n\
            仓库根: {}\n\
            您的 SVN 凭据配置正确，可以正常进行更新和提交操作。",
            url, revision, repository_root
        ))
    } else {
        let stderr = String::from_utf8_lossy(&output.stderr);
        let error_msg = stderr.to_string();

        if error_msg.contains("authorization") || error_msg.contains("authentication") || error_msg.contains("凭据") {
            Err(format!(
                "❌ 认证失败！\n\n\
                问题: SVN 认证失败\n\n\
                可能的原因:\n\
                1. 用户名或密码错误\n\
                2. 没有访问权限\n\
                3. 凭据已过期\n\n\
                解决方案:\n\
                1. 重新输入凭据: svn commit --username <用户名>\n\
                2. 或保存凭据: svn commit --username <用户名> --password <密码>\n\
                3. 或清除已保存的凭据并重新输入\n\n\
                详细错误: {}",
                error_msg
            ))
        } else {
            Err(format!("连接测试失败: {}", error_msg))
        }
    }
}

#[tauri::command]
async fn svn_add(path: String, files: Vec<String>) -> Result<String, String> {
    check_svn_installed()?;

    if files.is_empty() {
        return Err("没有要添加的文件".to_string());
    }

    let mut args = vec!["add".to_string()];
    args.extend(files.clone());
    args.push(path.clone());

    let output = Command::new("svn")
        .args(&args)
        .output()
        .map_err(|e| format!("执行 svn add 失败: {}", e))?;

    if output.status.success() {
        Ok(format!("成功添加 {} 个文件到版本控制", files.len()))
    } else {
        let stderr = String::from_utf8_lossy(&output.stderr);
        Err(format!("添加文件失败: {}", stderr))
    }
}

#[tauri::command]
async fn svn_revert(path: String, files: Option<Vec<String>>) -> Result<String, String> {
    check_svn_installed()?;

    let output = if let Some(file_list) = files {
        if file_list.is_empty() {
            return Err("没有要还原的文件".to_string());
        }
        let mut args = vec!["revert".to_string()];
        args.extend(file_list);
        Command::new("svn")
            .args(&args)
            .output()
            .map_err(|e| format!("执行 svn revert 失败: {}", e))?
    } else {
        Command::new("svn")
            .args(["revert", "-R", &path])
            .output()
            .map_err(|e| format!("执行 svn revert 失败: {}", e))?
    };

    if output.status.success() {
        Ok("还原成功".to_string())
    } else {
        let stderr = String::from_utf8_lossy(&output.stderr);
        Err(format!("还原失败: {}", stderr))
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_autostart::init(
            tauri_plugin_autostart::MacosLauncher::LaunchAgent,
            Some(vec!["--flag1", "--flag2"]),
        ))
        .plugin(tauri_plugin_single_instance::init(|_app, _args, _cwd| {
            // Write your code here...
        }))
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_sql::Builder::new().build())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            open_folder,
            open_in_vscode,
            get_repository_status,
            git_pull,
            git_push,
            git_commit,
            git_diff,
            git_clone,
            open_terminal,
            test_git_auth,
            get_config,
            save_config,
            get_home_dir,
            get_svn_status,
            svn_update,
            svn_commit,
            svn_diff,
            test_svn_auth,
            svn_add,
            svn_revert,
            svn_checkout
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
