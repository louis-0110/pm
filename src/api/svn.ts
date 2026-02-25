import { invoke } from '@tauri-apps/api/core'
import type { SvnStatus } from '@/types'

export const svnApi = {
    /**
     * 获取 SVN 仓库状态
     */
    async getStatus(path: string): Promise<SvnStatus> {
        return invoke<SvnStatus>('get_svn_status', { path })
    },

    /**
     * SVN 更新
     */
    async update(path: string): Promise<string> {
        return invoke<string>('svn_update', { path })
    },

    /**
     * SVN 提交
     */
    async commit(path: string, message: string): Promise<string> {
        return invoke<string>('svn_commit', { path, message })
    },

    /**
     * SVN Diff
     */
    async diff(path: string): Promise<string> {
        return invoke<string>('svn_diff', { path })
    },

    /**
     * 测试 SVN 认证
     */
    async testAuth(path: string): Promise<string> {
        return invoke<string>('test_svn_auth', { path })
    },

    /**
     * SVN 添加文件
     */
    async add(path: string, files: string[]): Promise<string> {
        return invoke<string>('svn_add', { path, files })
    },

    /**
     * SVN 还原
     */
    async revert(path: string, files?: string[]): Promise<string> {
        return invoke<string>('svn_revert', { path, files })
    },

    /**
     * SVN 检出
     */
    async checkout(url: string, targetPath: string): Promise<string> {
        return invoke<string>('svn_checkout', { url, targetPath })
    },
}
