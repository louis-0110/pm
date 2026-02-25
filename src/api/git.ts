import { invoke } from '@tauri-apps/api/core'
import type { GitStatus } from '@/types'

export const gitApi = {
    /**
     * 获取 Git 仓库状态
     */
    async getStatus(path: string): Promise<GitStatus> {
        return invoke<GitStatus>('get_repository_status', { path })
    },

    /**
     * Git 拉取
     */
    async pull(path: string): Promise<string> {
        return invoke<string>('git_pull', { path })
    },

    /**
     * Git 推送
     */
    async push(path: string): Promise<string> {
        return invoke<string>('git_push', { path })
    },

    /**
     * Git 提交
     */
    async commit(path: string, message: string): Promise<string> {
        return invoke<string>('git_commit', { path, message })
    },

    /**
     * Git Diff
     */
    async diff(path: string): Promise<string> {
        return invoke<string>('git_diff', { path })
    },

    /**
     * 测试 Git 认证
     */
    async testAuth(path: string): Promise<string> {
        return invoke<string>('test_git_auth', { path })
    },

    /**
     * Git 克隆
     */
    async clone(url: string, targetPath: string): Promise<string> {
        return invoke<string>('git_clone', { url, targetPath })
    },
}
