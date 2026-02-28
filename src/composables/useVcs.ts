/**
 * VCS 操作统一接口 Composable
 * 统一 Git/SVN 操作，根据类型自动选择对应的 API
 */

import { ref } from 'vue'
import { gitApi, svnApi } from '@/api'
import { VCS_TYPES, type VcsType } from '@/constants/vcs'
import { MESSAGES } from '@/constants/messages'
import type { GitStatus, SvnStatus } from '@/types'

export function useVcs() {
  const loading = ref({
    pull: false,
    push: false,
    commit: false,
    update: false,
    diff: false
  })

  /**
   * 根据 VCS 类型获取状态
   */
  const getStatus = async (vcs: VcsType, path: string): Promise<GitStatus | SvnStatus | null> => {
    try {
      if (vcs === VCS_TYPES.GIT) {
        return await gitApi.getStatus(path)
      } else if (vcs === VCS_TYPES.SVN) {
        return await svnApi.getStatus(path)
      }
    } catch (error) {
      // 静默失败
    }
    return null
  }

  /**
   * 拉取/更新
   * Git: pull, SVN: update
   */
  const pull = async (vcs: VcsType, path: string): Promise<string> => {
    loading.value.pull = true
    try {
      if (vcs === VCS_TYPES.GIT) {
        return await gitApi.pull(path)
      } else if (vcs === VCS_TYPES.SVN) {
        return await svnApi.update(path)
      }
      throw new Error('不支持的 VCS 类型')
    } finally {
      loading.value.pull = false
    }
  }

  /**
   * 推送（仅 Git 支持）
   */
  const push = async (vcs: VcsType, path: string): Promise<string> => {
    if (vcs !== VCS_TYPES.GIT) {
      throw new Error(MESSAGES.REPOSITORY.SVN_NO_PUSH)
    }

    loading.value.push = true
    try {
      return await gitApi.push(path)
    } finally {
      loading.value.push = false
    }
  }

  /**
   * 提交
   * 支持 Git 和 SVN
   */
  const commit = async (vcs: VcsType, path: string, message: string): Promise<string> => {
    loading.value.commit = true
    try {
      if (vcs === VCS_TYPES.GIT) {
        return await gitApi.commit(path, message)
      } else if (vcs === VCS_TYPES.SVN) {
        return await svnApi.commit(path, message)
      }
      throw new Error('不支持的 VCS 类型')
    } finally {
      loading.value.commit = false
    }
  }

  /**
   * Diff
   * 支持 Git 和 SVN
   */
  const diff = async (vcs: VcsType, path: string): Promise<string> => {
    loading.value.diff = true
    try {
      if (vcs === VCS_TYPES.GIT) {
        return await gitApi.diff(path)
      } else if (vcs === VCS_TYPES.SVN) {
        return await svnApi.diff(path)
      }
      throw new Error('不支持的 VCS 类型')
    } finally {
      loading.value.diff = false
    }
  }

  /**
   * 测试认证
   * 支持 Git 和 SVN
   */
  const testAuth = async (vcs: VcsType, path: string): Promise<string> => {
    if (vcs === VCS_TYPES.GIT) {
      return await gitApi.testAuth(path)
    } else if (vcs === VCS_TYPES.SVN) {
      return await svnApi.testAuth(path)
    }
    throw new Error('不支持的 VCS 类型')
  }

  /**
   * 克隆
   * 支持 Git 和 SVN
   */
  const clone = async (vcs: VcsType, url: string, targetPath: string): Promise<string> => {
    if (vcs === VCS_TYPES.GIT) {
      return await gitApi.clone(url, targetPath)
    } else if (vcs === VCS_TYPES.SVN) {
      return await svnApi.checkout(url, targetPath)
    }
    throw new Error('不支持的 VCS 类型')
  }

  return {
    loading,
    getStatus,
    pull,
    push,
    commit,
    diff,
    testAuth,
    clone
  }
}
