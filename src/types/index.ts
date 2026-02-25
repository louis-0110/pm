/**
 * 项目类型定义
 */
export interface Project {
    id: number
    name: string
    description: string | null
    created_at: string
    updated_at: string
}

/**
 * 仓库类型定义
 */
export interface Repository {
    id: number
    name: string
    path: string
    vcs: 'git' | 'svn'
    project_id: number
    created_at?: string
}

/**
 * Git 状态类型定义
 */
export interface GitStatus {
    branch: string | null
    commit: string | null
    modified_files: string[]
    untracked_files: string[]
    is_dirty: boolean
    ahead: number | null
    behind: number | null
}

/**
 * SVN 状态类型定义
 */
export interface SvnStatus {
    revision: string | null
    url: string | null
    repository_root?: string | null
    modified_files: string[]
    untracked_files: string[]
    is_dirty: boolean
    author: string | null
    date: string | null
}

/**
 * Git 配置
 */
export interface GitConfig {
    default_remote: string | null
    ssh_key_path: string | null
    auto_fetch: boolean
    auto_push: boolean
}

/**
 * SVN 配置
 */
export interface SvnConfig {
    auto_update: boolean
    username: string | null
    password: string | null
}

/**
 * 编辑器配置
 */
export interface EditorConfig {
    vscode_path: string | null
    default_editor: string
}

/**
 * 应用配置
 */
export interface AppConfig {
    git: GitConfig
    svn: SvnConfig
    editor: EditorConfig
}

/**
 * 数据库操作结果
 */
export interface DbResult {
    lastInsertId: number
    rowsAffected: number
}
